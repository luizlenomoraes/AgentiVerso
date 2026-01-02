import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { KnowledgeManager } from "@/components/knowledge-manager"

export default async function AgentKnowledgePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await getSupabaseServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "admin") redirect("/dashboard")

    const { data: agent } = await supabase.from("agents").select("*").eq("id", id).single()
    if (!agent) redirect("/admin")

    // Buscar documentos existentes
    const { data: documents } = await supabase
        .from("agent_knowledge")
        .select("*")
        .eq("agent_id", id)
        .order("created_at", { ascending: false })

    return <KnowledgeManager agent={agent} initialDocuments={documents || []} />
}
