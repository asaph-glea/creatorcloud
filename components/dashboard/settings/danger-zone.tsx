"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { AlertTriangle, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
// import { signOut } from "next-auth/react" // Uncomment when using next-auth

export function DangerZone() {
    const [deleteConfirmation, setDeleteConfirmation] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== "DELETE") return

        setIsDeleting(true)
        try {
            // Mock API call to delete account
            await new Promise(resolve => setTimeout(resolve, 2000))

            toast.success("Account deleted successfully")
            // signOut() // Redirect to sign in page
            // window.location.href = "/" // Fallback redirect
        } catch (error) {
            toast.error("Failed to delete account")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Card className="border-red-200 dark:border-red-900 bg-red-50/10 dark:bg-red-900/10">
            <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                </CardTitle>
                <CardDescription>
                    Irreversible and destructive actions. Proceed with caution.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg bg-background">
                    <div>
                        <h4 className="font-medium">Delete Account</h4>
                        <p className="text-sm text-muted-foreground">
                            Permanently delete your account and all associated data.
                        </p>
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Account
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    account, all generated videos, connected social profiles, and
                                    remove your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <div className="py-4">
                                <label className="text-sm text-muted-foreground mb-2 block">
                                    Type <strong>DELETE</strong> to confirm:
                                </label>
                                <Input
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    placeholder="DELETE"
                                    className="max-w-xs"
                                />
                            </div>

                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteAccount}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={deleteConfirmation !== "DELETE" || isDeleting}
                                >
                                    {isDeleting ? "Deleting..." : "Delete Account"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    )
}
