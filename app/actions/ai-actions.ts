"use server"

import { generateText } from "@/lib/gemini"

export async function polishScript(currentScript: string) {
    if (!currentScript || currentScript.trim().length < 10) {
        return { success: false, error: "Script is too short to polish." }
    }

    try {
        const prompt = `
        You are an expert video script editor. Improve the following script for a short-form video (TikTok/Shorts).
        
        Goals:
        1. Fix grammar and flow.
        2. Make the hook (first sentence) more engaging.
        3. Keep it concise and conversational.
        4. Do NOT add any metadata, labels, or "Here is the rewritten script:" text. Just return the raw polished script.

        Current Script:
        "${currentScript}"
        `

        const polished = await generateText(prompt);

        // precise cleanup if gemini adds quotes
        const cleanScript = polished.replace(/^"|"$/g, '').trim();

        return { success: true, polishedScript: cleanScript }
    } catch (error: any) {
        console.error("Error polishing script:", error)
        return { success: false, error: "Failed to polish script. Please try again." }
    }
}
