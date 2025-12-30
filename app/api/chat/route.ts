import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { agentId, message, userId } = await request.json()

    const supabase = await getSupabaseServerClient()

    // Get user profile and check credits
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (!profile) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const availableCredits = profile.total_credits - profile.used_credits

    if (availableCredits <= 0) {
      return NextResponse.json({ error: "Créditos insuficientes" }, { status: 403 })
    }

    // Get agent
    const { data: agent } = await supabase.from("agents").select("*").eq("id", agentId).single()

    if (!agent) {
      return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 })
    }

    // Simulate AI response (in production, integrate with OpenAI/Gemini + RAG)
    const aiResponse = `Olá! Eu sou ${agent.name}. ${agent.description}\n\nVocê perguntou: "${message}"\n\nEsta é uma resposta simulada. Em produção, aqui seria integrado com OpenAI/Gemini e a base de conhecimento RAG para fornecer respostas contextualizadas.`

    // Update credits
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ used_credits: profile.used_credits + 1 })
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
