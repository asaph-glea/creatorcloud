"use strict"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CreateSeriesButton() {
    return (
        <Button className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Create New Series
        </Button>
    )
}
