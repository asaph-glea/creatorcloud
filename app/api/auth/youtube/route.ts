import { google } from "googleapis";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(request: Request) {
    const user = await currentUser();
    if (!user) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`
    );

    // Generate a secure random state verification code.
    // Ideally, you'd store this in a cookie or database to verify on callback.
    // For simplicity, we'll just pass the user ID (not secure enough for prod but ok for prototype)
    const state = user.id;

    // Access scopes for YouTube
    const scopes = [
        "https://www.googleapis.com/auth/youtube.upload",
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email"
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: "offline", // Essential for getting a refresh token
        scope: scopes,
        state: state,
        prompt: "consent", // Force consent screen to ensure we get a refresh token
        include_granted_scopes: true
    });

    return NextResponse.redirect(url);
}
