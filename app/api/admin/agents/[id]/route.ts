import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const supabase = await getSupabaseServerClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        // Verifica se é admin
        const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

        if (!profile?.is_admin) {
            return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
        }

        // 1. Limpar logs de uso (para evitar erro de FK)
        await supabase.from("usage_logs").delete().eq("agent_id", id)

        // 2. Limpar conversas vinculadas
        await supabase.from("conversations").delete().eq("agent_id", id)

        // 3. Finalmente deletar o agente
        const { error } = await supabase.from("agents").delete().eq("id", id)

        if (error) {
            console.error("Erro ao deletar agente:", error)
            return NextResponse.json({ error: "Erro ao deletar agente" }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete Error:", error)
        return NextResponse.json({ error: "Erro interno" }, { status: 500 })
    }
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const supabase = await getSupabaseServerClient()

        // Buscar o agente específico para edição
        const { data: agent, error } = await supabase
            .from("agents")
            .select("*")
            .eq("id", id)
            .single()

        if (error) return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 })

        return NextResponse.json(agent)
    } catch (error) {
        return NextResponse.json({ error: "Erro interno" }, { status: 500 })
    }
}
