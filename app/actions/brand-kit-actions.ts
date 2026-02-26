"use server";

import { createClient } from "@/utils/supabase/server";
import { currentUser } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";

export async function getBrandKit() {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const supabase = await createClient();

        // Link via internal users table
        const { data: dbUser } = await supabase
            .from("users")
            .select("id")
            .eq("clerk_id", user.id)
            .single();

        if (!dbUser) return { success: false, error: "User not found in DB" };

        const { data, error } = await supabase
            .from("brand_kits")
            .select("*")
            .eq("user_id", dbUser.id)
            .single();

        if (error && error.code !== "PGRST116") { // Ignore if not found
            console.error("Error fetching brand kit:", error);
            Sentry.captureException(error);
            return { success: false, error: "Failed to load brand kit" };
        }

        return { success: true, brandKit: data };
    } catch (e: any) {
        console.error("getBrandKit error", e);
        Sentry.captureException(e);
        return { success: false, error: e.message || "Something went wrong" };
    }
}

export async function upsertBrandKit(formData: FormData) {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const supabase = await createClient();

        let logoUrl = formData.get("logoUrl") as string | null;
        const logoFile = formData.get("logoFile") as File | null;
        const primaryColor = formData.get("primaryColor") as string;
        const fontFamily = formData.get("fontFamily") as string;

        const { data: dbUser } = await supabase
            .from("users")
            .select("id")
            .eq("clerk_id", user.id)
            .single();

        if (!dbUser) return { success: false, error: "User not found in DB" };

        // Handle File upload if present
        if (logoFile && logoFile.size > 0 && logoFile.name !== 'undefined') {
            const fileExt = logoFile.name.split('.').pop();
            const fileName = `${dbUser.id}-${Date.now()}.${fileExt}`;
            const filePath = `logos/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('series-assets') // Re-using existing bucket
                .upload(filePath, logoFile);

            if (uploadError) {
                console.error("Upload error", uploadError);
                return { success: false, error: "Failed to upload logo" };
            }

            const { data: publicUrlData } = supabase.storage
                .from('series-assets')
                .getPublicUrl(filePath);

            logoUrl = publicUrlData.publicUrl;
        }

        const payload = {
            user_id: dbUser.id,
            logo_url: logoUrl,
            primary_color: primaryColor,
            font_family: fontFamily,
            updated_at: new Date().toISOString()
        };

        const { data: existing } = await supabase
            .from("brand_kits")
            .select("id")
            .eq("user_id", dbUser.id)
            .single();

        let result;
        if (existing) {
            result = await supabase
                .from("brand_kits")
                .update(payload)
                .eq("id", existing.id);
        } else {
            result = await supabase
                .from("brand_kits")
                .insert([payload]);
        }

        if (result.error) {
            console.error("Error upserting brand kit:", result.error);
            Sentry.captureException(result.error);
            return { success: false, error: "Failed to save brand kit" };
        }

        return { success: true, logoUrl };
    } catch (e: any) {
        console.error("upsertBrandKit error", e);
        Sentry.captureException(e);
        return { success: false, error: e.message || "Something went wrong" };
    }
}
