"use client"

import { triggerVideoGeneration } from "@/app/actions/video-actions"
import { triggerPublishWorkflow } from "@/app/actions/publish-actions"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { VIDEO_STYLES } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { CloudUpload, Edit2, MoreVertical, Pause, Play, Trash, Video } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export interface Series {
    id: string
    created_at: string
    series_name: string
    video_style: string
    niche_type: string
    status?: "active" | "paused"
    publish_time?: string
    platform?: string[]
}

interface SeriesCardProps {
    series: Series
    onDelete: (id: string) => void
}

export function SeriesCard({ series, onDelete }: SeriesCardProps) {
    const [isPaused, setIsPaused] = useState(series.status === "paused")
    const router = useRouter()

    // Find the video style image
    const style = VIDEO_STYLES.find(s => s.id === series.video_style)
    const imageSrc = style?.image || "/video-style/realistic.png" // Fallback

    const handlePauseToggle = async () => {
        const newStatus = isPaused ? "active" : "paused"
        // Optimistic update
        setIsPaused(!isPaused)

        try {
            const res = await fetch("/api/series", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: series.id, status: newStatus }),
            })

            if (!res.ok) throw new Error("Failed to update status")

            toast.success(isPaused ? "Series Resumed" : "Series Paused")
        } catch (err) {
            console.error(err)
            toast.error("Failed to update status")
            setIsPaused(isPaused) // Revert
        }
    }

    const handleDelete = () => {
        onDelete(series.id)
    }

    const handleTestPublish = async () => {
        const promise = triggerPublishWorkflow(series.id);
        toast.promise(promise, {
            loading: "Triggering publish workflow...",
            success: "Workflow started! Check Inngest.",
            error: "Failed to trigger workflow",
        })
    }

    const handleGenerate = async () => {
        const promise = triggerVideoGeneration(series.id);

        toast.promise(promise, {
            loading: "Starting generation...",
            success: (data) => {
                if (data.success) {
                    router.push("/dashboard/videos");
                    return "Generation started! Redirecting..."
                } else {
                    throw new Error(data.error)
                }
            },
            error: "Failed to start generation",
        })
    }

    const handleViewVideos = () => {
        toast.info("Viewing videos for " + series.series_name)
    }

    return (
        <Card className="p-0 gap-0 overflow-hidden group relative flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
            {/* Thumbnail - Vertical Aspect Ratio for Shorts/Reels */}
            <div className="relative aspect-[4/5] w-full bg-muted border-b">
                <Image
                    src={imageSrc}
                    alt={series.series_name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                {/* Status Badge */}
                <div className="absolute top-3 left-3 flex gap-2 z-10">
                    {isPaused && <Badge variant="destructive" className="shadow-sm">Paused</Badge>}
                </div>

                {/* Top Right Actions */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white border-none backdrop-blur-md">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/create?edit=${series.id}`} className="cursor-pointer">
                                    <Edit2 className="mr-2 h-4 w-4" /> Edit Series
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handlePauseToggle} className="cursor-pointer">
                                {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                                {isPaused ? "Resume Series" : "Pause Series"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive cursor-pointer">
                                <Trash className="mr-2 h-4 w-4" /> Delete Series
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                    <h3 className="font-bold text-lg leading-tight truncate px-1 drop-shadow-md" title={series.series_name}>
                        {series.series_name}
                    </h3>
                </div>
            </div>

            {/* Content & Actions */}
            <div className="p-4 flex flex-col flex-1 gap-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="px-2 py-0.5 text-xs font-normal">
                        {style?.name || series.video_style}
                    </Badge>
                    <Badge variant="outline" className="px-2 py-0.5 text-xs font-normal">
                        {series.niche_type}
                    </Badge>
                </div>

                <div className="mt-auto flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="w-full text-xs"
                            onClick={handleViewVideos}
                        >
                            <Video className="mr-2 h-3.5 w-3.5" /> Videos
                        </Button>

                        <Button
                            size="sm"
                            className="w-full text-xs bg-primary hover:bg-primary/90"
                            onClick={handleGenerate}
                        >
                            <span className="mr-1">⚡</span> Generate
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-muted-foreground hover:text-foreground h-8"
                        onClick={handleTestPublish}
                        title="Test Publish Workflow"
                    >
                        <CloudUpload className="mr-2 h-3.5 w-3.5" /> Test Publish
                    </Button>
                </div>
            </div>
        </Card>
    )
}
