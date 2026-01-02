import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"

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

    return (
        <div className="min-h-screen bg-background relative flex flex-col">
            {/* Grid de fundo global */}
            <div className="cyber-grid fixed inset-0 z-0 pointer-events-none" />

            {/* Header Global do Dashboard */}
            <DashboardHeader profile={profile} />

            <main className="flex-1 relative z-10">
                {children}
            </main>
        </div>
    )
}
