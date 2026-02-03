import { Wand2, Video, Mic, Type, CalendarClock, Palette, BarChart3, Layers } from "lucide-react"

const features = [
    {
        icon: Wand2,
        title: "Text → Video AI",
        description: "Turn simple text prompts into engaging video content in seconds.",
    },
    {
        icon: Video,
        title: "Image → Video AI",
        description: "Animate your static assets into dynamic videos automatically.",
    },
    {
        icon: Mic,
        title: "Audio → Video AI",
        description: "Transform podcasts and voiceovers into shareable video clips.",
    },
    {
        icon: Type,
        title: "AI Captions & Voiceovers",
        description: "Auto-generate accurate captions and lifelike AI voiceovers.",
    },
    {
        icon: CalendarClock,
        title: "Multi-Platform Scheduling",
        description: "Schedule & publish to TikTok, IG, YouTube, and LinkedIn at once.",
    },
    {
        icon: Palette,
        title: "Templates & Brand Kits",
        description: "Keep your content on-brand with saved styles and presets.",
    },
    {
        icon: BarChart3,
        title: "Analytics & Insights",
        description: "Track performance across all platforms from one dashboard.",
    },
    {
        icon: Layers,
        title: "Customizable Themes",
        description: "Personalize your workspace with Light, Dark, or Brand themes.",
    },
]

export function FeatureSection() {
    return (
        <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        Everything you need to dominate social media
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Powerful AI tools meets robust automation.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div key={index} className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:shadow-md transition-all">
                            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
