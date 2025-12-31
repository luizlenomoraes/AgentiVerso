"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch" // Certifique-se de ter este componente ou use um checkbox simples
import { ArrowLeft, Loader2, Save, UserCheck } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const supabase = getSupabaseBrowserClient()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  
  const [formData, setFormData] = useState({
    full_name: "",
    total_credits: 0,
    is_admin: false,
    email: "" // Apenas visualização
  })

  // Buscar dados do usuário
  useEffect(() => {
    const fetchUser = async () => {
      // Buscar perfil
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        alert("Erro ao buscar usuário ou usuário não encontrado.")
        router.push("/admin")
        return
      }

      // Tentar buscar email da tabela auth (só funciona se for admin service role ou via rpc, 
      // mas como estamos no client, talvez não consigamos ver o email. 
      // Vamos tentar mostrar apenas o ID se o email não estiver no profile)
      
      setFormData({
        full_name: profile.full_name || "",
        total_credits: profile.total_credits || 0,
        is_admin: profile.is_admin || false,
        email: userId // Usaremos o ID como referência visual já que email é protegido
      })
      
      setFetching(false)
    }
    fetchUser()
  }, [userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          total_credits: Number(formData.total_credits),
          is_admin: formData.is_admin
        })
        .eq("id", userId)

      if (error) throw error

      alert("Usuário atualizado com sucesso!")
      router.push("/admin")
      router.refresh()
    } catch (error: any) {
      console.error("Erro ao atualizar:", error)
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
          <h1 className="text-2xl font-bold">Editar Usuário</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-xl mx-auto p-8 bg-card/50 backdrop-blur border-border/50">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/50">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
              <UserCheck className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{formData.full_name}</h2>
              <p className="text-xs text-muted-foreground font-mono">ID: {formData.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome Completo</label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Créditos Totais</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={formData.total_credits}
                  onChange={(e) => setFormData({ ...formData, total_credits: Number(e.target.value) })}
                  required
                  className="bg-background/50"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setFormData(prev => ({ ...prev, total_credits: prev.total_credits + 10 }))}
                >
                  +10
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use este campo para bonificar o usuário manualmente.
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/30">
              <div className="space-y-0.5">
                <label className="text-base font-medium">Acesso de Administrador</label>
                <p className="text-xs text-muted-foreground">
                  Permite acesso total ao painel admin e edição de agentes.
                </p>
              </div>
              {/* Se não tiver o componente Switch do Shadcn, use um input checkbox simples */}
              <div className="flex items-center gap-2">
                 <input 
                    type="checkbox" 
                    checked={formData.is_admin}
                    onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                    className="w-5 h-5 accent-primary"
                 />
                 <span className="text-sm">{formData.is_admin ? "Sim" : "Não"}</span>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
