/**
 * Mercado Pago Integration - PIX Payment
 * 
 * Documentação: https://www.mercadopago.com.br/developers/pt/docs
 */

interface MercadoPagoConfig {
    accessToken: string
    sandbox: boolean
}

interface PixPaymentRequest {
    transaction_amount: number
    description: string
    payment_method_id: "pix"
    payer: {
        email: string
        first_name?: string
        last_name?: string
        identification?: {
            type: "CPF" | "CNPJ"
            number: string
        }
    }
    external_reference?: string
}

interface PixPaymentResponse {
    id: number
    status: string
    status_detail: string
    transaction_amount: number
    point_of_interaction: {
        transaction_data: {
            qr_code: string
            qr_code_base64: string
            ticket_url: string
        }
    }
}

export class MercadoPagoError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public response?: any
    ) {
        super(message)
        this.name = "MercadoPagoError"
    }
}

function getBaseUrl(sandbox: boolean): string {
    return "https://api.mercadopago.com"
}

export async function createPixPayment(
    config: MercadoPagoConfig,
    data: PixPaymentRequest
): Promise<PixPaymentResponse> {
    const baseUrl = getBaseUrl(config.sandbox)

    const response = await fetch(`${baseUrl}/v1/payments`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${config.accessToken}`,
            "Content-Type": "application/json",
            "X-Idempotency-Key": `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        },
        body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
        console.error("[MercadoPago] Error:", result)
        throw new MercadoPagoError(
            result.message || "Erro ao criar pagamento PIX",
            response.status,
            result
        )
    }

    return result
}

export async function getPayment(
    config: MercadoPagoConfig,
    paymentId: string | number
): Promise<any> {
    const baseUrl = getBaseUrl(config.sandbox)

    const response = await fetch(`${baseUrl}/v1/payments/${paymentId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${config.accessToken}`,
            "Content-Type": "application/json",
        },
    })

    const result = await response.json()

    if (!response.ok) {
        throw new MercadoPagoError(
            result.message || "Erro ao buscar pagamento",
            response.status,
            result
        )
    }

    return result
}

// Helper para criar pagamento PIX simplificado
export async function createMPPixPayment(
    accessToken: string,
    sandbox: boolean,
    options: {
        amount: number
        description: string
        email: string
        firstName?: string
        lastName?: string
        cpf?: string
        externalReference?: string
    }
): Promise<{
    paymentId: number
    qrCode: string
    qrCodeBase64: string
    ticketUrl: string
    status: string
}> {
    const config: MercadoPagoConfig = { accessToken, sandbox }

    const paymentData: PixPaymentRequest = {
        transaction_amount: options.amount,
        description: options.description,
        payment_method_id: "pix",
        payer: {
            email: options.email,
            first_name: options.firstName,
            last_name: options.lastName,
            identification: options.cpf ? {
                type: "CPF",
                number: options.cpf.replace(/\D/g, ""),
            } : undefined,
        },
        external_reference: options.externalReference,
    }

    const result = await createPixPayment(config, paymentData)

    return {
        paymentId: result.id,
        qrCode: result.point_of_interaction.transaction_data.qr_code,
        qrCodeBase64: result.point_of_interaction.transaction_data.qr_code_base64,
        ticketUrl: result.point_of_interaction.transaction_data.ticket_url,
        status: result.status,
    }
}
