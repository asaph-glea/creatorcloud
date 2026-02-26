"use client";

import { Composition } from 'remotion';
import { MyComposition, CompositionProps } from './Composition';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="MyComp"
                component={MyComposition as any}
                durationInFrames={300}
                fps={30}
                width={1080}
                height={1920}
                defaultProps={{
                    audioUrl: '',
                    imageUrls: [],
                    captions: [],
                    script: '',
                }}
            />
        </>
    );
};
