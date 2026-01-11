/**
 * Payment Gateway Factory
 * 
 * Retorna o cliente de pagamento correto baseado nas configurações do admin.
 */

import { createClient } from "@supabase/supabase-js"
import { createMPPixPayment, MercadoPagoError } from "./mercadopago"
import {
    createCustomer,
    createOrder,
    payWithPix as appmaxPayWithPix,
    AppmaxError
} from "./appmax"

export type PaymentGateway = "mercadopago" | "appmax"
export type PaymentEnvironment = "sandbox" | "production"

export interface GatewaySettings {
    gateway: PaymentGateway
    environment: PaymentEnvironment
    // Mercado Pago
    mpAccessTokenSandbox?: string
    mpAccessTokenProduction?: string
    // Appmax
    appmaxClientId?: string
    appmaxClientSecret?: string
}

export interface PaymentResult {
    gateway: PaymentGateway
    paymentId: string
    orderId?: string
    qrCode: string
    qrCodeText: string
    expiresAt?: string
    status: string
}

// Cache de settings para evitar múltiplas queries
let settingsCache: GatewaySettings | null = null
let settingsCacheTime = 0
const CACHE_TTL = 60000 // 1 minuto

function getSupabaseAdmin() {
    // SERVICE_ROLE_KEY para bypass de RLS (só funciona server-side)
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export async function getGatewaySettings(): Promise<GatewaySettings> {
    // Verificar cache
    if (settingsCache && Date.now() - settingsCacheTime < CACHE_TTL) {
        return settingsCache
    }

    const supabase = getSupabaseAdmin()

    // A tabela app_settings usa formato key-value, não colunas
    const { data, error } = await supabase
        .from("app_settings")
        .select("key, value")

    if (error) {
        console.error("[Gateway] Erro ao buscar settings:", error)
    }

    // Converter array [{key, value}] para objeto
    const config: Record<string, string> = {}
    data?.forEach((row: { key: string; value: string }) => {
        config[row.key] = row.value
    })

    const settings: GatewaySettings = {
        gateway: (config.payment_gateway as PaymentGateway) || "mercadopago",
        environment: (config.payment_environment as PaymentEnvironment) || "sandbox",
        mpAccessTokenSandbox: config.mp_access_token_sandbox,
        mpAccessTokenProduction: config.mp_access_token_production,
        appmaxClientId: config.appmax_client_id,
        appmaxClientSecret: config.appmax_client_secret,
    }

    // Atualizar cache
    settingsCache = settings
    settingsCacheTime = Date.now()

    return settings
}

export function clearSettingsCache() {
    settingsCache = null
    settingsCacheTime = 0
}

export function getMPAccessToken(settings: GatewaySettings): string {
    if (settings.environment === "production") {
        return settings.mpAccessTokenProduction || ""
    }
    return settings.mpAccessTokenSandbox || ""
}

export async function processPixPayment(options: {
    amount: number
    description: string
    email: string
    firstName?: string
    lastName?: string
    cpf?: string
    externalReference: string
    clientIp?: string
}): Promise<PaymentResult> {
    const settings = await getGatewaySettings()

    if (settings.gateway === "mercadopago") {
        const accessToken = getMPAccessToken(settings)

        if (!accessToken) {
            throw new Error("Token do Mercado Pago não configurado")
        }

        const result = await createMPPixPayment(
            accessToken,
            settings.environment === "sandbox",
            {
                amount: options.amount,
                description: options.description,
                email: options.email,
                firstName: options.firstName,
                lastName: options.lastName,
                cpf: options.cpf,
                externalReference: options.externalReference,
            }
        )

        return {
            gateway: "mercadopago",
            paymentId: String(result.paymentId),
            qrCode: `data:image/png;base64,${result.qrCodeBase64}`,
            qrCodeText: result.qrCode,
            status: result.status,
        }

    } else if (settings.gateway === "appmax") {
        // Appmax requer customer e order antes do PIX
        // Nota: Para Appmax funcionar, precisamos do OAuth que está em lib/appmax.ts
        // Aqui usamos as funções já existentes

        const priceInCents = Math.round(options.amount * 100)

        // 1. Criar customer
        const customerResponse = await createCustomer({
            first_name: options.firstName || "Cliente",
            last_name: options.lastName || "",
            email: options.email,
            phone: "11999999999",
            document_number: options.cpf,
            ip: options.clientIp || "127.0.0.1",
            products: [
                {
                    sku: options.externalReference,
                    name: options.description,
                    quantity: 1,
                    unit_value: priceInCents,
                    type: "digital",
                },
            ],
        })

        const customerId = customerResponse.data.customer.id

        // 2. Criar order
        const orderResponse = await createOrder({
            customer_id: customerId,
            products: [
                {
                    sku: options.externalReference,
                    name: options.description,
                    quantity: 1,
                    unit_value: priceInCents,
                    type: "digital",
                },
            ],
        })

        const orderId = orderResponse.data.order.id

        // 3. Gerar PIX
        const pixResponse = await appmaxPayWithPix({
            order_id: orderId,
            payment_data: {
                pix: {
                    document_number: options.cpf || "00000000000",
                },
            },
        })

        return {
            gateway: "appmax",
            paymentId: String(orderId),
            orderId: String(orderId),
            qrCode: pixResponse.data.payment.qr_code,
            qrCodeText: pixResponse.data.payment.qr_code_text,
            expiresAt: pixResponse.data.payment.expires_at,
            status: "pending",
        }
    }

    throw new Error("Gateway de pagamento não suportado")
}
