import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"

// Lazy initialization para evitar erros de build
function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

function getMercadoPagoClient() {
    return new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })
}

export async function POST(request: Request) {
    try {
        // Parse o body da requisição
        const body = await request.json().catch(() => ({}))

        // O Mercado Pago pode enviar via query params OU body
        const url = new URL(request.url)

        // Extrair dados do body (formato novo) ou query params (formato antigo)
        const topic = body.type || body.action || url.searchParams.get("topic") || url.searchParams.get("type")
        const dataId = body.data?.id || url.searchParams.get("id") || url.searchParams.get("data.id")

        console.log("Webhook recebido:", { topic, dataId, body })

        // Ignorar se não for notificação de pagamento
        if (!topic?.includes("payment") || !dataId) {
            console.log("Notificação ignorada:", topic)
            return NextResponse.json({ status: "ignored" }, { status: 200 })
        }

        // Consultar o status real do pagamento no Mercado Pago (Segurança)
        const mpClient = getMercadoPagoClient()
        const payment = new Payment(mpClient)
        const paymentData = await payment.get({ id: dataId })

        if (!paymentData) {
            console.error("Pagamento não encontrado:", dataId)
            return NextResponse.json({ error: "Payment not found" }, { status: 404 })
        }

        console.log("Status do pagamento:", paymentData.status)

        // Pegar o ID da nossa transação que enviamos no metadata
        const internalTxId = paymentData.metadata?.transaction_id
        const status = paymentData.status // approved, pending, rejected

        if (internalTxId) {
            // Atualizar a tabela transactions
            // O Trigger 'handle_payment_approval' vai rodar automaticamente
            const supabaseAdmin = getSupabaseAdmin()
            const { error } = await supabaseAdmin
                .from("transactions")
                .update({
                    status: status,
                    external_id: String(paymentData.id)
                })
                .eq("id", internalTxId)

            if (error) {
                console.error("Erro ao atualizar transação:", error)
                return NextResponse.json({ error: "DB Error" }, { status: 500 })
            }

            console.log("Transação atualizada:", internalTxId, "->", status)
        } else {
            console.log("Sem transaction_id no metadata")
        }

        return NextResponse.json({ status: "ok" }, { status: 200 })

    } catch (error: any) {
        console.error("Webhook error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}

// Aceitar também GET para verificação do Mercado Pago
export async function GET() {
    return NextResponse.json({ status: "webhook active" }, { status: 200 })
}
