import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
    return (
        <section className="py-24 bg-primary text-primary-foreground text-center">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                        Ready to streamline your creative workflow?
                    </h2>
                    <p className="text-xl text-primary-foreground/80">
                        Join thousands of creators who are saving time and growing faster with ContentOS.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" variant="secondary" className="h-14 px-8 text-base">
                            Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 text-base bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                            Schedule a Demo
                        </Button>
                    </div>
                    <p className="text-sm text-primary-foreground/60">
                        No credit card required. Cancel anytime.
                    </p>
                </div>
            </div>
        </section>
    )
}
