"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Video,
    Settings,
    CreditCard,
    BookOpen,
    LayoutGrid,
    Zap,
    User,
    LogOut,
    Mountain,
    Palette
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CreateSeriesButton } from "@/components/dashboard/create-series-button"

const sidebarItems = [
    {
        title: "Series",
        href: "/dashboard/series",
        icon: LayoutGrid,
    },
    {
        title: "Videos",
        href: "/dashboard/videos",
        icon: Video,
    },
    {
        title: "Guides",
        href: "/dashboard/guides",
        icon: BookOpen,
    },
    {
        title: "Billing",
        href: "/dashboard/billing",
        icon: CreditCard,
    },
    {
        title: "Brand Kit",
        href: "/dashboard/settings/brand-kit",
        icon: Palette,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()

    return (
        <div className={cn("pb-12 h-screen flex flex-col border-r bg-sidebar", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 mb-6">
                        <Mountain className="h-6 w-6" />
                        <span className="font-bold text-xl">CreatorCloud</span>
                    </Link>
                    <div className="px-4 mb-4">
                        <CreateSeriesButton />
                    </div>
                    <div className="space-y-1">
                        <nav className="grid gap-1 px-2">
                            {sidebarItems.map((item, index) => {
                                const isActive = pathname?.startsWith(item.href)
                                return (
                                    <Link
                                        key={index}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                                            isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                                            "text-base" // Making menu options bigger as requested
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.title}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                </div>
            </div>
            <div className="mt-auto px-4 py-4 border-t">
                <div className="mb-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-4">
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <Zap className="h-4 w-4 fill-primary" />
                        <span className="font-semibold text-sm">Pro Plan</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                        You are on the free plan. Upgrade to unlock all features.
                    </p>
                    <Button size="sm" variant="default" className="w-full text-xs">
                        Upgrade Now
                    </Button>
                </div>
                <nav className="grid gap-1">
                    <Link
                        href="/dashboard/profile"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground text-base"
                        )}
                    >
                        <User className="h-5 w-5" />
                        Profile Settings
                    </Link>
                </nav>
            </div>
        </div>
    )
}
