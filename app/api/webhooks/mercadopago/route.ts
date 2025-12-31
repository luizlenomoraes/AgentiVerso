import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"

// Lazy initialization to avoid build-time errors when env vars aren't available
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
    // O Mercado Pago envia query params ou body dependendo do tipo de notificação
    // Geralmente vem no formato: ?id=123&topic=payment
    const url = new URL(request.url)
    const topic = url.searchParams.get("topic") || url.searchParams.get("type")
    const id = url.searchParams.get("id") || url.searchParams.get("data.id")

    if (topic !== "payment" || !id) {
      return NextResponse.json({ status: "ignored" })
    }

    // Consultar o status real do pagamento no Mercado Pago (Segurança)
    const mpClient = getMercadoPagoClient()
    const payment = new Payment(mpClient)
    const paymentData = await payment.get({ id })

    if (!paymentData) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Pegar o ID da nossa transação que enviamos no metadata
    const internalTxId = paymentData.metadata.transaction_id
    const status = paymentData.status // approved, pending, rejected

    if (internalTxId) {
      // Atualizar a tabela transactions
      // O Trigger 'handle_payment_approval' que você criou no banco vai rodar
      // automaticamente quando o status mudar para 'approved' e dar os créditos.
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
    }

    return NextResponse.json({ status: "ok" })

  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
