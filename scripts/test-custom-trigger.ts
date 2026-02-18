
import { inngest } from "@/inngest/client";

async function main() {
    console.log("Testing Custom Video Trigger...");

    // You might need a valid series ID from your DB.
    // Replace this with a real ID or fetch one.
    const TEST_SERIES_ID = "replace-with-real-series-id";

    try {
        const result = await inngest.send({
            name: "video/generate.series",
            data: {
                seriesId: TEST_SERIES_ID,
                videoId: "test-video-id",
                test: false,
                customScript: "This is a test script for custom video generation.",
                customImageUrls: ["https://example.com/image1.png", "https://example.com/image2.png"]
            },
        });
        console.log("Inngest send result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Test Failed:", error);
    }
}

main();
