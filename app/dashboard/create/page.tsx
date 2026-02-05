"use client"

import { CreateSeriesData, CreateSeriesProvider, useCreateSeries } from "@/app/dashboard/create/context"
import { Stepper } from "@/components/create/stepper"
import { StepCaption } from "@/components/create/steps/caption/step-caption"
import { StepDetails } from "@/components/create/steps/details/step-details"
import { StepLanguage } from "@/components/create/steps/language/step-language"
import { StepMusic } from "@/components/create/steps/music/step-music"
import { StepNiche } from "@/components/create/steps/niche/step-niche"
import { StepVideo } from "@/components/create/steps/video/step-video"
import { Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { toast } from "sonner"

function CreateWizard() {
    const { currentStep } = useCreateSeries()

    return (
        <div className="container max-w-5xl mx-auto py-6 pb-24">
            <Stepper />

            <div className="mt-8">
                {currentStep === 1 && <StepNiche />}
                {currentStep === 2 && <StepLanguage />}
                {currentStep === 3 && <StepMusic />}
                {currentStep === 4 && <StepVideo />}
                {currentStep === 5 && <StepCaption />}
                {currentStep === 6 && <StepDetails />}
            </div>
        </div>
    )
}

function CreateContent() {
    const searchParams = useSearchParams()
    const editId = searchParams.get("edit")
    const [initialData, setInitialData] = useState<Partial<CreateSeriesData> | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(!!editId)

    useEffect(() => {
        if (!editId) return

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/series?id=${editId}`)
                if (!res.ok) throw new Error("Failed to fetch series")
                const json = await res.json()
                const series = json.series && json.series[0]

                if (series) {
                    setInitialData({
                        id: series.id,
                        seriesName: series.series_name,
                        nicheType: series.niche_type as any,
                        selectedNiche: series.selected_niche || "",
                        customNiche: series.custom_niche || "",
                        language: series.language,
                        voice: series.voice,
                        music: series.music || "",
                        customMusic: null, // Files can't be restored easily
                        videoStyle: series.video_style,
                        captionStyle: series.caption_style,
                        videoDuration: series.video_duration,
                        platform: series.platform,
                        publishTime: series.publish_time ? new Date(series.publish_time) : undefined,
                    })
                } else {
                    toast.error("Series not found")
                }
            } catch (error) {
                console.error(error)
                toast.error("Failed to load series for editing")
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [editId])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <CreateSeriesProvider initialData={initialData}>
            <CreateWizard />
        </CreateSeriesProvider>
    )
}

export default function CreatePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
            <CreateContent />
        </Suspense>
    )
}
