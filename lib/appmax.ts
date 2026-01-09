/**
 * Appmax API Integration
 * 
 * Baseado na documentação oficial da Appmax.
 * 
 * Fluxo de pagamento:
 * 1. Obter token de acesso (OAuth2)
 * 2. Criar/atualizar Customer
 * 3. Criar Order
 * 4. Processar Payment (PIX, Cartão, Boleto)
 * 
 * Variáveis de ambiente necessárias:
 * - APPMAX_CLIENT_ID: Client ID do merchant
 * - APPMAX_CLIENT_SECRET: Client Secret do merchant
 * - APPMAX_SANDBOX: "true" para sandbox, qualquer outro valor para produção
 */

// URLs da API Appmax
const APPMAX_PRODUCTION_AUTH_URL = "https://auth.appmax.com.br";
const APPMAX_PRODUCTION_API_URL = "https://api.appmax.com.br";
const APPMAX_SANDBOX_AUTH_URL = "https://auth.sandboxappmax.com.br";
const APPMAX_SANDBOX_API_URL = "https://api.sandboxappmax.com.br";

/**
 * Retorna se está em modo sandbox
 */
export function isAppmaxSandbox(): boolean {
  return process.env.APPMAX_SANDBOX === "true";
}

/**
 * Retorna a URL base de autenticação
 */
export function getAppmaxAuthUrl(): string {
  return isAppmaxSandbox() ? APPMAX_SANDBOX_AUTH_URL : APPMAX_PRODUCTION_AUTH_URL;
}

/**
 * Retorna a URL base da API
 */
export function getAppmaxApiUrl(): string {
  return isAppmaxSandbox() ? APPMAX_SANDBOX_API_URL : APPMAX_PRODUCTION_API_URL;
}

/**
 * Erro da API Appmax
 */
export class AppmaxError extends Error {
  public statusCode: number;
  public response: unknown;

  constructor(message: string, statusCode: number, response?: unknown) {
    super(message);
    this.name = "AppmaxError";
    this.statusCode = statusCode;
    this.response = response;
  }
}

// Cache para o token de acesso
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Obtém um token de acesso OAuth2
 * Cacheia o token até expirar
 */
export async function getAccessToken(): Promise<string> {
  // Verificar cache
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const authUrl = getAppmaxAuthUrl();
  const clientId = process.env.APPMAX_CLIENT_ID;
  const clientSecret = process.env.APPMAX_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new AppmaxError("APPMAX_CLIENT_ID e APPMAX_CLIENT_SECRET são obrigatórios", 500);
  }

  try {
    const response = await fetch(`${authUrl}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new AppmaxError(
        `Erro de autenticação Appmax: ${response.status}`,
        response.status,
        data
      );
    }

    // Cachear token (expiresAt em segundos, converter para ms e subtrair margem de 60s)
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    };

    return data.access_token;
  } catch (error) {
    if (error instanceof AppmaxError) throw error;
    throw new AppmaxError(
      `Falha ao conectar com Appmax Auth: ${error instanceof Error ? error.message : "Unknown error"}`,
      500
    );
  }
}

/**
 * Faz uma requisição autenticada para a API
 */
async function appmaxRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown
): Promise<T> {
  const token = await getAccessToken();
  const apiUrl = getAppmaxApiUrl();

  try {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new AppmaxError(
        `Appmax API error: ${response.status}`,
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof AppmaxError) throw error;
    throw new AppmaxError(
      `Falha ao conectar com Appmax API: ${error instanceof Error ? error.message : "Unknown error"}`,
      500
    );
  }
}

// =============================================================================
// TIPOS
// =============================================================================

export interface AppmaxAddress {
  postcode: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
}

export interface AppmaxProduct {
  sku: string;
  name: string;
  quantity: number;
  unit_value: number; // Valor em centavos
  type?: "physical" | "digital";
}

export interface CreateCustomerPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  document_number?: string; // CPF ou CNPJ
  ip: string;
  address?: AppmaxAddress;
  products?: AppmaxProduct[];
}

export interface CreateOrderPayload {
  customer_id: number;
  products: AppmaxProduct[];
  products_value?: number; // Valor total em centavos
  discount_value?: number;
  shipping_value?: number;
}

export interface PaymentPixPayload {
  order_id: number;
  payment_data: {
    pix: {
      document_number: string;
    };
  };
}

export interface PaymentCreditCardPayload {
  order_id: number;
  customer_id: number;
  payment_data: {
    credit_card: {
      token?: string; // Token do cartão (tokenização)
      number?: string;
      cvv?: string;
      expiration_month?: string;
      expiration_year?: string;
      holder_document_number: string;
      holder_name: string;
      installments: number;
      soft_descriptor?: string;
    };
  };
}

// =============================================================================
// RESPOSTAS
// =============================================================================

export interface CustomerResponse {
  data: {
    customer: {
      id: number;
    };
  };
}

export interface OrderResponse {
  data: {
    order: {
      id: number;
      status: string;
    };
  };
}

export interface PixPaymentResponse {
  data: {
    payment: {
      qr_code: string; // Imagem QR Code em base64
      qr_code_text: string; // Código EMV (copia e cola)
      expires_at: string;
    };
  };
}

export interface CreditCardPaymentResponse {
  data: {
    payment: {
      status: string;
      upsell_hash?: string; // Hash para upsell 1-click
    };
  };
}

// =============================================================================
// FUNÇÕES DA API
// =============================================================================

/**
 * Cria ou atualiza um cliente na Appmax
 */
export async function createCustomer(payload: CreateCustomerPayload): Promise<CustomerResponse> {
  return appmaxRequest<CustomerResponse>("/v1/customers", "POST", payload);
}

/**
 * Cria um pedido na Appmax
 */
export async function createOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
  return appmaxRequest<OrderResponse>("/v1/orders", "POST", payload);
}

/**
 * Processa pagamento via PIX
 */
export async function payWithPix(payload: PaymentPixPayload): Promise<PixPaymentResponse> {
  return appmaxRequest<PixPaymentResponse>("/v1/payments/pix", "POST", payload);
}

/**
 * Processa pagamento via Cartão de Crédito
 */
export async function payWithCreditCard(payload: PaymentCreditCardPayload): Promise<CreditCardPaymentResponse> {
  return appmaxRequest<CreditCardPaymentResponse>("/v1/payments/credit-card", "POST", payload);
}

/**
 * Tokeniza cartão de crédito
 */
export async function tokenizeCreditCard(cardData: {
  number: string;
  cvv: string;
  expiration_month: string;
  expiration_year: string;
  holder_name: string;
}): Promise<{ data: { token: string } }> {
  return appmaxRequest("/v1/payments/tokenize", "POST", {
    payment_data: {
      credit_card: cardData,
    },
  });
}

/**
 * Consulta dados de um pedido
 */
export async function getOrder(orderId: number): Promise<unknown> {
  return appmaxRequest(`/v1/orders/${orderId}`, "GET");
}

/**
 * Cria uma solicitação de estorno
 */
export async function createRefund(orderId: number, type: "total" | "partial" = "total", value?: number): Promise<unknown> {
  const payload: { order_id: number; type: string; value?: number } = {
    order_id: orderId,
    type,
  };
  if (type === "partial" && value) {
    payload.value = value;
  }
  return appmaxRequest("/v1/orders/refund-request", "POST", payload);
}
