# 🚀 GUIA DE DEPLOY - AgentiVerso

## ✅ **TUDO QUE FOI IMPLEMENTADO:**

### 🤖 **Sistema Multi-Provider de IA**
- ✅ Gemini 2.5 Flash (Google)
- ✅ GPT-4o / GPT-4 Turbo (OpenAI)
- ✅ Claude 3.5 Sonnet (Anthropic)
- ✅ Grok 2 (xAI)

### 💬 **Chat Completo**
- ✅ Memória de conversa (contexto completo)
- ✅ Múltiplas conversas separadas
- ✅ Botão "Nova Conversa"
- ✅ Histórico persistente
- ✅ Respostas em tempo real

### ⚙️ **Painel Admin**
- ✅ Seletor de Provider (Gemini/OpenAI/Claude/Grok)
- ✅ Seletor de Modelo (dinâmico via API)
- ✅ Configuração de chaves API
- ✅ Gestão de créditos
- ✅ Gestão de pacotes

---

## 📦 **DEPLOY NO COOLIFY**

### **1. VARIÁVEIS DE AMBIENTE**

Configure no Coolify → Settings → Environment:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://supabase.luizleno.com.br
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu_anon_key
SUPABASE_SERVICE_ROLE_KEY=seu_service_role_key

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=TEST-xxx
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxx

# App
NEXT_PUBLIC_APP_URL=https://agentiverso.saas.luizleno.com.br

# Chaves de IA (OPCIONAL - pode configurar via Admin)
GEMINI_API_KEY=AIzaSyBVxBBrcZDIUyV7hGTqXdVz95ETt6ZHulI
# OPENAI_API_KEY=sk-...
# CLAUDE_API_KEY=sk-ant-...
# GROK_API_KEY=xai-...
```

### **2. START COMMAND**

⚠️ **IMPORTANTE:** No Coolify → Settings → Start Command:

Mude de `npm start` para:
```bash
node .next/standalone/server.js
```

### **3. BUILD COMMAND**

Deixe como padrão:
```bash
npm run build
```

### **4. APÓS O DEPLOY**

1. **Acesse o admin:** https://agentiverso.saas.luizleno.com.br/admin/settings
2. **Configure o Provider:** Selecione "Google Gemini"
3. **Cole a chave API:** AIzaSyBVxBBrcZDIUyV7hGTqXdVz95ETt6ZHulI
4. **Clique em "🔄 Recarregar"** para carregar modelos
5. **Selecione o modelo:** models/gemini-2.5-flash
6. **Salve**

---

## 🗄️ **BANCO DE DADOS (SUPABASE)**

Execute este SQL se ainda não tiver executado:

```sql
-- Criar policies para transactions (se ainda não existe)
CREATE POLICY "Users can view their own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update transactions" 
ON public.transactions FOR UPDATE 
USING (true);

-- Criar tabelas de configurações (se não existir)
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de pacotes de créditos (se não existir)
CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna phone em profiles (se não existir)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Inserir pacotes padrão
INSERT INTO credit_packages (name, amount, price) VALUES
  ('Pacote Básico', 100, 10),
  ('Pacote Plus', 500, 45),
  ('Pacote Premium', 1000, 80),
  ('Pacote Corporate', 5000, 350)
ON CONFLICT DO NOTHING;
```

---

## 🧪 **TESTAR APÓS DEPLOY**

1. ✅ Site carrega?
2. ✅ Login funciona?
3. ✅ Dashboard aparece?
4. ✅ Chat abre?
5. ✅ Chat responde (Gemini)?
6. ✅ Chat tem memória?
7. ✅ Botão "Nova Conversa" funciona?
8. ✅ Histórico aparece?
9. ✅ Admin settings funciona?
10. ✅ Pode trocar de provider?

---

## ⚠️ **SE DER ERRO**

### **Bad Gateway:**
- Verifique logs: Coolify → Logs → Runtime
- Comando de start correto? `node .next/standalone/server.js`
- Variáveis de ambiente configuradas?

### **Chat não responde:**
- Admin settings → Configurou provider?
- Chave API está correta?
- Clicou em "Recarregar" modelos?

### **Erro de build:**
- Verifique package.json está completo
- Delete node_modules e reinstale
- Verifique Next.js 16 compatibility

---

## 📝 **PRÓXIMOS PASSOS (OPCIONAL)**

1. **Base de Conhecimento RAG:** Upload de documentos para agentes
2. **Menu lateral:** Lista de conversas estilo ChatGPT
3. **Mercado Pago:** Finalizar integração do webhook
4. **Triggers:** Dar créditos iniciais para novos usuários
5. **Claude/Grok:** Adicionar chaves e testar outros providers

---

**🎉 TUDO IMPLEMENTADO E PRONTO PARA DEPLOY!**
