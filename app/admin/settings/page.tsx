"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Loader2, Key, Database, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [settings, setSettings] = useState({
    openai_api_key: "",
    default_model: "gpt-4o",
  })

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/admin/settings")
        const data = await response.json()
        setSettings({
          openai_api_key: data.openai_api_key || "",
          default_model: data.default_model || "gpt-4o",
        })
      } catch (error) {
        console.error("Erro ao carregar configurações")
      } finally {
        setFetching(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        alert("Configurações salvas com sucesso!")
      } else {
        alert("Erro ao salvar configurações")
      }
    } catch (error) {
      alert("Erro de conexão")
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
            Configurações do SaaS
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="p-8 bg-card/50 backdrop-blur border-border/50 space-y-6">
            <div className="flex items-center gap-3 text-primary">
              <Key className="w-6 h-6" />
              <h2 className="text-xl font-bold">Chaves de API (LLM)</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">OpenAI API Key Global</label>
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={settings.openai_api_key}
                  onChange={(e) => setSettings({ ...settings, openai_api_key: e.target.value })}
                  className="bg-background/50 border-border/50 font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Esta chave será usada para todos os agentes do sistema.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Modelo Padrão</label>
                <select
                  value={settings.default_model}
                  onChange={(e) => setSettings({ ...settings, default_model: e.target.value })}
                  className="w-full flex h-10 rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="gpt-4o">gpt-4o (Recomendado)</option>
                  <option value="gpt-4-turbo">gpt-4-turbo</option>
                  <option value="gpt-3.5-turbo">gpt-3.5-turbo (Econômico)</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-card/50 backdrop-blur border-border/50 space-y-6">
            <div className="flex items-center gap-3 text-primary">
              <ShieldCheck className="w-6 h-6" />
              <h2 className="text-xl font-bold">Regras de Acesso</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure aqui comportamentos globais de novos usuários e pagamentos. (Em breve mais opções)
            </p>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full md:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 px-8"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Todas as Configurações
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
