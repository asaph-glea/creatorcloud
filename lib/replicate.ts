import Replicate from "replicate";

const replicate = process.env.REPLICATE_API_TOKEN
    ? new Replicate({ auth: process.env.REPLICATE_API_TOKEN })
    : null;

interface GenerateImageParams {
    prompt: string;
}

export async function generateImage({ prompt }: GenerateImageParams): Promise<Buffer> {
    if (!replicate) {
        throw new Error("REPLICATE_API_TOKEN is not set");
    }

    const model = "bytedance/sdxl-lightning-4step:6f7a773af6fc3e8de9d5a3c00be77c17308914bf67772726aff83496ba1e3bbe";
    const input = {
        prompt,
        width: 1024,
        height: 576, // 16:9 aspect ratio or close to it
    };

    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
        try {
            const output = await replicate.run(model, { input });

            // Replicate returns an array of URLs or output strings
            // @ts-ignore
            const imageUrl = Array.isArray(output) ? output[0] : output;

            if (!imageUrl) {
                throw new Error("Failed to generate image from Replicate - empty output");
            }

            // Fetch the image to return as buffer
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
                throw new Error(`Failed to fetch image from URL: ${imageResponse.statusText}`);
            }
            const arrayBuffer = await imageResponse.arrayBuffer();

            return Buffer.from(arrayBuffer);

        } catch (error: any) {
            attempts++;
            const isRateLimit = error?.message?.includes("429") ||
                error?.status === 429 ||
                error?.response?.status === 429;

            if (isRateLimit && attempts < maxAttempts) {
                // Exponential backoff: 2s, 4s, 8s, 16s
                const waitTime = 2000 * Math.pow(2, attempts - 1);
                console.warn(`[Replicate] Rate limited (429). Retrying attempt ${attempts}/${maxAttempts} in ${waitTime}ms...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            if (attempts >= maxAttempts) {
                console.error(`[Replicate] Max retries (${maxAttempts}) exceeded.`);
                throw error;
            }

            // If it's not a rate limit error, throw immediately (or maybe retry on 500s too? keeping it simple for now)
            throw error;
        }
    }
    throw new Error("Unexpected end of retry loop");
}
