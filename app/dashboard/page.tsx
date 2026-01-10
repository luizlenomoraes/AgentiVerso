import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/components/dashboard-content"
import { CombosShowcase } from "@/components/combos-showcase"

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch agents with monetization columns
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
  let userAgentAccess: string[] = []
  try {
    const { data: accessData } = await supabase
      .from("user_agent_access")
      .select("agent_id")
      .eq("user_id", user.id)

    userAgentAccess = accessData?.map(a => a.agent_id) || []
  } catch {
    // Table doesn't exist yet
  }

  // Fetch active combos with their agents
  let combos: any[] = []
  try {
    const { data: combosData } = await supabase
      .from("agent_combos")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (combosData && combosData.length > 0) {
      // Fetch agents for each combo
      const combosWithAgents = await Promise.all(
        combosData.map(async (combo) => {
          const { data: comboAgents } = await supabase
            .from("combo_agents")
            .select("agent_id, agents(id, name, photo_url)")
            .eq("combo_id", combo.id)

          return {
            ...combo,
            agents: comboAgents?.map((ca: any) => ca.agents).filter(Boolean) || []
          }
        })
      )
      combos = combosWithAgents
    }
  } catch {
    // Tables don't exist yet
  }

  const calculatedCredits = (profile?.total_credits || 0) - (profile?.used_credits || 0)
  const availableCredits = Math.max(0, calculatedCredits)

  return (
    <div className="space-y-8">
      {/* Combos Section - shows only if there are active combos */}
      {combos.length > 0 && (
        <div className="container mx-auto px-4 pt-8">
          <CombosShowcase combos={combos} />
        </div>
      )}

      <DashboardContent
        profile={profile}
        agents={agents || []}
        categories={categories || []}
        conversations={conversations || []}
        usageLogs={usageLogs || []}
        availableCredits={availableCredits}
        userAgentAccess={userAgentAccess}
      />
    </div>
  )
}
