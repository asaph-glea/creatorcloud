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
import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';
import os from 'os';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.post('/render', async (req: express.Request, res: express.Response) => {
    try {
        const { inputProps, compositionId, outputBucket, outputKey, outputProvider, durationInFrames } = req.body;

        if (!inputProps || !compositionId || !outputKey) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Default to GCS if GCS_BUCKET is set and no outputBucket provided, or if provider explicitly set
        const useGcs = outputProvider === 'gcs' || (!outputBucket && process.env.GCS_BUCKET);
        const targetBucket = outputBucket || process.env.GCS_BUCKET;

        if (!targetBucket) {
            return res.status(400).json({ error: 'No output bucket specified' });
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

        // Determine duration
        const finalDurationInFrames = durationInFrames || composition.durationInFrames;

        // Create a temporary file for the output
        const tmpDir = os.tmpdir();
        const outputFile = path.join(tmpDir, `out-${Date.now()}.mp4`);

        console.log('Rendering video...');
        await renderMedia({
            composition: {
                ...composition,
                durationInFrames: finalDurationInFrames, // Override duration
            },
            serveUrl: bundled,
            codec: 'h264',
            outputLocation: outputFile,
            inputProps,
            // Chromium options for Cloud Run / Docker
            chromiumOptions: {
                enableMultiProcessOnLinux: true,
            },
        });

        console.log(`Render complete. Uploading to ${useGcs ? 'GCS' : 'Supabase'}...`);

        if (useGcs) {
            // Upload to Google Cloud Storage
            const storage = new Storage();
            const bucket = storage.bucket(targetBucket);

            await bucket.upload(outputFile, {
                destination: outputKey,
                public: true, // Make public by default? adjustable
            });

            // Clean up temp file
            fs.unlinkSync(outputFile);

            const publicUrl = `https://storage.googleapis.com/${targetBucket}/${outputKey}`;
            console.log(`Upload complete: ${publicUrl}`);
            res.json({ success: true, url: publicUrl });

        } else {
            // Upload to Supabase
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Missing Supabase credentials');
            }

            const supabase = createClient(supabaseUrl, supabaseKey);
            const fileContent = fs.readFileSync(outputFile);

            const { data, error } = await supabase.storage
                .from(targetBucket)
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
                .from(targetBucket)
                .getPublicUrl(outputKey);

            console.log(`Upload complete: ${publicUrl}`);

            res.json({ success: true, url: publicUrl });
        }

    } catch (error: any) {
        console.error('Render failed:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Render server listening on port ${PORT}`);
});
