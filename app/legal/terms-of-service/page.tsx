import { LegalFooter } from "@/components/legal-footer";

export default function TermsOfService() {
    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl prose dark:prose-invert">
                <h1>Terms of Service</h1>
                <p className="text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>

                <h2>1. Acceptance of Terms</h2>
                <p>By accessing or using Creator Cloud, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>

                <h2>2. Description of Service</h2>
                <p>Creator Cloud is an AI-powered SaaS platform that allows users to generate videos from text prompts and automatically publish them to connected social media accounts (e.g., YouTube, TikTok).</p>

                <h2>3. Credit-Based Billing and Refunds</h2>
                <p>Our services operate on a credit-based system. By purchasing credits, you acknowledge and agree to the following:</p>
                <ul>
                    <li>Credits are consumed when initiating a video generation request via our AI sub-processors.</li>
                    <li><strong>Non-Refundable:</strong> All credit purchases are strictly non-refundable once processed. Video generations that have begun processing via AI endpoints cannot be canceled or refunded, as computational resources have already been allocated.</li>
                    <li>In the event of a platform-side technical failure preventing the completion of your video, credits will be automatically reimbursed to your account balance.</li>
                </ul>

                <h2>4. User Content and AI Liability</h2>
                <p>You retain all rights to the scripts and prompts you input into Creator Cloud.</p>
                <p><strong>Responsibility for Published Content:</strong> You understand that the platform automatically schedules and uploads AI-generated media to your connected social networks. You assume all liability for the content pushed to your social media accounts. You agree not to use the platform to generate or distribute illegal, hateful, or infringing content.</p>

                <h2>5. Account Suspension</h2>
                <p>We reserve the right to suspend or terminate your account and revoke API access at any time for any reason, including violation of these Terms or the terms of our integrated platforms (such as the YouTube API Terms of Service).</p>
            </main>
            <LegalFooter />
        </div>
    );
}
