"use client"

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Loader2, PlayCircle, Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface Video {
    id: string;
    user_id: string;
    status: string | null;
    created_at: string;
    image_urls: string[] | null;
    voice_model: string | null;
    series: {
        series_name: string;
        niche_type: string;
        video_style: string;
        publish_time: string;
    } | null;
}

interface VideoListProps {
    initialVideos: any[]; // Using any to avoid strict type definition hassle right now, ideally matches Video interface
}

export function VideoList({ initialVideos }: VideoListProps) {
    const [videos, setVideos] = useState<Video[]>(initialVideos);
    const supabase = createClient();

    useEffect(() => {
        // Update local state if initialVideos changes (e.g. parent re-validation)
        setVideos(initialVideos);
    }, [initialVideos]);

    useEffect(() => {
        const hasProcessing = videos.some(v => v.status === 'processing');
        if (!hasProcessing) return;

        const intervalId = setInterval(async () => {
            console.log("Polling for video updates...");
            // Poll for updates on processing videos
            // We could just fetch all videos to keep it simple and ensure correct order/state
            // Or ideally fetch only the processing ones, but replacing the whole list ensures consistency with sorting
            const { data: updatedVideos, error } = await supabase
                .from("videos")
                .select(`
                    id,
                    status,
                    created_at,
                    image_urls,
                    voice_model,
                    series:series_id (
                        series_name,
                        niche_type,
                        video_style,
                        publish_time
                    )
                `)
                .eq("user_id", videos[0]?.user_id || (await supabase.auth.getUser()).data.user?.id) // fallback to auth user if list empty/weird
                // IMPORTANT: Use exact same ordering as Server Component
                .order("created_at", { ascending: false });

            if (!error && updatedVideos) {
                // @ts-ignore - mismatch in loose types, handled by matching shape of query
                setVideos(updatedVideos);
            }
        }, 4000);

        return () => clearInterval(intervalId);
    }, [videos, supabase]);

    if (videos.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>No videos generated yet.</p>
                <Link href="/dashboard/series" className="underline hover:text-foreground">
                    Create a series to start generating.
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => {
                const isProcessing = video.status === 'processing';
                // Use first image as thumbnail, or fallback
                const thumbnail = video.image_urls?.[0] || "/placeholder-video.jpg"; // You might need a placeholder asset

                return (
                    <Card key={video.id} className="overflow-hidden group flex flex-col h-full hover:shadow-md transition-shadow">
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
                                        className="object-cover transition-transform group-hover:scale-105"
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
    );
}

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
