import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function syncUser() {
    console.log("DEBUG: syncUser started");
    try {
        const user = await currentUser();

        if (!user) {
            console.log("DEBUG: Sync User: No Clerk user found.");
            return null;
        }

        const email = user.emailAddresses[0]?.emailAddress;
        const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        const clerkId = user.id;

        console.log(`DEBUG: Sync User: Found Clerk User. Email: ${email}, ClerkID: ${clerkId}`);

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error("DEBUG: ERROR: SUPABASE_SERVICE_ROLE_KEY is missing in env vars");
            return null;
        }

        // Use Service Role Key to bypass RLS
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        console.log("DEBUG: Supabase client initialized with Service Role");

        // Check if user exists by email OR clerk_id
        const { data: existingUser, error: fetchError } = await supabase
            .from("users")
            .select("*")
            .or(`email.eq.${email},clerk_id.eq.${clerkId}`)
            .maybeSingle();

        if (fetchError) {
            console.error("DEBUG: Error fetching user from Supabase:", fetchError);
            return null;
        }

        if (existingUser) {
            console.log("DEBUG: Sync User: User already exists:", existingUser);
            // Optional: Update user details if they changed? 
            if (!existingUser.clerk_id) {
                console.log("DEBUG: Updating existing user with clerk_id");
                const { error: updateError } = await supabase.from("users").update({ clerk_id: clerkId }).eq("id", existingUser.id);
                if (updateError) console.error("DEBUG: Error updating user clerk_id:", updateError);
            }
            return existingUser;
        }

        console.log("DEBUG: Sync User: Inserting new user:", email);

        // Insert new user
        const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert([
                {
                    email,
                    name,
                    clerk_id: clerkId,
                },
            ])
            .select()
            .single();

        if (insertError) {
            console.error("DEBUG: Error inserting user to Supabase:", insertError);
            return null;
        }

        console.log("DEBUG: Sync User: Successfully inserted user:", newUser);
        return newUser;
    } catch (e) {
        console.error("DEBUG: UNEXPECTED ERROR in syncUser:", e);
        return null;
    }
}
