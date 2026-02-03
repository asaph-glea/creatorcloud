import { XCircle } from "lucide-react"

export function ProblemSection() {
    return (
        <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        Creating content shouldn't be a struggle
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Most creators and teams are stuck in manual workflows that kill creativity and consistency.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        {
                            title: "Tool Fatigue",
                            description: "Jumping between 5+ different apps for editing, writing, scheduling, and analytics.",
                        },
                        {
                            title: "Time Consuming",
                            description: "Spending hours on simple video edits and manual uploads instead of creating strategy.",
                        },
                        {
                            title: "Inconsistent Brand",
                            description: "Struggling to maintain a cohesive look and feel across different social platforms.",
                        },
                        {
                            title: "Burnout",
                            description: "The pressure to post daily leads to lower quality content and creator burnout.",
                        },
                    ].map((problem, index) => (
                        <div key={index} className="flex flex-col items-start p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                            <div className="p-2 bg-destructive/10 rounded-full mb-4">
                                <XCircle className="h-6 w-6 text-destructive" />
                            </div>
                            <h3 className="font-semibold text-xl mb-2">{problem.title}</h3>
                            <p className="text-muted-foreground">{problem.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
