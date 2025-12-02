-- =====================================================
-- Script de Criação de Usuários para Autenticação
-- =====================================================
-- Este script deve ser executado no SQL Editor do Supabase
-- Dashboard: https://supabase.com/dashboard/project/ttpakcmpugwlahukmecm

-- =====================================================
-- 1. Garantir que a tabela profiles existe
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'teacher')),
    full_name TEXT,
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    school_name TEXT,
    responsible TEXT,
    academic_year TEXT DEFAULT '2025',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. Garantir que a tabela schools existe
-- =====================================================
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. Habilitar RLS nas tabelas
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. Criar políticas RLS para profiles
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- 5. Criar políticas RLS para schools
-- =====================================================
DROP POLICY IF EXISTS "Users can view their school" ON schools;
DROP POLICY IF EXISTS "Admins can view all schools" ON schools;
DROP POLICY IF EXISTS "Admins can manage schools" ON schools;

CREATE POLICY "Users can view their school" ON schools
    FOR SELECT
    USING (
        id IN (
            SELECT school_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all schools" ON schools
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage schools" ON schools
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- 6. Criar escola de teste
-- =====================================================
INSERT INTO schools (id, name, code)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Escola Teste',
    'ESCOLA_TESTE'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name;

-- =====================================================
-- 7. INSTRUÇÕES PARA CRIAR USUÁRIOS
-- =====================================================
-- Os usuários devem ser criados via Supabase Dashboard ou API
-- Não é possível criar usuários auth diretamente via SQL

-- Após criar os usuários no dashboard, execute o seguinte
-- para associar os perfis:

-- USUÁRIO 1: Administrador Geral
-- Email: admin@chathorario.com
-- Senha: Admin@2025
-- Criar manualmente em: Authentication > Users > Add User
-- Depois execute:
/*
INSERT INTO profiles (id, role, full_name, school_id)
VALUES (
    'COLE_AQUI_O_UUID_DO_USUARIO_ADMIN',
    'admin',
    'Administrador Geral',
    NULL
);
*/

-- USUÁRIO 2: Usuário da Escola Teste
-- Email: escola@teste.com
-- Senha: Escola@2025
-- Criar manualmente em: Authentication > Users > Add User
-- Depois execute:
/*
INSERT INTO profiles (id, role, full_name, school_id, school_name)
VALUES (
    'COLE_AQUI_O_UUID_DO_USUARIO_ESCOLA',
    'staff',
    'Usuário Escola Teste',
    '00000000-0000-0000-0000-000000000001',
    'Escola Teste'
);
*/
