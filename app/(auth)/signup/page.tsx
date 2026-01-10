"use client"

import type React from "react"
import { useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Loader2, ArrowLeft } from "lucide-react"

// Função para formatar CPF
const formatCPF = (value: string) => {
  const numbers = value.replace(/\D/g, "")
  return numbers
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1")
}

// Função para formatar telefone
const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, "")
  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
  }
  return numbers
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1")
}

// Validar CPF
const isValidCPF = (cpf: string) => {
  const numbers = cpf.replace(/\D/g, "")
  if (numbers.length !== 11) return false
  if (/^(\d)\1+$/.test(numbers)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(numbers[i]) * (10 - i)
  let check = (sum * 10) % 11
  if (check === 10 || check === 11) check = 0
  if (check !== parseInt(numbers[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(numbers[i]) * (11 - i)
  check = (sum * 10) % 11
  if (check === 10 || check === 11) check = 0
  return check === parseInt(numbers[10])
}

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [cpf, setCpf] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validações
    if (password !== confirmPassword) {
      setError("As senhas não conferem")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres")
      setLoading(false)
      return
    }

    if (!isValidCPF(cpf)) {
      setError("CPF inválido")
      setLoading(false)
      return
    }

    const phoneNumbers = phone.replace(/\D/g, "")
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      setError("Telefone inválido. Use DDD + número")
      setLoading(false)
      return
    }

    const supabase = getSupabaseBrowserClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        data: {
          full_name: fullName,
          phone: phoneNumbers, // Telefone sem formatação
          cpf: cpf.replace(/\D/g, ""), // CPF sem formatação
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
    } else if (data.user) {
      setSuccess(true)
      setTimeout(() => {
        router.refresh()
        router.push("/dashboard")
      }, 2000)
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
            Novo Registro de Operador
          </p>
        </div>

        {/* Mensagem de sucesso */}
        {success ? (
          <div className="p-4 text-sm text-green-400 bg-green-400/10 rounded-lg border border-green-400/30 text-center font-bold tracking-wider">
            ✓ ACESSO CRIADO COM SUCESSO!<br />
            <span className="text-xs font-normal opacity-80">Redirecionando para o painel...</span>
          </div>
        ) : (
          <>
            {/* Mensagem de erro */}
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/30 text-center font-medium">
                {error}
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-primary text-xs uppercase tracking-wider ml-1">
                  Nome do Operador
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Neo Anderson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="cyber-input"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-primary text-xs uppercase tracking-wider ml-1">
                  Email Corporativo
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="cyber-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="cpf" className="block text-primary text-xs uppercase tracking-wider ml-1">
                    CPF
                  </label>
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    required
                    maxLength={14}
                    className="cyber-input"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-primary text-xs uppercase tracking-wider ml-1">
                    WhatsApp
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    required
                    maxLength={15}
                    className="cyber-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-primary text-xs uppercase tracking-wider ml-1">
                  Definir Chave de Acesso
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="cyber-input"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-primary text-xs uppercase tracking-wider ml-1">
                  Confirmar Chave
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  "CRIAR ACESSO"
                )}
              </Button>
            </form>
          </>
        )}

        {/* Link para login */}
        <div className="text-center">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-primary text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Login
          </Link>
        </div>
      </main>
    </div>
  )
}
