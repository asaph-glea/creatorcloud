import { inngest } from "@/inngest/client";
import { createClient } from "@supabase/supabase-js";

export const publishWorkflow = inngest.createFunction(
    { id: "publish-workflow" },
    { event: "video/publish.workflow" },
    async ({ event, step }) => {
        const { seriesId, test } = event.data;

        // Step 1: Fetch Series Details
        const series = await step.run("fetch-series-details", async () => {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );
            const { data, error } = await supabase
                .from("series")
                .select("*")
                .eq("id", seriesId)
                .single();

            if (error) throw new Error(error.message);
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
            // Defaults to 'aura-asteria-en' if not specified
            const audioBuffer = await generateVoiceover({
                text: script.script,
                model: "aura-asteria-en"
            });

            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );
            const fileName = `${seriesId}/voiceover-${Date.now()}.mp3`;

            const { error: uploadError } = await supabase.storage
                .from("series-assets")
                .upload(fileName, audioBuffer, { contentType: "audio/mpeg" });

            if (uploadError) throw new Error(`Failed to upload audio: ${uploadError.message}`);

            const { data: { publicUrl } } = supabase.storage
                .from("series-assets")
                .getPublicUrl(fileName);

            return { audioUrl: publicUrl };
        });

        // Step 4: Generate Captions
        const captions = await step.run("generate-captions", async () => {
            const { transcribeAudio } = await import("@/lib/deepgram");
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
            const prompts = Array.isArray(script.image_prompts) ? script.image_prompts : [];

            for (let i = 0; i < prompts.length; i++) {
                let prompt = prompts[i];
                if (typeof prompt === 'object' && prompt !== null) {
                    // @ts-ignore
                    prompt = prompt.image_prompt || prompt.prompt || prompt.text || JSON.stringify(prompt);
                }
                prompt = String(prompt);

                console.log(`Generating image ${i} with prompt:`, prompt);
                let imageBuffer: Buffer;
                try {
                    imageBuffer = await generateImage({ prompt });
                } catch (error: any) {
                    console.error(`Error generating image ${i}:`, error.message);
                    console.log("Attempting fallback generation...");
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

                if (i < prompts.length - 1) await new Promise(r => setTimeout(r, 10000));
            }
            return { imageUrls };
        });

        // Step 6: Render Video
        const renderResult = await step.run("render-video", async () => {
            const renderServiceUrl = process.env.NEXT_PUBLIC_RENDER_SERVICE_URL;
            if (!renderServiceUrl) {
                console.warn("RENDER_SERVICE_URL not found. Skipping video rendering.");
                return { videoUrl: null };
            }

            const inputProps = {
                audioUrl: audio.audioUrl,
                imageUrls: images.imageUrls,
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

        // Step 7: Save to Database (Insert new record)
        const savedVideo = await step.run("save-to-db", async () => {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            const videoPath = renderResult.videoUrl;
            const usedVoiceModel = "aura-asteria-en";

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
        });

        // Step 8: Wait Information (if not test)
        if (!test && series.publish_time) {
            await step.run("wait-for-publish-time", async () => {
                const now = new Date();
                const [targetHour, targetMinute] = series.publish_time.split(':').map(Number);
                const targetTime = new Date(now);
                targetTime.setHours(targetHour, targetMinute, 0, 0);

                let delay = targetTime.getTime() - now.getTime();
                if (delay > 0) {
                    console.log(`Waiting for ${delay}ms until publish time: ${series.publish_time}`);
                    await step.sleep("wait-until-publish", delay);
                } else {
                    console.log("Publish time passed, publishing immediately.");
                }
            });
        }

        // Step 9: Publish to Platforms (Email + YouTube)
        await step.run("publish-video", async () => {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            // Re-fetch User (can be optimized but safe)
            const { data: user } = await supabase
                .from("users")
                .select("*")
                .eq("id", series.user_id)
                .single();

            const latestVideo = savedVideo; // Use the video we just saved

            // 1. Email Notification
            // We ALWAYS attempt access email logic if platform includes it OR if we force it. 
            // Note: series.platform might be null if not selected. 
            // Ensure safe access.
            const platforms = Array.isArray(series.platform) ? series.platform : [];
            const hasEmail = platforms.includes('email');

            // DEBUG LOGGING
            console.log("Platforms:", platforms);
            console.log("Has Email:", hasEmail);

            if (hasEmail) {
                const { plunk } = await import("@/lib/plunk");
                const { generateVideoNotificationEmail } = await import("@/lib/email-helpers");

                if (user && plunk) {
                    const emailHtml = generateVideoNotificationEmail({
                        userName: user.name || "Creator",
                        videoTitle: latestVideo.script?.title || "Your New Scheduled Video",
                        videoUrl: latestVideo.video_url,
                        thumbnailUrl: latestVideo.image_urls?.[0],
                        seriesName: series.series_name,
                    });

                    await plunk.emails.send({
                        to: user.email,
                        subject: `[Published] Your video is live! 🚀`,
                        body: emailHtml,
                    });
                    console.log(`Scheduled email sent to ${user.email}`);
                } else {
                    console.warn("Skipping Email: Missing User or Plunk Client");
                }
            }

            // 2. YouTube Publishing
            if (platforms.includes('youtube')) {
                console.log("Starting YouTube Publishing...");

                const { data: connection } = await supabase
                    .from("social_connections")
                    .select("*")
                    .eq("user_id", series.user_id)
                    .eq("platform", "youtube")
                    .single();

                if (!connection || !connection.connected) {
                    console.error("No active YouTube connection found for user:", series.user_id);
                    await supabase.from("videos").update({ publish_status: 'failed', platform_error: 'No active YouTube connection' }).eq("id", latestVideo.id);
                    return;
                }

                try {
                    const { google } = await import('googleapis');
                    const oauth2Client = new google.auth.OAuth2(
                        process.env.GOOGLE_CLIENT_ID,
                        process.env.GOOGLE_CLIENT_SECRET
                    );

                    oauth2Client.setCredentials({
                        access_token: connection.access_token,
                        refresh_token: connection.refresh_token,
                        expiry_date: connection.token_expires_at ? new Date(connection.token_expires_at).getTime() : undefined
                    });

                    // Refresh token logic
                    const isExpired = !connection.token_expires_at || new Date(connection.token_expires_at).getTime() < Date.now() + 5 * 60 * 1000;
                    if (isExpired && connection.refresh_token) {
                        console.log("Refreshing YouTube access token...");
                        const { credentials } = await oauth2Client.refreshAccessToken();
                        oauth2Client.setCredentials(credentials);
                        await supabase.from("social_connections").update({
                            access_token: credentials.access_token,
                            refresh_token: credentials.refresh_token || connection.refresh_token,
                            token_expires_at: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : undefined,
                            updated_at: new Date().toISOString()
                        }).eq("id", connection.id);
                    }

                    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
                    const response = await fetch(latestVideo.video_url);
                    if (!response.ok) throw new Error(`Failed to fetch video file: ${response.statusText}`);
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const { Readable } = await import('stream');
                    const stream = Readable.from(buffer);

                    console.log("Uploading video to YouTube...");
                    const uploadRes = await youtube.videos.insert({
                        part: ['snippet', 'status'],
                        requestBody: {
                            snippet: {
                                title: latestVideo.script?.title || `New Video from ${series.series_name}`,
                                description: latestVideo.script?.description || `Generated by CreatorCloud. Series: ${series.series_name} \n\n ${latestVideo.script?.content?.substring(0, 100)}...`,
                                tags: ['AiGenerated', 'CreatorCloud', series.niche_type || 'General'],
                            },
                            status: {
                                privacyStatus: 'private',
                                selfDeclaredMadeForKids: false,
                            },
                        },
                        media: { body: stream },
                    });

                    console.log("YouTube Upload Success!", uploadRes.data);
                    await supabase.from("videos").update({
                        publish_status: 'published',
                        platform_video_id: uploadRes.data.id,
                        platform_url: `https://youtube.com/watch?v=${uploadRes.data.id}`,
                        updated_at: new Date().toISOString()
                    }).eq("id", latestVideo.id);

                } catch (err: any) {
                    console.error("YouTube Upload Failed:", err);
                    await supabase.from("videos").update({
                        publish_status: 'failed',
                        platform_error: err?.message || 'Unknown error'
                    }).eq("id", latestVideo.id);
                }
            }

            if (platforms.some((p: string) => ['instagram', 'tiktok', 'facebook'].includes(p))) {
                console.log("Skipping Instagram/TikTok/Facebook - Integration Coming Soon");
            }

            return { success: true, platforms: platforms };
        });

        return { success: true, videoId: savedVideo.id };
    }
);
