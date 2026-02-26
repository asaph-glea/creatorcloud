import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export function PricingSection() {
    return (
        <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Start for free, upgrade as you grow.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            name: "Free",
                            price: "$0",
                            description: "For individuals just getting started.",
                            features: ["3 AI Generations/mo", "1 Social Account", "Basic Templates", "720p Export"],
                            cta: "Get Started",
                            variant: "outline"
                        },
                        {
                            name: "Starter",
                            price: "$29",
                            description: "For growing creators and influencers.",
                            features: ["30 AI Generations/mo", "5 Social Accounts", "Pro Templates", "1080p Export", "No Watermark"],
                            cta: "Start Free Trial",
                            variant: "default"
                        },
                        {
                            name: "Pro",
                            price: "$79",
                            description: "For serious creators and small teams.",
                            features: ["Unlimited AI Generations", "10 Social Accounts", "Brand Kits", "4K Export", "Priority Support"],
                            cta: "Start Free Trial",
                            variant: "outline"
                        },
                        {
                            name: "Team",
                            price: "$199",
                            description: "For agencies and larger organizations.",
                            features: ["Unlimited Everything", "Unlimited Accounts", "Team Collaboration", "API Access", "Dedicated Success Manager"],
                            cta: "Contact Sales",
                            variant: "outline"
                        },
                    ].map((plan, index) => (
                        <div key={index} className="flex flex-col p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                            <div className="mb-4">
                                <h3 className="font-bold text-xl">{plan.name}</h3>
                                <div className="mt-2 text-3xl font-extrabold">{plan.price}<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                            </div>
                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                        <Check className="h-4 w-4 text-primary" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Button variant={plan.variant as any} className="w-full">{plan.cta}</Button>
                        </div>
                    ))}
                </div>
                <div className="mt-12 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
                    <p>
                        * By purchasing a plan or credits, you acknowledge that API-based video generations are non-refundable once processing begins via our AI sub-processors (as per our <a href="/legal/terms-of-service" className="underline hover:text-primary">Terms of Service</a>).
                    </p>
                </div>
            </div>
        </section>
    )
}
