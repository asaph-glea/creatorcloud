"use client"

import { CreateSeriesProvider, useCreateSeries } from "@/app/dashboard/create/context"
import { Stepper } from "@/components/create/stepper"
import { StepNiche } from "@/components/create/steps/niche/step-niche"
import { StepLanguage } from "@/components/create/steps/language/step-language"
import { StepMusic } from "@/components/create/steps/music/step-music"

function CreateWizard() {
    const { currentStep } = useCreateSeries()

    return (
        <div className="container max-w-5xl mx-auto py-6 pb-24">
            <Stepper />

            <div className="mt-8">
                {currentStep === 1 && <StepNiche />}
                {currentStep === 2 && <StepLanguage />}
                {currentStep === 3 && <StepMusic />}
                {currentStep === 4 && (
                    <div className="text-center py-20">
                        <h2 className="text-xl font-semibold">Step 4: Style & Tone</h2>
                        <p className="text-muted-foreground">Coming soon...</p>
                    </div>
                )}
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
