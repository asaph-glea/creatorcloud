"use client"

import { useCreateSeries } from "@/app/dashboard/create/context"
import { CreateFooter } from "@/components/create/create-footer"
import { CaptionPreview } from "@/components/create/steps/caption/caption-preview"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CAPTION_STYLES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export function StepCaption() {
    const { data, setData, nextStep, prevStep } = useCreateSeries()

    const handleStyleSelect = (styleId: string) => {
        setData(prev => ({ ...prev, captionStyle: styleId }))
    }

    const isNextDisabled = !data.captionStyle

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold tracking-tight">Select Caption Style</h2>
                <p className="text-muted-foreground mt-2">
                    Choose how your captions will appear in your videos.
                </p>
            </div>

            <ScrollArea className="flex-1 w-full h-[500px] border rounded-md p-4 bg-muted/20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CAPTION_STYLES.map((style) => (
                        <Card
                            key={style.id}
                            className={cn(
                                "cursor-pointer transition-all duration-200 hover:shadow-md relative overflow-hidden",
                                data.captionStyle === style.id
                                    ? "border-primary ring-2 ring-primary bg-background"
                                    : "border-border hover:border-primary/50 bg-background/50"
                            )}
                            onClick={() => handleStyleSelect(style.id)}
                        >
                            <div className="p-4 space-y-4">
                                <CaptionPreview className={style.className} styleId={style.id} />

                                <div>
                                    <h3 className="font-semibold">{style.name}</h3>
                                    <p className="text-xs text-muted-foreground">{style.description}</p>
                                </div>
                            </div>

                            {data.captionStyle === style.id && (
                                <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm z-20">
                                    <Check className="h-4 w-4" />
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </ScrollArea>

            <CreateFooter
                onNext={nextStep}
                onBack={prevStep}
                isNextDisabled={isNextDisabled}
            />
        </div>
    )
}
