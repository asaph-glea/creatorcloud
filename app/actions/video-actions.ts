"use server"

import { inngest } from "@/inngest/client"
import { syncUser } from "@/utils/supabase/sync-user"
import { createClient } from "@supabase/supabase-js"

export async function triggerVideoGeneration(seriesId: string) {
    try {
        const user = await syncUser()
        if (!user) throw new Error("Unauthorized")

        // Initialize Admin Client for DB operations
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 1. Create initial video record with 'processing' status
        const { data: video, error } = await supabase
            .from("videos")
            .insert({
                series_id: seriesId,
                user_id: user.id,
                status: "processing",
                // Initialize other fields as null or empty
                image_urls: [],
            })
            .select()
            .single()

        if (error) throw new Error(`Failed to create video record: ${error.message}`)

        // 2. Trigger Inngest with the new videoId
        await inngest.send({
            name: "video/generate.series",
            data: {
                seriesId,
                videoId: video.id, // Pass the ID to update later
                userId: user.id
            },
        })

        return { success: true, videoId: video.id }
    } catch (error: any) {
        console.error("Failed to trigger video generation:", error)
        return { success: false, error: error.message || "Failed to start generation" }
    }
}
