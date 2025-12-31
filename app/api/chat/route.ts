import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    
    // 1. SEGURANÇA: Pegar usuário da sessão
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

    // 2. PERSISTÊNCIA: Gerenciar Conversa e Mensagens
    let currentConversationId = conversationId

    // Se não veio ID da conversa, cria uma nova
    if (!currentConversationId) {
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({
          user_id: userId,
          agent_id: agentId,
          title: message.substring(0, 30) + "...", // Título automático baseado na 1ª msg
        })
        .select()
        .single()

      if (convError) throw convError
      currentConversationId = newConv.id
    }

    // Salvar mensagem do Usuário
    await supabase.from("messages").insert({
      conversation_id: currentConversationId,
      user_id: userId,
      role: "user",
      content: message,
    })

    // --- SIMULAÇÃO DA IA ---
    // (Futuramente você trocará isso pela chamada ao OpenAI/Gemini)
    const aiResponse = `[Simulação] Olá! Sou o ${agent.name}. Recebi sua mensagem: "${message}". Minha diretriz é: ${agent.system_prompt.substring(0, 50)}...`
    // -----------------------

    // Salvar resposta da IA
    await supabase.from("messages").insert({
      conversation_id: currentConversationId,
      // user_id fica NULL para mensagens do sistema/assistant, ou pode por o ID do bot se tiver
      role: "assistant",
      content: aiResponse,
    })

    // 3. ATUALIZAÇÃO: Descontar crédito e Logar
    await supabase.from("profiles").update({ used_credits: profile.used_credits + 1 }).eq("id", userId)

    await supabase.from("usage_logs").insert({
      user_id: userId,
      agent_id: agentId,
      user_query: message,
      bot_response: aiResponse,
      tokens_used: 1,
    })

    return NextResponse.json({
      response: aiResponse,
      conversationId: currentConversationId, // Retorna o ID para o front manter o contexto
      remainingCredits: availableCredits - 1,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
