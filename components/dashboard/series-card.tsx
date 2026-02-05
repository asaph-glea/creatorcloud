"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { VIDEO_STYLES } from "@/lib/constants"
import { Edit2, MoreVertical, Pause, Play, Trash, Video } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

export interface Series {
    id: string
    created_at: string
    series_name: string
    video_style: string
    niche_type: string
    status?: "active" | "paused" // Assuming this field exists or we simulate it
}

interface SeriesCardProps {
    series: Series
    onDelete: (id: string) => void
}

export function SeriesCard({ series, onDelete }: SeriesCardProps) {
    const [isPaused, setIsPaused] = useState(series.status === "paused")

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

    const handleGenerate = () => {
        toast.info("Triggered video generation for " + series.series_name)
    }

    const handleViewVideos = () => {
        toast.info("Viewing videos for " + series.series_name)
    }

    return (
        <Card className="overflow-hidden group relative flex flex-col">
            {/* Thumbnail */}
            <div className="relative aspect-video w-full bg-muted">
                <Image
                    src={imageSrc}
                    alt={series.series_name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />

                {/* Top Right Edit Button */}
                <Link href={`/dashboard/create?edit=${series.id}`} className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100">
                    <Edit2 className="h-4 w-4" />
                </Link>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-semibold truncate pr-2" title={series.series_name}>
                            {series.series_name}
                        </h3>
                        <p className="text-xs text-muted-foreground capitalize">
                            {style?.name || series.video_style} • {series.niche_type}
                        </p>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
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

                <div className="mt-auto pt-4 flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={handleViewVideos}
                    >
                        <Video className="mr-2 h-3 w-3" /> View Videos
                    </Button>
                    <Button
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={handleGenerate}
                    >
                        Generate
                    </Button>
                </div>
            </div>
        </Card>
    )
}
