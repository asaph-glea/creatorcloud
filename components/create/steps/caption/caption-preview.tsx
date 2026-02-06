import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface CaptionPreviewProps {
    className?: string
    styleId: string
}

export function CaptionPreview({ className, styleId }: CaptionPreviewProps) {
    const [wordIndex, setWordIndex] = useState(0)
    const words = ["Create", "Amazing", "Stories", "Together"]

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % words.length)
        }, 600)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className={cn("bg-black/80 rounded-lg p-4 flex items-center justify-center h-24 overflow-hidden relative", className)}>
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
            </div>

            <div key={wordIndex} className="relative z-10 transition-all duration-200">
                <motion.span
                    key={wordIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn("text-2xl text-center block", className)}
                >
                    {words[wordIndex]}
                </motion.span>
            </div>
        </div>
    )
}
