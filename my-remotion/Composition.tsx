"use client";

import { AbsoluteFill, Audio, Img, useCurrentFrame, useVideoConfig, Sequence, interpolate, spring } from 'remotion';
import React, { useMemo } from 'react';

// You might need to install 'parse-srt' or similar if captions are raw text/json
// For now assuming we pass processed captions or handle them simply

export interface CompositionProps {
    audioUrl: string;
    musicUrl?: string;
    imageUrls: string[];
    captions: any[]; // Adjust type based on Deepgram output
    script?: string;
    brandKit?: {
        logo_url?: string | null;
        primary_color?: string | null;
        font_family?: string | null;
    } | null;
}

export const MyComposition: React.FC<CompositionProps> = ({ audioUrl, musicUrl, imageUrls, captions, brandKit }) => {
    const { fps, durationInFrames } = useVideoConfig();
    const frame = useCurrentFrame();

    // Calculate duration per image
    // Total frames / number of images
    // Note: In real world, we might want to sync images to specific script sections.
    // For this MVP, we will distribute them evenly.

    // Ensure we have images
    const imagesToUse = imageUrls.length > 0 ? imageUrls : [];
    const imageDuration = imagesToUse.length > 0 ? Math.floor(durationInFrames / imagesToUse.length) : durationInFrames;

    const visibleCaptions = useMemo(() => {
        // Determine which caption words to show based on current frame/time
        // Assuming captions has structure { start: number (sec), end: number, word: string }
        // We show 2-3 words.
        // Deepgram "captions" usually come as vtt or json. I'll assume JSON words array for fine control.

        const curTime = frame / fps;

        // Logic to find current active word(s)
        // This is a simplified view showing current word +/- neighbor
        if (!Array.isArray(captions)) return [];

        // Find active word
        const activeIndex = captions.findIndex((c: any) => curTime >= c.start && curTime <= c.end);

        if (activeIndex === -1) return [];

        // Show current and next 2 words for "2 to 3 words" effect, or accumulating group
        // Let's show a sliding window of 3 words centered(ish) or starting at active
        return captions.slice(Math.max(0, activeIndex), activeIndex + 3);
    }, [frame, fps, captions]);

    return (
        <AbsoluteFill className="bg-black">
            {/* Background Music */}
            {musicUrl && <Audio src={musicUrl} loop volume={0.2} />}

            {/* Voiceover */}
            {audioUrl && <Audio src={audioUrl} />}

            {/* Images Sequence */}
            {imagesToUse.map((src, index) => {
                const startFrame = index * imageDuration;

                // Animation Effects
                const progress = interpolate(
                    frame - startFrame,
                    [0, imageDuration],
                    [0, 1],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );

                const scale = interpolate(progress, [0, 1], [1, 1.1]); // Zoom In
                const opacity = interpolate(
                    frame - startFrame,
                    [0, 15, imageDuration - 15, imageDuration],
                    [0, 1, 1, 0]
                ); // Fade In/Out

                return (
                    <Sequence from={startFrame} durationInFrames={imageDuration} key={src + index}>
                        <AbsoluteFill>
                            <Img
                                src={src}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transform: `scale(${scale})`,
                                    opacity
                                }}
                            />
                        </AbsoluteFill>
                    </Sequence>
                );
            })}

            {/* Captions Layer */}
            <AbsoluteFill className="justify-end items-center pb-32">
                <div
                    className="text-white text-5xl font-bold text-center drop-shadow-md px-10 p-4 rounded-xl"
                    style={{
                        backgroundColor: brandKit && brandKit.primary_color ? `${brandKit.primary_color}CC` : 'rgba(0,0,0,0.5)',
                        fontFamily: brandKit && brandKit.font_family ? brandKit.font_family : 'inherit'
                    }}
                >
                    {visibleCaptions.map((c: any) => c.word).join(' ')}
                </div>
            </AbsoluteFill>

            {/* Brand Kit Logo */}
            {brandKit && brandKit.logo_url && (
                <AbsoluteFill className="justify-start items-end p-8 pointer-events-none">
                    <Img
                        src={brandKit.logo_url}
                        style={{ width: '120px', height: '120px', objectFit: 'contain', opacity: 0.85 }}
                    />
                </AbsoluteFill>
            )}

            {/* AI-Generated Watermark (EU AI Act Compliance) */}
            <AbsoluteFill className="justify-start items-end p-6 pointer-events-none">
                <div className="text-white/50 text-xl font-medium tracking-wider drop-shadow-md bg-black/20 px-3 py-1 rounded-md">
                    AI-Generated Content
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
}
