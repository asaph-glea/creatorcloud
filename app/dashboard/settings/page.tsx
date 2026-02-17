import { SocialConnections } from "@/components/dashboard/settings/social-connections"
import { DangerZone } from "@/components/dashboard/settings/danger-zone"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                    <p className="text-muted-foreground">
                        Manage your account, integrations, and preferences
                    </p>
                </div>
            </div>

            <Separator />

            <div className="space-y-6">
                {/* Social Media Integrations */}
                <section>
                    <SocialConnections />
                </section>

                {/* Future: Profile Settings, Notification Settings, etc. */}

                {/* Danger Zone */}
                <section className="pt-8">
                    <DangerZone />
                </section>
            </div>
        </div>
    )
}
