"use client"

import { cn } from "@/lib/utils"
import { Lock } from "lucide-react"

interface AgentAvatarProps {
    name: string
    emoji?: string | null
    status?: "online" | "offline" | "busy" | "processing"
    size?: "sm" | "md" | "lg" | "xl"
    className?: string
    locked?: boolean
}

const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-lg",
    lg: "w-16 h-16 text-2xl",
    xl: "w-24 h-24 text-4xl",
}

const statusColors = {
    online: "bg-green-500",
    offline: "bg-muted-foreground",
    busy: "bg-yellow-500",
    processing: "bg-primary animate-pulse",
}

export function AgentAvatar({
    name,
    emoji,
    status = "online",
    size = "md",
    className,
    locked = false
}: AgentAvatarProps) {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()

    return (
        <div className={cn("relative group", className)}>
            {/* Glow effect on hover (only if not locked) */}
            {!locked && (
                <div
                    className={cn(
                        "absolute inset-0 rounded-xl blur-lg opacity-0 transition-opacity duration-300",
                        "bg-gradient-to-br from-primary to-accent",
                        "group-hover:opacity-40"
                    )}
                />
            )}

            {/* Avatar */}
            <div
                className={cn(
                    "relative rounded-xl overflow-hidden",
                    "border transition-all duration-300",
                    "flex items-center justify-center",
                    sizeClasses[size],
                    locked
                        ? "bg-muted/50 border-border/50 grayscale"
                        : "bg-gradient-to-br from-primary/20 to-accent/20 border-primary/30 group-hover:border-primary/60"
                )}
            >
                {emoji ? (
                    <span className={cn("select-none", locked && "opacity-50")}>{emoji}</span>
                ) : (
                    <span className={cn(
                        "font-orbitron font-bold",
                        locked ? "text-muted-foreground" : "text-primary/80"
                    )}>
                        {initials}
                    </span>
                )}

                {/* Lock overlay for locked agents */}
                {locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                        <Lock className={cn(
                            "text-muted-foreground",
                            size === "sm" && "w-3 h-3",
                            size === "md" && "w-4 h-4",
                            size === "lg" && "w-6 h-6",
                            size === "xl" && "w-8 h-8"
                        )} />
                    </div>
                )}

                {/* Scan line animation (only if not locked) */}
                {!locked && (
                    <div
                        className={cn(
                            "absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent",
                            "opacity-0 group-hover:opacity-100",
                            "animate-scan-line"
                        )}
                    />
                )}
            </div>

            {/* Status indicator (only if not locked) */}
            {!locked && (
                <div
                    className={cn(
                        "absolute -bottom-1 -right-1 rounded-full border-2 border-background",
                        "transition-all duration-300",
                        statusColors[status],
                        size === "sm" && "w-2.5 h-2.5",
                        size === "md" && "w-3 h-3",
                        size === "lg" && "w-4 h-4",
                        size === "xl" && "w-5 h-5"
                    )}
                />
            )}

            {/* Processing ring */}
            {status === "processing" && !locked && (
                <div
                    className={cn(
                        "absolute inset-0 rounded-xl border-2 border-primary",
                        "animate-ping opacity-30"
                    )}
                />
            )}
        </div>
    )
}
