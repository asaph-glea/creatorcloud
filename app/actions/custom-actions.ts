"use server"

import { inngest } from "@/inngest/client"
import { syncUser } from "@/utils/supabase/sync-user"
import { createClient } from "@supabase/supabase-js"
import { generateVoiceover } from "@/lib/deepgram"

export async function generatePreviewAudio(script: string) {
    if (!script || script.length < 5) return { success: false, error: "Script too short" };

    try {
        // Sanitize
        const cleanScript = script.replace(/<[^>]*>?/gm, '');

        // Generate TTS (using default model for preview to save cost/complexity, 
        // or match the one in generate-video if possible, but keeping it simple for now)
        const audioBuffer = await generateVoiceover({
            text: cleanScript,
            model: "aura-asteria-en"
        });

        // Upload to a temporary bucket or public bucket with quick expiration?
        // For simplicity, use same bucket, maybe under "previews/" folder.
        // We need it public for the player to read it.
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const fileName = `previews/audio-${Date.now()}.mp3`;
        const { error: uploadError } = await supabase.storage
            .from("series-assets")
            .upload(fileName, audioBuffer, {
                contentType: "audio/mpeg",
                upsert: true
            });

        if (uploadError) throw new Error("Upload failed");

        const { data } = supabase.storage
            .from("series-assets")
            .getPublicUrl(fileName);

        return { success: true, audioUrl: data.publicUrl };

    } catch (error: any) {
        console.error("Preview Audio Error:", error);
        return { success: false, error: error.message };
    }
}

export async function createCustomVideo(formData: FormData) {
    console.log("DEBUG: createCustomVideo Server Action Started");
    console.log("DEBUG: Env NODE_ENV:", process.env.NODE_ENV);
    console.log("DEBUG: Env SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

    try {
        console.log("DEBUG: Calling syncUser()...");
        const user = await syncUser()
        console.log("DEBUG: syncUser result:", user ? `User ID: ${user.id}` : "null");

        if (!user) throw new Error("Unauthorized")

        const seriesId = formData.get("seriesId") as string
        const script = formData.get("script") as string
        const images = formData.getAll("images") as File[]

        if (!seriesId || !script || images.length === 0) {
            return { success: false, error: "Missing required fields" }
        }

        // Sanitize Script (Security)
        // Remove HTML tags to prevent injection (though React escapes, this is safer for DB/Email)
        const sanitizedScript = script.replace(/<[^>]*>?/gm, '');

        // Validate Images (Security)
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

        for (const file of images) {
            if (file.size > MAX_FILE_SIZE) {
                return { success: false, error: `File "${file.name}" exceeds 10MB limit.` };
            }
            if (!ALLOWED_TYPES.includes(file.type)) {
                return { success: false, error: `File "${file.name}" has invalid type (${file.type}). Allowed: PNG, JPG, WEBP.` };
            }
        }

        // Initialize Admin Client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 1. Upload Images to Supabase (Parallel Performance)
        console.log(`DEBUG: Starting parallel upload of ${images.length} images...`);

        const uploadPromises = images.map(async (file, i) => {
            const buffer = await file.arrayBuffer()
            // Sanitize filename
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
            const fileName = `${seriesId}/custom-${Date.now()}-${i}-${safeName}`

            const { error: uploadError } = await supabase.storage
                .from("series-assets")
                .upload(fileName, buffer, {
                    contentType: file.type,
                    upsert: true
                })

            if (uploadError) {
                console.error(`Failed to upload custom image ${i} (${file.name}):`, uploadError)
                throw new Error(`Failed to upload image: ${file.name}`);
            }

            const { data } = supabase.storage
                .from("series-assets")
                .getPublicUrl(fileName)

            return data.publicUrl;
        });

        let customImageUrls: string[];
        try {
            customImageUrls = await Promise.all(uploadPromises);
            console.log("DEBUG: All images uploaded successfully.");
        } catch (uploadError: any) {
            return { success: false, error: uploadError.message || "Image upload failed" };
        }

        if (customImageUrls.length === 0) {
            return { success: false, error: "Failed to upload any images" }
        }

        // 2. Create Video Record
        const { data: video, error: dbError } = await supabase
            .from("videos")
            .insert({
                series_id: seriesId,
                user_id: user.id,
                status: "processing",
                script: {
                    title: "Custom Video",
                    script: script,
                    image_prompts: [] // No prompts for custom
                },
                image_urls: customImageUrls, // Store pre-uploaded images
            })
            .select()
            .single()

        if (dbError) throw new Error(`Failed to create video record: ${dbError.message}`)

        // 3. Trigger Inngest Workflow
        // We reuse the existing workflow but pass custom data
        console.log("Triggering Inngest workflow with data:", {
            seriesId,
            videoId: video.id,
            test: false,
            customScriptLength: script.length,
            customImageArgsCount: customImageUrls.length
        });

        try {
            console.log("DEBUG: Triggering Inngest workflow with data:", {
                seriesId,
                videoId: video.id,
                test: false,
                customScriptLength: sanitizedScript.length, // Log length, not content for privacy/size
                customImageArgsCount: customImageUrls.length
            });

            const result = await inngest.send({
                name: "video/generate.series",
                data: {
                    seriesId,
                    videoId: video.id,
                    test: false,
                    customScript: sanitizedScript,
                    customImageUrls: customImageUrls
                },
            });
            console.log("DEBUG: Inngest send result:", JSON.stringify(result, null, 2));

            // Return early success if we verify send
            if (result && result.ids && result.ids.length > 0) {
                console.log(`DEBUG: Inngest event sent successfully. ID: ${result.ids[0]}`);
            } else {
                console.warn("DEBUG: Inngest send returned empty/unexpected result:", result);
            }

        } catch (inngestError: any) {
            console.error("Failed to send Inngest event:", inngestError);
            console.error("Inngest Error Details:", JSON.stringify(inngestError, Object.getOwnPropertyNames(inngestError)));
            // We might not want to fail the whole request if just the async trigger checks failed, 
            // but for now let's rethrow or handle as needed. 
            // If this fails, the video is in DB but workflow won't start.
            throw inngestError;
        }

        return { success: true, videoId: video.id }

    } catch (error: any) {
        console.error("Create Custom Video Error:", error)
        return { success: false, error: error.message || "Failed to create custom video" }
    }
}
