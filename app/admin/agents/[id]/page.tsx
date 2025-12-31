"use client"

export const dynamic = "force-dynamic"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function EditAgentPage() {
    const router = useRouter()
    const params = useParams()
    const agentId = params.id as string
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

    // Buscar dados do agente e categorias
    useEffect(() => {
        const fetchData = async () => {
            // Categorias
            const { data: catData } = await supabase.from("categories").select("id, name").order("name")
            if (catData) setCategories(catData)

            // Agente
            const { data: agent, error } = await supabase
                .from("agents")
                .select("*")
                .eq("id", agentId)
                .single()

            if (error) {
                alert("Agente não encontrado.")
                router.push("/admin")
                return
            }

            setFormData({
                name: agent.name || "",
                description: agent.description || "",
                photo_url: agent.photo_url || "",
                system_prompt: agent.system_prompt || "",
                category_id: agent.category_id || "",
            })

            setFetching(false)
        }
        fetchData()
    }, [agentId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from("agents")
                .update({
                    name: formData.name,
                    description: formData.description,
                    photo_url: formData.photo_url,
                    system_prompt: formData.system_prompt,
                    category_id: formData.category_id || null,
                })
                .eq("id", agentId)

            if (error) throw error

            alert("Agente atualizado com sucesso!")
            router.push("/admin")
            router.refresh()
        } catch (error: any) {
            console.error("Error updating agent:", error)
            alert("Erro ao atualizar agente: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
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
                        Editar Agente
                    </h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <Card className="max-w-2xl mx-auto p-8 bg-card/50 backdrop-blur border-border/50">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Nome do Agente</label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="bg-background/50 border-border/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="category" className="text-sm font-medium">Categoria</label>
                            <select
                                id="category"
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                required
                                className="w-full flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="">Selecione uma categoria...</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium">Descrição</label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                rows={3}
                                className="bg-background/50 border-border/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="photo_url" className="text-sm font-medium">Emoji ou URL da Foto</label>
                            <Input
                                id="photo_url"
                                value={formData.photo_url}
                                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                                className="bg-background/50 border-border/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="system_prompt" className="text-sm font-medium">System Prompt</label>
                            <Textarea
                                id="system_prompt"
                                value={formData.system_prompt}
                                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                                required
                                rows={10}
                                className="bg-background/50 border-border/50 font-mono text-sm"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Salvar Alterações
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
