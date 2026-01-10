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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Save, DollarSign, Sparkles, Eye, Lock, Gift } from "lucide-react"
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
        is_public: true,
        is_free: true,
        price: 0,
        bonus_credits: 0,
        is_featured: false,
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
                is_public: agent.is_public ?? true,
                is_free: agent.is_free ?? true,
                price: agent.price || 0,
                bonus_credits: agent.bonus_credits || 0,
                is_featured: agent.is_featured ?? false,
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
                    is_public: formData.is_public,
                    is_free: formData.is_free,
                    price: formData.is_free ? 0 : formData.price,
                    bonus_credits: formData.is_free ? 0 : formData.bonus_credits,
                    is_featured: formData.is_featured,
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
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="ghost" size="icon">
                            <Link href="/admin">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                            Editar Agente
                        </h1>
                    </div>

                    {/* Botão Base de Conhecimento */}
                    <Button
                        asChild
                        variant="outline"
                        className="border-accent/50 text-accent hover:bg-accent/10 cyber-button"
                    >
                        <Link href={`/admin/agents/${agentId}/knowledge`} className="flex items-center gap-2">
                            <span className="text-xl">🧠</span>
                            Base de Conhecimento
                        </Link>
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">

                    {/* Card: Informações Básicas */}
                    <Card className="p-6 bg-card/50 backdrop-blur border-border/50 space-y-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="text-2xl">{formData.photo_url || "🤖"}</span>
                            Informações Básicas
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome do Agente</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="bg-background/50 border-border/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="photo_url">Emoji ou URL da Foto</Label>
                                <Input
                                    id="photo_url"
                                    value={formData.photo_url}
                                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                                    placeholder="🤖 ou https://..."
                                    className="bg-background/50 border-border/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Categoria</Label>
                            <select
                                id="category"
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                required
                                className="w-full flex h-10 rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="">Selecione uma categoria...</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
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
                            <Label htmlFor="system_prompt">System Prompt</Label>
                            <Textarea
                                id="system_prompt"
                                value={formData.system_prompt}
                                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                                required
                                rows={10}
                                className="bg-background/50 border-border/50 font-mono text-sm"
                            />
                        </div>
                    </Card>

                    {/* Card: Visibilidade */}
                    <Card className="p-6 bg-card/50 backdrop-blur border-border/50 space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Eye className="w-5 h-5 text-primary" />
                            Visibilidade
                        </h2>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border/30">
                            <div className="space-y-1">
                                <Label htmlFor="is_public" className="font-medium">Agente Público</Label>
                                <p className="text-sm text-muted-foreground">
                                    Se ativo, aparece no dashboard para todos os usuários
                                </p>
                            </div>
                            <Switch
                                id="is_public"
                                checked={formData.is_public}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border/30">
                            <div className="space-y-1">
                                <Label htmlFor="is_featured" className="font-medium flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-yellow-500" />
                                    Destaque na Home
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Aparece em destaque com badge especial
                                </p>
                            </div>
                            <Switch
                                id="is_featured"
                                checked={formData.is_featured}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                            />
                        </div>
                    </Card>

                    {/* Card: Monetização */}
                    <Card className="p-6 bg-gradient-to-br from-card/50 to-accent/5 backdrop-blur border-accent/30 space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-accent" />
                            Monetização
                        </h2>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border/30">
                            <div className="space-y-1">
                                <Label htmlFor="is_free" className="font-medium flex items-center gap-2">
                                    {formData.is_free ? (
                                        <span className="text-green-500">🆓 Gratuito</span>
                                    ) : (
                                        <span className="text-accent flex items-center gap-1">
                                            <Lock className="w-4 h-4" /> Premium
                                        </span>
                                    )}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {formData.is_free
                                        ? "Todos os usuários podem usar este agente"
                                        : "Usuários precisam comprar acesso para usar"
                                    }
                                </p>
                            </div>
                            <Switch
                                id="is_free"
                                checked={formData.is_free}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
                            />
                        </div>

                        {/* Campos Premium (só aparecem se não for gratuito) */}
                        {!formData.is_free && (
                            <div className="space-y-4 p-4 rounded-lg bg-accent/5 border border-accent/20 animate-fade-in-up">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price" className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            Preço (R$)
                                        </Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                            placeholder="29.90"
                                            className="bg-background/50 border-accent/30 focus:border-accent"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bonus_credits" className="flex items-center gap-2">
                                            <Gift className="w-4 h-4 text-green-500" />
                                            Créditos Bônus
                                        </Label>
                                        <Input
                                            id="bonus_credits"
                                            type="number"
                                            min="0"
                                            value={formData.bonus_credits}
                                            onChange={(e) => setFormData({ ...formData, bonus_credits: parseInt(e.target.value) || 0 })}
                                            placeholder="50"
                                            className="bg-background/50 border-accent/30 focus:border-accent"
                                        />
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground text-center">
                                    Ao comprar, o usuário recebe <span className="text-accent font-bold">{formData.bonus_credits}</span> créditos de bônus
                                </p>
                            </div>
                        )}
                    </Card>

                    {/* Botões de ação */}
                    <div className="flex gap-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Salvar Alterações
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex-1 bg-transparent"
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    )
}
