
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { syncUser } from "@/utils/supabase/sync-user";

export async function GET(request: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const publicUser = await syncUser();
        if (!publicUser) {
            return NextResponse.json({ error: "User synchronization failed" }, { status: 500 });
        }


        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        let query = supabase
            .from("series")
            .select("*")
            .eq("user_id", publicUser.id);

        if (id) {
            query = query.eq("id", id);
        }

        const { data: series, error } = await query.order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching series:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ series });
    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get ID from query params or body. Let's support both or just body.
        // Usually DELETE body is fine, or URL param. 
        // Let's check query params first for ease of use.
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing series ID" }, { status: 400 });
        }

        const publicUser = await syncUser();
        if (!publicUser) {
            return NextResponse.json({ error: "User synchronization failed" }, { status: 500 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Verify ownership before deleting
        const { error } = await supabase
            .from("series")
            .delete()
            .eq("id", id)
            .eq("user_id", publicUser.id);

        if (error) {
            console.error("Error deleting series:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });


    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const publicUser = await syncUser();
        if (!publicUser) {
            return NextResponse.json({ error: "User synchronization failed" }, { status: 500 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Map frontend camelCase to DB snake_case if necessary
        // Or expect body to match DB columns? 
        // Let's expect camelCase from frontend and map here to be safe and consistent with create.
        const dbUpdates: any = {};
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.seriesName) dbUpdates.series_name = updates.seriesName;
        if (updates.nicheType) dbUpdates.niche_type = updates.nicheType;
        if (updates.selectedNiche) dbUpdates.selected_niche = updates.selectedNiche;
        if (updates.customNiche) dbUpdates.custom_niche = updates.customNiche;
        if (updates.language) dbUpdates.language = updates.language;
        if (updates.voice) dbUpdates.voice = updates.voice;
        if (updates.music) dbUpdates.music = updates.music;
        // customMusicUrl ... 
        if (updates.videoStyle) dbUpdates.video_style = updates.videoStyle;
        if (updates.captionStyle) dbUpdates.caption_style = updates.captionStyle;
        if (updates.videoDuration) dbUpdates.video_duration = updates.videoDuration;
        if (updates.platform) dbUpdates.platform = updates.platform;
        if (updates.publishTime) dbUpdates.publish_time = updates.publishTime;

        if (Object.keys(dbUpdates).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        // Verify ownership before updating
        const { error } = await supabase
            .from("series")
            .update(dbUpdates)
            .eq("id", id)
            .eq("user_id", publicUser.id);

        if (error) {
            console.error("Error updating series:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
