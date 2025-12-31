"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Save, Loader2, Key } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function AdminSettingsPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  
  const [keys, setKeys] = useState({
    openai_api_key: "",
    gemini_api_key: "",
    anthropic_api_key: "",
  })

  // Buscar chaves salvas ao carregar
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("app_settings").select("*")
      
      if (data) {
        const newKeys = { ...keys }
        data.forEach((item) => {
          if (item.key in newKeys) {
            // @ts-ignore
            newKeys[item.key] = item.value || ""
          }
        })
        setKeys(newKeys)
      }
      setFetching(false)
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      // Salvar cada chave individualmente
      const updates = Object.entries(keys).map(([key, value]) => {
        return supabase
          .from("app_settings")
          .upsert({ key, value, updated_at: new Date().toISOString() })
      })

      await Promise.all(updates)
      alert("Configurações salvas com sucesso!")
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("Erro ao salvar configurações")
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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Configurações do Sistema
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-8 bg-card/50 backdrop-blur border-border/50 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/50">
            <Key className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Chaves de API (LLMs)</h2>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Defina as chaves de API para os modelos de inteligência artificial. 
            Se deixar em branco, o sistema tentará usar as variáveis de ambiente (.env).
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">OpenAI API Key (GPT-4o, GPT-3.5)</label>
              <Input
                type="password"
                value={keys.openai_api_key}
                onChange={(e) => setKeys({ ...keys, openai_api_key: e.target.value })}
                placeholder="sk-..."
                className="bg-background/50 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Google Gemini API Key</label>
              <Input
                type="password"
                value={keys.gemini_api_key}
                onChange={(e) => setKeys({ ...keys, gemini_api_key: e.target.value })}
                placeholder="AIza..."
                className="bg-background/50 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Anthropic Claude API Key</label>
              <Input
                type="password"
                value={keys.anthropic_api_key}
                onChange={(e) => setKeys({ ...keys, anthropic_api_key: e.target.value })}
                placeholder="sk-ant-..."
                className="bg-background/50 font-mono"
              />
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Configurações
          </Button>
        </Card>
      </main>
    </div>
  )
}