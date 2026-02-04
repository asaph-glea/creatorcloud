"use strict"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CreateSeriesButton() {
    return (
        <Button className="w-full gap-2" asChild>
            <Link href="/dashboard/create">
                <Plus className="h-4 w-4" />
                Create New Series
            </Link>
        </Button>
    )
}
