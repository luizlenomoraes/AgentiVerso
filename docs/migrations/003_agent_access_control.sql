-- ==================================================
-- MIGRATION 003: Sistema de Monetização Híbrida
-- Execute este SQL no Supabase SQL Editor
-- ==================================================

-- ==================================================
-- TABELA AGENTS: Adicionar campos de monetização
-- ==================================================
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS bonus_credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

COMMENT ON COLUMN agents.is_free IS 'true=grátis para todos, false=requer compra';
COMMENT ON COLUMN agents.price IS 'Preço em R$ para desbloquear acesso';
COMMENT ON COLUMN agents.bonus_credits IS 'Créditos bônus ao comprar este agente';
COMMENT ON COLUMN agents.is_featured IS 'Destaque na home/dashboard';

-- Garantir que todos os agentes existentes sejam gratuitos
UPDATE agents SET is_free = true WHERE is_free IS NULL;

-- ==================================================
-- TABELA USER_AGENT_ACCESS: Controle de acesso premium
-- ==================================================
CREATE TABLE IF NOT EXISTS user_agent_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    transaction_id UUID REFERENCES transactions(id),
    UNIQUE(user_id, agent_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_uaa_user ON user_agent_access(user_id);
CREATE INDEX IF NOT EXISTS idx_uaa_agent ON user_agent_access(agent_id);

-- RLS (Row Level Security)
ALTER TABLE user_agent_access ENABLE ROW LEVEL SECURITY;

-- Política: Usuários veem apenas seu próprio acesso
DROP POLICY IF EXISTS "Users view own access" ON user_agent_access;
CREATE POLICY "Users view own access" ON user_agent_access
    FOR SELECT USING (auth.uid() = user_id);

-- Política: Admins podem gerenciar todos
DROP POLICY IF EXISTS "Admins manage all access" ON user_agent_access;
CREATE POLICY "Admins manage all access" ON user_agent_access
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

-- ==================================================
-- TABELA AGENT_COMBOS: Promoções relâmpago
-- ==================================================
CREATE TABLE IF NOT EXISTS agent_combos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2), -- Para mostrar "De R$X por R$Y"
    bonus_credits INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    valid_until TIMESTAMPTZ, -- NULL = sem prazo de validade
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de relacionamento combo <-> agentes
CREATE TABLE IF NOT EXISTS combo_agents (
    combo_id UUID NOT NULL REFERENCES agent_combos(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    PRIMARY KEY (combo_id, agent_id)
);

-- RLS para combos
ALTER TABLE agent_combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE combo_agents ENABLE ROW LEVEL SECURITY;

-- Todos podem ver combos ativos
DROP POLICY IF EXISTS "Anyone can view active combos" ON agent_combos;
CREATE POLICY "Anyone can view active combos" ON agent_combos
    FOR SELECT USING (is_active = true);

-- Admins gerenciam combos
DROP POLICY IF EXISTS "Admins manage combos" ON agent_combos;
CREATE POLICY "Admins manage combos" ON agent_combos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

DROP POLICY IF EXISTS "Anyone can view combo agents" ON combo_agents;
CREATE POLICY "Anyone can view combo agents" ON combo_agents
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage combo agents" ON combo_agents;
CREATE POLICY "Admins manage combo agents" ON combo_agents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

-- ==================================================
-- TABELA TRANSACTIONS: Suportar compra de agente/combo
-- ==================================================
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'credits',
ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES agents(id),
ADD COLUMN IF NOT EXISTS combo_id UUID REFERENCES agent_combos(id);

COMMENT ON COLUMN transactions.type IS 'Tipo: credits, agent, ou combo';

-- ==================================================
-- FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
-- ==================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para agent_combos
DROP TRIGGER IF EXISTS update_agent_combos_updated_at ON agent_combos;
CREATE TRIGGER update_agent_combos_updated_at
    BEFORE UPDATE ON agent_combos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- DADOS DE EXEMPLO (OPCIONAL - DESCOMENTE SE QUISER)
-- ==================================================
-- INSERT INTO agent_combos (name, description, price, original_price, bonus_credits, is_active)
-- VALUES (
--     'Pack Relacionamentos',
--     'Todos os agentes de relacionamento + 100 créditos bônus!',
--     79.90,
--     129.90,
--     100,
--     true
-- );
