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
import { format, setHours, setMinutes } from "date-fns"
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

    const setTime = (type: "hour" | "minute" | "period", value: string) => {
        if (!data.publishTime) return

        const date = new Date(data.publishTime)
        let hours = date.getHours()
        let minutes = date.getMinutes()

        if (type === "hour") {
            const currentPeriod = hours >= 12 ? "PM" : "AM"
            let newHour = parseInt(value)
            if (currentPeriod === "PM" && newHour !== 12) newHour += 12
            if (currentPeriod === "AM" && newHour === 12) newHour = 0
            hours = newHour
        } else if (type === "minute") {
            minutes = parseInt(value)
        } else if (type === "period") {
            if (value === "PM" && hours < 12) hours += 12
            if (value === "AM" && hours >= 12) hours -= 12
        }

        const newDate = setMinutes(setHours(date, hours), minutes)
        setData(prev => ({ ...prev, publishTime: newDate }))
    }

    const getTimeValues = () => {
        if (!data.publishTime) return { hour: "12", minute: "00", period: "AM" }
        const date = data.publishTime
        let hours = date.getHours()
        const minutes = date.getMinutes().toString().padStart(2, "0")
        const period = hours >= 12 ? "PM" : "AM"

        if (hours > 12) hours -= 12
        if (hours === 0) hours = 12

        return { hour: hours.toString(), minute: minutes, period }
    }

    const { hour, minute, period } = getTimeValues()

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
                                {data.publishTime ? format(data.publishTime, "PPP p") : <span>Pick a date</span>}
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

                    <div className="flex gap-2 mt-2">
                        <Select
                            disabled={!data.publishTime}
                            value={hour}
                            onValueChange={(val) => setTime("hour", val)}
                        >
                            <SelectTrigger className="w-[80px]">
                                <SelectValue placeholder="Hour" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                                    <SelectItem key={h} value={h.toString()}>
                                        {h}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            disabled={!data.publishTime}
                            value={minute}
                            onValueChange={(val) => setTime("minute", val)}
                        >
                            <SelectTrigger className="w-[80px]">
                                <SelectValue placeholder="Min" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                                    <SelectItem key={m} value={m.toString().padStart(2, "0")}>
                                        {m.toString().padStart(2, "0")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            disabled={!data.publishTime}
                            value={period}
                            onValueChange={(val) => setTime("period", val)}
                        >
                            <SelectTrigger className="w-[80px]">
                                <SelectValue placeholder="AM/PM" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AM">AM</SelectItem>
                                <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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
        </div >
    )
}
