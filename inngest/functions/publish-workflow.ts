import { inngest } from "@/inngest/client";
import { createClient } from "@supabase/supabase-js";
import { MUSIC_TRACKS } from "@/lib/constants";
import fs from "fs";
import path from "path";

export const publishWorkflow = inngest.createFunction(
    { id: "publish-workflow" },
    { event: "video/publish.workflow" },
    async ({ event, step }) => {
        try {
            const { seriesId, test, customScript, customImageUrls } = event.data;

            // Step 1: Fetch Series Details
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

                if (error) throw new Error(error.message);
                if (!data) throw new Error("Series not found");
                return data;
            });

            // Step 2: Generate Video Script (or use Custom)
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

            // Step 3: Prapare Audio (Voiceover + Music)
            const audioAssets = await step.run("prepare-audio", async () => {
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                );

                // 3a. Generate Voiceover
                const { generateVoiceover } = await import("@/lib/deepgram");
                // Defaults to 'aura-asteria-en' if not specified
                const voiceBuffer = await generateVoiceover({
                    text: script.script,
                    model: "aura-asteria-en"
                });
                const voiceFileName = `${seriesId}/voiceover-${Date.now()}.mp3`;
                const { error: voiceError } = await supabase.storage
                    .from("series-assets")
                    .upload(voiceFileName, voiceBuffer, { contentType: "audio/mpeg" });

                if (voiceError) throw new Error(`Failed to upload voice: ${voiceError.message}`);
                const { data: { publicUrl: voiceUrl } } = supabase.storage
                    .from("series-assets")
                    .getPublicUrl(voiceFileName);

                // 3b. Upload Background Music
                // We need to upload the local music file to Supabase so the remote renderer can access it.
                let musicUrl: string | undefined = undefined;
                if (series.music) {
                    const track = MUSIC_TRACKS.find(t => t.id === series.music);
                    if (track) {
                        try {
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

                return { voiceUrl, musicUrl };
            });

            // Step 4: Generate Captions
            const captions = await step.run("generate-captions", async () => {
                const { transcribeAudio } = await import("@/lib/deepgram");
                if (!audioAssets.voiceUrl) throw new Error("No audio URL generated from previous step");
                const captions = await transcribeAudio(audioAssets.voiceUrl);
                return { captions };
            });

            // Step 5: Generate Images (or use Custom)
            const images = await step.run("generate-images", async () => {
                if (customImageUrls && Array.isArray(customImageUrls) && customImageUrls.length > 0) {
                    // For custom videos, we might want to duplicate specific images to match the video duration 
                    // if the user uploaded fewer images than needed. 
                    // But for now, let's just use what they gave us. The composition logic handles looping/stretching.
                    return { imageUrls: customImageUrls };
                }

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

                        // If it's a rate limit error that bubbled up after internal retries, do NOT try fallback
                        const isRateLimit = error?.message?.includes("429") || error?.status === 429;
                        if (isRateLimit) {
                            console.error("Rate limit persisted. Skipping fallback to avoid further throttling.");
                            throw error;
                        }

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
                    audioUrl: audioAssets.voiceUrl,
                    musicUrl: audioAssets.musicUrl,
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

            // Step 7: Save to Database (Insert new record or Update existing)
            const savedVideo = await step.run("save-to-db", async () => {
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                );

                const videoPath = renderResult.videoUrl;
                const usedVoiceModel = "aura-asteria-en";


                let data: any;

                if (event.data.videoId) {
                    const { data: updated, error } = await supabase
                        .from("videos")
                        .update({
                            script: script,
                            audio_url: audioAssets.voiceUrl,
                            voice_model: usedVoiceModel,
                            captions: captions.captions,
                            image_urls: images.imageUrls,
                            video_url: videoPath,
                            status: videoPath ? 'completed' : 'failed'
                        })
                        .eq('id', event.data.videoId)
                        .select()
                        .single();
                    if (error) throw new Error(`Failed to update video: ${error.message}`);
                    data = updated;
                } else {
                    const { data: inserted, error } = await supabase
                        .from("videos")
                        .insert({
                            series_id: seriesId,
                            user_id: series.user_id,
                            script: script,
                            audio_url: audioAssets.voiceUrl,
                            voice_model: usedVoiceModel,
                            captions: captions.captions,
                            image_urls: images.imageUrls,
                            video_url: videoPath,
                            status: videoPath ? 'completed' : 'failed'
                        })
                        .select()
                        .single();
                    if (error) throw new Error(`Failed to insert video: ${error.message}`);
                    data = inserted;
                }

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

                const latestVideo = savedVideo;

                // Parse Platforms Logic
                let platforms: string[] = [];
                if (Array.isArray(series.platform)) {
                    platforms = series.platform;
                } else if (typeof series.platform === 'string') {
                    try {
                        const parsed = JSON.parse(series.platform);
                        if (Array.isArray(parsed)) {
                            platforms = parsed;
                        } else {
                            platforms = [String(parsed)];
                        }
                    } catch (e) {
                        platforms = [series.platform];
                    }
                }

                const hasEmail = platforms.includes('email');

                console.log("Debug: Parsed Platforms:", platforms);

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

            });

            return { success: true, videoId: savedVideo.id };

        } catch (error: any) {
            // Ensure we always throw an Error object for Inngest serialization
            const normalizedError = error instanceof Error ? error : new Error(String(error));
            console.error("Publish Workflow Failed:", normalizedError);
            throw normalizedError;
        }
    }
);
