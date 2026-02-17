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
    let promptCount = "2-3";
    const duration = params.videoDuration || "20-30";

    // Normalize duration string (remove 's' suffix if present just in case)
    const normalizedDuration = duration.replace(/s$/, "");

    if (normalizedDuration === "20-30") promptCount = "2-3";
    if (normalizedDuration === "30-40") promptCount = "3-4";
    if (normalizedDuration === "40-50") promptCount = "4-5";
    if (normalizedDuration === "50-60") promptCount = "5-6";

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
    
    IMPORTANT SAFETY GUIDELINES:
    - The image prompts MUST BE SAFE FOR WORK (SFW).
    - Do NOT include any sexual, violent, gory, or harmful content in the image prompts.
    - If a scene implies violence or adult themes, describe it abstractly or focus on safe elements (e.g., "shadowy figure", "tense atmosphere") without explicit details.
    - Ensure all prompts comply with standard safety policies.
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
