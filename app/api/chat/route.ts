import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()

    // 1. SEGURANÇA: Autenticação
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Chave Gemini
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Chave Gemini não configurada" }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const userId = user.id
    const { agentId, message, conversationId } = await request.json()

    // Validação de saldo
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()
    const availableCredits = (profile?.total_credits || 0) - (profile?.used_credits || 0)

    if (availableCredits <= 0) {
      return NextResponse.json({ error: "Créditos insuficientes" }, { status: 403 })
    }

    const { data: agent } = await supabase.from("agents").select("*").eq("id", agentId).single()
    if (!agent) {
      return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 })
    }

    // Prompt do sistema
    const systemPrompt = `
    Você é ${agent.name}.
    Descrição: ${agent.description}
    Diretrizes: ${agent.system_prompt}
    
    Responda no idioma do usuário e mantenha a persona.
    `

    // Gerar resposta com Gemini
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "Entendido! Estou pronto para ajudar." }],
        },
      ],
    })

    const result = await chat.sendMessage(message)
    const response = await result.response
    const botReply = response.text()

    // Gerenciar conversa
    let currentConversationId = conversationId

    if (!currentConversationId) {
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({
          user_id: userId,
          agent_id: agentId,
          title: message.substring(0, 50) + "...",
        })
        .select()
        .single()

      currentConversationId = newConv?.id
    }

    // Salvar mensagens
    await supabase.from("messages").insert([
      {
        conversation_id: currentConversationId,
        user_id: userId,
        role: "user",
        content: message,
      },
      {
        conversation_id: currentConversationId,
        user_id: userId,
        role: "assistant",
        content: botReply,
      },
    ])

    // Atualizar créditos e logs
    await supabase
      .from("profiles")
      .update({ used_credits: (profile?.used_credits || 0) + 1 })
      .eq("id", userId)

    await supabase.from("usage_logs").insert({
      user_id: userId,
      agent_id: agentId,
      user_query: message,
      bot_response: botReply,
      tokens_used: Math.ceil(botReply.length / 4),
    })

    return NextResponse.json({
      reply: botReply,
      conversationId: currentConversationId,
    })
  } catch (error: any) {
    console.error("Erro no chat:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
