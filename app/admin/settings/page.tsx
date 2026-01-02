"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Loader2, Key, Sparkles } from "lucide-react"
import Link from "next/link"

const PROVIDERS = [
  { value: "gemini", label: "Google Gemini" },
  { value: "openai", label: "OpenAI" },
  { value: "claude", label: "Anthropic Claude" },
  { value: "grok", label: "xAI Grok" },
]

const MODELS = {
  gemini: [
    { value: "models/gemini-2.5-flash", label: "Gemini 2.5 Flash (Rápido)" },
    { value: "models/gemini-2.5-pro", label: "Gemini 2.5 Pro (Avançado)" },
    { value: "models/gemini-flash-lite-latest", label: "Gemini Flash Lite (Econômico)" },
  ],
  openai: [
    { value: "gpt-4o", label: "GPT-4o (Recomendado)" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini (Rápido)" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Econômico)" },
  ],
  claude: [
    { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet (Melhor)" },
    { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
    { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku (Rápido)" },
  ],
  grok: [
    { value: "grok-2-1212", label: "Grok 2 (Última versão)" },
    { value: "grok-2-vision-1212", label: "Grok 2 Vision" },
  ],
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [loadingModels, setLoadingModels] = useState(false)
  const [availableModels, setAvailableModels] = useState<Array<{ value: string; label: string }>>([])
  const [settings, setSettings] = useState({
    ai_provider: "gemini",
    ai_model: "models/gemini-2.5-flash",
    gemini_api_key: "",
    openai_api_key: "",
    claude_api_key: "",
    grok_api_key: "",
  })

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/admin/settings")
        const data = await response.json()
        setSettings({
          ai_provider: data.ai_provider || "gemini",
          ai_model: data.ai_model || "models/gemini-2.5-flash",
          gemini_api_key: data.gemini_api_key || "",
          openai_api_key: data.openai_api_key || "",
          claude_api_key: data.claude_api_key || "",
          grok_api_key: data.grok_api_key || "",
        })
      } catch (error) {
        console.error("Erro ao carregar configurações")
      } finally {
        setFetching(false)
      }
    }
    fetchSettings()
  }, [])

  // Carregar modelos quando provider ou chave mudar
  useEffect(() => {
    loadAvailableModels()
  }, [settings.ai_provider])

  const loadAvailableModels = async () => {
    const apiKeyMap: Record<string, string> = {
      gemini: settings.gemini_api_key,
      openai: settings.openai_api_key,
      claude: settings.claude_api_key,
      grok: settings.grok_api_key,
    }

    const apiKey = apiKeyMap[settings.ai_provider]

    if (!apiKey) {
      setAvailableModels([])
      return
    }

    setLoadingModels(true)
    try {
      const response = await fetch(
        `/api/admin/models?provider=${settings.ai_provider}&apiKey=${encodeURIComponent(apiKey)}`
      )
      const data = await response.json()

      if (data.models) {
        setAvailableModels(data.models)
      }
    } catch (error) {
      console.error("Erro ao carregar modelos:", error)
      setAvailableModels([])
    } finally {
      setLoadingModels(false)
    }
  }

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

  const handleProviderChange = (provider: string) => {
    const defaultModel = MODELS[provider as keyof typeof MODELS][0].value
    setSettings({
      ...settings,
      ai_provider: provider,
      ai_model: defaultModel,
    })
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
            Configurações de IA
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="p-8 bg-card/50 backdrop-blur border-border/50 space-y-6">
            <div className="flex items-center gap-3 text-primary">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-xl font-bold">Provider de IA</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Selecionar Provider</label>
                <select
                  value={settings.ai_provider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="w-full flex h-10 rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {PROVIDERS.map((provider) => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Este provider será usado para todos os agentes do sistema.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Modelo</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={loadAvailableModels}
                    disabled={loadingModels}
                    className="h-7 text-xs"
                  >
                    {loadingModels ? <Loader2 className="w-3 h-3 animate-spin" /> : "🔄 Recarregar"}
                  </Button>
                </div>
                <select
                  value={settings.ai_model}
                  onChange={(e) => setSettings({ ...settings, ai_model: e.target.value })}
                  disabled={loadingModels || availableModels.length === 0}
                  className="w-full flex h-10 rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  {availableModels.length > 0 ? (
                    availableModels.map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))
                  ) : (
                    <option value="">Configure a API Key primeiro</option>
                  )}
                </select>
                <p className="text-xs text-muted-foreground">
                  {loadingModels ? "Carregando modelos disponíveis..." :
                    availableModels.length > 0 ? `${availableModels.length} modelos disponíveis` :
                      "Configure a chave API acima e clique em Recarregar"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-card/50 backdrop-blur border-border/50 space-y-6">
            <div className="flex items-center gap-3 text-primary">
              <Key className="w-6 h-6" />
              <h2 className="text-xl font-bold">Chaves de API</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Gemini API Key</label>
                <Input
                  type="password"
                  placeholder="AIza..."
                  value={settings.gemini_api_key}
                  onChange={(e) => setSettings({ ...settings, gemini_api_key: e.target.value })}
                  className="bg-background/50 border-border/50 font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">OpenAI API Key</label>
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={settings.openai_api_key}
                  onChange={(e) => setSettings({ ...settings, openai_api_key: e.target.value })}
                  className="bg-background/50 border-border/50 font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Claude API Key</label>
                <Input
                  type="password"
                  placeholder="sk-ant-..."
                  value={settings.claude_api_key}
                  onChange={(e) => setSettings({ ...settings, claude_api_key: e.target.value })}
                  className="bg-background/50 border-border/50 font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Grok API Key</label>
                <Input
                  type="password"
                  placeholder="xai-..."
                  value={settings.grok_api_key}
                  onChange={(e) => setSettings({ ...settings, grok_api_key: e.target.value })}
                  className="bg-background/50 border-border/50 font-mono"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                💡 Configure apenas a chave do provider que você está usando atualmente.
              </p>
            </div>
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
