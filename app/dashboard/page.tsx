import { syncUser } from "@/utils/supabase/sync-user";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    // Sync user to Supabase on every dashboard visit (or optimize to run less frequently)
    await syncUser();

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-4 text-muted-foreground">
                Welcome back, {user.firstName}!
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="font-semibold leading-none tracking-tight">Total Projects</div>
                    <div className="mt-2 text-3xl font-bold">0</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="font-semibold leading-none tracking-tight">Generated Videos</div>
                    <div className="mt-2 text-3xl font-bold">0</div>
                </div>
            </div>
        </div>
    );
}
