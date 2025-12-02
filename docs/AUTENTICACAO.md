# 🔐 Guia de Configuração de Autenticação - ChatHorário

## ✅ Estrutura do Banco de Dados Criada

Todas as tabelas necessárias foram criadas com sucesso no Supabase:

### Tabelas Principais:
- ✅ `schools` - Escolas
- ✅ `profiles` - Perfis de usuários
- ✅ `teachers` - Professores
- ✅ `subjects` - Disciplinas
- ✅ `classes` - Turmas
- ✅ `workloads` - Cargas horárias
- ✅ `teacher_availability` - Disponibilidade dos professores
- ✅ `allocations` - Alocações
- ✅ `schedule_scenarios` - Cenários de horários
- ✅ `generation_parameters` - Parâmetros de geração
- ✅ `school_configs` - Configurações da escola
- ✅ `fixed_lessons` - Aulas fixas

### Escola de Teste:
- ✅ Escola "Escola Teste" criada (ID: 00000000-0000-0000-0000-000000000001)

### Trigger Automático:
- ✅ Trigger `handle_new_user()` configurado para criar perfis automaticamente

---

## 📝 Como Criar os Usuários

### Opção 1: Via Supabase Dashboard (RECOMENDADO)

1. **Acesse o Dashboard do Supabase:**
   - URL: https://supabase.com/dashboard/project/kzmiuivepufxkrdedxrj/auth/users

2. **Desabilite a Confirmação de Email (Temporariamente):**
   - Vá em: **Authentication** > **Email Auth** > **Settings**
   - Desmarque "Enable email confirmations"
   - Clique em "Save"

3. **Crie o Usuário Administrador:**
   - Clique em "Add User" > "Create new user"
   - Email: `admin@chathorario.com`
   - Password: `Admin@2025`
   - Auto Confirm User: ✅ (marque esta opção)
   - Clique em "Create user"
   - **O trigger criará automaticamente o perfil de admin!**

4. **Crie o Usuário da Escola:**
   - Clique em "Add User" > "Create new user"
   - Email: `escola@teste.com`
   - Password: `Escola@2025`
   - Auto Confirm User: ✅ (marque esta opção)
   - Clique em "Create user"
   - **O trigger criará automaticamente o perfil de staff vinculado à Escola Teste!**

5. **Reabilite a Confirmação de Email (Opcional):**
   - Volte em **Authentication** > **Email Auth** > **Settings**
   - Marque "Enable email confirmations"
   - Clique em "Save"

---

### Opção 2: Via Interface do App

1. **Desabilite a Confirmação de Email** (conforme instruções acima)

2. **Acesse a tela de cadastro:**
   - Abra: http://localhost:8080/auth
   - Clique na aba "Criar conta"

3. **Crie o Administrador:**
   - Nome Completo: `Administrador Geral`
   - Email: `admin@chathorario.com`
   - Senha: `Admin@2025`
   - Confirmar Senha: `Admin@2025`
   - Clique em "Criar conta"

4. **Crie o Usuário da Escola:**
   - Nome Completo: `Usuário Escola Teste`
   - Email: `escola@teste.com`
   - Senha: `Escola@2025`
   - Confirmar Senha: `Escola@2025`
   - Clique em "Criar conta"

---

## 🎯 Credenciais dos Usuários

### 👨‍💼 Administrador Geral
```
Email: admin@chathorario.com
Senha: Admin@2025
Role: admin
Permissões: Acesso total ao sistema
```

### 🏫 Usuário da Escola Teste
```
Email: escola@teste.com
Senha: Escola@2025
Role: staff
Escola: Escola Teste
Permissões: Gerenciar dados da escola
```

---

## 🔍 Verificar se Funcionou

### 1. Verificar Perfis no Supabase:
```sql
SELECT 
  p.id,
  p.full_name,
  p.role,
  s.name as school_name,
  au.email
FROM profiles p
LEFT JOIN schools s ON p.school_id = s.id
LEFT JOIN auth.users au ON p.id = au.id;
```

### 2. Testar Login:
- Acesse: http://localhost:8080/auth
- Tente fazer login com as credenciais acima
- O admin deve ser redirecionado para `/admin`
- O usuário da escola deve ser redirecionado para `/escola`

---

## 🐛 Solução de Problemas

### Erro 400 no Signup:
- **Causa:** Confirmação de email habilitada
- **Solução:** Desabilite temporariamente em Authentication > Email Auth > Settings

### Erro 500 ao carregar schools:
- **Causa:** Políticas RLS muito restritivas
- **Solução:** Já corrigido! As políticas foram atualizadas para permitir acesso.

### Perfil não criado automaticamente:
- **Causa:** Trigger não executado
- **Solução:** Verifique se o trigger existe:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### Usuário criado mas não consegue logar:
- **Causa:** Email não confirmado
- **Solução:** No dashboard, vá em Authentication > Users, clique no usuário e marque "Email Confirmed"

---

## 📊 Próximos Passos

Após criar os usuários:

1. ✅ Faça login com o usuário admin
2. ✅ Teste o acesso ao dashboard administrativo
3. ✅ Faça login com o usuário da escola
4. ✅ Teste o cadastro de professores, disciplinas e turmas
5. ✅ Configure os parâmetros da escola

---

## 🔒 Segurança

- As senhas são armazenadas de forma segura pelo Supabase (hash bcrypt)
- Row Level Security (RLS) está habilitado em todas as tabelas
- Cada usuário só pode acessar dados da sua escola (exceto admins)
- Políticas de acesso estão configuradas corretamente

---

## 📞 Suporte

Se encontrar algum problema:
1. Verifique o console do navegador (F12)
2. Verifique os logs do Supabase
3. Execute as queries SQL de verificação acima
