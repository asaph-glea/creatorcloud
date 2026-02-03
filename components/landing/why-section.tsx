import { Check } from "lucide-react"

export function WhySection() {
    return (
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                            Why Top Creators Choose ContentOS
                        </h2>
                        <div className="space-y-4">
                            {[
                                "True All-in-One: No more glued-together tools.",
                                "AI-First Workflow: Built from the ground up for generative AI.",
                                "Global Reach: Auto-translate and localize content in clicks.",
                                "Total Customization: The only platform with full UI theming.",
                                "Consumer-Grade UX: Enterprise power, simple design."
                            ].map((benefit, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="mt-1 bg-white/20 p-1 rounded-full">
                                        <Check className="h-4 w-4" />
                                    </div>
                                    <span className="text-lg font-medium">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative h-[400px] rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center">
                        {/* Visual Placeholder for comparison or dashboard snippet */}
                        <div className="text-center p-8">
                            <div className="text-2xl font-bold mb-2">The ContentOS Advantage</div>
                            <p className="text-white/80">Experience the difference of a unified workflow.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
