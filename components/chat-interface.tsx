"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { ArrowLeft, Send, Loader2 } from "lucide-react"

// ... (Tipos Message e Agent mantêm iguais) ...
type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

type Agent = {
  id: string
  name: string
  description: string
  photo_url: string | null
  categories: { name: string } | null
}

type ChatInterfaceProps = {
  agent: Agent
  userId: string
  availableCredits: number
  initialMessages?: Message[]       // <--- NOVO
  initialConversationId?: string    // <--- NOVO
}

export function ChatInterface({ 
  agent, 
  userId, 
  availableCredits, 
  initialMessages = [], 
  initialConversationId = null 
}: ChatInterfaceProps) { // <--- Atualize a assinatura da função
  
  // Inicialize o estado com as mensagens vindas do banco
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState(availableCredits)
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId)
  const scrollRef = useRef<HTMLDivElement>(null)

  // ... (O resto do código: useEffect scroll, handleSend, return...) 
  // O código restante permanece idêntico, apenas a inicialização mudou.
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading || credits <= 0) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: agent.id,
          message: userMessage.content,
          conversationId, // Usa o ID existente
        }),
      })

      const data = await response.json()

      if (data.error) throw new Error(data.error)

      if (data.conversationId) setConversationId(data.conversationId)

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setCredits(data.remainingCredits)
    } catch (error) {
      console.error("Chat error:", error)
    } finally {
      setLoading(false)
    }
  }

  // ... (JSX do return mantém igual) ...
  return (
    <div className="min-h-screen bg-background flex flex-col">
        {/* ... (Cabeçalho, ScrollArea, Input - tudo igual) ... */}
        <header className="border-b border-border/40 bg-card/30 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl">
                {agent.photo_url || "🤖"}
              </div>
              <div>
                <h1 className="font-semibold">{agent.name}</h1>
                {agent.categories && <p className="text-xs text-muted-foreground">{agent.categories.name}</p>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <span className="text-sm text-muted-foreground">Créditos:</span>
            <span className="font-bold text-primary">{credits}</span>
          </div>
        </div>
      </header>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="container mx-auto max-w-4xl space-y-4">
          {messages.length === 0 && (
            <Card className="p-8 text-center space-y-4 bg-card/50 backdrop-blur border-border/50">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl mx-auto">
                {agent.photo_url || "🤖"}
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">{agent.name}</h2>
                <p className="text-muted-foreground">{agent.description}</p>
              </div>
              <p className="text-sm text-muted-foreground">Envie uma mensagem para começar a conversa</p>
            </Card>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <Avatar className="w-8 h-8 bg-gradient-to-br from-primary to-accent">
                  <AvatarFallback>{agent.photo_url || "🤖"}</AvatarFallback>
                </Avatar>
              )}
              <Card
                className={`p-4 max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card/50 backdrop-blur border-border/50"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </Card>
              {message.role === "user" && (
                <Avatar className="w-8 h-8 bg-secondary">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="w-8 h-8 bg-gradient-to-br from-primary to-accent">
                <AvatarFallback>{agent.photo_url || "🤖"}</AvatarFallback>
              </Avatar>
              <Card className="p-4 bg-card/50 backdrop-blur border-border/50">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border/40 bg-card/30 backdrop-blur-xl p-4">
        <div className="container mx-auto max-w-4xl flex gap-2">
          <Input
            placeholder={credits > 0 ? "Digite sua mensagem..." : "Sem créditos disponíveis"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={loading || credits <= 0}
            className="bg-background/50 border-border/50"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim() || credits <= 0}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
