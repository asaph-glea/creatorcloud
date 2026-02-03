import { Star } from "lucide-react"

export function Testimonials() {
    return (
        <section className="py-16 md:py-24 bg-secondary/20">
            <div className="container px-4 md:px-6 mx-auto">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-center mb-16">
                    Loved by creators worldwide
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            quote: "ContentOS saved me 15 hours a week. The AI features are actually useful, not just gimmicks.",
                            author: "Sarah J.",
                            role: "Digital Marketer",
                        },
                        {
                            quote: "The ability to switch themes and customize the UI makes it feel like my own workspace. Love it.",
                            author: "David L.",
                            role: "Content Creator",
                        },
                        {
                            quote: "Finally, a tool that handles everything from creation to scheduling. It's a game changer.",
                            author: "Elena R.",
                            role: "Social Media Manager",
                        },
                    ].map((testimonial, i) => (
                        <div key={i} className="flex flex-col justify-between p-6 rounded-lg border bg-background shadow-sm">
                            <div className="flex gap-1 text-primary mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-current" />
                                ))}
                            </div>
                            <p className="text-lg italic mb-6">"{testimonial.quote}"</p>
                            <div>
                                <div className="font-semibold">{testimonial.author}</div>
                                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
