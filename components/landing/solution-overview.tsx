import { CheckCircle2 } from "lucide-react"

export function SolutionOverview() {
    return (
        <section className="py-16 md:py-24 bg-secondary/20">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-8">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Meet ContentOS: Your Entire Creative Workflow in One Place
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Stop juggling disjointed tools. CreatorCloud unifies every step of content creation, from AI generation to multi-platform publishing, ensuring your brand stays consistent and active 24/7.
                        </p>
                        <ul className="space-y-4">
                            {["Centralized Dashboard for all your content", "AI that learns your brand voice", "Automated scheduling across 10+ platforms"].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    <span className="text-base font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex-1 rounded-xl bg-gradient-to-br from-primary/20 via-secondary to-background border border-border/50 p-8 flex items-center justify-center min-h-[300px]">
                        {/* Visual representation placeholder */}
                        <div className="text-center space-y-2">
                            <div className="text-4xl font-bold text-primary">ContentOS</div>
                            <div className="text-sm text-muted-foreground">The Operating System for Creators</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
