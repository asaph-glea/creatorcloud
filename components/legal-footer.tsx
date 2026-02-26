import Link from "next/link";

export function LegalFooter() {
    return (
        <footer className="border-t py-6 md:py-0 bg-background">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row text-sm text-muted-foreground">
                <p>
                    &copy; {new Date().getFullYear()} Creator Cloud. All rights reserved.
                </p>
                <nav className="flex items-center gap-4 text-xs md:text-sm">
                    <Link href="/legal/terms-of-service" className="hover:underline underline-offset-4">
                        Terms of Service
                    </Link>
                    <Link href="/legal/privacy-policy" className="hover:underline underline-offset-4">
                        Privacy Policy
                    </Link>
                    <Link href="/legal/ai-disclosure" className="hover:underline underline-offset-4">
                        AI Disclosure
                    </Link>
                    <Link href="/legal/dmca" className="hover:underline underline-offset-4">
                        DMCA Policy
                    </Link>
                </nav>
            </div>
        </footer>
    );
}
