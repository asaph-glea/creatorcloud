"use client"

import { useCreateSeries } from "@/app/dashboard/create/context"
import { CreateFooter } from "@/components/create/create-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MUSIC_TRACKS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Music, Play, Pause, Upload, FileAudio } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export function StepMusic() {
    const { data, setData, nextStep, prevStep } = useCreateSeries()
    // Local state for previewing
    const [playingTrack, setPlayingTrack] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // For custom upload preview
    const [customPreviewUrl, setCustomPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        // Cleanup object URL on unmount
        return () => {
            if (customPreviewUrl) URL.revokeObjectURL(customPreviewUrl)
        }
    }, [customPreviewUrl])

    const handleTrackSelect = (trackId: string) => {
        setData(prev => ({ ...prev, music: trackId, customMusic: null }))
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Create preview URL
            if (customPreviewUrl) URL.revokeObjectURL(customPreviewUrl)
            const url = URL.createObjectURL(file)
            setCustomPreviewUrl(url)

            setData(prev => ({
                ...prev,
                music: "custom",
                customMusic: file
            }))

            // Auto play the uploaded track
            if (audioRef.current) {
                audioRef.current.pause()
            }
            audioRef.current = new Audio(url)
            audioRef.current.play()
            setPlayingTrack("custom")
            audioRef.current.onended = () => setPlayingTrack(null)
        }
    }

    const togglePreview = (e: React.MouseEvent, trackId: string, filename?: string) => {
        e.stopPropagation()

        if (playingTrack === trackId) {
            audioRef.current?.pause()
            setPlayingTrack(null)
            return
        }

        if (audioRef.current) {
            audioRef.current.pause()
        }

        const src = trackId === "custom" && customPreviewUrl
            ? customPreviewUrl
            : `/music/${filename}`

        audioRef.current = new Audio(src)
        audioRef.current.play()
        setPlayingTrack(trackId)
        audioRef.current.onended = () => setPlayingTrack(null)
    }

    const isNextDisabled = !data.music

    return (
        <div className="flex flex-col h-full max-w-3xl mx-auto">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold tracking-tight">Set the Mood</h2>
                <p className="text-muted-foreground">
                    Choose background music or upload your own track.
                </p>
            </div>

            <Tabs defaultValue="library" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="library">Music Library</TabsTrigger>
                    <TabsTrigger value="upload">Upload Custom</TabsTrigger>
                </TabsList>

                <TabsContent value="library" className="space-y-4">
                    <ScrollArea className="h-[400px] border rounded-md p-4 bg-muted/20">
                        <div className="grid grid-cols-1 gap-3">
                            {MUSIC_TRACKS.map((track) => (
                                <div
                                    key={track.id}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-lg border cursor-pointer bg-background transition-all hover:border-primary/50",
                                        data.music === track.id ? "border-primary ring-1 ring-primary" : ""
                                    )}
                                    onClick={() => handleTrackSelect(track.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground")}>
                                            <Music className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm">{track.name}</h4>
                                            <p className="text-xs text-muted-foreground">{track.artist} • {track.mood}</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        onClick={(e) => togglePreview(e, track.id, track.filename)}
                                    >
                                        {playingTrack === track.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="upload">
                    <Card>
                        <CardContent className="pt-6 space-y-6">
                            <div className="border-2 border-dashed rounded-lg p-10 text-center hover:bg-muted/50 transition-colors relative">
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                                        <Upload className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-semibold">Click to upload or drag and drop</h3>
                                    <p className="text-sm text-muted-foreground">MP3, WAV or OGG (max 10MB)</p>
                                </div>
                            </div>

                            {data.music === "custom" && data.customMusic && (
                                <div className="flex items-center justify-between p-4 rounded-lg border bg-background">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400">
                                            <FileAudio className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm">{data.customMusic.name}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                {(data.customMusic.size / 1024 / 1024).toFixed(2)} MB • Custom Upload
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        onClick={(e) => togglePreview(e, "custom")}
                                    >
                                        {playingTrack === "custom" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <CreateFooter
                onNext={nextStep}
                onBack={prevStep}
                isNextDisabled={isNextDisabled}
            />
        </div>
    )
}
