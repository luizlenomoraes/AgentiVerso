"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    Plus,
    MessageSquare,
    LayoutDashboard,
    Settings,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    Search,
    User
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps {
    conversations: any[]
    profile: any
    availableCredits?: number
}

export function Sidebar({ conversations = [], profile, availableCredits = 0 }: SidebarProps) {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    // Agrupar conversas por data (simplificado por enquanto)
    // TODO: Implementar agrupamento por Hoje, Ontem, etc.

    return (
        <aside
            className={cn(
                "sticky top-0 h-screen transition-all duration-300 ease-in-out flex flex-col shrink-0 z-40",
                "bg-card/95 backdrop-blur-xl border-r border-primary/20",
                collapsed ? "w-20" : "w-[280px] md:w-[320px]"
            )}
        >
            {/* Header / New Chat */}
            <div className="p-4 space-y-4">
                <Link href="/dashboard" className="flex items-center gap-2 px-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                        <span className="text-lg">🤖</span>
                    </div>
                    {!collapsed && (
                        <span className="font-orbitron font-bold text-lg text-primary truncate">
                            AgentiVerso
                        </span>
                    )}
                </Link>

                <Button
                    asChild
                    variant="outline" // Mudado para outline para menos peso visual que o gradiente
                    className={cn(
                        "w-full justify-start gap-2 border-primary/20 hover:bg-primary/10 transition-all",
                        collapsed && "justify-center px-0"
                    )}
                >
                    <Link href="/dashboard">
                        <Plus className="w-5 h-5 text-primary" />
                        {!collapsed && <span>Novo Chat / Explorar</span>}
                    </Link>
                </Button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {!collapsed && (
                    <div className="px-6 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Histórico
                    </div>
                )}
                <ScrollArea className="flex-1 px-3">
                    <div className="space-y-1 pb-4">
                        {conversations.length === 0 ? (
                            !collapsed && (
                                <div className="text-center py-8 px-4 text-muted-foreground text-sm">
                                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    Nenhuma conversa recente
                                </div>
                            )
                        ) : (
                            conversations.map((conv) => {
                                const isActive = pathname.includes(conv.id)
                                return (
                                    <Link
                                        key={conv.id}
                                        href={`/dashboard/chat/${conv.agent_id}?conversation=${conv.id}`}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-3 rounded-lg transition-all group relative",
                                            "hover:bg-primary/10",
                                            isActive ? "bg-primary/20 text-primary" : "text-muted-foreground",
                                            collapsed && "justify-center"
                                        )}
                                    >
                                        <MessageSquare className="w-4 h-4 shrink-0" />
                                        {!collapsed && (
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-sm font-medium truncate",
                                                    isActive ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
                                                )}>
                                                    {conv.title || conv.agents?.name || "Conversa"}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground/70 truncate">
                                                    {conv.agents?.name}
                                                </p>
                                            </div>
                                        )}
                                        {isActive && !collapsed && (
                                            <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary" />
                                        )}
                                    </Link>
                                )
                            })
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-primary/20 space-y-2 bg-card/50">
                {/* Credits */}
                <Link
                    href="/dashboard/credits"
                    className={cn(
                        "flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 transition-colors",
                        collapsed && "justify-center"
                    )}
                >
                    <CreditCard className="w-4 h-4 text-accent" />
                    {!collapsed && (
                        <div className="flex-1 flex justify-between items-center">
                            <span className="text-sm">Créditos</span>
                            <span className="text-sm font-bold font-orbitron text-accent">
                                {availableCredits.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                            </span>
                        </div>
                    )}
                </Link>

                {/* Admin Link (Conditional could be handled by parent passing explicit flag, but checking profile here is OK for UI display) */}
                {/* Assuming profile.role is available, otherwise this link appears for everyone which is harmless (protected by middleware) */}
                <Link
                    href="/admin"
                    className={cn(
                        "flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 transition-colors text-muted-foreground hover:text-foreground",
                        collapsed && "justify-center"
                    )}
                >
                    <Settings className="w-4 h-4" />
                    {!collapsed && <span className="text-sm">Configurações</span>}
                </Link>

                {/* User Info */}
                <div className={cn(
                    "flex items-center gap-3 pt-2 mt-2 border-t border-border/50",
                    collapsed && "justify-center"
                )}>
                    <Avatar className="w-8 h-8 border border-primary/30">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{profile?.full_name?.split(' ')[0]}</p>
                            <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className={cn(
                    "absolute -right-3 top-1/2 -translate-y-1/2 z-50",
                    "w-6 h-6 rounded-full bg-background border border-primary/30",
                    "flex items-center justify-center",
                    "hover:bg-primary/20 transition-colors shadow-lg",
                    // Hide on mobile as sidebar is likely handled differently (drawer)
                    "hidden md:flex"
                )}
            >
                {collapsed ? (
                    <ChevronRight className="w-3 h-3 text-primary" />
                ) : (
                    <ChevronLeft className="w-3 h-3 text-primary" />
                )}
            </button>
        </aside>
    )
}
