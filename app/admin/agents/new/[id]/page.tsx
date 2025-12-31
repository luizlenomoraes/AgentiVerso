"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation" // Use useParams para pegar o ID
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function EditAgentPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params.agentId as string // O nome do parâmetro deve bater com a pasta [agentId] ou [id]

  const supabase = getSupabaseBrowserClient()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    photo_url: "",
    system_prompt: "",
    category_id: "",
  })

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
        // 1. Categorias
        const { data: cats } = await supabase.from("categories").select("id, name").order("name")
        if (cats) setCategories(cats)

        // 2. Agente (O ID vem da URL params.id pois o arquivo é [id]/page.tsx)
        const id = params.id 
        if (id) {
            const { data: agent, error } = await supabase.from("agents").select("*").eq("id", id).single()
            if (agent) {
                setFormData({
                    name: agent.name,
                    description: agent.description || "",
                    photo_url: agent.photo_url || "",
                    system_prompt: agent.system_prompt,
                    category_id: agent.category_id || "",
                })
            }
        }
        setFetching(false)
    }
    loadData()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Update direto via Supabase Client (já que é Admin e tem permissão RLS)
      // Ou criar uma API PUT /api/admin/agents se preferir
      const { error } = await supabase
        .from("agents")
        .update({
            name: formData.name,
            description: formData.description,
            photo_url: formData.photo_url,
            system_prompt: formData.system_prompt,
            category_id: formData.category_id || null
        })
        .eq("id", params.id)

      if (error) throw error

      router.push("/admin")
      router.refresh()
    } catch (error: any) {
      console.error("Error updating agent:", error)
      alert("Erro ao atualizar: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
      return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
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
          <h1 className="text-2xl font-bold">Editar Agente</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-8 bg-card/50 backdrop-blur border-border/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-background/50"
              />
            </div>
             {/* Reutilizar os mesmos campos do NewAgentPage: Categoria, Descrição, Foto, Prompt... */}
             <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
              >
                <option value="">Selecione...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-medium">System Prompt</label>
                <Textarea 
                    value={formData.system_prompt}
                    onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                    className="font-mono text-sm bg-background/50"
                    rows={6}
                />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}