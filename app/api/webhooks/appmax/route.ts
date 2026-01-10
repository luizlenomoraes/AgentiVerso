import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

/**
 * Webhook para receber notificações da Appmax
 * 
 * Suporta 3 tipos de transação:
 * - credits: adiciona créditos comprados
 * - agent: libera acesso ao agente + bônus credits
 * - combo: libera acesso a todos agentes do combo + bônus credits
 */

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

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

const APPROVED_EVENTS = [
    "order_paid",
    "order_approved",
    "order_paid_by_pix",
    "order_integrated",
];

const REFUND_EVENTS = ["order_refund"];
const UPSELL_EVENTS = ["order_up_sold"];

export async function POST(request: Request) {
    try {
        const payload: AppmaxWebhookPayload = await request.json()

        console.log("[Appmax Webhook] Evento recebido:", payload.event)

        const supabaseAdmin = getSupabaseAdmin()
        const orderId = payload.data.order?.id

        if (!orderId) {
            console.log("[Appmax Webhook] Sem order_id no payload")
            return NextResponse.json({ status: "ignored", reason: "no_order_id" })
        }

        // Buscar transação
        const { data: transaction, error: txFindError } = await supabaseAdmin
            .from("transactions")
            .select("*")
            .eq("appmax_order_id", String(orderId))
            .single()

        if (txFindError || !transaction) {
            console.log("[Appmax Webhook] Transação não encontrada para order:", orderId)
            return NextResponse.json({ status: "ignored", reason: "transaction_not_found" })
        }

        // Processar eventos de aprovação
        if (APPROVED_EVENTS.includes(payload.event)) {
            if (transaction.status === "approved") {
                console.log("[Appmax Webhook] Transação já processada:", orderId)
                return NextResponse.json({ status: "already_processed" })
            }

            // 1. Atualizar transação para approved
            await supabaseAdmin
                .from("transactions")
                .update({
                    status: "approved",
                    payment_method: payload.data.payment?.method || transaction.payment_method,
                })
                .eq("id", transaction.id)

            // 2. Processar baseado no tipo de transação
            const txType = transaction.type || 'credits'
            let creditsToAdd = 0
            let actionResult = ''

            if (txType === 'credits') {
                // Compra de pacote de créditos
                const { data: pkg } = await supabaseAdmin
                    .from("credit_packages")
                    .select("amount")
                    .eq("price", transaction.amount)
                    .single()

                creditsToAdd = pkg?.amount || 0
                actionResult = `${creditsToAdd} créditos adicionados`

            } else if (txType === 'agent' && transaction.agent_id) {
                // Compra de agente premium

                // Buscar bônus do agente
                const { data: agent } = await supabaseAdmin
                    .from("agents")
                    .select("bonus_credits, name")
                    .eq("id", transaction.agent_id)
                    .single()

                creditsToAdd = agent?.bonus_credits || 0

                // Conceder acesso ao agente
                const { error: accessError } = await supabaseAdmin
                    .from("user_agent_access")
                    .insert({
                        user_id: transaction.user_id,
                        agent_id: transaction.agent_id,
                        transaction_id: transaction.id,
                    })

                if (accessError && !accessError.message.includes('duplicate')) {
                    console.error("[Appmax Webhook] Erro ao conceder acesso:", accessError)
                }

                actionResult = `Acesso ao agente "${agent?.name}" liberado + ${creditsToAdd} créditos bônus`

            } else if (txType === 'combo' && transaction.combo_id) {
                // Compra de combo

                // Buscar combo e seus agentes
                const { data: combo } = await supabaseAdmin
                    .from("agent_combos")
                    .select("bonus_credits, name")
                    .eq("id", transaction.combo_id)
                    .single()

                const { data: comboAgents } = await supabaseAdmin
                    .from("combo_agents")
                    .select("agent_id")
                    .eq("combo_id", transaction.combo_id)

                creditsToAdd = combo?.bonus_credits || 0

                // Conceder acesso a todos os agentes do combo
                if (comboAgents && comboAgents.length > 0) {
                    const accessInserts = comboAgents.map((ca: { agent_id: string }) => ({
                        user_id: transaction.user_id,
                        agent_id: ca.agent_id,
                        transaction_id: transaction.id,
                    }))

                    const { error: accessError } = await supabaseAdmin
                        .from("user_agent_access")
                        .insert(accessInserts)

                    if (accessError && !accessError.message.includes('duplicate')) {
                        console.error("[Appmax Webhook] Erro ao conceder acesso combo:", accessError)
                    }
                }

                actionResult = `Combo "${combo?.name}" liberado (${comboAgents?.length || 0} agentes) + ${creditsToAdd} créditos bônus`
            }

            // 3. Adicionar créditos (se houver)
            if (creditsToAdd > 0) {
                // Buscar créditos atuais
                const { data: profile } = await supabaseAdmin
                    .from("profiles")
                    .select("total_credits")
                    .eq("id", transaction.user_id)
                    .single()

                const currentCredits = profile?.total_credits || 0

                await supabaseAdmin
                    .from("profiles")
                    .update({
                        total_credits: currentCredits + creditsToAdd,
                        appmax_customer_id: payload.data.customer?.id ? String(payload.data.customer.id) : null,
                        last_payment_token: payload.data.payment?.upsell_hash || null,
                        last_payment_brand: payload.data.payment?.card?.brand || null,
                    })
                    .eq("id", transaction.user_id)
            }

            console.log(`[Appmax Webhook] Sucesso! ${actionResult}`)
            return NextResponse.json({ status: "ok", action: actionResult })
        }

        // Processar estorno
        if (REFUND_EVENTS.includes(payload.event)) {
            await supabaseAdmin
                .from("transactions")
                .update({ status: "refunded" })
                .eq("id", transaction.id)

            // Se foi compra de agente/combo, revogar acesso
            if (transaction.type === 'agent' && transaction.agent_id) {
                await supabaseAdmin
                    .from("user_agent_access")
                    .delete()
                    .eq("transaction_id", transaction.id)
            }

            console.log(`[Appmax Webhook] Estorno registrado para order: ${orderId}`)
            return NextResponse.json({ status: "ok", action: "refund_registered" })
        }

        // Upsell
        if (UPSELL_EVENTS.includes(payload.event)) {
            console.log(`[Appmax Webhook] Upsell detectado para order: ${orderId}`)
            return NextResponse.json({ status: "ok", action: "upsell_detected" })
        }

        console.log(`[Appmax Webhook] Evento ignorado: ${payload.event}`)
        return NextResponse.json({ status: "ignored", event: payload.event })

    } catch (error) {
        console.error("[Appmax Webhook] Erro:", error)
        return NextResponse.json({ status: "error", message: "Internal error" })
    }
}

export async function GET() {
    return NextResponse.json({
        status: "active",
        message: "Appmax webhook endpoint is ready",
        sandbox: process.env.APPMAX_SANDBOX === "true",
        supported_types: ["credits", "agent", "combo"],
        events_handled: [...APPROVED_EVENTS, ...REFUND_EVENTS, ...UPSELL_EVENTS],
    })
}
