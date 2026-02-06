import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const client = apiKey ? new GoogleGenAI({ apiKey }) : null;

interface GenerateScriptParams {
    seriesName: string;
    nicheType: string;
    selectedNiche?: string;
    customNiche?: string;
    videoStyle: string;
    videoDuration: string;
}

export async function generateVideoScript(params: GenerateScriptParams) {
    if (!client) {
        throw new Error("GEMINI_API_KEY is not set");
    }

    // Determine prompt count based on duration
    let promptCount = "1-2";
    const duration = params.videoDuration || "10-20s";
    if (duration === "20-30s") promptCount = "2-3";
    if (duration === "30-40s") promptCount = "3-4";
    if (duration === "40-50s") promptCount = "4-5";
    if (duration === "50-60s") promptCount = "5-6";

    const prompt = `
    Create a viral short video script for a series named "${params.seriesName}".
    Niche: ${params.nicheType} ${params.selectedNiche ? `(${params.selectedNiche})` : ""} ${params.customNiche ? `(${params.customNiche})` : ""}.
    Video Style: ${params.videoStyle}.
    Target Duration: ${duration}.
    
    Strictly return VALID JSON only. No markdown formatting. No code blocks.
    Structure:
    {
      "title": "Viral catchy title",
      "script": "The full spoken script for the voiceover. Natural, engaging tone.",
      "image_prompts": [
        "Detailed AI image prompt for scene 1",
        "Detailed AI image prompt for scene 2"
        ... (${promptCount} prompts)
      ]
    }
    
    Make sure the script fits the time limit.
    Make the image prompts highly detailed, describing style, lighting, and composition matching the "${params.videoStyle}" style.
  `;

    try {
        const result = await client.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
        });

        // @ts-ignore - The SDK types might be mismatching runtime or lint is confused, but usually it's a helper method or property.
        // Based on lint error: "This expression is not callable because it is a 'get' accessor"
        const text = typeof result.text === 'function' ? result.text() : result.text;

        if (!text && result?.candidates?.length) {
            // Fallback to manual extraction if helper fails
            const part = result.candidates[0].content?.parts?.[0];
            if (part?.text) return JSON.parse(part.text.replace(/```json/g, "").replace(/```/g, "").trim());
        }

        // Clean up markdown if present (Gemini sometimes adds \`\`\`json ... \`\`\`)
        const cleanedText = (text || "").replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(cleanedText);
    } catch (error: any) {
        throw new Error(`Failed to generate video script: ${error.message}`);
    }
}
