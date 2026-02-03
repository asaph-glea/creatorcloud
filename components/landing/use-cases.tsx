import { User, Briefcase, GraduationCap, Building2 } from "lucide-react"

export function UseCases() {
    return (
        <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        Built for everyone who creates
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Whether you're a solo creator or a global agency, ContentOS scales with you.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            icon: User,
                            title: "Creators",
                            description: "Focus on being creative while we handle the repurposing and scheduling.",
                        },
                        {
                            icon: Building2,
                            title: "Startups",
                            description: "Scale your content marketing without hiring a large media team.",
                        },
                        {
                            icon: Briefcase,
                            title: "Agencies",
                            description: "Manage multiple clients and brands from a single, unified dashboard.",
                        },
                        {
                            icon: GraduationCap,
                            title: "Educators",
                            description: "Turn your lectures and notes into bite-sized educational videos.",
                        },
                    ].map((useCase, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-6 rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:scale-105">
                            <div className="p-3 bg-primary/10 rounded-full mb-4 text-primary">
                                <useCase.icon className="h-8 w-8" />
                            </div>
                            <h3 className="font-semibold text-xl mb-2">{useCase.title}</h3>
                            <p className="text-muted-foreground">{useCase.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
