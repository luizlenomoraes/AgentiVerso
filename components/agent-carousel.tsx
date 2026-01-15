"use client"

import { Card } from "@/components/ui/card"
import { Bot } from "lucide-react"

type Agent = {
    id: string
    name: string
    description: string
}

export function AgentCarousel({ agents }: { agents: Agent[] }) {
    if (!agents || agents.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                Nenhum agente disponível no momento.
            </div>
        )
    }

    // Duplicate agents for infinite scroll effect
    const displayAgents = [...agents, ...agents]

    return (
        <div className="w-full overflow-hidden py-10 relative">
            {/* Gradient Masks */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

            <div className="flex animate-scroll-left gap-6 hover:[animation-play-state:paused]">
                {displayAgents.map((agent, i) => (
                    <Card
                        key={`${agent.id}-${i}`}
                        className="w-[300px] shrink-0 p-6 hover:-translate-y-2 transition-transform duration-300 bg-card/40 backdrop-blur border-primary/10 group cursor-default"
                    >
                        <div className="p-4 rounded-xl w-fit mb-4 bg-gradient-to-br from-primary/20 to-accent/20">
                            <Bot className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold font-orbitron group-hover:text-primary transition-colors truncate">
                            {agent.name}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                            {agent.description}
                        </p>
                    </Card>
                ))}
            </div>
        </div>
    )
}
