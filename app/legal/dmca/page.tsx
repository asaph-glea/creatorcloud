import { LegalFooter } from "@/components/legal-footer";

export default function DMCAPolicy() {
    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl prose dark:prose-invert">
                <h1>DMCA Takedown Policy</h1>
                <p className="text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>

                <h2>1. Introduction</h2>
                <p>Creator Cloud is an AI automation platform. We respect the intellectual property rights of others and expect our users to do the same.</p>

                <h2>2. Reporting Copyright Infringements</h2>
                <p>If you believe that any content generated or published on Creator Cloud infringes your copyright, please submit a written notification to our Designated Copyright Agent containing the following information (the "DMCA Notice"):</p>
                <ul>
                    <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
                    <li>Identification of the copyrighted work claimed to have been infringed.</li>
                    <li>Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit us to locate the material (e.g., the URL of the offending content).</li>
                    <li>Information reasonably sufficient to permit us to contact you, such as an address, telephone number, and email address.</li>
                    <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
                    <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
                </ul>

                <h2>3. Contact Information</h2>
                <p>Our Designated Copyright Agent to receive DMCA Notices is:</p>
                <p>
                    <strong>Creator Cloud Legal Team</strong><br />
                    Email: dmca@creatorcloud.app
                </p>

                <h2>4. Counter-Notices</h2>
                <p>If you believe your content was removed by mistake or misidentification, you may submit a counter-notice to our agent with your physical or electronic signature, identification of the material removed, a statement under penalty of perjury that the removal was a mistake, and your contact information.</p>
            </main>
            <LegalFooter />
        </div>
    );
}
