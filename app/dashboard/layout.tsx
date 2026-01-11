import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await getSupabaseServerClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    // Buscar conversas recentes para a sidebar history
    const { data: conversations } = await supabase
        .from("conversations")
        .select(`
            *,
            agents (
                 name,
                 photo_url
            )
        `)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(30)

    // Buscar configurações (apenas chaves públicas necessárias)
    const { data: appSettings } = await supabase
        .from("app_settings")
        .select("key, value")
        .eq("key", "support_whatsapp")
        .single()

    const supportWhatsapp = appSettings?.value || null



    const availableCredits = profile ? Math.max(0, (profile.total_credits || 0) - (profile.used_credits || 0)) : 0

    return (
        <div className="min-h-screen bg-background relative flex flex-col">
            {/* Grid de fundo global */}
            <div className="cyber-grid fixed inset-0 z-0 pointer-events-none opacity-50" />

            {/* Layout com Sidebar e Main */}
            <div className="flex relative z-10 w-full min-h-screen">
                <Sidebar
                    conversations={conversations || []}
                    profile={profile}
                    availableCredits={availableCredits}
                    supportWhatsapp={supportWhatsapp}
                />

                <main className="flex-1 min-w-0 flex flex-col h-screen overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
