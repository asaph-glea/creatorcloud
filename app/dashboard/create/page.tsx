"use client"

import { CreateSeriesProvider, useCreateSeries } from "@/app/dashboard/create/context"
import { Stepper } from "@/components/create/stepper"
import { StepNiche } from "@/components/create/steps/niche/step-niche"
import { StepLanguage } from "@/components/create/steps/language/step-language"
import { StepMusic } from "@/components/create/steps/music/step-music"
import { StepVideo } from "@/components/create/steps/video/step-video"
import { StepCaption } from "@/components/create/steps/caption/step-caption"
import { StepDetails } from "@/components/create/steps/details/step-details"

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
                {/* Placeholder for future steps */}
            </div>
        </div>
    )
}

export default function CreatePage() {
    return (
        <CreateSeriesProvider>
            <CreateWizard />
        </CreateSeriesProvider>
    )
}
