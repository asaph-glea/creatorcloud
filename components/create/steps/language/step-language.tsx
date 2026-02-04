"use client"

import { useCreateSeries } from "@/app/dashboard/create/context"
import { CreateFooter } from "@/components/create/create-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

import { LANGUAGES, NOIZ_VOICES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Play, Pause, Mic } from "lucide-react"
import { useState, useRef } from "react"

export function StepLanguage() {
    const { data, setData, nextStep, prevStep } = useCreateSeries()
    const [playingVoice, setPlayingVoice] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const handleLanguageChange = (val: string) => {
        setData((prev) => ({ ...prev, language: val, voice: "" })) // Reset voice on language change
    }

    const handleVoiceSelect = (modelName: string) => {
        setData((prev) => ({ ...prev, voice: modelName }))
    }

    const handlePreview = (e: React.MouseEvent, previewUrl: string, modelName: string) => {
        e.stopPropagation()

        if (playingVoice === modelName) {
            audioRef.current?.pause()
            setPlayingVoice(null)
            return
        }

        if (audioRef.current) {
            audioRef.current.pause()
        }

        // Assumption: previewUrl is a valid path or we need a base URL.
        // Since user provided simple filenames, assuming they are in public/ or valid URLs.
        audioRef.current = new Audio(`/voice/${previewUrl}`) // Assuming a /voice folder in public
        audioRef.current.play()
        setPlayingVoice(modelName)

        audioRef.current.onended = () => setPlayingVoice(null)
    }

    // Filter voices based on selected language
    // Logic: strict match on voice.language === data.language
    const selectedLang = LANGUAGES.find(l => l.modelLangCode === data.language)

    const filteredVoices = NOIZ_VOICES.filter(voice => {
        if (!data.language) return false
        return voice.language === data.language
    })

    // Create a fallback if nothing matches (for demo purposes if user selects non-English)
    const displayVoices = filteredVoices.length > 0 ? filteredVoices : (data.language ? [] : [])

    const isNextDisabled = !data.language || !data.voice

    return (
        <div className="flex flex-col h-full max-w-3xl mx-auto">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold tracking-tight">Select Language & Voice</h2>
                <p className="text-muted-foreground">
                    Choose the language and narrator for your content.
                </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Language</label>
                    <Select value={data.language} onValueChange={handleLanguageChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent>
                            {LANGUAGES.map((lang) => (
                                <SelectItem key={lang.modelLangCode} value={lang.modelLangCode}>
                                    <span className="mr-2">{lang.countryFlag}</span>
                                    {lang.language}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {data.language && selectedLang && (
                    <div className="rounded-lg border bg-gradient-to-br from-primary/10 via-background to-background p-6">
                        <div className="flex items-start gap-4">
                            <span className="text-4xl">{selectedLang.countryFlag}</span>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    {selectedLang.language}
                                    {data.voice && (
                                        <span className="text-sm font-normal text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
                                            {data.voice}
                                        </span>
                                    )}
                                </h3>
                                <p className="text-muted-foreground italic text-sm">
                                    "{selectedLang.warmMessage}"
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {data.language && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Voice ({displayVoices.length} available)</label>
                        {displayVoices.length === 0 ? (
                            <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                                No voices available for this language yet. Please select English for demo.
                            </div>
                        ) : (
                            <ScrollArea className="h-[300px] border rounded-md p-4 bg-muted/20">
                                <div className="grid grid-cols-1 gap-3">
                                    {displayVoices.map((voice) => (
                                        <div
                                            key={voice.modelName}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-lg border cursor-pointer bg-background transition-all hover:border-primary/50",
                                                data.voice === voice.modelName ? "border-primary ring-1 ring-primary" : ""
                                            )}
                                            onClick={() => handleVoiceSelect(voice.modelName)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn("h-10 w-10 rounded-full flex items-center justify-center bg-primary/10 text-primary")}>
                                                    <Mic className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-sm">{voice.modelName}</h4>
                                                    <p className="text-xs text-muted-foreground capitalize">{voice.gender} • {voice.model}</p>
                                                </div>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                                onClick={(e) => handlePreview(e, voice.preview, voice.modelName)}
                                            >
                                                {playingVoice === voice.modelName ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                )}
            </div>

            <CreateFooter
                onNext={nextStep}
                onBack={prevStep}
                isNextDisabled={isNextDisabled}
            />
        </div>
    )
}
