import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import {
  createCustomer,
  createOrder,
  payWithPix,
  AppmaxError,
  isAppmaxSandbox
} from "@/lib/appmax"

/**
 * Endpoint para iniciar o checkout de créditos via Appmax
 * 
 * Por padrão, usa PIX como método de pagamento.
 * O fluxo é:
 * 1. Criar customer na Appmax
 * 2. Criar order na Appmax
 * 3. Gerar pagamento PIX
 * 4. Retornar QR Code e código EMV
 * 
 * O webhook da Appmax notificará quando o pagamento for confirmado.
 */
export async function POST(request: Request) {
  try {
    const { packageId, paymentMethod = "pix" } = await request.json()

    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!packageId) {
      return NextResponse.json({ error: "Pacote não especificado" }, { status: 400 })
    }

    // Buscar dados do usuário no profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, cpf, phone")
      .eq("id", user.id)
      .single()

    // Buscar o pacote no banco
    const { data: pkg } = await supabase
      .from("credit_packages")
      .select("*")
      .eq("id", packageId)
      .single()

    if (!pkg) {
      return NextResponse.json({ error: "Pacote não encontrado" }, { status: 404 })
    }

    // Valores em centavos (Appmax usa centavos)
    const priceInCents = Math.round(Number(pkg.price) * 100)
    const credits = pkg.amount

    // Preparar dados do cliente
    const fullName = profile?.full_name || user.email?.split("@")[0] || "Cliente"
    const nameParts = fullName.trim().split(" ")
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(" ") || firstName

    // Obter IP do cliente (header ou fallback)
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "127.0.0.1"

    // 1. Criar customer na Appmax
    const customerResponse = await createCustomer({
      first_name: firstName,
      last_name: lastName,
      email: profile?.email || user.email || "",
      phone: profile?.phone || "11999999999", // Fallback necessário
      document_number: profile?.cpf || undefined,
      ip: clientIp,
      products: [
        {
          sku: `credits-${credits}`,
          name: `${credits} Créditos AgentiVerso`,
          quantity: 1,
          unit_value: priceInCents,
          type: "digital",
        },
      ],
    })

    const customerId = customerResponse.data.customer.id

    // 2. Criar order na Appmax
    const orderResponse = await createOrder({
      customer_id: customerId,
      products: [
        {
          sku: `credits-${credits}`,
          name: `${credits} Créditos AgentiVerso`,
          quantity: 1,
          unit_value: priceInCents,
          type: "digital",
        },
      ],
    })

    const orderId = orderResponse.data.order.id

    // 3. Criar registro inicial na tabela transactions (Status: pending)
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        amount: Number(pkg.price),
        status: "pending",
        external_id: String(orderId),
        appmax_order_id: String(orderId),
        payment_method: paymentMethod,
      })
      .select()
      .single()

    if (txError) {
      console.error("Erro ao criar transação:", txError)
      return NextResponse.json({ error: "Erro ao iniciar transação" }, { status: 500 })
    }

    // 4. Processar pagamento baseado no método
    if (paymentMethod === "pix") {
      const pixResponse = await payWithPix({
        order_id: orderId,
        payment_data: {
          pix: {
            document_number: profile?.cpf || "00000000000",
          },
        },
      })

      // Log para debug em sandbox
      if (isAppmaxSandbox()) {
        console.log("[Appmax Sandbox] PIX gerado para order:", orderId)
      }

      return NextResponse.json({
        paymentMethod: "pix",
        transactionId: transaction.id,
        orderId: orderId,
        pix: {
          qrCode: pixResponse.data.payment.qr_code,
          qrCodeText: pixResponse.data.payment.qr_code_text,
          expiresAt: pixResponse.data.payment.expires_at,
        },
      })
    }

    // Para outros métodos de pagamento (cartão), retornar dados do pedido
    // O frontend deve coletar dados do cartão e enviar para outro endpoint
    return NextResponse.json({
      paymentMethod: "credit_card",
      transactionId: transaction.id,
      orderId: orderId,
      customerId: customerId,
      message: "Pedido criado. Envie os dados do cartão para completar o pagamento.",
    })

  } catch (error) {
    console.error("Checkout error:", error)

    if (error instanceof AppmaxError) {
      console.error("Appmax error details:", error.response)
      return NextResponse.json(
        {
          error: "Erro ao processar pagamento",
          details: error.message,
          code: error.statusCode
        },
        { status: error.statusCode >= 400 && error.statusCode < 500 ? error.statusCode : 500 }
      )
    }

    return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 })
  }
}
