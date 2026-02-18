import { inngest } from "@/inngest/client";
import { createClient } from "@supabase/supabase-js";

export const generateVideo = inngest.createFunction(
    { id: "generate-video" },
    { event: "video/generate.series" },
    async ({ event, step }) => {
        const { seriesId, customScript, customImageUrls } = event.data;

        console.log("DEBUG: generateVideo function triggered!", {
            seriesId,
            hasCustomScript: !!customScript,
            customImagesCount: customImageUrls?.length
        });

        try {
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
                if (customScript) {
                    return {
                        title: "Custom Video",
                        script: customScript,
                        image_prompts: []
                    };
                }

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

            // Step 3 & 4: Generate Voice, Images, and Music in Parallel
            const [audio, images, music] = await Promise.all([
                step.run("generate-voice", async () => {
                    const { generateVoiceover } = await import("@/lib/deepgram");
                    const { NOIZ_VOICES } = await import("@/lib/constants");

                    // Use series voice or default
                    // valid models: aura-asteria-en, aura-luna-en, aura-stella-en, aura-athena-en, etc.
                    // If series.voice is a full model name, use it. If it's a friendly name, map it (assuming ID for now).
                    let voiceModel = series.voice || "aura-asteria-en";

                    // Check if voiceModel matches a friendly name in NOIZ_VOICES
                    // @ts-ignore - modelId was recently added to constants
                    const matchedVoice = NOIZ_VOICES.find(v => v.modelName === voiceModel);
                    if (matchedVoice && matchedVoice.modelId) {
                        // @ts-ignore
                        voiceModel = matchedVoice.modelId;
                    }

                    const audioBuffer = await generateVoiceover({
                        text: script.script,
                        model: voiceModel
                    });

                    const supabase = createClient(
                        process.env.NEXT_PUBLIC_SUPABASE_URL!,
                        process.env.SUPABASE_SERVICE_ROLE_KEY!
                    );

                    const fileName = `${seriesId}/voiceover-${Date.now()}.mp3`;

                    const { error: uploadError } = await supabase.storage
                        .from("series-assets")
                        .upload(fileName, audioBuffer, {
                            contentType: "audio/mpeg",
                        });

                    if (uploadError) throw new Error(`Failed to upload audio: ${uploadError.message}`);

                    const { data: { publicUrl } } = supabase.storage
                        .from("series-assets")
                        .getPublicUrl(fileName);

                    return { audioUrl: publicUrl, voiceModel };
                }),

                step.run("generate-images", async () => {
                    if (customImageUrls && Array.isArray(customImageUrls) && customImageUrls.length > 0) {
                        return { imageUrls: customImageUrls };
                    }

                    const { generateImage } = await import("@/lib/replicate");
                    const supabase = createClient(
                        process.env.NEXT_PUBLIC_SUPABASE_URL!,
                        process.env.SUPABASE_SERVICE_ROLE_KEY!
                    );

                    const imageUrls: string[] = [];
                    const prompts = Array.isArray(script.image_prompts) ? script.image_prompts : [];

                    // We can also parallelize individual image generation if we want, 
                    // but Replicate execution might be rate limited or we want to wait. 
                    // For now, let's keep image loop serial to be safe with rate limits, 
                    // but the whole block runs parallel to voice.

                    for (let i = 0; i < prompts.length; i++) {
                        let prompt = prompts[i];
                        if (typeof prompt === 'object' && prompt !== null) {
                            // @ts-ignore
                            prompt = prompt.image_prompt || prompt.prompt || prompt.text || JSON.stringify(prompt);
                        }
                        prompt = String(prompt);

                        console.log(`DEBUG: Generating image ${i} with prompt:`, prompt);
                        let imageBuffer: Buffer;
                        try {
                            imageBuffer = await generateImage({ prompt });
                        } catch (error: any) {
                            console.error(`Error generating image ${i}:`, error.message);
                            try {
                                imageBuffer = await generateImage({ prompt: `A cinematic abstract background, safe for work, high quality.` });
                            } catch (fallbackError) {
                                throw fallbackError;
                            }
                        }
                        const fileName = `${seriesId}/image-${i}-${Date.now()}.png`;

                        const { error: uploadError } = await supabase.storage
                            .from("series-assets")
                            .upload(fileName, imageBuffer, { contentType: "image/png" });

                        if (uploadError) throw new Error(`Failed to upload image ${i}: ${uploadError.message}`);

                        const { data: { publicUrl } } = supabase.storage
                            .from("series-assets")
                            .getPublicUrl(fileName);

                        imageUrls.push(publicUrl);

                        // Small delay if needed, but since we are running parallel with voice now, 
                        // total time is determined by the slowest path (usually images).
                        if (i < prompts.length - 1) await new Promise(r => setTimeout(r, 2000));
                    }
                    return { imageUrls };
                }),

                step.run("generate-music", async () => {
                    const { MUSIC_TRACKS } = await import("@/lib/constants");
                    const path = await import("path");
                    const fs = await import("fs");
                    const supabase = createClient(
                        process.env.NEXT_PUBLIC_SUPABASE_URL!,
                        process.env.SUPABASE_SERVICE_ROLE_KEY!
                    );

                    let musicUrl: string | undefined = undefined;
                    // Check if series has music selected
                    if (series.music) {
                        const track = MUSIC_TRACKS.find(t => t.id === series.music);
                        if (track) {
                            try {
                                // In production/Vercel, accessing public folder via fs might be tricky.
                                // But Inngest usually runs in Node environment.
                                const musicFilePath = path.join(process.cwd(), 'public', 'music', track.filename);
                                if (fs.existsSync(musicFilePath)) {
                                    const musicBuffer = fs.readFileSync(musicFilePath);
                                    const musicFileName = `${seriesId}/music-${track.id}-${Date.now()}.mp3`;

                                    const { error: musicUploadError } = await supabase.storage
                                        .from("series-assets")
                                        .upload(musicFileName, musicBuffer, { contentType: "audio/mpeg" });

                                    if (musicUploadError) {
                                        console.error("Failed to upload music:", musicUploadError);
                                    } else {
                                        const { data } = supabase.storage
                                            .from("series-assets")
                                            .getPublicUrl(musicFileName);
                                        musicUrl = data.publicUrl;
                                    }
                                } else {
                                    console.warn(`Music file not found at path: ${musicFilePath}`);
                                }
                            } catch (err) {
                                console.error("Error preparing music:", err);
                            }
                        }
                    }
                    return { musicUrl };
                })
            ]);

            // Step 5: Generate Captions (Requires Audio)
            const captions = await step.run("generate-captions", async () => {
                const { transcribeAudio } = await import("@/lib/deepgram");
                if (!audio.audioUrl) throw new Error("No audio URL generated");
                const captions = await transcribeAudio(audio.audioUrl);
                return { captions };
            });

            // Step 6: Render Video
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
                    musicUrl: music.musicUrl,
                    captions: captions.captions,
                    script: script.script
                };

                const compositionId = "MyComp";
                const outputBucket = "creatorcloud-renders";
                const outputKey = `${seriesId}/video-${Date.now()}.mp4`;

                let durationInFrames = 300;
                if (captions.captions && captions.captions.length > 0) {
                    const lastCaption = captions.captions[captions.captions.length - 1];
                    durationInFrames = Math.ceil((lastCaption.end + 2) * 30);
                }

                try {
                    const response = await fetch(`${renderServiceUrl}/render`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
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

                    return { videoUrl: data.url };
                } catch (err: any) {
                    console.error("Render failed", err);
                    throw err;
                }
            });

            // Step 7: Save to Database (Success)
            const savedVideo = await step.run("save-to-db", async () => {
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                );

                const videoId = event.data.videoId;
                const videoPath = renderResult.videoUrl;

                const dbData = {
                    script: script,
                    audio_url: audio.audioUrl,
                    voice_model: audio.voiceModel,
                    captions: captions.captions,
                    image_urls: images.imageUrls,
                    video_url: videoPath,
                    status: videoPath ? 'completed' : 'failed'
                };

                if (videoId) {
                    const { data, error } = await supabase
                        .from("videos")
                        .update(dbData)
                        .eq("id", videoId)
                        .select()
                        .single();
                    if (error) throw new Error(`Failed to update video: ${error.message}`);
                    return data;
                } else {
                    const { data, error } = await supabase
                        .from("videos")
                        .insert({
                            ...dbData,
                            series_id: seriesId,
                            user_id: series.user_id, // We need this from Step 1
                        })
                        .select()
                        .single();
                    if (error) throw new Error(`Failed to insert video: ${error.message}`);
                    return data;
                }
            });

            // Step 8: Send Notification Email
            await step.run("send-notification-email", async () => {
                if (event.data.skipNotification || !savedVideo.video_url) return { status: "skipped" };

                const { plunk } = await import("@/lib/plunk");
                if (!plunk) return { status: "skipped", reason: "No plunk client" };

                const { generateVideoNotificationEmail } = await import("@/lib/email-helpers");
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                );

                const { data: user } = await supabase
                    .from("users")
                    .select("email, name")
                    .eq("id", series.user_id)
                    .single();

                if (user && user.email) {
                    const emailHtml = generateVideoNotificationEmail({
                        userName: user.name || "Creator",
                        videoTitle: script.title || "Your New Video",
                        videoUrl: savedVideo.video_url,
                        thumbnailUrl: images.imageUrls?.[0],
                        seriesName: series.series_name,
                    });

                    await plunk.emails.send({
                        to: user.email,
                        subject: `Your video "${script.title || 'Video'}" is ready! 🎬`,
                        body: emailHtml,
                    });
                }
            });

            return { success: true, videoId: savedVideo.id };

        } catch (error: any) {
            // Global Error Handler for the function
            console.error("Workflow Failed:", error);

            // Attempt to update DB status to failed
            await step.run("handle-failure", async () => {
                const videoId = event.data.videoId;
                if (videoId) {
                    const supabase = createClient(
                        process.env.NEXT_PUBLIC_SUPABASE_URL!,
                        process.env.SUPABASE_SERVICE_ROLE_KEY!
                    );
                    await supabase
                        .from("videos")
                        .update({
                            status: 'failed',
                            error_message: error.message || "Unknown workflow error"
                        })
                        .eq("id", videoId);
                }
            });

            // Ensure we always throw an Error object for Inngest serialization
            const normalizedError = error instanceof Error ? error : new Error(String(error));
            throw normalizedError;
        }
    }
);
