"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { submitLegalConsent } from "@/app/actions/legal-actions";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
    const [agreed, setAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleContinue = async () => {
        if (!agreed) {
            setError("You must agree to the terms to continue.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await submitLegalConsent();
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Welcome to Creator Cloud</CardTitle>
                    <CardDescription>
                        Before you start creating, we need you to review and accept our platform policies.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-md bg-muted p-4 text-sm text-foreground">
                        <p className="mb-2"><strong>Required Consents:</strong></p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>I agree to the <a href="/legal/terms-of-service" target="_blank" className="text-primary hover:underline">Terms of Service</a> and <a href="/legal/privacy-policy" target="_blank" className="text-primary hover:underline">Privacy Policy</a>.</li>
                            <li>I have read the <a href="/legal/ai-disclosure" target="_blank" className="text-primary hover:underline">AI Disclosure</a> and acknowledge that content generated here is synthetic.</li>
                            <li>If I connect my YouTube account, I agree to the <a href="https://www.youtube.com/t/terms" target="_blank" className="text-primary hover:underline" rel="noreferrer">YouTube Terms of Service</a> and <a href="https://policies.google.com/privacy" target="_blank" className="text-primary hover:underline" rel="noreferrer">Google Privacy Policy</a>.</li>
                        </ul>
                    </div>

                    <div className="flex items-start space-x-3">
                        <Checkbox
                            id="terms"
                            checked={agreed}
                            onCheckedChange={(checked) => setAgreed(checked as boolean)}
                            className="mt-1"
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="terms" className="text-sm font-medium leading-normal cursor-pointer">
                                I agree to the Terms of Service, Privacy Policy, YouTube API Terms, and acknowledge that generated content is AI-assisted.
                            </Label>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm font-medium text-destructive">{error}</p>
                    )}
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                        onClick={handleContinue}
                        disabled={!agreed || isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Accept & Continue
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
