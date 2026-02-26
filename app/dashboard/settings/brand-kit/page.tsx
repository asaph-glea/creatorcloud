"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"
import { Loader2, Upload, X, Palette, Type, Image as ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getBrandKit, upsertBrandKit } from "@/app/actions/brand-kit-actions"
import * as Sentry from "@sentry/nextjs"

const FONTS = [
    { value: "Inter", label: "Inter (Modern Sans)" },
    { value: "Roboto", label: "Roboto (Clean Sans)" },
    { value: "Playfair Display", label: "Playfair Display (Elegant Serif)" },
    { value: "Montserrat", label: "Montserrat (Bold Sans)" },
    { value: "Outfit", label: "Outfit (Geometric)" }
]

export default function BrandKitPage() {
    const router = useRouter()

    // Form State
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const [logoUrl, setLogoUrl] = useState<string | null>(null)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)

    const [primaryColor, setPrimaryColor] = useState("#ffffff")
    const [fontFamily, setFontFamily] = useState("Inter")

    const fileInputRef = useRef<HTMLInputElement>(null)

    // Load initial data
    useEffect(() => {
        async function loadData() {
            try {
                const res = await getBrandKit()
                if (res.success && res.brandKit) {
                    setLogoUrl(res.brandKit.logo_url)
                    setPrimaryColor(res.brandKit.primary_color || "#ffffff")
                    setFontFamily(res.brandKit.font_family || "Inter")
                }
            } catch (e) {
                console.error("Failed to load brand kit", e)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Logo must be less than 5MB")
                return
            }
            if (!file.type.startsWith("image/")) {
                toast.error("Only image files are supported")
                return
            }

            setLogoFile(file)
            setLogoPreview(URL.createObjectURL(file))
        }
    }

    const clearLogo = () => {
        setLogoFile(null)
        setLogoPreview(null)
        setLogoUrl(null)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await Sentry.startSpan(
                { op: "ui.form_submit", name: "Save Brand Kit" },
                async (span) => {
                    span.setAttribute("hasLogoChange", !!logoFile)
                    span.setAttribute("fontFamily", fontFamily)

                    const formData = new FormData()
                    if (logoFile) {
                        formData.append("logoFile", logoFile)
                    }
                    if (logoUrl && !logoFile) {
                        formData.append("logoUrl", logoUrl)
                    }
                    if (!logoUrl && !logoFile) {
                        formData.append("logoUrl", "") // Cleared
                    }
                    formData.append("primaryColor", primaryColor)
                    formData.append("fontFamily", fontFamily)

                    const res = await upsertBrandKit(formData)

                    if (res.success) {
                        toast.success("Brand Kit saved successfully")
                        Sentry.logger.info("Brand Kit updated successfully")
                        if (res.logoUrl) {
                            setLogoUrl(res.logoUrl)
                            setLogoFile(null)
                            // Clean up preview object url
                            if (logoPreview) URL.revokeObjectURL(logoPreview)
                            setLogoPreview(null)
                        }
                    } else {
                        toast.error(res.error || "Failed to save Brand Kit")
                        Sentry.logger.error("Failed to save brand kit", { error: res.error })
                    }
                }
            )
        } catch (e: any) {
            toast.error("An unexpected error occurred")
            Sentry.captureException(e)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const currentDisplayLogo = logoPreview || logoUrl

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Brand Kit</h1>
                <p className="text-muted-foreground">
                    Customize the global logo, colors, and fonts injected into all your generated videos.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Editor Column */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-primary" /> Channel Logo
                            </CardTitle>
                            <CardDescription>
                                Upload a transparent PNG logo. It will be layered on top of the composition.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!currentDisplayLogo ? (
                                <div
                                    className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/webp"
                                        onChange={handleImageChange}
                                    />
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="bg-muted p-4 rounded-full">
                                            <Upload className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <h3 className="font-medium">Upload Logo</h3>
                                        <p className="text-sm text-muted-foreground">Max 5MB</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative w-40 h-40 rounded-lg border bg-muted/30 flex items-center justify-center p-2 group overflow-hidden">
                                        <div className="absolute inset-0 pattern-checkered opacity-5" />
                                        <Image
                                            src={currentDisplayLogo}
                                            alt="Brand Logo"
                                            fill
                                            className="object-contain p-2"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                                                Change
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={clearLogo}>
                                                Remove
                                            </Button>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/png, image/jpeg, image/webp"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground">This logo will be displayed on your videos.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Palette className="h-5 w-5 text-primary" /> Colors & Typography
                            </CardTitle>
                            <CardDescription>
                                Set the primary caption colors and font styles used in your edits.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label>Primary Brand Color</Label>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-10 w-10 rounded-md border shrink-0 overflow-hidden relative"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            <input
                                                type="color"
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                            />
                                        </div>
                                        <Input
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            placeholder="#FFFFFF"
                                            className="uppercase font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label>Font Family</Label>
                                    <Select value={fontFamily} onValueChange={setFontFamily}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a font" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {FONTS.map(font => (
                                                <SelectItem key={font.value} value={font.value}>
                                                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-6">
                            <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Brand Kit
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Preview Column */}
                <div className="hidden md:block">
                    <div className="sticky top-6 space-y-4">
                        <Label className="text-lg">Captions Preview</Label>
                        <div className="aspect-[9/16] bg-zinc-900 rounded-xl overflow-hidden relative border shadow-lg flex flex-col justify-end">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

                            {/* Logo Overlay Preview */}
                            {currentDisplayLogo && (
                                <div className="absolute top-4 right-4 w-12 h-12 z-20 opacity-80 bg-black/20 rounded-md p-1">
                                    <Image
                                        src={currentDisplayLogo}
                                        alt="Logo Preview"
                                        fill
                                        className="object-contain p-1"
                                        unoptimized
                                    />
                                </div>
                            )}

                            {/* Captions Preview */}
                            <div className="relative z-20 pb-24 px-6">
                                <div
                                    className="text-white text-3xl font-bold text-center drop-shadow-md rounded-xl p-3"
                                    style={{
                                        fontFamily: fontFamily,
                                        backgroundColor: `${primaryColor}CC` // add some transparency 
                                    }}
                                >
                                    <span style={{ color: "#fff" }}>BRAND</span> KIT
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Some minimal CSS to power the checkboard pattern */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .pattern-checkered {
                    background-color: #e5e5f7;
                    background-image:  repeating-linear-gradient(45deg, #444cf7 25%, transparent 25%, transparent 75%, #444cf7 75%, #444cf7), repeating-linear-gradient(45deg, #444cf7 25%, #e5e5f7 25%, #e5e5f7 75%, #444cf7 75%, #444cf7);
                    background-position: 0 0, 10px 10px;
                    background-size: 20px 20px;
                }
            `}} />
        </div>
    )
}
