import { createClient } from "@deepgram/sdk";

const deepgram = process.env.DEEPGRAM_API_KEY
    ? createClient(process.env.DEEPGRAM_API_KEY)
    : null;

interface GenerateVoiceParams {
    text: string;
    model?: string; // e.g. "aura-luna-en"
}

export async function generateVoiceover({ text, model = "aura-asteria-en" }: GenerateVoiceParams) {
    if (!deepgram) {
        throw new Error("DEEPGRAM_API_KEY is not set");
    }

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            // Deepgram Aura (TTS) 
            // Ref: https://developers.deepgram.com/docs/text-to-speech
            const response = await deepgram.speak.request(
                { text },
                {
                    model: model,
                    encoding: "mp3",
                }
            );

            const stream = await response.getStream();

            if (!stream) {
                throw new Error("Failed to generate audio stream from Deepgram");
            }

            // Convert Web ReadableStream to Buffer
            const buffer = await streamToBuffer(stream);
            return buffer;

        } catch (error: any) {
            attempts++;
            console.warn(`[Deepgram] Generate Voice attempt ${attempts}/${maxAttempts} failed: ${error.message}`);

            if (attempts >= maxAttempts) {
                console.error("[Deepgram] All attempts failed.");
                throw error;
            }

            // Exponential backoff: 1s, 2s, 4s
            const waitTime = 1000 * Math.pow(2, attempts - 1);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    throw new Error("Deepgram generation failed after retries");
}

// Helper to convert stream to buffer
async function streamToBuffer(stream: ReadableStream): Promise<Buffer> {
    const reader = stream.getReader();
    const chunks = [];

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }

    return Buffer.concat(chunks);
}

export async function transcribeAudio(audioUrl: string) {
    if (!deepgram) throw new Error("DEEPGRAM_API_KEY is not set");

    const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
        { url: audioUrl },
        {
            model: "nova-2",
            smart_format: true,
            diarize: false, // We assume single speaker for now
        }
    );

    if (error) throw new Error(`Deepgram transcription failed: ${error.message}`);

    // Return the words with timestamps
    // Accessing correct path based on SDK response structure
    const words = result?.results?.channels?.[0]?.alternatives?.[0]?.words;
    if (!words) return [];

    return words.map((w: any) => ({
        word: w.word,
        start: w.start,
        end: w.end,
        confidence: w.confidence
    }));
}
