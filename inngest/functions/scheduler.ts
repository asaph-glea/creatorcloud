import { inngest } from "@/inngest/client";
import { createClient } from "@supabase/supabase-js";

// Run every 30 minutes
export const scheduler = inngest.createFunction(
    { id: "scheduler" },
    { cron: "*/30 * * * *" },
    async ({ step }) => {
        const seriesList = await step.run("fetch-active-series", async () => {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            // Fetch active series with a publish_time set
            const { data, error } = await supabase
                .from("series")
                .select("*")
                .eq("status", "active")
                .not("publish_time", "is", null);

            if (error) throw new Error(error.message);
            return data || [];
        });

        // Current time
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Iterate series and check if we are in the "2 hours before" window
        for (const series of seriesList) {
            if (!series.publish_time) continue;

            const [pHeader, pMinute] = series.publish_time.split(":").map(Number);

            // Calculate publish date for today
            const publishDate = new Date(now);
            publishDate.setHours(pHeader, pMinute, 0, 0);

            // Calculate generation trigger time (2 hours before)
            const generationDate = new Date(publishDate.getTime() - 2 * 60 * 60 * 1000);

            // If generation time is within the last 30 minutes (scheduler interval), trigger it.
            // This prevents double triggering if we run every 30 mins.
            // We check: generationDate <= now && generationDate > (now - 30mins)

            const diff = now.getTime() - generationDate.getTime();
            const thirtyMins = 30 * 60 * 1000;

            if (diff >= 0 && diff < thirtyMins) {
                await step.sendEvent("trigger-publish", {
                    name: "video/publish.workflow",
                    data: {
                        seriesId: series.id,
                        test: false
                    }
                });
            }
        }

        return { checked: seriesList.length };
    }
);
