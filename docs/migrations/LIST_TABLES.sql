-- Listar todas as tabelas do esquema 'public'
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Listar colunas da tabela 'credit_packages' (para verificar estrutura)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'credit_packages';
