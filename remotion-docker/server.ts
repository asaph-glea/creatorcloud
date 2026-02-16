/**
 * Remotion Render Server for Google Cloud Run
 *
 * This server receives rendering requests, bundles the Remotion project,
 * renders the video using Chromium, and uploads the result to Supabase Storage.
 */

import express from 'express';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import os from 'os';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.post('/render', async (req: express.Request, res: express.Response) => {
    try {
        const { inputProps, compositionId, outputBucket, outputKey } = req.body;

        if (!inputProps || !compositionId || !outputBucket || !outputKey) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        console.log(`Starting render for composition: ${compositionId}`);

        // Bundle the project
        // Assuming the entry point is at src/remotion/index.ts (standard Next.js Remotion setup)
        const entryPoint = path.join(process.cwd(), 'remotion', 'index.ts');

        console.log('Bundling project...');
        const bundled = await bundle({
            entryPoint,
            // If we are in Docker, we might need to adjust webpack config, 
            // but usually defaults work fine for standard setups.
        });

        console.log('Selecting composition...');
        const composition = await selectComposition({
            serveUrl: bundled,
            id: compositionId,
            inputProps,
        });

        // Create a temporary file for the output
        const tmpDir = os.tmpdir();
        const outputFile = path.join(tmpDir, `out-${Date.now()}.mp4`);

        console.log('Rendering video...');
        await renderMedia({
            composition,
            serveUrl: bundled,
            codec: 'h264',
            outputLocation: outputFile,
            inputProps,
            // Chromium options for Cloud Run / Docker
            chromiumOptions: {
                enableMultiProcessOnLinux: true,
            },
        });

        console.log('Render complete. Uploading to Supabase...');

        // Upload to Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase credentials');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const fileContent = fs.readFileSync(outputFile);

        const { data, error } = await supabase.storage
            .from(outputBucket)
            .upload(outputKey, fileContent, {
                contentType: 'video/mp4',
                upsert: true,
            });

        // Clean up temp file
        fs.unlinkSync(outputFile);

        if (error) {
            throw new Error(`Supabase upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(outputBucket)
            .getPublicUrl(outputKey);

        console.log(`Upload complete: ${publicUrl}`);

        res.json({ success: true, url: publicUrl });

    } catch (error: any) {
        console.error('Render failed:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Render server listening on port ${PORT}`);
});
