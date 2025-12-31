import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Buscar configurações
export async function GET() {
    try {
        const supabase = await getSupabaseServerClient()

        // Tentamos buscar da tabela 'app_settings'
        // Se a tabela não existir, retornaremos valores padrão do .env para não quebrar
        const { data: settings, error } = await supabase
            .from("app_settings")
            .select("*")

        if (error) {
            return NextResponse.json({
                openai_api_key: process.env.OPENAI_API_KEY || "",
                default_model: "gpt-4o",
            })
        }

        // Transformamos a lista [ {key, value} ] em um objeto amigável
        const config: any = {}
        settings?.forEach(s => {
            config[s.key] = s.value
        })

        return NextResponse.json(config)
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar configurações" }, { status: 500 })
    }
}

// Salvar configurações
export async function POST(request: Request) {
    try {
        const supabase = await getSupabaseServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

        // Verifica se é admin
        const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
        if (!profile?.is_admin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 })

        const body = await request.json()

        // Upsert em massa (para cada chave enviada)
        for (const key in body) {
            await supabase
                .from("app_settings")
                .upsert({ key, value: body[key] }, { onConflict: "key" })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
    }
}
