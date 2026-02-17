import { inngest } from "@/inngest/client";
import { createClient } from "@supabase/supabase-js";

export const generateVideo = inngest.createFunction(
    { id: "generate-video" },
    { event: "video/generate.series" },
    async ({ event, step }) => {
        const { seriesId } = event.data;

        // Step 1: Fetch series data
        const series = await step.run("fetch-series-data", async () => {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            const { data, error } = await supabase
                .from("series")
                .select("*")
                .eq("id", seriesId)
                .single();

            if (error) throw new Error(`Failed to fetch series: ${error.message}`);
            if (!data) throw new Error("Series not found");

            return data;
        });

        // Step 2: Generate Video Script
        const script = await step.run("generate-script", async () => {
            const { generateVideoScript } = await import("@/lib/gemini");
            return await generateVideoScript({
                seriesName: series.series_name,
                nicheType: series.niche_type,
                selectedNiche: series.selected_niche,
                customNiche: series.custom_niche,
                videoStyle: series.video_style,
                videoDuration: series.video_duration,
            });
        });

        // Step 3: Generate Voice
        const audio = await step.run("generate-voice", async () => {
            const { generateVoiceover } = await import("@/lib/deepgram");

            // Map series voice to Deepgram model if needed, or default
            // Assuming series.voice holds a name or ID. Deepgram needs models like "aura-asteria-en"
            // Defaults to 'aura-asteria-en' if not specified or mapped
            // TODO: Implement proper voice mapping based on series.voice
            const audioBuffer = await generateVoiceover({
                text: script.script,
                model: "aura-asteria-en"
            });

            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            const fileName = `${seriesId}/voiceover-${Date.now()}.mp3`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from("series-assets")
                .upload(fileName, audioBuffer, {
                    contentType: "audio/mpeg",
                });

            if (uploadError) throw new Error(`Failed to upload audio: ${uploadError.message}`);

            const { data: { publicUrl } } = supabase.storage
                .from("series-assets")
                .getPublicUrl(fileName);

            return { audioUrl: publicUrl };
        });

        // Step 4: Generate Captions
        const captions = await step.run("generate-captions", async () => {
            const { transcribeAudio } = await import("@/lib/deepgram");

            // We need the public URL from the previous step
            if (!audio.audioUrl) throw new Error("No audio URL generated from previous step");

            const captions = await transcribeAudio(audio.audioUrl);

            return { captions };
        });

        // Step 5: Generate Images
        const images = await step.run("generate-images", async () => {
            const { generateImage } = await import("@/lib/replicate");
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            const imageUrls: string[] = [];

            // Iterate over image prompts
            // Normalize script.image_prompts to array if needed
            const prompts = Array.isArray(script.image_prompts) ? script.image_prompts : [];

            for (let i = 0; i < prompts.length; i++) {
                let prompt = prompts[i];

                // Handle case where LLM returns object instead of string
                if (typeof prompt === 'object' && prompt !== null) {
                    console.warn(`Warning: Image prompt at index ${i} is an object:`, prompt);
                    // @ts-ignore
                    prompt = prompt.image_prompt || prompt.prompt || prompt.text || JSON.stringify(prompt);
                }

                // Ensure it's a string
                prompt = String(prompt);

                console.log(`DEBUG: Generating image ${i} with prompt:`, prompt);
                let imageBuffer: Buffer;
                try {
                    imageBuffer = await generateImage({ prompt });
                } catch (error: any) {
                    console.error(`Error generating image ${i} with prompt "${prompt}":`, error.message);
                    // Fallback to a safe prompt if generation fails (e.g. NSFW)
                    console.log("Attempting fallback generation with safe prompt...");
                    try {
                        imageBuffer = await generateImage({ prompt: `A cinematic abstract background, safe for work, high quality.` });
                    } catch (fallbackError) {
                        console.error("Fallback generation failed:", fallbackError);
                        // Skip this image or throw? 
                        // For now, let's create a tiny transparent pixel or similar? 
                        // No, let's just skip this image in the array if possible, but that might break sync.
                        // Better to use a placeholder image URL if available, but we need a buffer.
                        // Let's rethrow if fallback fails, it might be a connectivity issue.
                        throw fallbackError;
                    }
                }
                const fileName = `${seriesId}/image-${i}-${Date.now()}.png`;

                const { error: uploadError } = await supabase.storage
                    .from("series-assets") // Using the existing bucket
                    .upload(fileName, imageBuffer, {
                        contentType: "image/png",
                    });

                if (uploadError) throw new Error(`Failed to upload image ${i}: ${uploadError.message}`);

                const { data: { publicUrl } } = supabase.storage
                    .from("series-assets")
                    .getPublicUrl(fileName);

                imageUrls.push(publicUrl);

                // Sleep 10s to respect Rate Limit
                if (i < prompts.length - 1) await new Promise(r => setTimeout(r, 10000));
            }

            return { imageUrls };
        });

        // Step 8: Render Video
        const renderResult = await step.run("render-video", async () => {
            const renderServiceUrl = process.env.NEXT_PUBLIC_RENDER_SERVICE_URL;

            if (!renderServiceUrl) {
                console.warn("RENDER_SERVICE_URL not found. Skipping video rendering.");
                return { videoUrl: null };
            }

            console.log("Starting render with service:", renderServiceUrl);

            const inputProps = {
                audioUrl: audio.audioUrl,
                imageUrls: images.imageUrls,
                captions: captions.captions,
                script: script.script
            };

            const compositionId = "MyComp"; // Make sure this matches your composition ID in src/remotion/index.ts
            const outputBucket = "creatorcloud-renders"; // GCS bucket for video output
            const outputKey = `${seriesId}/video-${Date.now()}.mp4`;

            // Calculate duration from captions
            // Default to 10s (300 frames) if no captions
            let durationInFrames = 300;
            if (captions.captions && captions.captions.length > 0) {
                const lastCaption = captions.captions[captions.captions.length - 1];
                const durationInSeconds = lastCaption.end;
                // Add 2 seconds buffer for smooth ending
                durationInFrames = Math.ceil((durationInSeconds + 2) * 30);
            }

            console.log(`Calculated duration: ${durationInFrames} frames (~${Math.round(durationInFrames / 30)}s)`);

            try {
                const response = await fetch(`${renderServiceUrl}/render`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        inputProps,
                        compositionId,
                        outputBucket,
                        outputKey,
                        outputProvider: 'gcs',
                        durationInFrames
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Render service failed: ${response.status} ${response.statusText} - ${errorText}`);
                }

                const data = await response.json();

                if (!data.success || !data.url) {
                    throw new Error(`Render service returned invalid response: ${JSON.stringify(data)}`);
                }

                console.log("Render completed:", data.url);
                return { videoUrl: data.url };

            } catch (err: any) {
                console.error("Render failed", err);
                throw err;
            }
        });

        // Step 6: Save to Database (Update existing record)
        const savedVideo = await step.run("save-to-db", async () => {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            // Check if we received a videoId to update
            const videoId = event.data.videoId;
            const usedVoiceModel = "aura-asteria-en";

            // Use rendered video URL if available, else first image as fallback (or null)
            const videoPath = renderResult.videoUrl;

            if (videoId) {
                // Update existing 'processing' record
                const { data, error } = await supabase
                    .from("videos")
                    .update({
                        script: script,
                        audio_url: audio.audioUrl,
                        voice_model: usedVoiceModel,
                        captions: captions.captions,
                        image_urls: images.imageUrls,
                        video_url: videoPath,
                        status: videoPath ? 'completed' : 'failed' // or 'draft' if render failed but assets generated
                    })
                    .eq("id", videoId)
                    .select()
                    .single();

                if (error) throw new Error(`Failed to update video: ${error.message}`);
                return data;
            } else {
                // Fallback: Insert new record (legacy flow or if ID missing)
                const { data, error } = await supabase
                    .from("videos")
                    .insert({
                        series_id: seriesId,
                        user_id: series.user_id,
                        script: script,
                        audio_url: audio.audioUrl,
                        voice_model: usedVoiceModel,
                        captions: captions.captions,
                        image_urls: images.imageUrls,
                        video_url: videoPath,
                        status: videoPath ? 'completed' : 'failed'
                    })
                    .select()
                    .single();

                if (error) throw new Error(`Failed to insert video: ${error.message}`);
                return data;
            }
        });

        // Step 7: Send Notification Email
        await step.run("send-notification-email", async () => {
            console.log("DEBUG: Starting send-notification-email step");
            console.log("DEBUG: Video URL:", savedVideo.video_url);

            if (event.data.skipNotification) {
                console.log("DEBUG: Skipping email notification as requested by event.");
                return { status: "skipped", reason: "skipNotification flag set" };
            }

            if (!savedVideo.video_url) {
                console.warn("No video URL generated, skipping email notification.");
                return { status: "skipped", reason: "No videoURL" };
            }

            const { plunk } = await import("@/lib/plunk");
            console.log("DEBUG: Plunk client initialized:", !!plunk);

            if (!plunk) {
                console.warn("Plunk client not initialized, skipping email.");
                return { status: "skipped", reason: "Plunk client missing (check PLUNK_API_KEY)" };
            }

            const { generateVideoNotificationEmail } = await import("@/lib/email-helpers");

            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            console.log("DEBUG: Fetching user for series.user_id:", series.user_id);

            // Fetch user email
            const { data: user, error: userError } = await supabase
                .from("users")
                .select("email, name")
                .eq("id", series.user_id)
                .single();

            console.log("DEBUG: User fetch result:", user);
            if (userError) console.error("DEBUG: User fetch error:", userError);

            if (userError || !user || !user.email) {
                console.error("Failed to fetch user email for notification. User:", user, "Error:", userError);
                return { status: "failed", reason: "User email not found", error: userError };
            }

            const emailHtml = generateVideoNotificationEmail({
                userName: user.name || "Creator",
                videoTitle: script.title || "Your New Video",
                videoUrl: savedVideo.video_url,
                thumbnailUrl: images.imageUrls?.[0],
                seriesName: series.series_name,
            });

            try {
                const result = await plunk.emails.send({
                    to: user.email,
                    subject: `Your video "${script.title || 'Video'}" is ready! 🎬`,
                    body: emailHtml,
                });
                console.log(`Notification email sent to ${user.email}. Result:`, result);
                return { status: "sent", recipient: user.email, result };
            } catch (emailError: any) {
                console.error("Failed to send notification email:", emailError);
                return { status: "error", error: emailError.message };
            }
        });

        return { success: true, videoId: savedVideo.id };
    }
);
