import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function syncUser() {
    const user = await currentUser();

    if (!user) {
        console.log("Sync User: No Clerk user found.");
        return null;
    }

    const email = user.emailAddresses[0]?.emailAddress;
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();

    // Use Service Role Key to bypass RLS
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error("Error fetching user from Supabase:", fetchError);
        return null;
    }

    if (existingUser) {
        console.log("Sync User: User already exists:", email);
        return existingUser;
    }

    console.log("Sync User: Inserting new user:", email);

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([
            {
                email,
                name,
                // ID can be the clerk ID if you want to link them strictly,
                // but usually the email is the bridge or you store clerk_id.
                // For now, let Supabase gen the ID or use email as PK.
            },
        ])
        .select()
        .single();

    if (insertError) {
        console.error("Error inserting user to Supabase:", insertError);
        return null;
    }

    console.log("Sync User: Successfully inserted user:", newUser);
    return newUser;
}
