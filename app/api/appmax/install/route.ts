import { NextResponse } from "next/server"

/**
 * Endpoint de validação/instalação do aplicativo Appmax
 * 
 * A Appmax envia um POST para esta URL quando um merchant instala o aplicativo.
 * Devemos retornar HTTP 200 com um external_id para confirmar a instalação.
 * 
 * Documentação: Seção 2.4 - Health check no aplicativo
 */

interface AppmaxInstallPayload {
    app_id: string;
    client_id: string;
    client_secret: string;
    external_key?: string;
}

export async function POST(request: Request) {
    try {
        const payload: AppmaxInstallPayload = await request.json()

        console.log("[Appmax Install] Instalação recebida:", {
            app_id: payload.app_id,
            external_key: payload.external_key,
            // Não logar secrets
        })

        // IMPORTANTE: Aqui você deve salvar as credenciais do merchant
        // Por enquanto, como temos apenas um merchant (você), 
        // as credenciais estão nas variáveis de ambiente.

        // Para um sistema multi-tenant, você salvaria:
        // - payload.client_id
        // - payload.client_secret
        // - payload.external_key
        // Em uma tabela de merchants no banco

        // Gerar um external_id único para esta instalação
        const externalId = `agentiverso-${Date.now()}`

        // Retornar HTTP 200 com external_id conforme documentação
        return NextResponse.json({
            external_id: externalId
        }, { status: 200 })

    } catch (error) {
        console.error("[Appmax Install] Erro:", error)
        return NextResponse.json({
            error: "Falha ao processar instalação"
        }, { status: 500 })
    }
}

// GET para verificar se o endpoint está ativo
export async function GET() {
    return NextResponse.json({
        status: "active",
        message: "Appmax installation validation endpoint",
        version: "1.0"
    }, { status: 200 })
}
