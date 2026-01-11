"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Loader2, Key, Sparkles, CreditCard, AlertTriangle, Gift, QrCode, Globe, Activity, Share2 } from "lucide-react"
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

const PAYMENT_GATEWAYS = [
  { value: "mercadopago", label: "Mercado Pago", icon: "💳" },
  { value: "appmax", label: "Appmax", icon: "🔷" },
]

const PAYMENT_ENVIRONMENTS = [
  { value: "sandbox", label: "Sandbox (Testes)", color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" },
  { value: "production", label: "Produção", color: "bg-green-500/20 text-green-500 border-green-500/30" },
]

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [loadingModels, setLoadingModels] = useState(false)
  const [availableModels, setAvailableModels] = useState<Array<{ value: string; label: string }>>([])

  const [settings, setSettings] = useState({
    // AI Settings
    ai_provider: "gemini",
    ai_model: "models/gemini-2.5-flash",
    gemini_api_key: "",
    openai_api_key: "",
    claude_api_key: "",
    grok_api_key: "",
    // Payment Settings
    payment_gateway: "mercadopago",
    payment_environment: "sandbox",
    mp_public_key_sandbox: "",
    mp_public_key_production: "",
    mp_access_token_sandbox: "",
    mp_access_token_production: "",
    appmax_client_id: "",
    appmax_client_secret: "",
    // Tracking Pixels
    google_pixel_id: "",
    facebook_pixel_id: "",
    tiktok_pixel_id: "",
    kwai_pixel_id: "",
    pinterest_pixel_id: "",
    taboola_pixel_id: "",
  })

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/admin/settings")
        const data = await response.json()
        setSettings(prev => ({
          ...prev,
          ai_provider: data.ai_provider || "gemini",
          ai_model: data.ai_model || "models/gemini-2.5-flash",
          gemini_api_key: data.gemini_api_key || "",
          openai_api_key: data.openai_api_key || "",
          claude_api_key: data.claude_api_key || "",
          grok_api_key: data.grok_api_key || "",
          payment_gateway: data.payment_gateway || "mercadopago",
          payment_environment: data.payment_environment || "sandbox",
          mp_public_key_sandbox: data.mp_public_key_sandbox || "",
          mp_public_key_production: data.mp_public_key_production || "",
          mp_access_token_sandbox: data.mp_access_token_sandbox || "",
          mp_access_token_production: data.mp_access_token_production || "",
          appmax_client_id: data.appmax_client_id || "",
          appmax_client_secret: data.appmax_client_secret || "",
          google_pixel_id: data.google_pixel_id || "",
          facebook_pixel_id: data.facebook_pixel_id || "",
          tiktok_pixel_id: data.tiktok_pixel_id || "",
          kwai_pixel_id: data.kwai_pixel_id || "",
          pinterest_pixel_id: data.pinterest_pixel_id || "",
          taboola_pixel_id: data.taboola_pixel_id || "",
        }))
      } catch (error) {
        console.error("Erro ao carregar configurações")
      } finally {
        setFetching(false)
      }
    }
    fetchSettings()
  }, [])

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

  const isProduction = settings.payment_environment === "production"
  const currentGateway = PAYMENT_GATEWAYS.find(g => g.value === settings.payment_gateway)
  const currentEnv = PAYMENT_ENVIRONMENTS.find(e => e.value === settings.payment_environment)

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
            Configurações do Sistema
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* SEÇÃO: GATEWAY DE PAGAMENTO */}
          <Card className="p-8 bg-gradient-to-br from-card/50 to-accent/5 backdrop-blur border-accent/30 space-y-6">
            <div className="flex items-center gap-3 text-accent">
              <CreditCard className="w-6 h-6" />
              <h2 className="text-xl font-bold">Gateway de Pagamento</h2>
              <Badge className={currentEnv?.color}>
                {currentEnv?.label}
              </Badge>
            </div>

            {isProduction && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <p className="text-sm text-yellow-500">
                  <strong>Atenção:</strong> Ambiente de produção ativo. Pagamentos serão cobrados de verdade!
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gateway Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Gateway Ativo</label>
                <div className="flex gap-2">
                  {PAYMENT_GATEWAYS.map((gw) => (
                    <button
                      key={gw.value}
                      onClick={() => setSettings({ ...settings, payment_gateway: gw.value })}
                      className={`flex-1 p-3 rounded-lg border transition-all ${settings.payment_gateway === gw.value
                        ? "bg-accent/20 border-accent text-accent"
                        : "bg-background/50 border-border/50 hover:border-accent/50"
                        }`}
                    >
                      <span className="text-xl">{gw.icon}</span>
                      <p className="text-sm font-medium mt-1">{gw.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Environment Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Ambiente</label>
                <div className="flex gap-2">
                  {PAYMENT_ENVIRONMENTS.map((env) => (
                    <button
                      key={env.value}
                      onClick={() => setSettings({ ...settings, payment_environment: env.value })}
                      className={`flex-1 p-3 rounded-lg border transition-all ${settings.payment_environment === env.value
                        ? env.color + " border-current"
                        : "bg-background/50 border-border/50 hover:border-accent/50"
                        }`}
                    >
                      <p className="text-sm font-medium">{env.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Credenciais Mercado Pago */}
            {settings.payment_gateway === "mercadopago" && (
              <div className="space-y-4 p-4 rounded-lg bg-background/30 border border-border/30">
                <h3 className="font-medium flex items-center gap-2">
                  💳 Credenciais Mercado Pago
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-yellow-500">Public Key (Sandbox)</label>
                    <Input
                      type="text"
                      placeholder="TEST-..."
                      value={settings.mp_public_key_sandbox}
                      onChange={(e) => setSettings({ ...settings, mp_public_key_sandbox: e.target.value })}
                      className="bg-background/50 border-border/50 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-green-500">Public Key (Produção)</label>
                    <Input
                      type="text"
                      placeholder="APP_USR-..."
                      value={settings.mp_public_key_production}
                      onChange={(e) => setSettings({ ...settings, mp_public_key_production: e.target.value })}
                      className="bg-background/50 border-border/50 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-yellow-500">Access Token (Sandbox)</label>
                    <Input
                      type="password"
                      placeholder="TEST-..."
                      value={settings.mp_access_token_sandbox}
                      onChange={(e) => setSettings({ ...settings, mp_access_token_sandbox: e.target.value })}
                      className="bg-background/50 border-border/50 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-green-500">Access Token (Produção)</label>
                    <Input
                      type="password"
                      placeholder="APP_USR-..."
                      value={settings.mp_access_token_production}
                      onChange={(e) => setSettings({ ...settings, mp_access_token_production: e.target.value })}
                      className="bg-background/50 border-border/50 font-mono"
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  💡 Obtenha suas credenciais em{" "}
                  <a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" className="text-accent hover:underline">
                    mercadopago.com.br/developers
                  </a>
                </p>
              </div>
            )}

            {/* Credenciais Appmax */}
            {settings.payment_gateway === "appmax" && (
              <div className="space-y-4 p-4 rounded-lg bg-background/30 border border-border/30">
                <h3 className="font-medium flex items-center gap-2">
                  🔷 Credenciais Appmax
                </h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Client ID</label>
                  <Input
                    type="text"
                    placeholder="Seu Client ID"
                    value={settings.appmax_client_id}
                    onChange={(e) => setSettings({ ...settings, appmax_client_id: e.target.value })}
                    className="bg-background/50 border-border/50 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Client Secret</label>
                  <Input
                    type="password"
                    placeholder="Seu Client Secret"
                    value={settings.appmax_client_secret}
                    onChange={(e) => setSettings({ ...settings, appmax_client_secret: e.target.value })}
                    className="bg-background/50 border-border/50 font-mono"
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  💡 Obtenha suas credenciais no painel da Appmax
                </p>
              </div>
            )}
          </Card>

          {/* SEÇÃO: PROVIDER DE IA */}
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
              </div>
            </div>
          </Card>

          {/* SEÇÃO: CHAVES DE API */}
          <Card className="p-8 bg-card/50 backdrop-blur border-border/50 space-y-6">
            <div className="flex items-center gap-3 text-primary">
              <Key className="w-6 h-6" />
              <h2 className="text-xl font-bold">Chaves de API (IA)</h2>
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
            </div>
          </Card>

          {/* Rastreamento & Pixels */}
          <Card className="p-8 bg-card/50 backdrop-blur border-border/50 space-y-6">
            <div className="flex items-center gap-3 text-primary">
              <Activity className="w-6 h-6" />
              <h2 className="text-xl font-bold">Rastreamento & Pixels</h2>
            </div>

            <p className="text-muted-foreground text-sm">
              Insira os IDs de rastreamento para ativar automaticamente os scripts de conversão e pageview.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Google Analytics / Ads
                </label>
                <Input
                  placeholder="G-XXXXXX ou AW-XXXXXX"
                  value={settings.google_pixel_id}
                  onChange={(e) => setSettings({ ...settings, google_pixel_id: e.target.value })}
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Meta / Facebook Pixel
                </label>
                <Input
                  placeholder="1234567890"
                  value={settings.facebook_pixel_id}
                  onChange={(e) => setSettings({ ...settings, facebook_pixel_id: e.target.value })}
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  TikTok Pixel
                </label>
                <Input
                  placeholder="CXXXXXXXXXXXX"
                  value={settings.tiktok_pixel_id}
                  onChange={(e) => setSettings({ ...settings, tiktok_pixel_id: e.target.value })}
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Kwai Pixel
                </label>
                <Input
                  placeholder="XXXXXXXX"
                  value={settings.kwai_pixel_id}
                  onChange={(e) => setSettings({ ...settings, kwai_pixel_id: e.target.value })}
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Pinterest Tag
                </label>
                <Input
                  placeholder="26XXXXXXXX"
                  value={settings.pinterest_pixel_id}
                  onChange={(e) => setSettings({ ...settings, pinterest_pixel_id: e.target.value })}
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Taboola Pixel
                </label>
                <Input
                  placeholder="1234567"
                  value={settings.taboola_pixel_id}
                  onChange={(e) => setSettings({ ...settings, taboola_pixel_id: e.target.value })}
                  className="bg-background/50 border-border/50"
                />
              </div>
            </div>
          </Card>

          {/* Botão Salvar */}
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
