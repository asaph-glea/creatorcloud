"use client"

import { Series, SeriesCard } from "@/components/dashboard/series-card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function SeriesGrid() {
    const [series, setSeries] = useState<Series[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchSeries = async () => {
        try {
            const res = await fetch("/api/series")
            if (!res.ok) throw new Error("Failed to fetch series")
            const data = await res.json()
            setSeries(data.series || [])
        } catch (err) {
            console.error(err)
            setError("Failed to load series")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSeries()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this series?")) return

        const previousSeries = [...series]
        // Optimistic update
        setSeries(series.filter(s => s.id !== id))

        try {
            const res = await fetch(`/api/series?id=${id}`, {
                method: "DELETE",
            })

            if (!res.ok) {
                throw new Error("Failed to delete")
            }
            toast.success("Series deleted")
        } catch (err) {
            console.error(err)
            toast.error("Failed to delete series")
            // Revert state on error
            setSeries(previousSeries)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center p-12 bg-muted/30 rounded-lg">
                <p className="text-destructive mb-2">{error}</p>
                <Button variant="outline" onClick={fetchSeries}>Try Again</Button>
            </div>
        )
    }

    if (series.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/10 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No Series found</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                    You haven't created any series yet. Create your first series to get started generating videos.
                </p>
                <Link href="/dashboard/create">
                    <Button>Create New Series</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {series.map((item) => (
                <SeriesCard
                    key={item.id}
                    series={item}
                    onDelete={handleDelete}
                />
            ))}
        </div>
    )
}
