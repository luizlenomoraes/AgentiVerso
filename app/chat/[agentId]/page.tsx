import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ChatInterface } from "@/components/chat-interface"

export default async function ChatPage({ params }: { params: { agentId: string } }) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // 1. Buscar Agente
  const { data: agent } = await supabase.from("agents").select("*, categories(name)").eq("id", params.agentId).single()

  if (!agent) {
    redirect("/dashboard")
  }

  // 2. Buscar Créditos
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  const availableCredits = (profile?.total_credits || 0) - (profile?.used_credits || 0)

  // 3. BUSCAR HISTÓRICO DE CONVERSA (NOVO)
  // Pegamos a última conversa ativa para este agente/usuário
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("user_id", user.id)
    .eq("agent_id", params.agentId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single()

  let initialMessages = []
  
  if (conversation) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true }) // Ordem cronológica
    
    initialMessages = msgs || []
  }

  return (
    <ChatInterface 
      agent={agent} 
      userId={user.id} 
      availableCredits={availableCredits}
      initialMessages={initialMessages}        // Passa o histórico
      initialConversationId={conversation?.id} // Passa o ID para continuar a mesma conversa
    />
  )
}
