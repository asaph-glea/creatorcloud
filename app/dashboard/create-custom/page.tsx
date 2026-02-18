"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Upload, X, Image as ImageIcon, Video, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { createCustomVideo } from "@/app/actions/custom-actions"
import Image from "next/image"

import { polishScript } from "@/app/actions/ai-actions"
import { generatePreviewAudio } from "@/app/actions/custom-actions"
import { PreviewPlayer } from "@/components/preview-player"
import { Wand2, PlayCircle } from "lucide-react"

function CustomVideoForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const seriesId = searchParams.get("seriesId")
    const seriesName = searchParams.get("seriesName")

    const [script, setScript] = useState("")
    const [images, setImages] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isPolishing, setIsPolishing] = useState(false)
    const [isPreviewGenerating, setIsPreviewGenerating] = useState(false)
    const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    if (!seriesId) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <h3 className="text-xl font-bold text-destructive mb-2">Missing Series</h3>
                <p className="text-muted-foreground mb-4">You must select a series to create a video for.</p>
                <Button onClick={() => router.push("/dashboard/series")}>Go to Series</Button>
            </div>
        )
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)

            // Limit to 5 images max for now
            if (images.length + newFiles.length > 5) {
                toast.error("Maximum 5 images allowed")
                return
            }

            setImages(prev => [...prev, ...newFiles])

            // Create previews
            const newPreviews = newFiles.map(file => URL.createObjectURL(file))
            setImagePreviews(prev => [...prev, ...newPreviews])
        }
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))

        // Revoke object URL to avoid memory leaks
        URL.revokeObjectURL(imagePreviews[index])
        setImagePreviews(prev => prev.filter((_, i) => i !== index))
    }

    const handlePolishScript = async () => {
        if (!script || script.length < 10) {
            toast.error("Script is too short to polish");
            return;
        }

        setIsPolishing(true);
        try {
            const result = await polishScript(script);
            if (result.success && result.polishedScript) {
                setScript(result.polishedScript);
                toast.success("Script polished by AI!");
            } else {
                toast.error(result.error || "Failed to polish script");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setIsPolishing(false);
        }
    }

    const handleGeneratePreviewAudio = async () => {
        if (!script) {
            toast.error("Enter a script first");
            return;
        }
        setIsPreviewGenerating(true);
        try {
            const result = await generatePreviewAudio(script);
            if (result.success && result.audioUrl) {
                setPreviewAudioUrl(result.audioUrl);
                toast.success("Preview audio generated!");
            } else {
                toast.error(result.error || "Failed to generate audio");
            }
        } catch (err) {
            toast.error("Something went wrong generating audio");
        } finally {
            setIsPreviewGenerating(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log("DEBUG: handleSubmit called")

        if (!script.trim()) {
            toast.error("Please write a script")
            return
        }

        if (images.length === 0) {
            toast.error("Please upload at least one image")
            return
        }

        // Client-side validation
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

        for (const file of images) {
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`File "${file.name}" is too large (Max 10MB)`)
                return
            }
            if (!ALLOWED_TYPES.includes(file.type)) {
                toast.error(`File "${file.name}" is not a supported image type`)
                return
            }
        }

        setIsSubmitting(true)

        try {
            const formData = new FormData()
            formData.append("seriesId", seriesId)
            formData.append("script", script)

            images.forEach((image) => {
                formData.append("images", image)
            })

            const result = await createCustomVideo(formData)
            console.log("DEBUG: Server Action Result:", result)

            if (result.success) {
                toast.success("Video creation started!")
                router.push("/dashboard/videos")
            } else {
                toast.error(result.error || "Failed to create video")
            }
        } catch (error) {
            console.error(error)
            toast.error("An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container max-w-6xl mx-auto py-10 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Create Custom Video</h1>
                <p className="text-muted-foreground">
                    Manually control the script and visuals for <strong>{seriesName || "your series"}</strong>.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT COLUMN: Input Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2">
                                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                                    The Narrative
                                </CardTitle>
                                <CardDescription>
                                    Write the exact script you want the AI voice to speak.
                                </CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={handlePolishScript}
                                disabled={isPolishing || !script}
                                className="h-8"
                            >
                                {isPolishing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Wand2 className="w-3 h-3 mr-1" />}
                                AI Polish
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Label htmlFor="script" className="sr-only">Script</Label>
                            <Textarea
                                id="script"
                                placeholder="Start writing your viral script here..."
                                className="min-h-[200px] text-base p-4"
                                value={script}
                                onChange={(e) => {
                                    setScript(e.target.value);
                                    // Invalidate audio preview if script changes significantly? 
                                    // For now, let user manually regenerate.
                                }}
                            />
                            <p className="text-xs text-muted-foreground mt-2 text-right">
                                {script.split(/\s+/).filter(w => w.length > 0).length} words
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                                The Visuals
                            </CardTitle>
                            <CardDescription>
                                Upload specific images to match your script.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div
                                className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="bg-muted p-3 rounded-full">
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-semibold">Click to upload images</h3>
                                    <p className="text-sm text-muted-foreground">JPG, PNG supported.</p>
                                </div>
                            </div>

                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                    {imagePreviews.map((preview, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-md overflow-hidden group border">
                                            <Image
                                                src={preview}
                                                alt={`Upload ${idx + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                                Img {idx + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3 sticky bottom-6 bg-background/95 backdrop-blur py-4 border-t z-10 lg:hidden">
                        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading & Generating...
                                </>
                            ) : (
                                <>
                                    <Video className="mr-2 h-4 w-4" /> Generate Custom Video
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                {/* RIGHT COLUMN: Real-Time Preview */}
                <div className="space-y-6">
                    <Card className="h-fit sticky top-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                                Real-Time Preview
                            </CardTitle>
                            <CardDescription>
                                Preview how your video will look with the current script and images.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-center">
                                <div className="w-full max-w-[280px]">
                                    <PreviewPlayer
                                        script={script}
                                        audioUrl={previewAudioUrl}
                                        imageUrls={imagePreviews}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={handleGeneratePreviewAudio}
                                    disabled={isPreviewGenerating || !script}
                                    className="w-full"
                                >
                                    {isPreviewGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                                    {previewAudioUrl ? "Regenerate Audio Preview" : "Generate Audio Preview"}
                                </Button>
                                <p className="text-xs text-muted-foreground text-center">
                                    Generates a TTS preview. Final video will use high-quality voice.
                                </p>
                            </div>

                            <div className="pt-4 border-t mt-4 space-y-3">
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={(e) => {
                                        document.querySelector('form')?.requestSubmit();
                                    }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Video className="mr-2 h-5 w-5" /> Generate Final Video
                                        </>
                                    )}
                                </Button>
                                <Button variant="ghost" className="w-full" onClick={() => router.back()} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default function CreateCustomPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <CustomVideoForm />
        </Suspense>
    )
}
