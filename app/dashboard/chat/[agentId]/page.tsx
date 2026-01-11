import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ChatInterface } from "@/components/chat-interface"

export default async function ChatPage(props: {
  params: Promise<{ agentId: string }>,
  searchParams: Promise<{ conversation?: string }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams

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
  const availableCredits = Math.max(0, (profile?.total_credits || 0) - (profile?.used_credits || 0))

  // 3. BUSCAR HISTÓRICO DE CONVERSA
  let targetConversationId = searchParams.conversation

  // Se não veio ID na URL, busca a última conversa deste agente
  if (!targetConversationId) {
    const { data: latestChat } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", user.id)
      .eq("agent_id", params.agentId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    targetConversationId = latestChat?.id
  }

  let initialMessages = []

  if (targetConversationId) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", targetConversationId)
      .order("created_at", { ascending: true })

    initialMessages = msgs || []
  }

  return (
    <ChatInterface
      agent={agent}
      userId={user.id}
      availableCredits={availableCredits}
      initialMessages={initialMessages}
      initialConversationId={targetConversationId}
    />
  )
}
