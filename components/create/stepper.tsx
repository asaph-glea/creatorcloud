"use client"

import { useCreateSeries } from "@/app/dashboard/create/context"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export function Stepper() {
    const { currentStep } = useCreateSeries()
    const steps = [1, 2, 3, 4, 5, 6]

    return (
        <div className="w-full flex items-center justify-center space-x-2 mb-8">
            {steps.map((step, index) => {
                const isCompleted = step < currentStep
                const isCurrent = step === currentStep

                return (
                    <div key={step} className="flex items-center">
                        {/* Step Indicator */}
                        <div
                            className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                                isCompleted
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : isCurrent
                                        ? "border-primary text-primary"
                                        : "border-muted-foreground/30 text-muted-foreground"
                            )}
                        >
                            {isCompleted ? <Check className="h-4 w-4" /> : step}
                        </div>

                        {/* Connector Line (except after last step) */}
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    "h-[2px] w-8 sm:w-16 mx-2 rounded-full transition-colors",
                                    step < currentStep ? "bg-primary" : "bg-muted-foreground/20"
                                )}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
