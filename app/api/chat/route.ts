import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    
    // 1. SEGURANÇA: Autenticação
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // --- LÓGICA DE CHAVE DINÂMICA ---
    // Tentar buscar a chave no banco de dados
    const { data: dbKey } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "openai_api_key")
      .single()

    // Usar chave do banco OU variável de ambiente
    const apiKey = dbKey?.value || process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Chave da API OpenAI não configurada no Admin." }, { status: 500 })
    }

    const openai = new OpenAI({ apiKey })
    // ---------------------------------

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

    // 2. RAG: Busca Vetorial de Conhecimento
    let contextText = ""
    
    try {
      // Gerar embedding da pergunta do usuário
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: message.replace(/\n/g, " "),
      })
      const embedding = embeddingResponse.data[0].embedding

      // Buscar no Supabase (usando a função RPC)
      const { data: documents } = await supabase.rpc("match_knowledge", {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 5,
        p_agent_id: agentId,
      })

      if (documents && documents.length > 0) {
        contextText = documents.map((doc: any) => doc.content).join("\n---\n")
      }
    } catch (err) {
      console.error("Erro no processo de embedding/busca:", err)
      // Segue sem contexto se falhar
    }

    // 3. IA: Geração da Resposta
    const systemMessage = `
    Você é ${agent.name}.
    Descrição: ${agent.description}
    Diretrizes de Comportamento: ${agent.system_prompt}
    
    Base de Conhecimento (Contexto):
    ${contextText ? contextText : "Nenhuma informação extra disponível no momento."}
    
    Instruções:
    - Use o contexto acima para responder se for relevante.
    - Se a resposta não estiver no contexto, use seu conhecimento geral, mas mantenha a persona.
    - Responda no idioma do usuário.
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    })

    const aiResponse = completion.choices[0].message.content || "Desculpe, não consegui processar sua resposta."

    // 4. PERSISTÊNCIA E COBRANÇA
    let currentConversationId = conversationId

    // Criar conversa se não existir
    if (!currentConversationId) {
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({
          user_id: userId,
          agent_id: agentId,
          title: message.substring(0, 30) + "...",
        })
        .select()
        .single()

      if (convError) throw convError
      currentConversationId = newConv.id
    }

    // Salvar mensagens
    await supabase.from("messages").insert([
      { conversation_id: currentConversationId, user_id: userId, role: "user", content: message },
      { conversation_id: currentConversationId, role: "assistant", content: aiResponse }
    ])

    // Atualizar créditos e logs
    await supabase.from("profiles").update({ used_credits: profile.used_credits + 1 }).eq("id", userId)

    await supabase.from("usage_logs").insert({
      user_id: userId,
      agent_id: agentId,
      user_query: message,
      bot_response: aiResponse,
      tokens_used: completion.usage?.total_tokens || 0,
    })

    return NextResponse.json({
      response: aiResponse,
      conversationId: currentConversationId,
      remainingCredits: availableCredits - 1,
    })

  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
