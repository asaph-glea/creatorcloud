"use client"

import { Player } from "@remotion/player"
import { MyComposition } from "@/my-remotion/Composition"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface PreviewPlayerProps {
    script: string
    audioUrl: string | null
    imageUrls: string[]
    durationInFrames?: number
}

export function PreviewPlayer({ script, audioUrl, imageUrls, durationInFrames = 300 }: PreviewPlayerProps) {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) {
        return <div className="aspect-[9/16] bg-muted animate-pulse rounded-lg" />
    }

    if (!audioUrl && imageUrls.length === 0) {
        return (
            <div className="aspect-[9/16] bg-muted/30 flex items-center justify-center rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground text-sm text-center px-4">
                    Upload images and generate audio to preview
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-lg overflow-hidden border shadow-sm bg-black">
            <Player
                component={MyComposition}
                inputProps={{
                    script,
                    audioUrl: audioUrl || "",
                    imageUrls: imageUrls.length > 0 ? imageUrls : ["https://via.placeholder.com/1080x1920?text=No+Images"],
                    captions: [] // Deepgram captions are hard to generate on-the-fly without paying twice. We skip captions for preview.
                }}
                durationInFrames={durationInFrames}
                fps={30}
                compositionWidth={1080}
                compositionHeight={1920}
                style={{
                    width: '100%',
                    aspectRatio: '9/16',
                }}
                controls
            />
        </div>
    )
}
