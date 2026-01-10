import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/components/dashboard-content"

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch agents with is_free column (if exists)
  const { data: agents } = await supabase
    .from("agents")
    .select("*, categories(id, name, slug)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })

  const { data: categories } = await supabase.from("categories").select("*").order("name")

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*, agent_id, agents(name, photo_url)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(5)

  const { data: usageLogs } = await supabase
    .from("usage_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  // Fetch user's agent access (for premium agents)
  // This may fail if table doesn't exist yet, so we handle gracefully
  let userAgentAccess: string[] = []
  try {
    const { data: accessData } = await supabase
      .from("user_agent_access")
      .select("agent_id")
      .eq("user_id", user.id)

    userAgentAccess = accessData?.map(a => a.agent_id) || []
  } catch {
    // Table doesn't exist yet, all agents are accessible
  }

  const calculatedCredits = (profile?.total_credits || 0) - (profile?.used_credits || 0)
  const availableCredits = Math.max(0, calculatedCredits)

  return (
    <DashboardContent
      profile={profile}
      agents={agents || []}
      categories={categories || []}
      conversations={conversations || []}
      usageLogs={usageLogs || []}
      availableCredits={availableCredits}
      userAgentAccess={userAgentAccess}
    />
  )
}
