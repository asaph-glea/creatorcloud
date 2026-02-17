import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { helloWorld } from "@/inngest/functions/hello-world";
import { generateVideo } from "@/inngest/functions/generate-video";
import { publishWorkflow } from "@/inngest/functions/publish-workflow";
import { scheduler } from "@/inngest/functions/scheduler";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        helloWorld,
        generateVideo,
        publishWorkflow,
        scheduler,
    ],
});
