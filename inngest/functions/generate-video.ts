import { inngest } from "@/inngest/client";
import { createClient } from "@supabase/supabase-js";

export const generateVideo = inngest.createFunction(
    { id: "generate-video" },
    { event: "video/generate.series" },
    async ({ event, step }) => {
        const { seriesId } = event.data;

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

            // Map series voice to Deepgram model if needed, or default
            // Assuming series.voice holds a name or ID. Deepgram needs models like "aura-asteria-en"
            // Defaults to 'aura-asteria-en' if not specified or mapped
            // TODO: Implement proper voice mapping based on series.voice
            const audioBuffer = await generateVoiceover({
                text: script.script,
                model: "aura-asteria-en"
            });

            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            const fileName = `${seriesId}/voiceover-${Date.now()}.mp3`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from("series-assets")
                .upload(fileName, audioBuffer, {
                    contentType: "audio/mpeg",
                });

            if (uploadError) throw new Error(`Failed to upload audio: ${uploadError.message}`);

            const { data: { publicUrl } } = supabase.storage
                .from("series-assets")
                .getPublicUrl(fileName);

            return { audioUrl: publicUrl };
        });

        // Step 4: Generate Captions
        const captions = await step.run("generate-captions", async () => {
            const { transcribeAudio } = await import("@/lib/deepgram");

            // We need the public URL from the previous step
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

            // Iterate over image prompts
            // Normalize script.image_prompts to array if needed
            const prompts = Array.isArray(script.image_prompts) ? script.image_prompts : [];

            for (let i = 0; i < prompts.length; i++) {
                const prompt = prompts[i];
                const imageBuffer = await generateImage({ prompt });
                const fileName = `${seriesId}/image-${i}-${Date.now()}.png`;

                const { error: uploadError } = await supabase.storage
                    .from("series-assets") // Using the existing bucket
                    .upload(fileName, imageBuffer, {
                        contentType: "image/png",
                    });

                if (uploadError) throw new Error(`Failed to upload image ${i}: ${uploadError.message}`);

                const { data: { publicUrl } } = supabase.storage
                    .from("series-assets")
                    .getPublicUrl(fileName);

                imageUrls.push(publicUrl);

                // Sleep 10s to respect Rate Limit
                if (i < prompts.length - 1) await new Promise(r => setTimeout(r, 10000));
            }

            return { imageUrls };
        });

        // Step 6: Save to Database
        const savedVideo = await step.run("save-to-db", async () => {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            const { data, error } = await supabase
                .from("videos")
                .insert({
                    series_id: seriesId,
                    user_id: series.user_id,
                    script: script,
                    audio_url: audio.audioUrl,
                    voice_model: "aura-asteria-en", // TODO: Making dynamic based on series settings
                    captions: captions.captions,
                    image_urls: images.imageUrls,
                    status: 'completed'
                })
                .select()
                .single();

            if (error) throw new Error(`Failed to save video to database: ${error.message}`);

            return data;
        });

        return { success: true, videoId: savedVideo.id };
    }
);
