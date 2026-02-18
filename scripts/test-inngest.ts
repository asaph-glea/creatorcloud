
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Inngest } from "inngest";

// Manually load .env.local
const envLocal = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocal)) {
    console.log('Loading .env.local');
    const envConfig = dotenv.parse(fs.readFileSync(envLocal));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

// Force development mode for local testing
process.env.NODE_ENV = 'development';

// Re-create client locally to avoid import issues if necessary, but trying import first
// import { inngest } from '../inngest/client'; 
// Actually, let's just define it here to be robust against module resolution issues in script
const inngest = new Inngest({
    id: "creatorcloud",
    baseUrl: "http://127.0.0.1:8288"
});

async function main() {
    console.log('Sending test event to http://127.0.0.1:8288 ...');
    try {
        const result = await inngest.send({
            name: "video/publish.workflow",
            data: {
                seriesId: "test-series-id-" + Date.now(),
                videoId: "test-video-id",
                test: true,
                customScript: "This is a test script from the reproduction script.",
                customImageUrls: ["https://via.placeholder.com/150"]
            }
        });
        console.log('Event sent successfully:', result);
    } catch (e) {
        console.error('Error sending event:', e);
    }
}

main();
