import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export function ItemFAQ() {
    return (
        <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6 mx-auto max-w-3xl">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-center mb-12">
                    Frequently Asked Questions
                </h2>
                <Accordion type="single" collapsible className="w-full">
                    {[
                        {
                            q: "What platforms does ContentOS support?",
                            a: "We support direct publishing to Instagram, TikTok, YouTube (Shorts & Long-form), LinkedIn, Twitter/X, and Facebook."
                        },
                        {
                            q: "Can I customize the AI voice and style?",
                            a: "Yes! You can clone your own voice or choose from our premium library. You can also train the AI on your brand's writing style."
                        },
                        {
                            q: "Is there a free trial?",
                            a: "Yes, we offer a generous free tier that lets you create up to 3 AI videos per month, and a 14-day free trial for all paid plans."
                        },
                        {
                            q: "How does the theme customization work?",
                            a: "ContentOS is built with theming at its core. You can switch between Light, Dark, System, and our signature Brand theme at any time from the top navigation."
                        },
                        {
                            q: "Can I collaborate with my team?",
                            a: "Absolutely. Our Team plan allows for multiple workspaces, role-based permissions, and approval workflows."
                        }

                    ].map((faq, i) => (
                        <AccordionItem key={i} value={`item-${i}`}>
                            <AccordionTrigger className="text-left text-lg">{faq.q}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {faq.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    )
}
