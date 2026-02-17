interface VideoNotificationParams {
    userName: string;
    videoTitle: string;
    videoUrl: string;
    thumbnailUrl?: string; // Optional, if we have one
    seriesName: string;
}

export function generateVideoNotificationEmail({
    userName,
    videoTitle,
    videoUrl,
    thumbnailUrl,
    seriesName
}: VideoNotificationParams): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your Video is Ready!</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9fafb; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background-color: #000000; color: #ffffff; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        .thumbnail { width: 100%; max-width: 100%; height: auto; border-radius: 6px; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; background-color: #f3f4f6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CreatorCloud</h1>
        </div>
        <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Great news! Your video for the series <strong>"${seriesName}"</strong> has been successfully generated.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin-top: 0;">${videoTitle}</h3>
                <p>Your content is ready to be shared with the world.</p>
            </div>

            ${thumbnailUrl ? `<img src="${thumbnailUrl}" alt="Video Thumbnail" class="thumbnail" />` : ''}

            <div style="text-align: center;">
                <a href="${videoUrl}" class="button">View & Download Video</a>
            </div>
            
            <p style="margin-top: 30px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="${videoUrl}" style="color: #2563eb; word-break: break-all;">${videoUrl}</a></p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} CreatorCloud. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
}
