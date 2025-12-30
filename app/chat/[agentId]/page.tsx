import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ChatInterface } from "@/components/chat-interface"

export default async function ChatPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: agent } = await supabase.from("agents").select("*, categories(name)").eq("id", agentId).single()

  if (!agent) {
    redirect("/dashboard")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const availableCredits = (profile?.total_credits || 0) - (profile?.used_credits || 0)

  return <ChatInterface agent={agent} userId={user.id} availableCredits={availableCredits} />
}
