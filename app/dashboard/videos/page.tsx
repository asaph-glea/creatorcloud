
import { createClient } from "@supabase/supabase-js"; // Use direct client for Service Role
import { VideoList } from "@/components/dashboard/video-list";
import { redirect } from "next/navigation";
import { syncUser } from "@/utils/supabase/sync-user";

export default async function VideosPage() {
    const user = await syncUser();
    if (!user) {
        redirect("/sign-in");
    }

    // Use Service Role to bypass RLS since we authenticated via Clerk
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch videos with series details
    // We order by created_at descending
    const { data: videos, error } = await supabase
        .from("videos")
        .select(`
            id,
            user_id,
            status,
            created_at,
            image_urls,
            voice_model,
            series:series_id (
                series_name,
                niche_type,
                video_style,
                publish_time
            )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching videos:", error);
        return <div>Error loading videos.</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">My Videos</h1>
            <VideoList initialVideos={videos || []} />
        </div>
    );
}
