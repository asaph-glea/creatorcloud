import { google } from "googleapis";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
        return NextResponse.redirect(new URL("/dashboard/settings?error=youtube_auth_failed", request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL("/dashboard/settings?error=no_code", request.url));
    }

    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`
        );

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user profile info
        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: "v2",
        });

        const { data: userInfo } = await oauth2.userinfo.get();
        const youtube = google.youtube({ version: "v3", auth: oauth2Client });

        // Get channel info to get the proper channel ID (platform_user_id)
        const channelResponse = await youtube.channels.list({
            mine: true,
            part: ["id", "snippet", "contentDetails"]
        });

        const channel = channelResponse.data.items?.[0];
        const channelId = channel?.id || userInfo.id; // Fallback to user ID if no channel found (rare)
        const channelTitle = channel?.snippet?.title || userInfo.name;

        // Store tokens in Supabase
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Find Supabase User ID from Clerk ID
        const { data: dbUser } = await supabase
            .from("users")
            .select("id")
            .eq("clerk_id", user.id)
            .single();

        if (!dbUser) {
            console.error("User not found in Supabase");
            return NextResponse.redirect(new URL("/dashboard/settings?error=user_not_found", request.url));
        }

        const { error: upsertError } = await supabase
            .from("social_connections")
            .upsert(
                {
                    user_id: dbUser.id,
                    platform: "youtube",
                    platform_user_id: channelId,
                    platform_username: channelTitle, // Storing channel name/title
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token, // IMPORTANT: Only returned if access_type=offline and prompt=consent
                    token_expires_at: new Date(tokens.expiry_date || Date.now() + 3500 * 1000).toISOString(),
                    connected: true,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id, platform" }
            );

        if (upsertError) {
            console.error("Supabase upsert error:", upsertError);
            return NextResponse.redirect(new URL("/dashboard/settings?error=db_error", request.url));
        }

        return NextResponse.redirect(new URL("/dashboard/settings?success=youtube_connected", request.url));

    } catch (err) {
        console.error("OAuth callback error:", err);
        return NextResponse.redirect(new URL("/dashboard/settings?error=oauth_error", request.url));
    }
}
