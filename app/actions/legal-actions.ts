"use server";

import { createClient } from "@supabase/supabase-js";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function submitLegalConsent() {
    const user = await currentUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const clerkId = user.id;

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
        .from("users")
        .update({
            ai_consent: true,
            accepted_terms_version: "v1.0",
            accepted_at: new Date().toISOString()
        })
        .eq("clerk_id", clerkId);

    if (error) {
        console.error("Failed to update legal consent:", error);
        throw new Error("Failed to save consent. Please try again.");
    }

    // Redirect to dashboard after successful consent
    redirect("/dashboard");
}
