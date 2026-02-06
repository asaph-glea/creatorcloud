
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function run() {
    console.log("Checking buckets...");
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error("Error listing buckets:", error);
    } else {
        console.log("Available Buckets:");
        buckets?.forEach(b => console.log(`- "${b.name}"`));
    }
}

run();
