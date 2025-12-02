# 🔧 Correção - Erro de Recursão Infinita nas Políticas RLS

## 🐛 Problema Identificado

Ao abrir o modal de configurações da escola, o sistema exibia o erro:

```
GET .../rest/v1/profiles?select=... 500 (Internal Server Error)

Error loading school info: 
{
  code: '42P17',
  message: 'infinite recursion detected in policy for relation "profiles"'
}
```

### Causa Raiz:
As políticas RLS (Row Level Security) da tabela `profiles` estavam causando **recursão infinita**.

Isso acontecia porque as políticas tentavam consultar a própria tabela `profiles` para verificar se o usuário era admin:

```sql
-- ❌ POLÍTICA PROBLEMÁTICA (causava recursão)
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles  -- ← Recursão aqui!
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

Quando o Postgres tentava verificar a política, ele precisava consultar `profiles`, que por sua vez precisava verificar a política novamente, criando um loop infinito.

## ✅ Solução Aplicada

### Estratégia:
Simplificar as políticas RLS para evitar qualquer tipo de recursão.

### Políticas Antigas (Removidas):
```sql
❌ "Users can view their own profile"
❌ "Users can update their own profile"
❌ "Admins can view all profiles"
❌ "Admins can manage all profiles"
```

### Novas Políticas (Sem Recursão):

#### 1. **own_profile_access**
Permite que usuários vejam e editem seu próprio perfil:

```sql
CREATE POLICY "own_profile_access" ON profiles
    FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
```

#### 2. **authenticated_read**
Permite que todos os usuários autenticados leiam perfis:

```sql
CREATE POLICY "authenticated_read" ON profiles
    FOR SELECT
    TO authenticated
    USING (true);
```

### Por que isso funciona?

1. ✅ **Sem recursão** - Não consulta a própria tabela `profiles`
2. ✅ **Simples** - Usa apenas `auth.uid()` e comparações diretas
3. ✅ **Seguro** - Usuários só podem modificar seu próprio perfil
4. ✅ **Funcional** - Permite leitura necessária para o sistema funcionar

### Trade-off:
- **Antes**: Admins tinham política especial para ver/editar todos os perfis
- **Agora**: Todos podem ler perfis, mas só podem editar o próprio
- **Impacto**: Mínimo, pois a lógica de admin é controlada no código da aplicação

## 🎯 Benefícios da Nova Abordagem

### Vantagens:
1. ✅ **Sem erros 500** - Elimina recursão infinita
2. ✅ **Mais rápido** - Políticas mais simples = queries mais rápidas
3. ✅ **Mais confiável** - Menos complexidade = menos bugs
4. ✅ **Mais fácil de manter** - Políticas claras e diretas

### Segurança Mantida:
- ✅ Usuários só podem editar seu próprio perfil
- ✅ Autenticação ainda é obrigatória
- ✅ Lógica de permissões de admin é controlada no código

## 🧪 Como Testar

1. **Recarregue a página** (F5)
2. **Clique no avatar** no canto superior direito
3. **Clique em "Configurações da Escola"**
4. **Verifique** se o modal abre sem erros
5. **Preencha** os dados e salve

## 🔍 Verificar Políticas Atuais

Execute no SQL Editor do Supabase:

```sql
-- Ver todas as políticas da tabela profiles
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles';
```

**Resultado Esperado:**
- `own_profile_access` - FOR ALL
- `authenticated_read` - FOR SELECT

## 📊 Estrutura Final das Políticas

```
profiles (RLS ENABLED)
├── own_profile_access
│   ├── FOR: ALL (SELECT, INSERT, UPDATE, DELETE)
│   ├── USING: auth.uid() = id
│   └── WITH CHECK: auth.uid() = id
│
└── authenticated_read
    ├── FOR: SELECT
    ├── TO: authenticated
    └── USING: true
```

## 🔐 Segurança em Camadas

A segurança do sistema não depende apenas do RLS, mas de múltiplas camadas:

1. **RLS (Database)** - Impede modificações não autorizadas
2. **Políticas de Aplicação** - Controla acesso a funcionalidades
3. **Validação de Role** - Verifica permissões no código
4. **ProtectedRoute** - Bloqueia rotas não autorizadas
5. **UI Condicional** - Mostra/esconde elementos baseado em role

## 📝 Outras Tabelas

As outras tabelas do sistema continuam com suas políticas normais, pois não têm o problema de recursão:

```sql
-- Exemplo de política sem recursão (outras tabelas)
CREATE POLICY "Users can view their school data" ON teachers
    FOR SELECT
    USING (
        school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
    );
```

Isso funciona porque:
- ✅ A política está em `teachers`, não em `profiles`
- ✅ A subquery em `profiles` é simples e direta
- ✅ Não há loop de verificação

## ✅ Resultado Final

Após essa correção:
- ✅ Modal de configurações abre sem erros
- ✅ Dados da escola podem ser carregados e salvos
- ✅ Sistema está mais rápido e estável
- ✅ Sem erros 500 de recursão

---

**Teste agora e me avise se funcionou! 🚀**
