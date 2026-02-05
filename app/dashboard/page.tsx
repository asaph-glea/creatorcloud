import { SeriesGrid } from "@/components/dashboard/series-grid"; // Import SeriesGrid
import { syncUser } from "@/utils/supabase/sync-user";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button"; // Optional: Add a create button at the top
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    // Sync user to Supabase on every dashboard visit
    await syncUser();

    return (
        <div className="container mx-auto py-10 px-4 md:px-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="mt-2 text-muted-foreground">
                        Welcome back, {user.firstName}!
                    </p>
                </div>
                <Link href="/dashboard/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Series
                    </Button>
                </Link>
            </div>

            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight mb-4">Your Series</h2>
                    <SeriesGrid />
                </div>
            </div>
        </div>
    );
}
