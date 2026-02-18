"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Calendar, Clock, Loader2, PlayCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";

interface Video {
    id: string;
    user_id: string;
    status: string | null;
    created_at: string;
    image_urls: string[] | null;
    video_url: string | null; // Added this field
    voice_model: string | null;
    series: {
        series_name: string;
        niche_type: string;
        video_style: string;
        publish_time: string;
    } | null;
}

interface VideoListProps {
    initialVideos: Video[];
}

export function VideoList({ initialVideos }: VideoListProps) {
    const [videos, setVideos] = useState<Video[]>(initialVideos);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const supabase = createClient();

    // ... existing useEffects for polling

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => {
                    const isProcessing = video.status === 'processing';
                    const thumbnail = video.image_urls?.[0] || "/placeholder-video.jpg";

                    return (
                        <Card
                            key={video.id}
                            className={`overflow-hidden group flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer ${isProcessing ? 'opacity-80 pointer-events-none' : ''}`}
                            onClick={() => !isProcessing && setSelectedVideo(video)}
                        >
                            <div className="relative aspect-video w-full bg-muted">
                                {isProcessing ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <>
                                        <Image
                                            src={thumbnail}
                                            alt={video.series?.series_name || "Video"}
                                            fill
                                            className="object-cover object-top transition-transform group-hover:scale-105"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <PlayCircle className="h-12 w-12 text-white drop-shadow-lg" />
                                        </div>
                                    </>
                                )}

                                <div className="absolute top-2 right-2">
                                    <StatusBadge status={video.status || "unknown"} />
                                </div>
                            </div>
                            {/* ... Rest of card content ... */}
                            <div className="p-4 flex flex-col gap-4 flex-1">
                                <div>
                                    <h3 className="font-semibold text-xl line-clamp-1" title={video.series?.series_name}>
                                        {video.series?.series_name || "Untitled Video"}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>
                                            {format(new Date(video.created_at), "MMM d, yyyy")}
                                        </span>
                                        <Clock className="h-3.5 w-3.5 ml-1" />
                                        <span>
                                            {format(new Date(video.created_at), "h:mm a")}
                                        </span>
                                    </div>
                                </div>

                                {video.series && (
                                    <div className="mt-auto grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Niche</span>
                                            <p className="text-sm font-medium truncate" title={video.series.niche_type}>
                                                {video.series.niche_type}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Style</span>
                                            <p className="text-sm font-medium truncate" title={video.series.video_style}>
                                                {video.series.video_style}
                                            </p>
                                        </div>
                                        <div className="col-span-2 bg-secondary/30 p-2.5 rounded-md border border-border/50">
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Scheduled Publish</span>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <Calendar className="h-4 w-4 text-primary/70 shrink-0" />
                                                    <span className="text-sm font-semibold truncate">
                                                        {video.series.publish_time ? format(new Date(video.series.publish_time), "MMM d, yyyy") : "N/A"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <Clock className="h-4 w-4 text-primary/70 shrink-0" />
                                                    <span className="text-sm font-semibold truncate">
                                                        {video.series.publish_time ? format(new Date(video.series.publish_time), "h:mm a") : ""}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-zinc-800">
                    <DialogHeader className="sr-only">
                        <DialogTitle>{selectedVideo?.series?.series_name || "Video Player"}</DialogTitle>
                    </DialogHeader>
                    {selectedVideo?.video_url ? (
                        <div className="relative aspect-[9/16] md:aspect-video w-full max-h-[80vh] flex items-center justify-center bg-black">
                            <video
                                src={selectedVideo.video_url}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                            />
                        </div>
                    ) : (
                        <div className="p-12 text-center text-white">
                            <p>Video URL not found.</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

// ... StatusBadge code remains same

function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        completed: "default",
        processing: "secondary",
        failed: "destructive",
    };

    if (status === 'processing') {
        return (
            <Badge variant="secondary" className="capitalize shadow-sm animate-pulse flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Generating...
            </Badge>
        );
    }

    return (
        <Badge variant={variants[status] || "outline"} className="capitalize shadow-sm">
            {status}
        </Badge>
    );
}
