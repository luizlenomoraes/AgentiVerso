-- Migration: Factional Credits
-- Altera as colunas de créditos para float8 (double precision) para permitir cobrança fracionada baseada em tokens.

-- Altera total_credits para float (mantendo os dados existentes)
ALTER TABLE profiles 
ALTER COLUMN total_credits TYPE float8 USING total_credits::float8;

-- Altera used_credits para float (mantendo os dados existentes)
ALTER TABLE profiles 
ALTER COLUMN used_credits TYPE float8 USING used_credits::float8;

-- Comentários para documentação
COMMENT ON COLUMN profiles.total_credits IS 'Total de créditos adquiridos (suporta decimais para precisão de tokens)';
COMMENT ON COLUMN profiles.used_credits IS 'Total de créditos utilizados (suporta decimais para precisão de tokens)';
