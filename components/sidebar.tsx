"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation" // Added useRouter
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
    User,
    MoreVertical,
    Pencil,
    Trash2,
    Check,
    X,
    MessageCircle // For Whatsapp
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input" // Assuming Input exists

interface SidebarProps {
    conversations: any[]
    profile: any
    availableCredits?: number
    supportWhatsapp?: string | null
}

export function Sidebar({ conversations = [], profile, availableCredits = 0, supportWhatsapp }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [collapsed, setCollapsed] = useState(false)

    // State for renaming
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editTitle, setEditTitle] = useState("")
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    const handleStartRename = (e: React.MouseEvent, conv: any) => {
        e.preventDefault()
        e.stopPropagation()
        setEditingId(conv.id)
        setEditTitle(conv.title || conv.agents?.name || "Conversa")
    }

    const handleSaveRename = async (e: React.MouseEvent | React.FormEvent | React.KeyboardEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!editingId) return

        try {
            await fetch(`/api/conversations/${editingId}`, {
                method: "PATCH",
                body: JSON.stringify({ title: editTitle }),
            })
            setEditingId(null)
            router.refresh()
        } catch (error) {
            console.error("Failed to rename", error)
        }
    }

    const handleCancelRename = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setEditingId(null)
    }

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirm("Tem certeza que deseja excluir esta conversa?")) return

        setIsDeleting(id)
        try {
            await fetch(`/api/conversations/${id}`, {
                method: "DELETE",
            })
            router.refresh()
            // If we are on this page, redirect to dashboard
            if (pathname.includes(id)) {
                router.push("/dashboard")
            }
        } catch (error) {
            console.error("Failed to delete", error)
        } finally {
            setIsDeleting(null)
        }
    }

    return (
        <aside
            className={cn(
                "sticky top-0 h-screen transition-all duration-300 ease-in-out flex flex-col shrink-0 z-40",
                "bg-card/95 backdrop-blur-xl border-r border-primary/20 shadow-xl",
                collapsed ? "w-20" : "w-[280px] md:w-[320px]"
            )}
        >
            {/* Header / New Chat */}
            <div className="p-4 space-y-4">
                <Link href="/dashboard" className="flex items-center gap-2 px-2 mb-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-lg group-hover:shadow-primary/20 transition-all">
                        <span className="text-lg">🤖</span>
                    </div>
                    {!collapsed && (
                        <span className="font-orbitron font-bold text-lg text-primary truncate tracking-wide">
                            AgentiVerso
                        </span>
                    )}
                </Link>

                <Button
                    asChild
                    variant="outline"
                    className={cn(
                        "w-full justify-start gap-2 border-primary/20 hover:bg-primary/10 transition-all shadow-sm hover:shadow-md",
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
                    <div className="px-6 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                        <span>Histórico</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{conversations.length}</span>
                    </div>
                )}
                <ScrollArea className="flex-1 px-3">
                    <div className="space-y-1 pb-4">
                        {conversations.length === 0 ? (
                            !collapsed && (
                                <div className="text-center py-8 px-4 text-muted-foreground/50 text-sm animate-in fade-in zoom-in-95">
                                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    Nenhuma conversa recente
                                </div>
                            )
                        ) : (
                            conversations.map((conv) => {
                                const isActive = pathname.includes(conv.id)
                                const isEditing = editingId === conv.id

                                return (
                                    <div key={conv.id} className="relative group">
                                        <Link
                                            href={`/dashboard/chat/${conv.agent_id}?conversation=${conv.id}`}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative overflow-hidden",
                                                "hover:bg-accent/5 hover:border-accent/10 border border-transparent",
                                                isActive ? "bg-primary/10 border-primary/20 text-primary shadow-sm" : "text-muted-foreground",
                                                collapsed && "justify-center"
                                            )}
                                        >
                                            {/* Active Indicator Background */}
                                            {isActive && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50 z-0" />
                                            )}

                                            <div className="relative z-10 flex items-center gap-3 w-full">
                                                <MessageSquare className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground/70")} />

                                                {!collapsed && (
                                                    <div className="flex-1 min-w-0 pr-6"> {/* Padding right for actions */}
                                                        {isEditing ? (
                                                            <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                                                                <Input
                                                                    value={editTitle}
                                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                                    className="h-6 text-xs px-1 py-0"
                                                                    autoFocus
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') handleSaveRename(e);
                                                                        if (e.key === 'Escape') handleCancelRename(e);
                                                                    }}
                                                                />
                                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-green-500" onClick={handleSaveRename}>
                                                                    <Check className="w-3 h-3" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={handleCancelRename}>
                                                                    <X className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <p className={cn(
                                                                    "text-sm font-medium truncate",
                                                                    isActive ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
                                                                )}>
                                                                    {conv.title || conv.agents?.name || "Conversa"}
                                                                </p>
                                                                <p className="text-[10px] text-muted-foreground/60 truncate group-hover:text-accent/80 transition-colors">
                                                                    {conv.agents?.name}
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>

                                        {/* Actions (Rename/Delete) - Only show if not collapsed and not editing */}
                                        {!collapsed && !isEditing && (
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card/80 backdrop-blur-sm rounded-md shadow-sm z-20">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 hover:text-primary hover:bg-primary/10"
                                                    onClick={(e) => handleStartRename(e, conv)}
                                                    title="Renomear"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
                                                    onClick={(e) => handleDelete(e, conv.id)}
                                                    disabled={isDeleting === conv.id}
                                                    title="Excluir"
                                                >
                                                    {isDeleting === conv.id ? (
                                                        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-primary/20 space-y-2 bg-gradient-to-t from-card to-card/50">

                {/* Whatsapp Support Button */}
                {supportWhatsapp && (
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start gap-3 p-2 rounded-lg hover:bg-green-500/10 text-muted-foreground hover:text-green-500 transition-colors",
                            collapsed && "justify-center px-0"
                        )}
                        asChild
                    >
                        <a href={`https://wa.me/${supportWhatsapp}`} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="w-4 h-4" />
                            {!collapsed && <span className="text-sm font-medium">Suporte WhatsApp</span>}
                        </a>
                    </Button>
                )}

                {/* Credits */}
                <Link
                    href="/dashboard/credits"
                    className={cn(
                        "flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 transition-colors group",
                        collapsed && "justify-center"
                    )}
                >
                    <CreditCard className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                    {!collapsed && (
                        <div className="flex-1 flex justify-between items-center">
                            <span className="text-sm text-foreground/80">Créditos</span>
                            <span className="text-sm font-bold font-orbitron text-accent drop-shadow-sm">
                                {availableCredits.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                            </span>
                        </div>
                    )}
                </Link>

                {/* Admin Link - Conditional */}
                {profile?.is_admin && (
                    <Link
                        href="/admin"
                        className={cn(
                            "flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 transition-colors text-muted-foreground hover:text-foreground group",
                            collapsed && "justify-center"
                        )}
                    >
                        <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                        {!collapsed && <span className="text-sm">Configurações</span>}
                    </Link>
                )}

                {/* User Info */}
                <div className={cn(
                    "flex items-center gap-3 pt-3 mt-2 border-t border-border/50",
                    collapsed && "justify-center"
                )}>
                    <Avatar className="w-8 h-8 border border-primary/30 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-foreground">{profile?.full_name?.split(' ')[0]}</p>
                            <p className="text-xs text-muted-foreground truncate font-mono">{profile?.email}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-card border border-primary/20 rounded-full p-1 shadow-lg hover:bg-accent text-primary transition-colors z-50 md:flex hidden"
            >
                {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>
        </aside>
    )
}
