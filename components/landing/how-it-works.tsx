export function HowItWorks() {
    return (
        <section className="py-16 md:py-24 bg-secondary/20">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        From Idea to Published in 4 Steps
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        A streamlined workflow designed for speed and consistency.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        {
                            step: "01",
                            title: "Upload or Prompt",
                            description: "Upload existing content or start from scratch with a text prompt.",
                        },
                        {
                            step: "02",
                            title: "Generate with AI",
                            description: "Let our AI create videos, add captions, and polish your content.",
                        },
                        {
                            step: "03",
                            title: "Customize & Brand",
                            description: "Apply your brand kit, adjust styles, and review the output.",
                        },
                        {
                            step: "04",
                            title: "Schedule & Publish",
                            description: "Push content to all your channels with a single click.",
                        },
                    ].map((item, index) => (
                        <div key={index} className="relative flex flex-col items-start space-y-4">
                            <span className="text-6xl font-black text-muted/20 absolute -top-10 -left-4 select-none z-0">
                                {item.step}
                            </span>
                            <div className="z-10 bg-background border p-6 rounded-xl w-full h-full">
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <p className="text-muted-foreground">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
