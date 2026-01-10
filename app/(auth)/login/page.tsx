"use client"

import type React from "react"
import { useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Force refresh to update server-side auth state before navigating
      router.refresh()
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid de fundo animado */}
      <div className="cyber-grid" />

      {/* Linha neon no topo */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

      {/* Gradientes de fundo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(0,255,249,0.15)_0%,transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_80%,rgba(255,0,193,0.1)_0%,transparent_40%)]" />

      {/* Card principal com efeito neon */}
      <main className="relative z-10 w-full max-w-md glass-panel neon-border rounded-2xl p-8 space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-orbitron text-3xl md:text-4xl font-bold tracking-wider">
            AGENTI<span className="text-primary">VERSO</span>
          </h1>
          <p className="text-muted-foreground text-sm tracking-widest uppercase">
            Autenticação Requerida
          </p>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/30 text-center font-medium">
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-primary text-xs uppercase tracking-wider ml-1">
              Identificação de Usuário
            </label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@nexus.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="cyber-input"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-primary text-xs uppercase tracking-wider ml-1">
              Chave de Acesso
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="cyber-input"
            />
          </div>

          <Button
            type="submit"
            className="w-full py-3 font-orbitron font-bold tracking-widest cyber-button mt-4"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "INICIAR SESSÃO"
            )}
          </Button>
        </form>

        {/* Link para cadastro */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Ainda não tem credenciais?{" "}
            <Link href="/signup" className="text-primary hover:text-accent font-bold tracking-wider transition-colors">
              REGISTRAR
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
