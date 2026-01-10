"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
    ArrowLeft,
    Loader2,
    Plus,
    Trash2,
    Package,
    Gift,
    DollarSign,
    Calendar,
    Sparkles,
    Bot
} from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { AgentAvatar } from "@/components/agent-avatar"

type Agent = {
    id: string
    name: string
    photo_url: string | null
    price: number
    is_free: boolean
}

type Combo = {
    id: string
    name: string
    description: string | null
    price: number
    original_price: number | null
    bonus_credits: number
    is_active: boolean
    valid_until: string | null
    agents: Agent[]
}

export default function CombosPage() {
    const router = useRouter()
    const supabase = getSupabaseBrowserClient()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [combos, setCombos] = useState<Combo[]>([])
    const [agents, setAgents] = useState<Agent[]>([])
    const [editingCombo, setEditingCombo] = useState<Combo | null>(null)
    const [isCreating, setIsCreating] = useState(false)

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: 0,
        original_price: 0,
        bonus_credits: 0,
        is_active: true,
        valid_until: "", // formato: YYYY-MM-DDTHH:MM
        selected_agents: [] as string[],
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)

        // Buscar combos com agentes
        const { data: combosData } = await supabase
            .from("agent_combos")
            .select("*")
            .order("created_at", { ascending: false })

        // Buscar agentes premium (para adicionar aos combos)
        const { data: agentsData } = await supabase
            .from("agents")
            .select("id, name, photo_url, price, is_free")
            .eq("is_public", true)
            .order("name")

        if (agentsData) setAgents(agentsData)

        // Para cada combo, buscar seus agentes
        if (combosData) {
            const combosWithAgents = await Promise.all(
                combosData.map(async (combo: { id: string; name: string; description: string | null; price: number; original_price: number | null; bonus_credits: number; is_active: boolean; valid_until: string | null }) => {
                    const { data: comboAgents } = await supabase
                        .from("combo_agents")
                        .select("agent_id, agents(id, name, photo_url, price, is_free)")
                        .eq("combo_id", combo.id)

                    return {
                        ...combo,
                        agents: comboAgents?.map((ca: { agents: Agent | null }) => ca.agents).filter(Boolean) || []
                    }
                })
            )
            setCombos(combosWithAgents as Combo[])
        }

        setLoading(false)
    }

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            price: 0,
            original_price: 0,
            bonus_credits: 0,
            is_active: true,
            valid_until: "",
            selected_agents: [],
        })
        setEditingCombo(null)
        setIsCreating(false)
    }

    const startEditing = (combo: Combo) => {
        // Formatar valid_until para datetime-local (YYYY-MM-DDTHH:MM)
        let formattedDate = ""
        if (combo.valid_until) {
            const date = new Date(combo.valid_until)
            formattedDate = date.toISOString().slice(0, 16) // YYYY-MM-DDTHH:MM
        }

        setFormData({
            name: combo.name,
            description: combo.description || "",
            price: combo.price,
            original_price: combo.original_price || 0,
            bonus_credits: combo.bonus_credits,
            is_active: combo.is_active,
            valid_until: formattedDate,
            selected_agents: combo.agents.map(a => a.id),
        })
        setEditingCombo(combo)
        setIsCreating(false)
    }

    const startCreating = () => {
        resetForm()
        setIsCreating(true)
    }

    const handleSave = async () => {
        if (!formData.name || formData.price <= 0 || formData.selected_agents.length === 0) {
            alert("Preencha nome, preço e selecione ao menos um agente")
            return
        }

        setSaving(true)

        try {
            const comboData = {
                name: formData.name,
                description: formData.description || null,
                price: formData.price,
                original_price: formData.original_price || null,
                bonus_credits: formData.bonus_credits,
                is_active: formData.is_active,
                valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
            }

            let comboId: string

            if (editingCombo) {
                // Atualizar combo existente
                const { error } = await supabase
                    .from("agent_combos")
                    .update(comboData)
                    .eq("id", editingCombo.id)

                if (error) throw error
                comboId = editingCombo.id

                // Remover agentes antigos
                await supabase.from("combo_agents").delete().eq("combo_id", comboId)
            } else {
                // Criar novo combo
                const { data, error } = await supabase
                    .from("agent_combos")
                    .insert(comboData)
                    .select("id")
                    .single()

                if (error) throw error
                comboId = data.id
            }

            // Adicionar agentes ao combo
            const comboAgents = formData.selected_agents.map(agentId => ({
                combo_id: comboId,
                agent_id: agentId,
            }))

            const { error: agentsError } = await supabase
                .from("combo_agents")
                .insert(comboAgents)

            if (agentsError) throw agentsError

            await fetchData()
            resetForm()
            alert(editingCombo ? "Combo atualizado!" : "Combo criado!")
        } catch (error: any) {
            console.error("Erro ao salvar combo:", error)
            alert("Erro ao salvar: " + error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (comboId: string, event: React.MouseEvent) => {
        event.stopPropagation()
        event.preventDefault()

        if (!confirm("Tem certeza que deseja excluir este combo?")) return

        try {
            // Primeiro deleta os agentes do combo
            await supabase
                .from("combo_agents")
                .delete()
                .eq("combo_id", comboId)

            // Depois deleta o combo
            const { error } = await supabase
                .from("agent_combos")
                .delete()
                .eq("id", comboId)

            if (error) throw error

            await fetchData()
            resetForm()
            alert("Combo excluído!")
        } catch (error: any) {
            console.error("Erro ao excluir:", error)
            alert("Erro ao excluir: " + error.message)
        }
    }

    const toggleAgentSelection = (agentId: string) => {
        setFormData(prev => ({
            ...prev,
            selected_agents: prev.selected_agents.includes(agentId)
                ? prev.selected_agents.filter(id => id !== agentId)
                : [...prev.selected_agents, agentId]
        }))
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border/40 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="ghost" size="icon">
                            <Link href="/admin">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                            Combos Promocionais
                        </h1>
                    </div>

                    <Button
                        onClick={startCreating}
                        className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Combo
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Lista de Combos */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary" />
                            Combos Cadastrados
                        </h2>

                        {combos.length === 0 ? (
                            <Card className="p-8 text-center bg-card/50 border-border/50">
                                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">Nenhum combo cadastrado</p>
                                <Button onClick={startCreating} variant="outline" className="mt-4">
                                    Criar primeiro combo
                                </Button>
                            </Card>
                        ) : (
                            combos.map((combo) => (
                                <Card
                                    key={combo.id}
                                    className={`p-4 bg-card/50 border-border/50 space-y-3 cursor-pointer transition-all hover:border-primary/30 ${editingCombo?.id === combo.id ? "ring-2 ring-primary" : ""
                                        }`}
                                    onClick={() => startEditing(combo)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold">{combo.name}</h3>
                                                <Badge variant={combo.is_active ? "default" : "secondary"}>
                                                    {combo.is_active ? "Ativo" : "Inativo"}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {combo.description}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:bg-destructive/10"
                                            onClick={(e) => handleDelete(combo.id, e)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            {combo.agents.slice(0, 4).map((agent) => (
                                                <div key={agent.id} className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm border-2 border-background">
                                                    {agent.photo_url || "🤖"}
                                                </div>
                                            ))}
                                            {combo.agents.length > 4 && (
                                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs border-2 border-background">
                                                    +{combo.agents.length - 4}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {combo.agents.length} agentes
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm">
                                        {combo.original_price && (
                                            <span className="text-muted-foreground line-through">
                                                R$ {combo.original_price.toFixed(2)}
                                            </span>
                                        )}
                                        <span className="text-accent font-bold text-lg">
                                            R$ {combo.price.toFixed(2)}
                                        </span>
                                        {combo.bonus_credits > 0 && (
                                            <Badge variant="outline" className="text-green-500 border-green-500/30">
                                                +{combo.bonus_credits} créditos
                                            </Badge>
                                        )}
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Formulário */}
                    {(isCreating || editingCombo) && (
                        <Card className="p-6 bg-card/50 border-accent/30 space-y-6 h-fit sticky top-24">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-accent" />
                                {editingCombo ? "Editar Combo" : "Novo Combo"}
                            </h2>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nome do Combo</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Pack Relacionamentos"
                                        className="bg-background/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Descrição</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Descrição do combo..."
                                        rows={2}
                                        className="bg-background/50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1">
                                            <DollarSign className="w-4 h-4" />
                                            Preço Promocional
                                        </Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                            className="bg-background/50"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Preço Original (riscar)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.original_price}
                                            onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) || 0 })}
                                            className="bg-background/50"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1">
                                            <Gift className="w-4 h-4 text-green-500" />
                                            Créditos Bônus
                                        </Label>
                                        <Input
                                            type="number"
                                            value={formData.bonus_credits}
                                            onChange={(e) => setFormData({ ...formData, bonus_credits: parseInt(e.target.value) || 0 })}
                                            className="bg-background/50"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            Válido até (data e hora)
                                        </Label>
                                        <Input
                                            type="datetime-local"
                                            value={formData.valid_until}
                                            onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                            className="bg-background/50"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            O contador mostrará tempo restante até esta data/hora
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 border">
                                    <Label>Combo Ativo</Label>
                                    <Switch
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                    />
                                </div>

                                {/* Seleção de Agentes */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1">
                                        <Bot className="w-4 h-4" />
                                        Agentes do Combo ({formData.selected_agents.length})
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-lg bg-background/30 border">
                                        {agents.map((agent) => (
                                            <div
                                                key={agent.id}
                                                onClick={() => toggleAgentSelection(agent.id)}
                                                className={`p-2 rounded-lg cursor-pointer flex items-center gap-2 transition-all ${formData.selected_agents.includes(agent.id)
                                                    ? "bg-primary/20 border border-primary/50"
                                                    : "bg-background/50 border border-transparent hover:border-border"
                                                    }`}
                                            >
                                                <span className="text-lg">{agent.photo_url || "🤖"}</span>
                                                <span className="text-sm truncate">{agent.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 bg-gradient-to-r from-primary to-accent"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    {editingCombo ? "Salvar" : "Criar Combo"}
                                </Button>
                                <Button variant="outline" onClick={resetForm} className="flex-1">
                                    Cancelar
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    )
}
