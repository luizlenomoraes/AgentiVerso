import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()

    // 1. SEGURANÇA: Verificar autenticação primeiro
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Agora é seguro usar user.id
    const userId = user.id 

    // Não pegue userId do body!
    const { agentId, message } = await request.json() 

    if (!message || !agentId) {
       return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    // Get user profile and check credits
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (!profile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 })
    }

    const availableCredits = (profile.total_credits || 0) - (profile.used_credits || 0)

    if (availableCredits <= 0) {
      return NextResponse.json({ error: "Créditos insuficientes" }, { status: 403 })
    }

    // Get agent
    const { data: agent } = await supabase.from("agents").select("*").eq("id", agentId).single()

    if (!agent) {
      return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 })
    }

    // Simulate AI response 
    const aiResponse = `Olá! Eu sou ${agent.name}. ${agent.description}\n\nVocê perguntou: "${message}"...`

    // Update credits
    // Melhoria: Tentar incrementar atomicamente seria melhor, mas aqui pelo menos usamos o ID seguro
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ used_credits: profile.used_credits + 1 }) // Ainda tem risco de Race Condition aqui, ideal mover para RPC
      .eq("id", userId)

    if (updateError) {
      console.error("[v0] Error updating credits:", updateError)
    }

    // Log usage
    await supabase.from("usage_logs").insert({
      user_id: userId,
      agent_id: agentId,
      user_query: message,
      bot_response: aiResponse,
      tokens_used: 1,
    })

    return NextResponse.json({
      response: aiResponse,
      remainingCredits: availableCredits - 1,
    })
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
