"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageSquare, Clock } from "lucide-react"

type Conversation = {
  id: string
  title: string
  created_at: string
  updated_at: string
  agents: {
    name: string
    photo_url: string | null
  } | null
}

type ConversationHistoryProps = {
  conversations: Conversation[]
}

export function ConversationHistory({ conversations }: ConversationHistoryProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Histórico de Conversas</h2>
        <p className="text-muted-foreground">Retome suas conversas anteriores com os agentes</p>
      </div>

      {conversations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conversations.map((conversation) => (
            <Card
              key={conversation.id}
              className="p-6 space-y-4 bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl flex-shrink-0">
                  {conversation.agents?.photo_url || "🤖"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{conversation.title}</h3>
                  <p className="text-sm text-muted-foreground">{conversation.agents?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(conversation.updated_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href={`/chat/${conversation.agents?.photo_url || ""}?conversation=${conversation.id}`}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Continuar Conversa
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center space-y-4 bg-card/50 backdrop-blur border-border/50">
          <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-xl font-semibold mb-2">Nenhuma conversa ainda</h3>
            <p className="text-muted-foreground">Comece uma conversa com um agente para vê-la aqui</p>
          </div>
          <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
            <Link href="/dashboard">Explorar Agentes</Link>
          </Button>
        </Card>
      )}
    </div>
  )
}
