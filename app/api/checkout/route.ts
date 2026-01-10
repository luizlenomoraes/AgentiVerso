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
 * Endpoint para iniciar o checkout via Appmax
 * 
 * Suporta 3 tipos de compra:
 * - type: 'credits' (padrão) - pacote de créditos
 * - type: 'agent' - agente premium individual
 * - type: 'combo' - combo promocional
 * 
 * O webhook da Appmax notificará quando o pagamento for confirmado.
 */
export async function POST(request: Request) {
  try {
    const {
      type = 'credits',
      packageId,
      agentId,
      comboId,
      paymentMethod = "pix"
    } = await request.json()

    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar dados do usuário no profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, cpf, phone")
      .eq("id", user.id)
      .single()

    // Variáveis para o pedido
    let price: number = 0
    let productName: string = ""
    let productSku: string = ""
    let bonusCredits: number = 0
    let credits: number = 0

    // Determinar o que está sendo comprado
    if (type === 'credits') {
      if (!packageId) {
        return NextResponse.json({ error: "Pacote não especificado" }, { status: 400 })
      }

      const { data: pkg } = await supabase
        .from("credit_packages")
        .select("*")
        .eq("id", packageId)
        .single()

      if (!pkg) {
        return NextResponse.json({ error: "Pacote não encontrado" }, { status: 404 })
      }

      price = Number(pkg.price)
      productName = `${pkg.amount} Créditos AgentiVerso`
      productSku = `credits-${pkg.amount}`
      credits = pkg.amount
      bonusCredits = 0

    } else if (type === 'agent') {
      if (!agentId) {
        return NextResponse.json({ error: "Agente não especificado" }, { status: 400 })
      }

      const { data: agent } = await supabase
        .from("agents")
        .select("id, name, price, bonus_credits, is_free")
        .eq("id", agentId)
        .single()

      if (!agent) {
        return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 })
      }

      if (agent.is_free) {
        return NextResponse.json({ error: "Este agente é gratuito" }, { status: 400 })
      }

      // Verificar se usuário já tem acesso
      const { data: existingAccess } = await supabase
        .from("user_agent_access")
        .select("id")
        .eq("user_id", user.id)
        .eq("agent_id", agentId)
        .single()

      if (existingAccess) {
        return NextResponse.json({ error: "Você já tem acesso a este agente" }, { status: 400 })
      }

      price = Number(agent.price) || 0
      productName = `Agente: ${agent.name}`
      productSku = `agent-${agentId}`
      bonusCredits = agent.bonus_credits || 0

    } else if (type === 'combo') {
      if (!comboId) {
        return NextResponse.json({ error: "Combo não especificado" }, { status: 400 })
      }

      const { data: combo } = await supabase
        .from("agent_combos")
        .select("*")
        .eq("id", comboId)
        .eq("is_active", true)
        .single()

      if (!combo) {
        return NextResponse.json({ error: "Combo não encontrado ou inativo" }, { status: 404 })
      }

      // Verificar se ainda está válido
      if (combo.valid_until && new Date(combo.valid_until) < new Date()) {
        return NextResponse.json({ error: "Esta promoção expirou" }, { status: 400 })
      }

      price = Number(combo.price)
      productName = `Combo: ${combo.name}`
      productSku = `combo-${comboId}`
      bonusCredits = combo.bonus_credits || 0

    } else {
      return NextResponse.json({ error: "Tipo de compra inválido" }, { status: 400 })
    }

    if (price <= 0) {
      return NextResponse.json({ error: "Preço inválido" }, { status: 400 })
    }

    // Valores em centavos (Appmax usa centavos)
    const priceInCents = Math.round(price * 100)

    // Preparar dados do cliente
    const fullName = profile?.full_name || user.email?.split("@")[0] || "Cliente"
    const nameParts = fullName.trim().split(" ")
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(" ") || firstName

    // Obter IP do cliente
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "127.0.0.1"

    // 1. Criar customer na Appmax
    const customerResponse = await createCustomer({
      first_name: firstName,
      last_name: lastName,
      email: profile?.email || user.email || "",
      phone: profile?.phone || "11999999999",
      document_number: profile?.cpf || undefined,
      ip: clientIp,
      products: [
        {
          sku: productSku,
          name: productName,
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
          sku: productSku,
          name: productName,
          quantity: 1,
          unit_value: priceInCents,
          type: "digital",
        },
      ],
    })

    const orderId = orderResponse.data.order.id

    // 3. Criar registro na tabela transactions
    const transactionData: any = {
      user_id: user.id,
      amount: price,
      status: "pending",
      external_id: String(orderId),
      appmax_order_id: String(orderId),
      payment_method: paymentMethod,
      type: type,
    }

    // Adicionar referência ao item comprado
    if (type === 'agent') {
      transactionData.agent_id = agentId
    } else if (type === 'combo') {
      transactionData.combo_id = comboId
    }

    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert(transactionData)
      .select()
      .single()

    if (txError) {
      console.error("Erro ao criar transação:", txError)
      return NextResponse.json({ error: "Erro ao iniciar transação" }, { status: 500 })
    }

    // 4. Processar pagamento PIX
    if (paymentMethod === "pix") {
      const pixResponse = await payWithPix({
        order_id: orderId,
        payment_data: {
          pix: {
            document_number: profile?.cpf || "00000000000",
          },
        },
      })

      if (isAppmaxSandbox()) {
        console.log(`[Appmax Sandbox] PIX gerado para ${type}:`, orderId)
      }

      return NextResponse.json({
        type,
        paymentMethod: "pix",
        transactionId: transaction.id,
        orderId: orderId,
        productName,
        price,
        bonusCredits,
        pix: {
          qrCode: pixResponse.data.payment.qr_code,
          qrCodeText: pixResponse.data.payment.qr_code_text,
          expiresAt: pixResponse.data.payment.expires_at,
        },
      })
    }

    // Para cartão, retornar dados do pedido
    return NextResponse.json({
      type,
      paymentMethod: "credit_card",
      transactionId: transaction.id,
      orderId: orderId,
      customerId: customerId,
      price,
      bonusCredits,
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
