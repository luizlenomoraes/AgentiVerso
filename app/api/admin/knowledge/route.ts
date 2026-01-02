import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import OpenAI from "openai"

export async function POST(request: Request) {
    try {
        const supabase = await getSupabaseServerClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        // Verificar se é admin
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

        if (profile?.role !== "admin") {
            return NextResponse.json({ error: "Apenas admins podem gerenciar conhecimento" }, { status: 403 })
        }

        const formData = await request.formData()
        const agentId = formData.get("agentId") as string
        const content = formData.get("content") as string
        const title = formData.get("title") as string || "Documento sem título"

        if (!agentId || !content) {
            return NextResponse.json({ error: "agentId e content são obrigatórios" }, { status: 400 })
        }

        // Buscar configurações de IA
        const { data: aiSettings } = await supabase
            .from("app_settings")
            .select("key, value")
            .in("key", ["ai_provider", "gemini_api_key", "openai_api_key"])

        const settings: Record<string, string> = {}
        aiSettings?.forEach((setting: any) => {
            settings[setting.key] = setting.value
        })

        const provider = settings.ai_provider || "gemini"
        let embedding: number[] = []

        // Gerar embedding baseado no provider
        if (provider === "gemini") {
            const apiKey = settings.gemini_api_key || process.env.GEMINI_API_KEY
            if (!apiKey) {
                return NextResponse.json({ error: "Gemini API key não configurada" }, { status: 500 })
            }

            const genAI = new GoogleGenerativeAI(apiKey)
            const model = genAI.getGenerativeModel({ model: "text-embedding-004" })

            const result = await model.embedContent(content)
            embedding = result.embedding.values
        } else {
            // OpenAI
            const apiKey = settings.openai_api_key || process.env.OPENAI_API_KEY
            if (!apiKey) {
                return NextResponse.json({ error: "OpenAI API key não configurada" }, { status: 500 })
            }

            const openai = new OpenAI({ apiKey })
            const response = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: content.replace(/\n/g, " "),
            })
            embedding = response.data[0].embedding
        }

        // Salvar no banco
        const { data, error } = await supabase
            .from("agent_knowledge")
            .insert({
                agent_id: agentId,
                content,
                embedding,
                metadata: { title },
            })
            .select()
            .single()

        if (error) {
            console.error("Erro ao salvar:", error)
            return NextResponse.json({ error: "Erro ao salvar documento" }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            document: data,
            message: "Documento adicionado à base de conhecimento!"
        })
    } catch (error: any) {
        console.error("Erro no upload:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// Listar documentos de um agente
export async function GET(request: Request) {
    try {
        const supabase = await getSupabaseServerClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const agentId = searchParams.get("agentId")

        if (!agentId) {
            return NextResponse.json({ error: "agentId é obrigatório" }, { status: 400 })
        }

        const { data, error } = await supabase
            .from("agent_knowledge")
            .select("id, content, metadata, created_at")
            .eq("agent_id", agentId)
            .order("created_at", { ascending: false })

        if (error) {
            return NextResponse.json({ error: "Erro ao buscar documentos" }, { status: 500 })
        }

        return NextResponse.json({ documents: data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// Deletar documento
export async function DELETE(request: Request) {
    try {
        const supabase = await getSupabaseServerClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const documentId = searchParams.get("id")

        if (!documentId) {
            return NextResponse.json({ error: "id é obrigatório" }, { status: 400 })
        }

        const { error } = await supabase
            .from("agent_knowledge")
            .delete()
            .eq("id", documentId)

        if (error) {
            return NextResponse.json({ error: "Erro ao deletar" }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
