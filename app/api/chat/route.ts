import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import OpenAI from "openai"
import Anthropic from "@anthropic-ai/sdk"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

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

    // BUSCAR CONFIGURAÇÕES DO ADMIN
    const { data: aiSettings } = await supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["ai_provider", "ai_model", "gemini_api_key", "openai_api_key", "claude_api_key", "grok_api_key"])

    const settings: Record<string, string> = {}
    aiSettings?.forEach((setting: any) => {
      settings[setting.key] = setting.value
    })

    const provider = settings.ai_provider || "gemini"
    const model = settings.ai_model || "models/gemini-2.5-flash"
    const apiKey = settings[`${provider}_api_key`] || process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Chave de API não configurada" }, { status: 500 })
    }

    // Prompt do sistema
    const systemPrompt = `
    Você é ${agent.name}.
    Descrição: ${agent.description}
    Diretrizes: ${agent.system_prompt}
    
    Responda no idioma do usuário e mantenha a persona.
    `

    // BUSCAR HISTÓRICO
    let conversationHistory: any[] = []

    if (conversationId) {
      const { data: previousMessages } = await supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (previousMessages && previousMessages.length > 0) {
        conversationHistory = previousMessages
      }
    }

    // GERAR RESPOSTA BASEADO NO PROVIDER
    let botReply = ""

    switch (provider) {
      case "gemini": {
        const genAI = new GoogleGenerativeAI(apiKey)
        const geminiModel = genAI.getGenerativeModel({ model })

        const history = [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: "Entendido! Estou pronto para ajudar." }] },
        ]

        conversationHistory.forEach((msg) => {
          history.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          })
        })

        const chat = geminiModel.startChat({ history })
        const result = await chat.sendMessage(message)
        botReply = result.response.text()
        break
      }

      case "openai": {
        const openai = new OpenAI({ apiKey })

        const messages: any[] = [
          { role: "system", content: systemPrompt },
        ]

        conversationHistory.forEach((msg) => {
          messages.push({ role: msg.role, content: msg.content })
        })

        messages.push({ role: "user", content: message })

        const completion = await openai.chat.completions.create({
          model,
          messages,
          temperature: 0.7,
        })

        botReply = completion.choices[0]?.message?.content || ""
        break
      }

      case "claude": {
        const anthropic = new Anthropic({ apiKey })

        const messages: any[] = []

        conversationHistory.forEach((msg) => {
          messages.push({ role: msg.role, content: msg.content })
        })

        messages.push({ role: "user", content: message })

        const response = await anthropic.messages.create({
          model,
          max_tokens: 4096,
          system: systemPrompt,
          messages,
        })

        botReply = response.content[0]?.type === "text" ? response.content[0].text : ""
        break
      }

      case "grok": {
        // Grok usa API compatível com OpenAI
        const openai = new OpenAI({
          apiKey,
          baseURL: "https://api.x.ai/v1",
        })

        const messages: any[] = [
          { role: "system", content: systemPrompt },
        ]

        conversationHistory.forEach((msg) => {
          messages.push({ role: msg.role, content: msg.content })
        })

        messages.push({ role: "user", content: message })

        const completion = await openai.chat.completions.create({
          model,
          messages,
          temperature: 0.7,
        })

        botReply = completion.choices[0]?.message?.content || ""
        break
      }

      default:
        return NextResponse.json({ error: "Provider não suportado" }, { status: 400 })
    }

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

    // Atualizar créditos
    await supabase
      .from("profiles")
      .update({ used_credits: (profile?.used_credits || 0) + 1 })
      .eq("id", userId)

    // Log
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
      remainingCredits: availableCredits - 1,
    })
  } catch (error: any) {
    console.error("Erro no chat:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
