-- Migration: 007_smart_pricing.sql

-- 0. Garantir que a tabela se chama 'credit_packages' e tem as colunas necessárias
-- Se a tabela não existir, descomente a linha abaixo (mas ela deve existir segundo o código)
-- CREATE TABLE IF NOT EXISTS credit_packages (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, name text, amount int, price float);

-- Adicionar colunas caso nao existam (Safe Migration)
ALTER TABLE credit_packages ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE credit_packages ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE credit_packages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 1. Desativar pacotes antigos
UPDATE credit_packages SET is_active = false WHERE is_active = true;

-- 2. Inserir a nova escada de valor (Usando a tabela correta 'credit_packages')
INSERT INTO credit_packages (name, description, amount, price, is_active, created_at) VALUES
('Starter', 'Ideal para testar. Acesso a modelos rápidos.', 300, 27.00, true, NOW()),
('Growth', 'O favorito. Melhor custo-benefício.', 750, 57.00, true, NOW()),
('Power', 'Para uso profissional em escala.', 1500, 97.00, true, NOW());

-- 3. Função RPC para dedução atômica de créditos
CREATE OR REPLACE FUNCTION deduct_credits(p_user_id UUID, p_amount FLOAT8)
RETURNS FLOAT8 AS $$
DECLARE
  v_current_usage FLOAT8;
  v_new_usage FLOAT8;
BEGIN
  -- Obter uso atual com bloqueio de linha (FOR UPDATE)
  SELECT used_credits INTO v_current_usage
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_usage IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  v_new_usage := v_current_usage + p_amount;

  UPDATE profiles
  SET used_credits = v_new_usage
  WHERE id = p_user_id;

  RETURN v_new_usage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
