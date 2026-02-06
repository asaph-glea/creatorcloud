"use server"

import { inngest } from "@/inngest/client"

export async function triggerVideoGeneration(seriesId: string) {
    try {
        await inngest.send({
            name: "video/generate.series",
            data: {
                seriesId,
            },
        })
        return { success: true }
    } catch (error) {
        console.error("Failed to trigger video generation:", error)
        return { success: false, error: "Failed to start generation" }
    }
}
