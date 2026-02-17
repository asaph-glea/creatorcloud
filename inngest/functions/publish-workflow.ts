import { inngest } from "@/inngest/client";
import { createClient } from "@supabase/supabase-js";

export const publishWorkflow = inngest.createFunction(
    { id: "publish-workflow" },
    { event: "video/publish.workflow" },
    async ({ event, step }) => {
        const { seriesId, test } = event.data;

        // Step 1: Trigger Video Generation
        // We trigger the generation function and wait for it to complete.
        // We pass 'skipNotification: true' so the generation function doesn't send the email immediately.
        const generationResult = await step.invoke("generate-video", {
            function: "creatorcloud-generate-video", // Must match the ID in generate-video.ts
            data: {
                seriesId: seriesId,
                skipNotification: true,
            },
        });

        // Step 2: Fetch Series Details for Publish Time
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
            return data;
        });

        // Step 3: Wait Information
        // If it's a test run, we don't wait.
        // If it's a real run, we wait until the publish_time.
        // Note: The scheduler triggers this 2 hours before.
        // So we calculate the delay.

        if (!test && series.publish_time) {
            await step.run("wait-for-publish-time", async () => {
                const now = new Date();
                const [targetHour, targetMinute] = series.publish_time.split(':').map(Number);

                // Create target date for today
                const targetTime = new Date(now);
                targetTime.setHours(targetHour, targetMinute, 0, 0);

                // If target time is in the past (e.g. slight delay in processing), we publish immediately.
                // If it's in the future, we calculate the sleep duration.
                let delay = targetTime.getTime() - now.getTime();

                if (delay > 0) {
                    console.log(`Waiting for ${delay}ms until publish time: ${series.publish_time}`);
                    // Inngest sleep handles delays (up to a year)
                    await step.sleep("wait-until-publish", delay);
                } else {
                    console.log("Publish time passed, publishing immediately.");
                }
            });
        }

        // Step 4: Publish to Platforms
        // This runs after the wait (or immediately if test/past time)

        await step.run("publish-video", async () => {
            // 1. Email Notification
            if (series.platform && series.platform.includes('email')) {
                const { plunk } = await import("@/lib/plunk");
                const { generateVideoNotificationEmail } = await import("@/lib/email-helpers");
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                );

                // Fetch user email
                const { data: user } = await supabase
                    .from("users")
                    .select("email, name")
                    .eq("id", series.user_id)
                    .single();

                // Get the generated video details. 
                // Since invoke returns the result of the function, and generate-video returns { videoUrl } (if we update it to return that)
                // Wait, generate-video currently returns the result of the LAST step? 
                // We need to ensuring generate-video returns the video details.
                // Currently generate-video ends with send-notification-email. 
                // We should probably specifically return the saved video object from generate-video.

                // Ideally, we fetch the latest video for this series.
                const { data: latestVideo } = await supabase
                    .from("videos")
                    .select("*")
                    .eq("series_id", seriesId)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single();

                if (user && latestVideo && plunk) {
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
                }
            }

            // 2. YouTube (Placeholder)
            if (series.platform && series.platform.includes('youtube')) {
                console.log("TODO: Upload to YouTube channel");
            }

            // 3. Instagram (Placeholder)
            if (series.platform && series.platform.includes('instagram')) {
                console.log("TODO: Post to Instagram");
            }

            // 4. TikTok (Placeholder)
            if (series.platform && series.platform.includes('tiktok')) {
                console.log("TODO: Post to TikTok");
            }
        });
    }
);
