import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32">
            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        <Sparkles className="mr-2 h-3 w-3" />
                        <span className="mr-1">New:</span> Customizable Brand Themes
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                        The Content Operating System for <span className="text-primary">Creators & Teams</span>
                    </h1>
                    <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                        Create high-quality videos from text, images, or audio using AI. Schedule and publish everywhere from one dashboard.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <Button size="lg" asChild className="w-full sm:w-auto text-base h-12 px-8">
                                <Link href="/dashboard">
                                    Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </SignedIn>
                        <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                            View Demo
                        </Button>
                    </div>
                    <div className="pt-8 text-sm text-muted-foreground grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 border-t border-border/50 mt-8 w-full">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Generate video in minutes
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Auto-publish to 5+ platforms
                        </div>
                        <div className="flex items-center justify-center sm:justify-end gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Consistent brand voice
                        </div>
                    </div>
                </div>
            </div>
            {/* Background gradient effects could go here */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[100px] rounded-full -z-10 opacity-50 dark:opacity-20" />
        </section>
    )
}
