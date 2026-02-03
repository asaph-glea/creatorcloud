export function TrustSection() {
    return (
        <section className="border-y border-border/50 bg-secondary/30 py-12 md:py-16">
            <div className="container px-4 md:px-6 mx-auto text-center">
                <p className="text-sm font-medium text-muted-foreground mb-8">
                    TRUSTED BY 10,000+ CREATORS & TEAMS WORLDWIDE
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center justify-center opacity-70 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                    {/* Placeholders for logos */}
                    <div className="text-xl font-bold flex items-center justify-center">Acme Corp</div>
                    <div className="text-xl font-bold flex items-center justify-center">GlobalMedia</div>
                    <div className="text-xl font-bold flex items-center justify-center">CreatorHub</div>
                    <div className="text-xl font-bold flex items-center justify-center">ViralLabs</div>
                    <div className="text-xl font-bold flex items-center justify-center hidden lg:flex">NextGen</div>
                </div>
            </div>
        </section>
    )
}
