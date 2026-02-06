"use client"

import { useCreateSeries } from "@/app/dashboard/create/context"
import { CreateFooter } from "@/components/create/create-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const AVAILABLE_NICHES = [
    {
        id: "scary-stories",
        title: "Scary Stories",
        description: "Spine-chilling tales of horror and mystery.",
    },
    {
        id: "bible-stories",
        title: "Bible Stories",
        description: "Historical and spiritual narratives from the Bible.",
    },
    {
        id: "educational",
        title: "Educational",
        description: "Informative content to teach and explain concepts.",
    },
    {
        id: "motivational",
        title: "Motivational Stories",
        description: "Inspiring stories to uplift and encourage.",
    },
    {
        id: "bedtime-stories",
        title: "Bedtime Stories",
        description: "Calm and soothing stories for sleep.",
    },
    {
        id: "history",
        title: "Historical Facts",
        description: "Interesting events and figures from the past.",
    },
]

export function StepNiche() {
    const { data, setData, nextStep } = useCreateSeries()
    const router = useRouter()

    const handleNicheSelect = (id: string) => {
        setData((prev) => ({ ...prev, selectedNiche: id }))
    }

    const handleCustomNicheChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData((prev) => ({ ...prev, customNiche: e.target.value }))
    }

    const handleContinue = () => {
        if (data.nicheType === "available" && !data.selectedNiche) return
        if (data.nicheType === "custom" && !data.customNiche) return
        nextStep()
    }

    const handleBack = () => {
        router.back()
    }

    const isNextDisabled =
        (data.nicheType === "available" && !data.selectedNiche) ||
        (data.nicheType === "custom" && !data.customNiche)

    return (
        <div className="flex flex-col h-full max-w-3xl mx-auto">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold tracking-tight">Choose a Niche</h2>
                <p className="text-muted-foreground">
                    Select a category for your new video series.
                </p>
            </div>

            <Tabs
                defaultValue={data.nicheType}
                onValueChange={(val) =>
                    setData((prev) => ({ ...prev, nicheType: val as any }))
                }
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="available">Available Niches</TabsTrigger>
                    <TabsTrigger value="custom">Custom Niche</TabsTrigger>
                </TabsList>

                <TabsContent value="available" className="space-y-4">
                    <ScrollArea className="h-[400px] w-full border rounded-md p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {AVAILABLE_NICHES.map((niche) => (
                                <Card
                                    key={niche.id}
                                    className={cn(
                                        "cursor-pointer transition-all hover:border-primary/50",
                                        data.selectedNiche === niche.id
                                            ? "border-primary bg-primary/5"
                                            : ""
                                    )}
                                    onClick={() => handleNicheSelect(niche.id)}
                                >
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-base">{niche.title}</CardTitle>
                                        <CardDescription className="text-xs">
                                            {niche.description}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="custom" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Define Your Own Niche</CardTitle>
                            <CardDescription>
                                Describe the specific topic or theme you want to focus on.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="custom-niche">Niche Name</Label>
                                <Input
                                    id="custom-niche"
                                    placeholder="e.g., Quantum Physics for Kids"
                                    value={data.customNiche}
                                    onChange={handleCustomNicheChange}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <CreateFooter
                onNext={handleContinue}
                onBack={handleBack}
                isNextDisabled={isNextDisabled}
            />
        </div>
    )
}
