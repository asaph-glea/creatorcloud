"use client"

import { useCreateSeries } from "@/app/dashboard/create/context"
import { CreateFooter } from "@/components/create/create-footer"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SOCIAL_PLATFORMS, VIDEO_DURATIONS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Instagram, Mail, Music2, Pin, Twitter, Youtube } from "lucide-react"

const iconMap = {
    Youtube: Youtube,
    Music2: Music2,
    Instagram: Instagram,
    Twitter: Twitter,
    Pin: Pin,
    Mail: Mail,
}

export function StepDetails() {
    const { data, setData, nextStep, prevStep } = useCreateSeries()

    const isNextDisabled = !data.seriesName || !data.videoDuration || !data.platform || !data.publishTime

    const handleSchedule = () => {
        // Here you would typically submit the form
        console.log("Scheduling series:", data)
        // For now, we can show a success message or redirect
        alert("Series scheduled successfully!")
    }

    return (
        <div className="flex flex-col h-full max-w-2xl mx-auto">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold tracking-tight">Final Details</h2>
                <p className="text-muted-foreground mt-2">
                    Review and schedule your series generation.
                </p>
            </div>

            <div className="flex-1 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="seriesName">Series Name</Label>
                    <Input
                        id="seriesName"
                        placeholder="e.g. Daily Meditation, Tech News..."
                        value={data.seriesName}
                        onChange={(e) => setData(prev => ({ ...prev, seriesName: e.target.value }))}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Video Duration</Label>
                    <Select
                        value={data.videoDuration}
                        onValueChange={(value) => setData(prev => ({ ...prev, videoDuration: value }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                            {VIDEO_DURATIONS.map((duration) => (
                                <SelectItem key={duration.value} value={duration.value}>
                                    {duration.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Social Platform</Label>
                    <div className="grid grid-cols-3 gap-3">
                        {SOCIAL_PLATFORMS.map((platform) => {
                            const Icon = iconMap[platform.icon as keyof typeof iconMap]
                            return (
                                <Card
                                    key={platform.id}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-4 cursor-pointer transition-all hover:bg-muted/50",
                                        data.platform === platform.id
                                            ? "border-primary ring-1 ring-primary"
                                            : ""
                                    )}
                                    onClick={() => setData(prev => ({ ...prev, platform: platform.id }))}
                                >
                                    <Icon className="h-6 w-6 mb-2" />
                                    <span className="text-xs font-medium">{platform.name}</span>
                                </Card>
                            )
                        })}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Publish Time</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !data.publishTime && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {data.publishTime ? format(data.publishTime, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={data.publishTime}
                                onSelect={(date) => setData(prev => ({ ...prev, publishTime: date }))}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground mt-1">
                        Video will generate 3-6 hours before the video is published.
                    </p>
                </div>
            </div>

            <div className="mt-8 pt-4 border-t flex justify-between">
                <Button
                    variant="ghost"
                    onClick={prevStep}
                >
                    Back
                </Button>
                <Button
                    onClick={handleSchedule}
                    disabled={isNextDisabled}
                    className="ml-auto"
                >
                    Schedule Series
                </Button>
            </div>
        </div>
    )
}
