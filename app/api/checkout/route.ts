import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })

export async function POST(request: Request) {
  try {
    const { price, credits, quantity = 1 } = await request.json()

    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // 1. Criar registro inicial na tabela transactions (Status: pending)
    // Isso garante que temos um ID nosso para rastrear antes de ir pro Mercado Pago
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        amount: price,
        status: 'pending',
        // external_id será atualizado depois ou usado como referência
      })
      .select()
      .single()

    if (txError) {
      console.error("Erro ao criar transação:", txError)
      return NextResponse.json({ error: "Erro ao iniciar transação" }, { status: 500 })
    }

    // 2. Configurar Preferência do Mercado Pago
    const preference = new Preference(client)
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const result = await preference.create({
      body: {
        items: [
          {
            id: `credits-${credits}`,
            title: `${credits} Créditos AgentiVerso`,
            quantity: quantity,
            unit_price: Number(price),
            currency_id: "BRL",
          },
        ],
        payer: {
          email: user.email,
        },
        // Metadata é CRUCIAL: é como saberemos quem é o usuário quando o Webhook bater
        metadata: {
          transaction_id: transaction.id,
          user_id: user.id,
          credits_amount: credits
        },
        back_urls: {
          success: `${appUrl}/dashboard/credits?status=success`,
          failure: `${appUrl}/dashboard/credits?status=failure`,
          pending: `${appUrl}/dashboard/credits?status=pending`,
        },
        auto_return: "approved",
        notification_url: `${appUrl}/api/webhooks/mercadopago`, // Onde o MP avisa que pagou
      },
    })

    // 3. Atualizar transação com o ID da preferência do MP (opcional, para debug)
    await supabase
      .from("transactions")
      .update({ external_id: result.id })
      .eq("id", transaction.id)

    return NextResponse.json({ url: result.init_point })

  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 })
  }
}
