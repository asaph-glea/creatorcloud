"use client"

import { UserButton } from "@clerk/nextjs"
import { ModeToggle } from "@/components/mode-toggle"

export function DashboardHeader() {
    return (
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
            <div className="ml-auto flex items-center gap-4">
                <ModeToggle />
                <UserButton />
            </div>
        </header>
    )
}
