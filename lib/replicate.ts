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

    const output = await replicate.run(model, { input });

    // Replicate returns an array of URLs or output strings
    // @ts-ignore
    const imageUrl = Array.isArray(output) ? output[0] : output;

    if (!imageUrl) {
        throw new Error("Failed to generate image from Replicate");
    }

    // Fetch the image to return as buffer
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();

    return Buffer.from(arrayBuffer);
}
