"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Facebook,
    Instagram,
    Twitter,
    Youtube,
    CheckCircle2,
    XCircle,
    Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

// Define the interface for a social platform
interface SocialPlatform {
    id: string
    name: string
    icon: React.ComponentType<any>
    connected: boolean
    username?: string
    color: string
    comingSoon?: boolean
}

// Initial state with platforms
// In a real app, this would come from the database
const INITIAL_PLATFORMS: SocialPlatform[] = [
    {
        id: "youtube",
        name: "YouTube",
        icon: Youtube,
        connected: false,
        color: "text-red-600"
    },
    {
        id: "instagram",
        name: "Instagram",
        icon: Instagram,
        connected: false,
        color: "text-pink-600",
        comingSoon: true
    },
    {
        id: "facebook",
        name: "Facebook",
        icon: Facebook,
        connected: false,
        color: "text-blue-600",
        comingSoon: true
    },
    {
        id: "twitter",
        name: "Twitter (X)",
        icon: Twitter,
        connected: false,
        color: "text-black dark:text-white",
        comingSoon: true
    },
    {
        id: "tiktok",
        name: "TikTok",
        icon: ({ className }: { className?: string }) => (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={className}
            >
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
            </svg>
        ),
        connected: false,
        color: "text-black dark:text-white",
        comingSoon: true
    },
    {
        id: "pinterest",
        name: "Pinterest",
        icon: ({ className }: { className?: string }) => (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={className}
            >
                <path d="M8 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                <path d="M12 12v5" />
            </svg>
        ),
        connected: false,
        color: "text-red-700",
        comingSoon: true
    }
]

export function SocialConnections() {
    const [platforms, setPlatforms] = useState<SocialPlatform[]>(INITIAL_PLATFORMS)
    const [loading, setLoading] = useState<string | null>(null)

    // Check URL parameters for success/error messages
    const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null)

    // Hydration safe search params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        setSearchParams(params)

        if (params.get("success") === "youtube_connected") {
            toast.success("YouTube connected successfully!")
            // Update local state to show connected
            setPlatforms(current =>
                current.map(p => p.id === "youtube" ? { ...p, connected: true } : p)
            )
        }

        if (params.get("error")) {
            toast.error("Failed to connect: " + params.get("error"))
        }

        // Clean up URL
        if (params.has("success") || params.has("error")) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
    }, [])

    const handleConnection = async (id: string, currentlyConnected: boolean) => {
        setLoading(id)

        if (id === "youtube") {
            if (currentlyConnected) {
                // Handle disconnect logic here (call API to delete connection)
                toast.info("Disconnecting logic to be implemented")
                setLoading(null)
            } else {
                // Redirect to Google Auth
                window.location.href = "/api/auth/youtube";
                return; // Don't stop loading, page will redirect
            }
            return;
        }

        // Mock API call / OAuth flow for others
        try {
            await new Promise(resolve => setTimeout(resolve, 1500))

            setPlatforms(current =>
                current.map(p => {
                    if (p.id === id) {
                        return { ...p, connected: !currentlyConnected }
                    }
                    return p
                })
            )

            if (!currentlyConnected) {
                toast.success(`Connected to ${id}`)
            } else {
                toast.info(`Disconnected from ${id}`)
            }
        } catch (error) {
            toast.error("Failed to update connection")
        } finally {
            setLoading(null)
        }
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Connected Social Accounts</CardTitle>
                <CardDescription>
                    Connect your social media platforms to enable content publishing and analytics.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4">
                    {platforms.map((platform) => (
                        <div
                            key={platform.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full bg-muted ${platform.color}`}>
                                    <platform.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-medium flex items-center gap-2">
                                        {platform.name}
                                        {platform.connected && (
                                            <Badge variant="secondary" className="text-xs gap-1 text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400">
                                                <CheckCircle2 className="w-3 h-3" /> Connected
                                            </Badge>
                                        )}
                                        {platform.comingSoon && (
                                            <Badge variant="outline" className="text-xs text-muted-foreground">
                                                Coming Soon
                                            </Badge>
                                        )}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {platform.comingSoon
                                            ? "Integration currently under development"
                                            : platform.connected
                                                ? "Ready to publish"
                                                : "Connect to enable publishing"}
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant={platform.connected ? "outline" : "default"}
                                size="sm"
                                disabled={loading === platform.id || platform.comingSoon}
                                onClick={() => handleConnection(platform.id, platform.connected)}
                            >
                                {platform.comingSoon ? (
                                    "Coming Soon"
                                ) : loading === platform.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : platform.connected ? (
                                    "Disconnect"
                                ) : (
                                    "Connect"
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
