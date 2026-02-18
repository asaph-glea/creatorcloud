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

    // Determine constraints based on duration
    let promptCount = 3;
    let minWords = 50;
    let maxWords = 80;
    const duration = params.videoDuration || "20-30";
    const normalizedDuration = duration.replace(/s$/, "");

    // Avg speaking rate ~140 wpm. 
    if (normalizedDuration === "20-30") { promptCount = 4; minWords = 50; maxWords = 75; }
    if (normalizedDuration === "30-40") { promptCount = 5; minWords = 75; maxWords = 100; }
    if (normalizedDuration === "40-50") { promptCount = 7; minWords = 100; maxWords = 125; }
    if (normalizedDuration === "50-60") { promptCount = 9; minWords = 125; maxWords = 150; }

    const prompt = `
    You are an expert viral video scriptwriter. Create a script for a video series named "${params.seriesName}".
    
    Target Audience/Niche: ${params.nicheType} ${params.selectedNiche ? `(${params.selectedNiche})` : ""} ${params.customNiche ? `(${params.customNiche})` : ""}.
    Video Style: ${params.videoStyle}.
    Target Duration: ${duration} seconds.
    Target Word Count: ${minWords} - ${maxWords} words.
    
    STRICT REQUIREMENTS:
    1.  **Word Count**: The spoken script MUST be between ${minWords} and ${maxWords} words. Do NOT generate a script shorter than ${minWords} words.
    2.  **Structure**: The script MUST have a clear beginning (Hook), middle (Body), and end (Conclusion/Call to Action). It must NOT end abruptly.
    3.  **Visuals**: Provide EXACTLY ${promptCount} distinct image prompts that align with the flow of the story.
    
    Strictly return VALID JSON only. No markdown formatting. No code blocks.
    JSON Structure:
    {
      "title": "Viral catchy title",
      "script": "The full spoken script. Plain text, no scene markers in this string.",
      "image_prompts": [
        "Visual description for scene 1",
        "Visual description for scene 2",
        ...
      ]
    }
    
    IMPORTANT SAFETY GUIDELINES:
    - The image prompts MUST BE SAFE FOR WORK (SFW).
    - Do NOT include any sexual, violent, gory, or harmful content.
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

export async function generateText(prompt: string): Promise<string> {
    if (!client) {
        throw new Error("GEMINI_API_KEY is not set");
    }

    try {
        const result = await client.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
        });

        // Handle response extraction similar to above
        const text = typeof result.text === 'function' ? result.text() : result.text;

        if (text) return text;

        // Fallback
        const part = result.candidates?.[0]?.content?.parts?.[0];
        if (part?.text) return part.text;

        throw new Error("No text returned from Gemini");

    } catch (error: any) {
        console.error("Gemini Generate Text Error:", error);
        throw new Error(`Failed to generate text: ${error.message}`);
    }
}
