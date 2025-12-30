"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function NewAgentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    photo_url: "",
    system_prompt: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/admin")
      } else {
        alert("Erro ao criar agente")
      }
    } catch (error) {
      console.error("[v0] Error creating agent:", error)
      alert("Erro ao criar agente")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Criar Novo Agente
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-8 bg-card/50 backdrop-blur border-border/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nome do Agente
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Assistente de Marketing"
                required
                className="bg-background/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descrição
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o que este agente faz..."
                required
                rows={3}
                className="bg-background/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="photo_url" className="text-sm font-medium">
                Emoji ou URL da Foto
              </label>
              <Input
                id="photo_url"
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                placeholder="Ex: 🤖 ou URL da imagem"
                className="bg-background/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="system_prompt" className="text-sm font-medium">
                System Prompt
              </label>
              <Textarea
                id="system_prompt"
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                placeholder="Instruções para o comportamento do agente..."
                required
                rows={6}
                className="bg-background/50 border-border/50 font-mono text-sm"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {loading ? "Criando..." : "Criar Agente"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 bg-transparent">
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
