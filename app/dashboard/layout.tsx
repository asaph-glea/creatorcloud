import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
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
