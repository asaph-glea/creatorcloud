"use client"

import { useCreateSeries } from "@/app/dashboard/create/context"
import { CreateFooter } from "@/components/create/create-footer"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { VIDEO_STYLES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import Image from "next/image"

export function StepVideo() {
    const { data, setData, nextStep, prevStep } = useCreateSeries()

    const handleStyleSelect = (styleId: string) => {
        setData(prev => ({ ...prev, videoStyle: styleId }))
    }

    const isNextDisabled = !data.videoStyle

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold tracking-tight">Choose Your Visual Style</h2>
                <p className="text-muted-foreground mt-2">
                    Select a video style that matches your content's vibe.
                </p>
            </div>

            <div className="flex-1 w-full max-w-4xl mx-auto">
                <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                    <div className="flex w-max space-x-4 p-4">
                        {VIDEO_STYLES.map((style) => (
                            <div
                                key={style.id}
                                className={cn(
                                    "relative group cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200",
                                    "w-[200px] aspect-[9/16]", // 9:16 aspect ratio
                                    data.videoStyle === style.id
                                        ? "border-primary ring-2 ring-primary ring-offset-2"
                                        : "border-transparent hover:border-primary/50"
                                )}
                                onClick={() => handleStyleSelect(style.id)}
                            >
                                <Image
                                    src={style.image}
                                    alt={style.name}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <h3 className="font-semibold text-white text-lg">{style.name}</h3>
                                </div>

                                {data.videoStyle === style.id && (
                                    <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                                        <Check className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>

            <CreateFooter
                onNext={nextStep}
                onBack={prevStep}
                isNextDisabled={isNextDisabled}
            />
        </div>
    )
}
