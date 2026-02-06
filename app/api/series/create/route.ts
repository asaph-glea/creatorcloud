import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { syncUser } from "@/utils/supabase/sync-user"; // Ensure this path is correct

export async function POST(request: Request) {
    console.log("DEBUG: API POST /api/series/create started");
    try {
        // 1. Authenticate with Clerk
        const user = await currentUser();

        if (!user) {
            console.log("DEBUG: API: No Clerk user found/Unauthorized");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.log("DEBUG: API: Clerk user authenticated:", user.id);

        // 2. Ensure user exists in Supabase 'users' table
        // We use syncUser to get the public user record (and create if missing)
        console.log("DEBUG: API: Calling syncUser()...");
        const publicUser = await syncUser();

        if (!publicUser) {
            console.error("DEBUG: API: syncUser returned null");
            return NextResponse.json({ error: "Failed to synchronize user data" }, { status: 500 });
        }
        console.log("DEBUG: API: syncUser success. User ID:", publicUser.id);

        // 3. Initialize Supabase Admin Client (Service Role)
        // We use the Service Role key to bypass RLS policies for the insert
        // effectively trusting the Clerk authentication we just performed.
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        console.log("DEBUG: API: Supabase client initialized");

        const body = await request.json();
        console.log("DEBUG: API: Request body received. Series Name:", body.seriesName);
        const {
            nicheType,
            selectedNiche,
            customNiche,
            language,
            voice,
            music,
            customMusicUrl,
            videoStyle,
            captionStyle,
            seriesName,
            videoDuration,
            platform,
            publishTime
        } = body;

        // Validate required fields
        if (!seriesName || !videoDuration || !platform || !publishTime) {
            console.error("DEBUG: API: Missing required fields");
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 4. Insert data into series table
        // IMPORTANT: user_id logic depends on your schema.
        // If 'series.user_id' references 'auth.users', this might fail if 'publicUser.id' is a public table UUID.
        // The previous SQL schema referenced 'auth.users'. If you are using Clerk,
        // you likely want to reference 'public.users(id)' (which syncUser returns)
        // OR just store the UUID if you updated the schema.

        console.log("DEBUG: API: Inserting into 'series' table...");
        const { data: seriesData, error } = await supabase
            .from("series")
            .insert({
                user_id: publicUser.id, // Using the ID from the public 'users' table
                niche_type: nicheType,
                selected_niche: selectedNiche || null,
                custom_niche: customNiche || null,
                language: language,
                voice: voice,
                music: music || null,
                custom_music_url: customMusicUrl || null,
                video_style: videoStyle,
                caption_style: captionStyle,
                series_name: seriesName,
                video_duration: videoDuration,
                platform: platform,
                publish_time: publishTime,
                status: 'active'
            })
            .select()
            .single();

        if (error) {
            console.error("DEBUG: API: Error inserting series:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log("DEBUG: API: Success! Series inserted:", seriesData);
        return NextResponse.json({ success: true, data: seriesData });

    } catch (error) {
        console.error("DEBUG: API: Internal Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
