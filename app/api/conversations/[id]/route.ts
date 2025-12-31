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

        // 1. Deletar as mensagens da conversa primeiro
        await supabase.from("messages").delete().eq("conversation_id", id)

        // 2. Deletar a conversa
        const { error } = await supabase
            .from("conversations")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id) // Garante que o usuário só delete a própria conversa

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Delete conversation error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
