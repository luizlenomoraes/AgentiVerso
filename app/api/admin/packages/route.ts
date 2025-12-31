import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const supabase = await getSupabaseServerClient()
        const { data: packages, error } = await supabase
            .from("credit_packages")
            .select("*")
            .order("price", { ascending: true })

        if (error) {
            // Retorno padrão se a tabela não existir ainda
            return NextResponse.json([
                { id: "1", name: "Bronze", amount: 100, price: 29.90 },
                { id: "2", name: "Prata", amount: 500, price: 99.90 },
                { id: "3", name: "Ouro", amount: 2000, price: 299.90 },
            ])
        }

        return NextResponse.json(packages)
    } catch (error) {
        return NextResponse.json({ error: "Erro interno" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await getSupabaseServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

        const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
        if (!profile?.is_admin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 })

        const body = await request.json() // Espera o array completo de pacotes

        // Limpa os antigos e insere os novos (estratégia simples)
        await supabase.from("credit_packages").delete().neq("id", "00000000-0000-0000-0000-000000000000") // deleta tudo

        const { error } = await supabase.from("credit_packages").insert(
            body.map((p: any) => ({
                name: p.name,
                amount: parseInt(p.amount),
                price: parseFloat(p.price),
            }))
        )

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
