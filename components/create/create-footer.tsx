"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface CreateFooterProps {
    onNext: () => void
    onBack: () => void
    isNextDisabled?: boolean
    isBackDisabled?: boolean
    nextLabel?: string
    backLabel?: string
}

export function CreateFooter({
    onNext,
    onBack,
    isNextDisabled = false,
    isBackDisabled = false,
    nextLabel = "Continue",
    backLabel = "Back",
}: CreateFooterProps) {
    return (
        <div className="fixed bottom-0 left-0 lg:left-72 right-0 border-t bg-background p-4 flex justify-between items-center z-10 box-border">
            <Button
                variant="ghost"
                onClick={onBack}
                disabled={isBackDisabled}
                className="gap-2"
            >
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
            </Button>
            <Button onClick={onNext} disabled={isNextDisabled} className="gap-2">
                {nextLabel}
                <ArrowRight className="h-4 w-4" />
            </Button>
        </div>
    )
}
