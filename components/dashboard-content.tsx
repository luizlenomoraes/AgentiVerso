"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AgentAvatar } from "@/components/agent-avatar"
import { cn } from "@/lib/utils"
import {
    Bot,
    MessageSquare,
    BarChart3,
    Sparkles,
    ArrowRight,
    Clock,
    Lock
} from "lucide-react"

interface Agent {
    id: string
    name: string
    description: string
    photo_url: string | null
    categories: { id: string; name: string; slug: string } | null
    is_free?: boolean // true = free for all, false/undefined = requires access
}

interface Category {
    id: string
    name: string
    slug: string
}

interface Conversation {
    id: string
    agent_id: string
    updated_at: string
    agents: { name: string; photo_url: string | null } | null
}

interface DashboardContentProps {
    profile: any
    agents: Agent[]
    categories: Category[]
    conversations: Conversation[]
    usageLogs: any[]
    availableCredits: number
    userAgentAccess?: string[] // Array of agent IDs user has access to
}

export function DashboardContent({
    profile,
    agents,
    categories,
    conversations,
    usageLogs,
    availableCredits,
    userAgentAccess = []
}: DashboardContentProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null)

    // Helper to check if user has access to an agent
    const hasAccess = (agent: Agent) => {
        // Free agents are accessible to everyone
        if (agent.is_free === undefined || agent.is_free === true) return true
        // Otherwise, check userAgentAccess array
        return userAgentAccess.includes(agent.id)
    }

    // Filter agents based on selected category
    const filteredAgents = activeCategory
        ? agents.filter(agent => agent.categories?.id === activeCategory)
        : agents

    const todayUsage = usageLogs.filter(l =>
        new Date(l.created_at).toDateString() === new Date().toDateString()
    ).length

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Welcome Section */}
            <section className="space-y-2 animate-fade-in-up">
                <h1 className="text-3xl md:text-4xl font-bold font-orbitron">
                    Olá, <span className="text-primary">{profile?.full_name?.split(" ")[0] || "Agente"}</span>
                </h1>
                <p className="text-muted-foreground text-lg">
                    Escolha um agente de IA para começar a conversar
                </p>
            </section>

            {/* Quick Stats */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up stagger-1">
                <QuickStatCard
                    icon={<Bot className="w-5 h-5" />}
                    label="Agentes"
                    value={agents.length}
                />
                <QuickStatCard
                    icon={<MessageSquare className="w-5 h-5" />}
                    label="Conversas"
                    value={conversations.length}
                />
                <QuickStatCard
                    icon={<BarChart3 className="w-5 h-5" />}
                    label="Uso Hoje"
                    value={todayUsage}
                />
                <QuickStatCard
                    icon={<Sparkles className="w-5 h-5" />}
                    label="Créditos"
                    value={availableCredits}
                    highlight
                />
            </section>

            {/* Category Filters */}
            {categories && categories.length > 0 && (
                <section className="flex flex-wrap gap-2 animate-fade-in-up stagger-2">
                    <Badge
                        variant="outline"
                        onClick={() => setActiveCategory(null)}
                        className={cn(
                            "cursor-pointer transition-all duration-200",
                            activeCategory === null
                                ? "bg-primary/20 border-primary/50 text-primary shadow-[0_0_10px_rgba(0,255,249,0.3)]"
                                : "hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
                        )}
                    >
                        Todos ({agents.length})
                    </Badge>

                    {categories.map((category) => {
                        const count = agents.filter(a => a.categories?.id === category.id).length
                        return (
                            <Badge
                                key={category.id}
                                variant="outline"
                                onClick={() => setActiveCategory(category.id)}
                                className={cn(
                                    "cursor-pointer transition-all duration-200",
                                    activeCategory === category.id
                                        ? "bg-accent/20 border-accent/50 text-accent shadow-[0_0_10px_rgba(255,0,193,0.3)]"
                                        : "hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
                                )}
                            >
                                {category.name} ({count})
                            </Badge>
                        )
                    })}
                </section>
            )}

            {/* Agents Grid */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold font-orbitron flex items-center gap-2">
                        <Bot className="w-5 h-5 text-primary" />
                        {activeCategory
                            ? `Agentes de ${categories.find(c => c.id === activeCategory)?.name}`
                            : "Agentes Disponíveis"
                        }
                        <span className="text-sm font-normal text-muted-foreground">
                            ({filteredAgents.length})
                        </span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAgents.length > 0 ? (
                        filteredAgents.map((agent, index) => {
                            const isLocked = !hasAccess(agent)

                            return (
                                <Card
                                    key={agent.id}
                                    className={cn(
                                        "group p-6 space-y-4 backdrop-blur border transition-all duration-300 animate-fade-in-up",
                                        isLocked
                                            ? "bg-muted/30 border-border/30 opacity-80"
                                            : "bg-card/50 border-primary/10 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(0,255,249,0.1)]"
                                    )}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-start gap-4">
                                        <AgentAvatar
                                            name={agent.name}
                                            emoji={agent.photo_url}
                                            status={isLocked ? "offline" : "online"}
                                            size="lg"
                                            locked={isLocked}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className={cn(
                                                    "font-semibold text-lg truncate transition-colors",
                                                    isLocked ? "text-muted-foreground" : "group-hover:text-primary"
                                                )}>
                                                    {agent.name}
                                                </h3>
                                                {isLocked && (
                                                    <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                )}
                                            </div>
                                            {agent.categories && (
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        "mt-1 text-xs",
                                                        isLocked
                                                            ? "bg-border/50 text-muted-foreground border-border/30"
                                                            : "bg-accent/20 text-accent border-accent/30"
                                                    )}
                                                >
                                                    {agent.categories.name}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <p className={cn(
                                        "text-sm line-clamp-2",
                                        isLocked ? "text-muted-foreground/70" : "text-muted-foreground"
                                    )}>
                                        {agent.description}
                                    </p>

                                    {isLocked ? (
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="w-full border-border/50 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                                        >
                                            <Link href="/dashboard/credits" className="flex items-center justify-center gap-2">
                                                <Lock className="w-4 h-4" />
                                                Desbloquear Acesso
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            asChild
                                            className="w-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-primary hover:from-primary hover:to-accent hover:text-background transition-all duration-300 group-hover:animate-glow-pulse"
                                        >
                                            <Link href={`/chat/${agent.id}`} className="flex items-center justify-center gap-2">
                                                Conversar
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </Button>
                                    )}
                                </Card>
                            )
                        })
                    ) : (
                        <div className="col-span-full text-center py-12 space-y-4">
                            <Bot className="w-16 h-16 mx-auto text-muted-foreground/50" />
                            <p className="text-muted-foreground">
                                {activeCategory
                                    ? "Nenhum agente nesta categoria."
                                    : "Nenhum agente disponível no momento."
                                }
                            </p>
                            {activeCategory && (
                                <Button
                                    variant="outline"
                                    onClick={() => setActiveCategory(null)}
                                    className="border-primary/30 hover:bg-primary/10"
                                >
                                    Ver todos os agentes
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Recent Conversations */}
            {conversations && conversations.length > 0 && (
                <section className="space-y-4 animate-fade-in-up stagger-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold font-orbitron flex items-center gap-2">
                            <Clock className="w-5 h-5 text-accent" />
                            Conversas Recentes
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {conversations.slice(0, 3).map((conv) => (
                            <Link
                                key={conv.id}
                                href={`/chat/${conv.agent_id}?conversation=${conv.id}`}
                                className="p-4 rounded-xl bg-card/30 border border-border/50 hover:border-primary/30 transition-all hover:bg-card/50"
                            >
                                <div className="flex items-center gap-3">
                                    <AgentAvatar
                                        name={conv.agents?.name || "Agent"}
                                        emoji={conv.agents?.photo_url}
                                        size="sm"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{conv.agents?.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(conv.updated_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}

function QuickStatCard({
    icon,
    label,
    value,
    highlight = false
}: {
    icon: React.ReactNode
    label: string
    value: number
    highlight?: boolean
}) {
    return (
        <div className={cn(
            "p-4 rounded-xl border transition-all",
            highlight
                ? "bg-primary/10 border-primary/30 hover:border-primary/50"
                : "bg-card/30 border-border/50 hover:border-primary/20"
        )}>
            <div className="flex items-center gap-3">
                <div className={cn(
                    "p-2 rounded-lg",
                    highlight ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground"
                )}>
                    {icon}
                </div>
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
                    <p className={cn(
                        "text-2xl font-bold font-orbitron",
                        highlight ? "text-primary" : "text-foreground"
                    )}>
                        {value.toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    )
}
