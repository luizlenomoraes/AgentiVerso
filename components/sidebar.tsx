"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    Bot,
    MessageSquare,
    CreditCard,
    Settings,
    LayoutDashboard,
    LogOut,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { useState } from "react"

interface SidebarProps {
    credits?: number
    userName?: string
}

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard", icon: Bot, label: "Agentes", tab: "agents" },
    { href: "/dashboard", icon: MessageSquare, label: "Conversas", tab: "conversations" },
    { href: "/dashboard/credits", icon: CreditCard, label: "Créditos" },
    { href: "/admin", icon: Settings, label: "Admin", adminOnly: true },
]

export function Sidebar({ credits = 0, userName }: SidebarProps) {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out",
                "bg-card/80 backdrop-blur-xl border-r border-primary/20",
                "flex flex-col",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Logo */}
            <div className="p-4 border-b border-primary/20">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <span className="text-xl">🤖</span>
                    </div>
                    {!collapsed && (
                        <span className="font-orbitron font-bold text-lg text-primary">
                            AgentiVerso
                        </span>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                "hover:bg-primary/10 group",
                                isActive && "bg-primary/20 border border-primary/30",
                                collapsed && "justify-center px-3"
                            )}
                        >
                            <Icon
                                className={cn(
                                    "w-5 h-5 transition-colors",
                                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                )}
                            />
                            {!collapsed && (
                                <span
                                    className={cn(
                                        "font-medium transition-colors",
                                        isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                    )}
                                >
                                    {item.label}
                                </span>
                            )}
                            {isActive && !collapsed && (
                                <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Credits Display */}
            <div className={cn(
                "p-4 border-t border-primary/20",
                collapsed && "flex justify-center"
            )}>
                <div className={cn(
                    "flex items-center gap-3 p-3 rounded-xl",
                    "bg-gradient-to-r from-primary/10 to-accent/10",
                    "border border-primary/20"
                )}>
                    <div className="relative">
                        <CreditCard className="w-5 h-5 text-primary" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-ping" />
                    </div>
                    {!collapsed && (
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Créditos</p>
                            <p className="font-orbitron font-bold text-lg text-primary">
                                {credits.toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className={cn(
                    "absolute -right-3 top-1/2 -translate-y-1/2",
                    "w-6 h-6 rounded-full bg-card border border-primary/30",
                    "flex items-center justify-center",
                    "hover:bg-primary/20 transition-colors"
                )}
            >
                {collapsed ? (
                    <ChevronRight className="w-4 h-4 text-primary" />
                ) : (
                    <ChevronLeft className="w-4 h-4 text-primary" />
                )}
            </button>
        </aside>
    )
}
