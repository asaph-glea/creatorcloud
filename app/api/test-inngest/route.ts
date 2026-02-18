
import { inngest } from "@/inngest/client";
import { NextResponse } from "next/server";

export async function GET() {
    console.log("DEBUG: /api/test-inngest called");
    try {
        const result = await inngest.send({
            name: "video/generate.series",
            data: {
                seriesId: "test-series-" + Date.now(),
                test: true,
                customScript: "Test Script from API Route",
                customImageUrls: ["https://via.placeholder.com/150"]
            }
        });
        console.log("DEBUG: Inngest send success:", result);
        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        console.error("DEBUG: Inngest send failed:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
