import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

/**
 * Webhook para receber notificações da Appmax
 * 
 * Eventos tratados (baseado na documentação oficial):
 * - order_paid: Pedido pago
 * - order_approved: Pedido aprovado
 * - order_paid_by_pix: Pix pago
 * - order_refund: Pedido estornado
 * - order_up_sold: Upsell pago
 */

// Lazy initialization para evitar erros de build
function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

// Interface do payload do webhook Appmax (baseado na documentação)
interface AppmaxWebhookPayload {
    event: string;
    event_type: string;
    data: {
        order?: {
            id: number;
            status: string;
            total_paid?: number;
        };
        customer?: {
            id: number;
            name: string;
            email: string;
            document_number?: string;
        };
        payment?: {
            method: string;
            installments?: number;
            card?: {
                brand: string;
                number: string;
            };
            upsell_hash?: string;
        };
    };
}

// Eventos que indicam pagamento aprovado
const APPROVED_EVENTS = [
    "order_paid",
    "order_approved",
    "order_paid_by_pix",
    "order_integrated",
];

// Eventos que indicam estorno
const REFUND_EVENTS = [
    "order_refund",
];

// Eventos de upsell
const UPSELL_EVENTS = [
    "order_up_sold",
];

export async function POST(request: Request) {
    try {
        const payload: AppmaxWebhookPayload = await request.json()

        console.log("[Appmax Webhook] Evento recebido:", payload.event)

        const supabaseAdmin = getSupabaseAdmin()
        const orderId = payload.data.order?.id

        // Validar se temos o order_id
        if (!orderId) {
            console.log("[Appmax Webhook] Sem order_id no payload")
            // Retorna 200 para não causar reenvios
            return NextResponse.json({ status: "ignored", reason: "no_order_id" })
        }

        // Buscar transação pelo appmax_order_id
        const { data: transaction, error: txFindError } = await supabaseAdmin
            .from("transactions")
            .select("*, profiles!inner(id, credits)")
            .eq("appmax_order_id", String(orderId))
            .single()

        if (txFindError || !transaction) {
            console.log("[Appmax Webhook] Transação não encontrada para order:", orderId)
            // Retorna 200 para não causar reenvios
            return NextResponse.json({ status: "ignored", reason: "transaction_not_found" })
        }

        // Processar eventos de aprovação
        if (APPROVED_EVENTS.includes(payload.event)) {
            // Verificar se já foi processado (evitar duplicação de créditos)
            if (transaction.status === "approved") {
                console.log("[Appmax Webhook] Transação já processada:", orderId)
                return NextResponse.json({ status: "already_processed" })
            }

            // 1. Atualizar transação para approved
            const { error: txUpdateError } = await supabaseAdmin
                .from("transactions")
                .update({
                    status: "approved",
                    payment_method: payload.data.payment?.method || transaction.payment_method,
                })
                .eq("id", transaction.id)

            if (txUpdateError) {
                console.error("[Appmax Webhook] Erro ao atualizar transação:", txUpdateError)
                return NextResponse.json({ status: "error", message: "DB Error" })
            }

            // 2. Calcular créditos a adicionar
            // Buscar o pacote pela transação ou calcular pelo amount
            const { data: pkg } = await supabaseAdmin
                .from("credit_packages")
                .select("amount")
                .eq("price", transaction.amount)
                .single()

            const creditsToAdd = pkg?.amount || 0

            if (creditsToAdd > 0) {
                // 3. Incrementar créditos do usuário
                const currentCredits = transaction.profiles?.credits || 0
                const newCredits = currentCredits + creditsToAdd

                const { error: profileUpdateError } = await supabaseAdmin
                    .from("profiles")
                    .update({
                        credits: newCredits,
                        // Dados para 1-Click Upsell
                        appmax_customer_id: payload.data.customer?.id ? String(payload.data.customer.id) : null,
                        last_payment_token: payload.data.payment?.upsell_hash || null,
                        last_payment_brand: payload.data.payment?.card?.brand || null,
                    })
                    .eq("id", transaction.user_id)

                if (profileUpdateError) {
                    console.error("[Appmax Webhook] Erro ao atualizar perfil:", profileUpdateError)
                    return NextResponse.json({ status: "error", message: "Profile update error" })
                }

                console.log(`[Appmax Webhook] Sucesso! User ${transaction.user_id} recebeu ${creditsToAdd} créditos.`)
            }

            return NextResponse.json({ status: "ok", action: "credits_added" })
        }

        // Processar eventos de estorno
        if (REFUND_EVENTS.includes(payload.event)) {
            const { error: txUpdateError } = await supabaseAdmin
                .from("transactions")
                .update({ status: "refunded" })
                .eq("id", transaction.id)

            if (txUpdateError) {
                console.error("[Appmax Webhook] Erro ao atualizar estorno:", txUpdateError)
            }

            console.log(`[Appmax Webhook] Estorno registrado para order: ${orderId}`)
            return NextResponse.json({ status: "ok", action: "refund_registered" })
        }

        // Processar upsell
        if (UPSELL_EVENTS.includes(payload.event)) {
            console.log(`[Appmax Webhook] Upsell detectado para order: ${orderId}`)
            // Lógica de upsell pode ser adicionada aqui
            return NextResponse.json({ status: "ok", action: "upsell_detected" })
        }

        // Evento não tratado
        console.log(`[Appmax Webhook] Evento ignorado: ${payload.event}`)
        return NextResponse.json({ status: "ignored", event: payload.event })

    } catch (error) {
        console.error("[Appmax Webhook] Erro:", error)
        // Retorna 200 mesmo em erro para evitar loops de reenvio
        return NextResponse.json({ status: "error", message: "Internal error" })
    }
}

// Método GET para verificar se o webhook está ativo
export async function GET() {
    return NextResponse.json({
        status: "active",
        message: "Appmax webhook endpoint is ready",
        sandbox: process.env.APPMAX_SANDBOX === "true",
        events_handled: [...APPROVED_EVENTS, ...REFUND_EVENTS, ...UPSELL_EVENTS],
    })
}
