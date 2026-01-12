"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { AgentAvatar } from "@/components/agent-avatar"
import { CreditCounter } from "@/components/credit-counter"
import Link from "next/link"
import { ArrowLeft, Send, Loader2, Sparkles, RotateCcw, User } from "lucide-react"

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
  initialMessages?: Message[]
  initialConversationId?: string | null
}

export function ChatInterface({
  agent,
  userId,
  availableCredits,
  initialMessages = [],
  initialConversationId = null
}: ChatInterfaceProps) {

  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState(availableCredits)
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

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
          conversationId,
        }),
      })

      const data = await response.json()

      if (data.error) throw new Error(data.error)

      if (data.conversationId) setConversationId(data.conversationId)

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setCredits(data.remainingCredits)
    } catch (error: any) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `❌ Erro: ${error.message || "Ocorreu um erro desconhecido"}`,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
      if (credits > availableCredits) setCredits(availableCredits)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-dvh w-full bg-background flex flex-col overflow-hidden relative">
      {/* Background Grid */}
      <div className="cyber-grid fixed inset-0 z-0 pointer-events-none opacity-20" />

      {/* Header */}
      <header className="relative z-10 border-b border-primary/20 bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="hover:bg-primary/10 md:hidden">
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <AgentAvatar
                name={agent.name}
                emoji={agent.photo_url}
                status={loading ? "processing" : "online"}
                size="md"
              />
              <div>
                <h1 className="font-semibold font-orbitron">{agent.name}</h1>
                {agent.categories && (
                  <p className="text-xs text-primary/70">{agent.categories.name}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setConversationId(null)
                setMessages([])
              }}
              className="gap-2 text-muted-foreground hover:text-foreground hover:bg-primary/10"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Conversa</span>
            </Button>
            <CreditCounter credits={credits} showBuyButton />
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="container mx-auto max-w-4xl p-4 space-y-6">
          {/* Empty State */}
          {messages.length === 0 && (
            <div className="py-12 animate-fade-in-up">
              <Card className="p-8 text-center space-y-6 bg-card/50 backdrop-blur border-primary/20">
                <div className="relative mx-auto w-fit">
                  <AgentAvatar
                    name={agent.name}
                    emoji={agent.photo_url}
                    status="online"
                    size="xl"
                  />
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-primary animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold font-orbitron">{agent.name}</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">{agent.description}</p>
                </div>
                <p className="text-sm text-primary/70 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Online e pronto para ajudar
                </p>
              </Card>
            </div>
          )}

          {/* Messages */}
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-fade-in-up ${message.role === "user" ? "justify-end" : "justify-start"}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Agent Avatar */}
              {message.role === "assistant" && (
                <AgentAvatar
                  name={agent.name}
                  emoji={agent.photo_url}
                  status="online"
                  size="sm"
                />
              )}

              {/* Message Bubble */}
              <div
                className={`
                  relative max-w-[80%] p-4 rounded-2xl
                  ${message.role === "user"
                    ? "bg-gradient-to-br from-primary to-accent text-background rounded-br-md"
                    : "bg-card/70 backdrop-blur border border-primary/20 rounded-bl-md"
                  }
                `}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <span className={`
                  text-[10px] mt-2 block
                  ${message.role === "user" ? "text-background/60" : "text-muted-foreground"}
                `}>
                  {new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>

                {/* Decorative corner */}
                {message.role === "assistant" && (
                  <div className="absolute -left-1 bottom-2 w-2 h-2 bg-card/70 border-l border-b border-primary/20 rotate-45" />
                )}
              </div>

              {/* User Avatar */}
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-secondary to-accent/50 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-3 justify-start animate-fade-in-up">
              <AgentAvatar
                name={agent.name}
                emoji={agent.photo_url}
                status="processing"
                size="sm"
              />
              <div className="px-5 py-4 rounded-2xl rounded-bl-md bg-card/70 backdrop-blur border border-primary/20">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-10 border-t border-primary/20 bg-card/80 backdrop-blur-xl p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <Input
                placeholder={credits > 0 ? "Digite sua mensagem..." : "Sem créditos disponíveis"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                disabled={loading || credits <= 0}
                className="pr-12 bg-background/50 border-primary/20 focus:border-primary/50 h-12 text-base"
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim() || credits <= 0}
              className="h-12 w-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,249,0.4)]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>

          {credits <= 5 && credits > 0 && (
            <p className="text-xs text-destructive mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
              Créditos baixos. Recarregue para continuar conversando.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
