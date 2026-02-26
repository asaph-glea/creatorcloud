import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { syncUser } from "@/utils/supabase/sync-user"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Sync user and check AI consent before rendering any dashboard page
    const user = await syncUser();

    if (user && user.ai_consent === false) {
        redirect("/onboarding");
    }

    return (
        <div className="flex min-h-screen flex-col lg:flex-row">
            {/* Sidebar hidden on mobile for now, can add drawer later */}
            <div className="hidden lg:block w-72 flex-shrink-0">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col min-h-screen">
                <DashboardHeader />
                <main className="flex-1 p-6 md:p-8 pt-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
