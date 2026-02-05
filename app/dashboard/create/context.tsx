"use client"

import React, { createContext, useContext, useState } from "react"

export type NicheType = "available" | "custom"

export interface CreateSeriesData {
    // Step 1: Niche
    id?: string
    nicheType: NicheType
    selectedNiche: string
    customNiche: string
    // Step 2: Language & Voice
    language: string
    voice: string
    // Step 3: Music
    music: string // ID of the selected track
    customMusic: File | null
    // Step 4: Video Style
    videoStyle: string
    // Step 5: Caption Style
    captionStyle: string
    // Step 6: Series Details
    seriesName: string
    videoDuration: string
    platform: string
    publishTime: Date | undefined
}

interface CreateSeriesContextType {
    data: CreateSeriesData
    setData: React.Dispatch<React.SetStateAction<CreateSeriesData>>
    currentStep: number
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>
    nextStep: () => void
    prevStep: () => void
}

const CreateSeriesContext = createContext<CreateSeriesContextType | undefined>(undefined)

export function CreateSeriesProvider({ children, initialData }: { children: React.ReactNode, initialData?: Partial<CreateSeriesData> }) {
    const [currentStep, setCurrentStep] = useState(1)
    const [data, setData] = useState<CreateSeriesData>({
        nicheType: "available",
        selectedNiche: "",
        customNiche: "",
        language: "",
        voice: "",
        music: "",
        customMusic: null,
        videoStyle: "",
        captionStyle: "",
        seriesName: "",
        videoDuration: "",
        platform: "",
        publishTime: undefined,
        ...initialData
    })

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 6))
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

    return (
        <CreateSeriesContext.Provider
            value={{
                data,
                setData,
                currentStep,
                setCurrentStep,
                nextStep,
                prevStep,
            }}
        >
            {children}
        </CreateSeriesContext.Provider>
    )
}

export function useCreateSeries() {
    const context = useContext(CreateSeriesContext)
    if (context === undefined) {
        throw new Error("useCreateSeries must be used within a CreateSeriesProvider")
    }
    return context
}
