import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { getPayment } from "@/lib/mercadopago"
import { getGatewaySettings, getMPAccessToken } from "@/lib/payment-gateway"

/**
 * Webhook para receber notificações do Mercado Pago
 * 
 * Documentação: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
 * 
 * Eventos tratados:
 * - payment: notificação de pagamento
 */

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

interface MPWebhookPayload {
    id: number
    live_mode: boolean
    type: string
    date_created: string
    user_id: string
    api_version: string
    action: string
    data: {
        id: string
    }
}

export async function POST(request: Request) {
    try {
        const payload: MPWebhookPayload = await request.json()

        console.log("[MP Webhook] Evento recebido:", payload.type, payload.action)

        // Apenas processar eventos de pagamento
        if (payload.type !== "payment") {
            return NextResponse.json({ status: "ignored", reason: "not_payment_event" })
        }

        const paymentId = payload.data.id
        if (!paymentId) {
            return NextResponse.json({ status: "ignored", reason: "no_payment_id" })
        }

        // Buscar detalhes do pagamento no Mercado Pago
        const settings = await getGatewaySettings()
        const accessToken = getMPAccessToken(settings)

        if (!accessToken) {
            console.error("[MP Webhook] Token não configurado")
            return NextResponse.json({ status: "error", reason: "no_token" })
        }

        const payment = await getPayment(
            { accessToken, sandbox: settings.environment === "sandbox" },
            paymentId
        )

        console.log("[MP Webhook] Payment status:", payment.status)

        const supabaseAdmin = getSupabaseAdmin()

        // Buscar transação pelo external_id (paymentId do MP)
        const { data: transaction, error: txFindError } = await supabaseAdmin
            .from("transactions")
            .select("*")
            .eq("external_id", paymentId)
            .eq("payment_gateway", "mercadopago")
            .single()

        if (txFindError || !transaction) {
            console.log("[MP Webhook] Transação não encontrada para payment:", paymentId)
            return NextResponse.json({ status: "ignored", reason: "transaction_not_found" })
        }

        // Processar baseado no status do pagamento
        if (payment.status === "approved") {
            // Verificar se já foi processado
            if (transaction.status === "approved") {
                console.log("[MP Webhook] Transação já processada:", paymentId)
                return NextResponse.json({ status: "already_processed" })
            }

            // Atualizar transação para approved
            await supabaseAdmin
                .from("transactions")
                .update({ status: "approved" })
                .eq("id", transaction.id)

            // Processar baseado no tipo de transação
            const txType = transaction.type || 'credits'
            let creditsToAdd = 0
            let actionResult = ''

            if (txType === 'credits') {
                const { data: pkg } = await supabaseAdmin
                    .from("credit_packages")
                    .select("amount")
                    .eq("price", transaction.amount)
                    .single()

                creditsToAdd = pkg?.amount || 0
                actionResult = `${creditsToAdd} créditos adicionados`

            } else if (txType === 'agent' && transaction.agent_id) {
                const { data: agent } = await supabaseAdmin
                    .from("agents")
                    .select("bonus_credits, name")
                    .eq("id", transaction.agent_id)
                    .single()

                creditsToAdd = agent?.bonus_credits || 0

                // Conceder acesso ao agente
                await supabaseAdmin
                    .from("user_agent_access")
                    .insert({
                        user_id: transaction.user_id,
                        agent_id: transaction.agent_id,
                        transaction_id: transaction.id,
                    })

                actionResult = `Acesso ao agente "${agent?.name}" liberado + ${creditsToAdd} créditos bônus`

            } else if (txType === 'combo' && transaction.combo_id) {
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

                    await supabaseAdmin
                        .from("user_agent_access")
                        .insert(accessInserts)
                }

                actionResult = `Combo "${combo?.name}" liberado (${comboAgents?.length || 0} agentes) + ${creditsToAdd} créditos bônus`
            }

            // Adicionar créditos (se houver)
            if (creditsToAdd > 0) {
                const { data: profile } = await supabaseAdmin
                    .from("profiles")
                    .select("total_credits")
                    .eq("id", transaction.user_id)
                    .single()

                const currentCredits = profile?.total_credits || 0

                await supabaseAdmin
                    .from("profiles")
                    .update({ total_credits: currentCredits + creditsToAdd })
                    .eq("id", transaction.user_id)
            }

            console.log(`[MP Webhook] Sucesso! ${actionResult}`)
            return NextResponse.json({ status: "ok", action: actionResult })

        } else if (payment.status === "rejected" || payment.status === "cancelled") {
            await supabaseAdmin
                .from("transactions")
                .update({ status: payment.status })
                .eq("id", transaction.id)

            console.log(`[MP Webhook] Pagamento ${payment.status}:`, paymentId)
            return NextResponse.json({ status: "ok", action: payment.status })

        } else if (payment.status === "refunded") {
            await supabaseAdmin
                .from("transactions")
                .update({ status: "refunded" })
                .eq("id", transaction.id)

            // Revogar acesso se foi compra de agente
            if (transaction.type === 'agent' || transaction.type === 'combo') {
                await supabaseAdmin
                    .from("user_agent_access")
                    .delete()
                    .eq("transaction_id", transaction.id)
            }

            console.log(`[MP Webhook] Estorno registrado:`, paymentId)
            return NextResponse.json({ status: "ok", action: "refund_registered" })
        }

        // Status pendente ou outro
        console.log(`[MP Webhook] Status ignorado:`, payment.status)
        return NextResponse.json({ status: "ignored", payment_status: payment.status })

    } catch (error) {
        console.error("[MP Webhook] Erro:", error)
        return NextResponse.json({ status: "error", message: "Internal error" })
    }
}

// Método GET para verificar se o webhook está ativo
export async function GET() {
    return NextResponse.json({
        status: "active",
        gateway: "mercadopago",
        message: "Mercado Pago webhook endpoint is ready",
    })
}
