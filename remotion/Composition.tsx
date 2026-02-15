import { AbsoluteFill, Audio, Img, useCurrentFrame, useVideoConfig, Sequence, interpolate, spring } from 'remotion';
import React, { useMemo } from 'react';

// You might need to install 'parse-srt' or similar if captions are raw text/json
// For now assuming we pass processed captions or handle them simply

export interface CompositionProps {
    audioUrl: string;
    imageUrls: string[];
    captions: any[]; // Adjust type based on Deepgram output
    script?: string;
}

export const MyComposition: React.FC<CompositionProps> = ({ audioUrl, imageUrls, captions }) => {
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
            {/* Audio Track */}
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
                <div className="text-white text-5xl font-bold text-center drop-shadow-md px-10 bg-black/50 p-4 rounded-xl">
                    {visibleCaptions.map((c: any) => c.word).join(' ')}
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
