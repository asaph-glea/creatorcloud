import { LegalFooter } from "@/components/legal-footer";

export default function PrivacyPolicy() {
    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl prose dark:prose-invert">
                <h1>Privacy Policy</h1>
                <p className="text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>

                <h2>1. Introduction</h2>
                <p>Welcome to Creator Cloud. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our video generation and social publishing services. We are committed to complying with GDPR, CCPA, and YouTube API Terms of Service.</p>

                <h2>2. Data We Collect</h2>
                <p>We may collect information about you in a variety of ways. The information we may collect via the Site includes:</p>
                <ul>
                    <li><strong>Personal Data:</strong> Name, email address, and demographic information provided during registration.</li>
                    <li><strong>Authentication Data:</strong> OAuth tokens for connected social platforms (e.g., YouTube).</li>
                    <li><strong>User Content:</strong> Uploaded images, audio, custom scripts, and resulting generated video files.</li>
                </ul>

                <h2>3. Use of Information and YouTube API Services</h2>
                <p>Our application uses <strong>YouTube API Services</strong> to allow you to directly upload videos to your YouTube channel. By accessing or using our platform, you are agreeing to be bound by the <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer">YouTube Terms of Service</a> and the <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google Privacy Policy</a>.</p>
                <p>Specifically regarding YouTube integrations:</p>
                <ul>
                    <li>We request the <code>youtube.upload</code> scope strictly to upload the videos you generate on Creator Cloud to your channel.</li>
                    <li>We do not sell, rent, or share your Google user data with any third parties for advertising purposes.</li>
                    <li>You can revoke Creator Cloud's access to your YouTube data at any time via the <a href="https://security.google.com/settings/security/permissions" target="_blank" rel="noreferrer">Google Security Settings page</a>.</li>
                </ul>

                <h2>4. Third-Party Sub-processors</h2>
                <p>We share necessary data with trusted third-party services to fulfill our core functionalities:</p>
                <ul>
                    <li><strong>Clerk:</strong> For identity management and authentication.</li>
                    <li><strong>Neon / Supabase:</strong> For secure database and file storage.</li>
                    <li><strong>Replicate, Google Gemini, Deepgram:</strong> For AI processing of scripts, images, and voiceovers.</li>
                </ul>

                <h2>5. Data Privacy Rights (GDPR / CCPA)</h2>
                <p>You have the right to request access to the personal data we hold about you, to request that we correct any inaccuracies, and to request that we delete your data. You can delete your account and all associated data from the platform settings.</p>

                <h2>6. Contact Us</h2>
                <p>If you have questions or comments about this Privacy Policy, please contact us at legal@creatorcloud.app.</p>
            </main>
            <LegalFooter />
        </div>
    );
}
