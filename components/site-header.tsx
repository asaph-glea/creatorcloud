import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Mountain } from "lucide-react"

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4">
                <div className="mr-4 hidden md:flex">
                    <Link className="mr-6 flex items-center space-x-2" href="/">
                        <Mountain className="h-6 w-6" />
                        <span className="hidden font-bold sm:inline-block">
                            CreatorCloud
                        </span>
                    </Link>
                    <nav className="flex items-center gap-6 text-sm">
                        <Link
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                            href="#"
                        >
                            Features
                        </Link>
                        <Link
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                            href="#"
                        >
                            Pricing
                        </Link>
                        <Link
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                            href="#"
                        >
                            About
                        </Link>
                        <Link
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                            href="#"
                        >
                            Blog
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Mobile Nav Trigger could go here */}
                    </div>
                    <nav className="flex items-center gap-2">
                        <Button variant="ghost" asChild className="hidden sm:inline-flex">
                            <Link href="#">Log in</Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="#">Get Started</Link>
                        </Button>
                        <ModeToggle />
                    </nav>
                </div>
            </div>
        </header>
    )
}
