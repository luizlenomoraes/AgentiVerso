import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import OpenAI from "openai"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const provider = searchParams.get("provider")
        const apiKey = searchParams.get("apiKey")

        if (!provider || !apiKey) {
            return NextResponse.json({ error: "Provider e API Key são obrigatórios" }, { status: 400 })
        }

        let models: Array<{ value: string; label: string }> = []

        switch (provider) {
            case "gemini":
                try {
                    const genAI = new GoogleGenerativeAI(apiKey)
                    const response = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
                    )
                    const data = await response.json()

                    if (data.models) {
                        models = data.models
                            .filter((model: any) =>
                                model.supportedGenerationMethods?.includes("generateContent")
                            )
                            .map((model: any) => ({
                                value: model.name,
                                label: model.displayName || model.name,
                            }))
                    }
                } catch (error) {
                    console.error("Erro ao buscar modelos Gemini:", error)
                    return NextResponse.json({ error: "Chave Gemini inválida" }, { status: 401 })
                }
                break

            case "openai":
                try {
                    const openai = new OpenAI({ apiKey })
                    const response = await openai.models.list()

                    // Filtrar apenas modelos de chat
                    models = response.data
                        .filter((model) =>
                            model.id.includes("gpt") ||
                            model.id.includes("o1") ||
                            model.id.includes("o3")
                        )
                        .map((model) => ({
                            value: model.id,
                            label: model.id,
                        }))
                        .sort((a, b) => b.label.localeCompare(a.label))
                } catch (error) {
                    console.error("Erro ao buscar modelos OpenAI:", error)
                    return NextResponse.json({ error: "Chave OpenAI inválida" }, { status: 401 })
                }
                break

            case "claude":
                // Anthropic não tem endpoint público de listagem
                // Modelos baseados na documentação oficial
                models = [
                    { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet (Melhor)" },
                    { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku (Rápido)" },
                    { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
                    { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" },
                    { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
                ]
                break

            case "grok":
                // xAI também não tem endpoint público ainda
                // Modelos baseados na documentação
                models = [
                    { value: "grok-2-1212", label: "Grok 2 (Última versão)" },
                    { value: "grok-2-vision-1212", label: "Grok 2 Vision" },
                    { value: "grok-beta", label: "Grok Beta" },
                ]
                break

            default:
                return NextResponse.json({ error: "Provider não suportado" }, { status: 400 })
        }

        return NextResponse.json({ models })
    } catch (error: any) {
        console.error("Erro ao listar modelos:", error)
        return NextResponse.json(
            { error: error.message || "Erro ao buscar modelos" },
            { status: 500 }
        )
    }
}
