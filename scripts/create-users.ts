/**
 * Script para criar usuários de teste no Supabase
 * 
 * Este script cria:
 * 1. Um usuário administrador geral
 * 2. Um usuário da escola teste
 * 
 * Uso: npx tsx scripts/create-users.ts
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://kzmiuivepufxkrdedxrj.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6bWl1aXZlcHVmeGtyZGVkeHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjgwODMsImV4cCI6MjA3OTY0NDA4M30.hxOfMJTvCbDxIznhZGkpdb4PZSl-uaDwGRyvGIlk9Ag';

// Você precisa da SERVICE_ROLE_KEY para criar usuários
// Obtenha em: https://supabase.com/dashboard/project/ttpakcmpugwlahukmecm/settings/api
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não encontrada!');
    console.log('\n📝 Para obter a chave:');
    console.log('1. Acesse: https://supabase.com/dashboard/project/ttpakcmpugwlahukmecm/settings/api');
    console.log('2. Copie a "service_role" key (secret)');
    console.log('3. Adicione ao arquivo .env: SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui\n');
    process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const SCHOOL_ID = '00000000-0000-0000-0000-000000000001';

async function createSchool() {
    console.log('🏫 Criando escola de teste...');

    const { data, error } = await supabaseAdmin
        .from('schools')
        .upsert({
            id: SCHOOL_ID,
            name: 'Escola Teste',
            code: 'ESCOLA_TESTE'
        }, {
            onConflict: 'id'
        })
        .select()
        .single();

    if (error) {
        console.error('❌ Erro ao criar escola:', error);
        return null;
    }

    console.log('✅ Escola criada:', data);
    return data;
}

async function createAdminUser() {
    console.log('\n👤 Criando usuário administrador...');

    const email = 'admin@chathorario.com';
    const password = 'Admin@2025';

    // Criar usuário no Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: 'Administrador Geral'
        }
    });

    if (authError) {
        console.error('❌ Erro ao criar usuário admin:', authError);
        return null;
    }

    console.log('✅ Usuário admin criado:', authData.user.id);

    // Criar perfil
    const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: authData.user.id,
            role: 'admin',
            full_name: 'Administrador Geral',
            school_id: null
        }, {
            onConflict: 'id'
        })
        .select()
        .single();

    if (profileError) {
        console.error('❌ Erro ao criar perfil admin:', profileError);
        return null;
    }

    console.log('✅ Perfil admin criado');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Senha: ${password}`);

    return authData.user;
}

async function createSchoolUser() {
    console.log('\n👤 Criando usuário da escola...');

    const email = 'escola@teste.com';
    const password = 'Escola@2025';

    // Criar usuário no Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: 'Usuário Escola Teste'
        }
    });

    if (authError) {
        console.error('❌ Erro ao criar usuário escola:', authError);
        return null;
    }

    console.log('✅ Usuário escola criado:', authData.user.id);

    // Criar perfil
    const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: authData.user.id,
            role: 'staff',
            full_name: 'Usuário Escola Teste',
            school_id: SCHOOL_ID,
            school_name: 'Escola Teste'
        }, {
            onConflict: 'id'
        })
        .select()
        .single();

    if (profileError) {
        console.error('❌ Erro ao criar perfil escola:', profileError);
        return null;
    }

    console.log('✅ Perfil escola criado');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Senha: ${password}`);

    return authData.user;
}

async function main() {
    console.log('🚀 Iniciando criação de usuários de teste...\n');

    try {
        // Criar escola
        await createSchool();

        // Criar usuários
        await createAdminUser();
        await createSchoolUser();

        console.log('\n✅ Processo concluído com sucesso!');
        console.log('\n📝 Credenciais criadas:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👨‍💼 ADMINISTRADOR GERAL');
        console.log('   Email: admin@chathorario.com');
        console.log('   Senha: Admin@2025');
        console.log('   Role: admin');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🏫 USUÁRIO DA ESCOLA');
        console.log('   Email: escola@teste.com');
        console.log('   Senha: Escola@2025');
        console.log('   Role: staff');
        console.log('   Escola: Escola Teste');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ Erro no processo:', error);
        process.exit(1);
    }
}

main();
