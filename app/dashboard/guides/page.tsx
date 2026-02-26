"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BookOpen, Lightbulb, Play, Settings, Upload, Video, Zap } from "lucide-react"

export default function GuidesPage() {
    return (
        <div className="container mx-auto py-8 max-w-5xl space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Guides & Documentation</h1>
                <p className="text-muted-foreground">
                    Learn how to get the most out of CreatorCloud.
                </p>
            </div>

            <Tabs defaultValue="getting-started" className="space-y-8">
                <div className="overflow-x-auto pb-2">
                    <TabsList className="h-auto w-full justify-start gap-2 bg-transparent p-0">
                        <TabsTrigger
                            value="getting-started"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2"
                        >
                            Getting Started
                        </TabsTrigger>
                        <TabsTrigger
                            value="series"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2"
                        >
                            Creating Series
                        </TabsTrigger>
                        <TabsTrigger
                            value="publishing"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2"
                        >
                            Publishing
                        </TabsTrigger>
                        <TabsTrigger
                            value="faq"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2"
                        >
                            FAQ
                        </TabsTrigger>
                        <TabsTrigger
                            value="advanced"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2"
                        >
                            Advanced Features
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Getting Started Tab */}
                <TabsContent value="getting-started" className="space-y-6 animate-in fade-in-50 duration-500">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-yellow-500" />
                                Quick Start Guide
                            </CardTitle>
                            <CardDescription>
                                Go from zero to your first video in minutes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="p-4 border rounded-lg bg-card/50">
                                    <div className="font-semibold mb-2 flex items-center gap-2">
                                        <div className="bg-primary/10 p-1.5 rounded-full text-primary">1</div>
                                        Connect Accounts
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Go to <strong>Settings</strong> and connect your YouTube account. This is required for auto-publishing.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg bg-card/50">
                                    <div className="font-semibold mb-2 flex items-center gap-2">
                                        <div className="bg-primary/10 p-1.5 rounded-full text-primary">2</div>
                                        Create a Series
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Use the <strong>+ Create Series</strong> wizard to define your niche, style, and voice.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg bg-card/50">
                                    <div className="font-semibold mb-2 flex items-center gap-2">
                                        <div className="bg-primary/10 p-1.5 rounded-full text-primary">3</div>
                                        Generate & Publish
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Click <strong>Generate</strong> on your series card. The AI handles writing, voicing, visuals, and uploading.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Platform Integrations</CardTitle>
                            <CardDescription>Currently supported and upcoming platforms.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-start gap-3 p-3 border rounded-md">
                                    <div className="bg-red-100 p-2 rounded text-red-600">
                                        <Video className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">YouTube</div>
                                        <p className="text-xs text-muted-foreground">Fully supported. Auto-uploads as Private/Public.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 border rounded-md opacity-60">
                                    <div className="bg-blue-100 p-2 rounded text-blue-600">
                                        <Lightbulb className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">Instagram/TikTok</div>
                                        <p className="text-xs text-muted-foreground">Coming Soon.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Series Creation Tab */}
                <TabsContent value="series" className="space-y-6 animate-in fade-in-50 duration-500">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>The Creation Wizard</CardTitle>
                                <CardDescription>Understanding the 6 steps to a perfect series.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded h-fit">Step 1</span>
                                        <div className="text-sm">
                                            <strong>Niche Selection:</strong> Choose a preset (e.g., "Motivational") or define a custom Custom Niche. This guides the AI scriptwriter.
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded h-fit">Step 2</span>
                                        <div className="text-sm">
                                            <strong>Language & Voice:</strong> Select the narration language and voice model.
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded h-fit">Step 3</span>
                                        <div className="text-sm">
                                            <strong>Music:</strong> Pick a background track. This sets the mood of your video.
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded h-fit">Step 4</span>
                                        <div className="text-sm">
                                            <strong>Visual Style:</strong> Choose from "Cinematic", "Anime", "3D Render", etc. This prompts the image generator.
                                        </div>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pro Tips for Quality</CardTitle>
                                <CardDescription>How to get the best results from the AI.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Target Specific Niches</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Instead of generic "Health", try "Keto Diet Tips for Beginners". Specificity yields better scripts.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Match Music to Mood</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Don't pair "Motivational" scripts with "Sad" music. Use the preview button in the wizard.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Video Duration</h4>
                                    <p className="text-sm text-muted-foreground">
                                        30-40 seconds is the sweet spot for Shorts/Reels retention.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Publishing Tab */}
                <TabsContent value="publishing" className="space-y-6 animate-in fade-in-50 duration-500">
                    <Card>
                        <CardHeader>
                            <CardTitle>The Generation Pipeline</CardTitle>
                            <CardDescription>What happens when you click "Generate"?</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative border-l-2 border-muted ml-3 pl-6 space-y-6 pb-2">
                                <div className="relative">
                                    <div className="absolute -left-[31px] bg-background border-2 border-primary rounded-full w-4 h-4" />
                                    <h4 className="font-semibold">1. Scripting (Gemini AI)</h4>
                                    <p className="text-sm text-muted-foreground">
                                        AI writes a viral script based on your niche and duration settings.
                                    </p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[31px] bg-background border-2 border-muted rounded-full w-4 h-4" />
                                    <h4 className="font-semibold">2. Narration (Deepgram)</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Text-to-speech engine generates a human-like voiceover.
                                    </p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[31px] bg-background border-2 border-muted rounded-full w-4 h-4" />
                                    <h4 className="font-semibold">3. Visualization (Replicate)</h4>
                                    <p className="text-sm text-muted-foreground">
                                        AI generates unique images for each scene described in the script.
                                    </p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[31px] bg-background border-2 border-muted rounded-full w-4 h-4" />
                                    <h4 className="font-semibold">4. Rendering (Remotion)</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Combines voice, music, images, and captions into an MP4 video.
                                    </p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[31px] bg-background border-2 border-green-500 rounded-full w-4 h-4" />
                                    <h4 className="font-semibold">5. Publishing</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically uploads to connected platforms (e.g., YouTube) and sends you an email.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Advanced Features Tab */}
                <TabsContent value="advanced" className="space-y-6 animate-in fade-in-50 duration-500">
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Video className="h-5 w-5 text-purple-500" />
                                    Custom Video Creation
                                </CardTitle>
                                <CardDescription>
                                    Create videos with your own scripts and images.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">How it works</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Navigate to any Series and click the <strong>Custom</strong> button (or "Create Custom Video" in the menu).
                                        This allows you to:
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground ml-2 space-y-1">
                                        <li>Paste your own pre-written script.</li>
                                        <li>Upload specific images you want to use.</li>
                                        <li>Generate a unique video using the series' voice and style.</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-yellow-500" />
                                        Instant Generation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Don't want to wait for the schedule?
                                    </p>
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <div className="font-semibold mb-2">⚡ Auto Generate</div>
                                        <p className="text-xs text-muted-foreground">
                                            Clicking this button on a Series Card immediately triggers the creation of a new video based on the series settings.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-blue-500" />
                                        Precise Scheduling
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Control exactly when your content goes live.
                                    </p>
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <div className="font-semibold mb-2">Calendar Controls</div>
                                        <p className="text-xs text-muted-foreground">
                                            During series creation or editing, use the calendar to pick a specific start date and time.
                                            The system will automatically prevent selecting past dates.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* FAQ Tab */}
                <TabsContent value="faq" className="space-y-6 animate-in fade-in-50 duration-500">
                    <Card>
                        <CardHeader>
                            <CardTitle>Frequently Asked Questions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>Why is my video shorter than expected?</AccordionTrigger>
                                    <AccordionContent>
                                        The AI tries to match your target word count, but speaking speeds vary. Try increasing the target duration in your Series settings.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>Why didn't my video publish to YouTube?</AccordionTrigger>
                                    <AccordionContent>
                                        Check <strong>Settings</strong> to ensure your account is connected. Also, YouTube quotas may limit uploads if you are on a test account.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>Can I edit the script before generation?</AccordionTrigger>
                                    <AccordionContent>
                                        Yes! You can use the <strong>Custom Video</strong> feature to input your own script directly.
                                        For fully automated series, the AI writes the script for you based on your niche.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-4">
                                    <AccordionTrigger>Is the music copyright free?</AccordionTrigger>
                                    <AccordionContent>
                                        Yes, the provided library tracks are royalty-free for use on social media.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
