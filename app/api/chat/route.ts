import { getSupabaseServerClient } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"
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

    // Segurança: Verificar permissão de acesso ao agente
    if (!agent.is_public && agent.user_id !== userId) {
      // Verificar se o usuário é admin
      const { data: requesterProfile } = await supabase.from("profiles").select("is_admin").eq("id", userId).single()

      if (!requesterProfile?.is_admin) {
        return NextResponse.json({ error: "Acesso negado a este agente privado" }, { status: 403 })
      }
    }

    // BUSCAR CONFIGURAÇÕES DO ADMIN (Usando Service Role para bypass RLS)
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: aiSettings } = await adminSupabase
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

    // ============================================
    // RAG: BUSCA NA BASE DE CONHECIMENTO
    // ============================================
    let contextText = ""

    try {
      // Gerar embedding da pergunta do usuário
      let queryEmbedding: number[] = []

      if (provider === "gemini") {
        const genAI = new GoogleGenerativeAI(apiKey)
        const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" })
        const result = await embeddingModel.embedContent(message)
        queryEmbedding = result.embedding.values
      } else {
        // OpenAI (também funciona para outros providers)
        const openai = new OpenAI({ apiKey })
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: message.replace(/\n/g, " "),
        })
        queryEmbedding = embeddingResponse.data[0].embedding
      }

      // Buscar documentos relevantes no Supabase
      const { data: documents } = await supabase.rpc("match_knowledge", {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: 5,
        p_agent_id: agentId,
      })

      if (documents && documents.length > 0) {
        contextText = documents.map((doc: any) => doc.content).join("\n---\n")
        console.log(`RAG: ${documents.length} documentos encontrados`)
      }
    } catch (err) {
      console.error("Erro no RAG:", err)
      // Continua sem contexto se falhar
    }

    // Atualizar system prompt com contexto
    const enrichedSystemPrompt = contextText
      ? `${systemPrompt}
      
CONTEXTO DA BASE DE CONHECIMENTO:
${contextText}

INSTRUÇÕES:
- Use as informações acima para responder se forem relevantes
- Se a resposta não estiver no contexto, use seu conhecimento geral
- Sempre mantenha a persona do agente
`
      : systemPrompt

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

    // TRACKING USE
    let totalTokens = 0

    switch (provider) {
      case "gemini": {
        const genAI = new GoogleGenerativeAI(apiKey)
        const geminiModel = genAI.getGenerativeModel({ model })

        const history = [
          { role: "user", parts: [{ text: enrichedSystemPrompt }] },
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

        // Gemini Token Count
        const usage = result.response.usageMetadata
        if (usage) {
          totalTokens = (usage.promptTokenCount || 0) + (usage.candidatesTokenCount || 0)
        }
        break
      }

      case "openai": {
        const openai = new OpenAI({ apiKey })

        const messages: any[] = [
          { role: "system", content: enrichedSystemPrompt },
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

        // OpenAI Token Count
        if (completion.usage) {
          totalTokens = completion.usage.total_tokens
        }
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
          system: enrichedSystemPrompt,
          messages,
        })

        botReply = response.content[0]?.type === "text" ? response.content[0].text : ""

        // Claude Token Count
        if (response.usage) {
          totalTokens = response.usage.input_tokens + response.usage.output_tokens
        }
        break
      }

      case "grok": {
        // Grok usa API compatível com OpenAI
        const openai = new OpenAI({
          apiKey,
          baseURL: "https://api.x.ai/v1",
        })

        const messages: any[] = [
          { role: "system", content: enrichedSystemPrompt },
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

        // Grok Token Count
        if (completion.usage) {
          totalTokens = completion.usage.total_tokens
        }
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

    // Atualizar créditos (Fracionado)
    const cost = Math.max(0.1, totalTokens / 1000)

    // Se totalTokens for 0 (fallback se API não retornou usage), estimamos
    const finalTokens = totalTokens > 0 ? totalTokens : Math.ceil((message.length + botReply.length) / 4)
    const exactCost = finalTokens / 1000

    await supabase
      .from("profiles")
      .update({ used_credits: (profile?.used_credits || 0) + exactCost })
      .eq("id", userId)

    // Log
    await supabase.from("usage_logs").insert({
      user_id: userId,
      agent_id: agentId,
      user_query: message,
      bot_response: botReply,
      tokens_used: finalTokens,
    })

    return NextResponse.json({
      reply: botReply,
      conversationId: currentConversationId,
      remainingCredits: Math.max(0, availableCredits - exactCost),
    })
  } catch (error: any) {
    console.error("Erro no chat:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
