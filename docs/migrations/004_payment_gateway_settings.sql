-- Migration: Payment Gateway Settings
-- Adiciona campos para configuração de gateway de pagamento

-- Campos de gateway de pagamento
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS payment_gateway TEXT DEFAULT 'mercadopago';
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS payment_environment TEXT DEFAULT 'sandbox';

-- Credenciais Mercado Pago
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS mp_public_key_sandbox TEXT;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS mp_public_key_production TEXT;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS mp_access_token_sandbox TEXT;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS mp_access_token_production TEXT;

-- Credenciais Appmax (Client ID + Client Secret via OAuth2)
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS appmax_client_id TEXT;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS appmax_client_secret TEXT;

-- Comentários para documentação
COMMENT ON COLUMN app_settings.payment_gateway IS 'Gateway ativo: mercadopago ou appmax';
COMMENT ON COLUMN app_settings.payment_environment IS 'Ambiente: sandbox ou production';
