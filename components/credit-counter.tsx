"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Zap } from "lucide-react"
import Link from "next/link"

interface CreditCounterProps {
    credits: number
    className?: string
    showBuyButton?: boolean
}

export function CreditCounter({ credits, className, showBuyButton = true }: CreditCounterProps) {
    const [displayCredits, setDisplayCredits] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)

    // Animate counter on mount and when credits change
    useEffect(() => {
        setIsAnimating(true)
        const duration = 1000
        const steps = 30
        const increment = credits / steps
        let current = 0
        let step = 0

        const timer = setInterval(() => {
            step++
            // Allow fractional values during animation
            current = Math.min(increment * step, credits)
            setDisplayCredits(current)

            if (step >= steps) {
                clearInterval(timer)
                setIsAnimating(false)
            }
        }, duration / steps)

        return () => clearInterval(timer)
    }, [credits])

    const isLow = credits < 10

    return (
        <div
            className={cn(
                "relative group",
                className
            )}
        >
            <div
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl",
                    "bg-gradient-to-r from-card/80 to-card/60",
                    "border transition-all duration-300",
                    isLow
                        ? "border-destructive/50 hover:border-destructive"
                        : "border-primary/30 hover:border-primary/60",
                    isAnimating && "scale-105"
                )}
            >
                {/* Icon with glow */}
                <div className="relative">
                    <Zap
                        className={cn(
                            "w-5 h-5 transition-colors",
                            isLow ? "text-destructive" : "text-primary"
                        )}
                    />
                    <div
                        className={cn(
                            "absolute inset-0 blur-md opacity-50",
                            isLow ? "bg-destructive" : "bg-primary"
                        )}
                    />
                </div>

                {/* Counter Display */}
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground tracking-wider">
                        Créditos
                    </span>
                    <span
                        className={cn(
                            "font-orbitron font-bold text-xl leading-none tracking-wider",
                            isLow ? "text-destructive" : "text-primary",
                            isAnimating && "animate-pulse"
                        )}
                    >
                        {displayCredits.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                    </span>
                </div>

                {/* Buy Button */}
                {showBuyButton && (
                    <Link
                        href="/dashboard/credits"
                        className={cn(
                            "ml-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase",
                            "transition-all duration-300",
                            isLow
                                ? "bg-destructive/20 text-destructive hover:bg-destructive hover:text-white"
                                : "bg-primary/20 text-primary hover:bg-primary hover:text-background"
                        )}
                    >
                        {isLow ? "Recarregar" : "+"}
                    </Link>
                )}
            </div>

            {/* Low credits warning glow */}
            {isLow && (
                <div className="absolute inset-0 rounded-xl bg-destructive/20 blur-xl -z-10 animate-pulse" />
            )}
        </div>
    )
}
