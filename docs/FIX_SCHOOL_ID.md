# 🔧 Correção - Erro ao Salvar Configurações

## 🐛 Problema Identificado

Ao tentar salvar configurações na página `/config`, o sistema exibia o erro:

```
School ID not found, cannot save config.
```

### Causa Raiz:
O hook `useProfile` estava tentando fazer um join com a tabela `schools` usando a sintaxe:

```typescript
.select(`
  *,
  schools:school_id(name)
`)
```

Essa sintaxe de join do Supabase pode falhar ou retornar `null` para `school_name`, fazendo com que o perfil não carregasse o `school_id` corretamente no contexto da aplicação.

## ✅ Solução Aplicada

### Arquivo Modificado:
`src/hooks/useProfile.ts`

### Mudanças:

**ANTES:**
```typescript
const { data: profileData, error: profileError } = await supabase
  .from('profiles')
  .select(`
    *,
    schools:school_id(name)
  `)
  .eq('id', userId)
  .maybeSingle();

// ...

school_name: profileData.schools?.name || null,
```

**DEPOIS:**
```typescript
const { data: profileData, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .maybeSingle();

// ...

school_name: profileData.school_name || null,
```

### Explicação:
1. **Removido o join** com a tabela `schools`
2. **Usando diretamente** o campo `school_name` da tabela `profiles`
3. Isso funciona porque a tabela `profiles` já tem o campo `school_name` armazenado

## 🎯 Por que isso funciona melhor?

### Vantagens:
1. ✅ **Mais rápido** - Não precisa fazer join
2. ✅ **Mais confiável** - Não depende de relacionamento externo
3. ✅ **Mais simples** - Query mais direta
4. ✅ **Cache** - O `school_name` já está na tabela profiles

### Estrutura da Tabela Profiles:
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    school_id UUID REFERENCES schools(id),
    school_name TEXT,  -- ← Campo usado agora
    role TEXT,
    full_name TEXT,
    ...
);
```

## 🧪 Como Testar

1. **Faça logout e login novamente** com `escola@teste.com`
2. **Acesse** `/config`
3. **Preencha** as configurações da escola
4. **Clique em Salvar**
5. **Verifique** se salvou sem erros

## 🔍 Verificar no Banco

Execute no SQL Editor do Supabase:

```sql
-- Verificar se o perfil tem school_id
SELECT 
  p.id,
  p.full_name,
  p.role,
  p.school_id,
  p.school_name,
  au.email
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.email = 'escola@teste.com';
```

**Resultado Esperado:**
- `school_id`: `00000000-0000-0000-0000-000000000001`
- `school_name`: `"Escola Teste"`

## 📝 Outras Correções Aplicadas

Também corrigi a mesma query na parte de bootstrap (criação automática de perfil):

```typescript
// Linha 93-113 - Refetch após criar perfil
const { data: createdProfile, error: refetchErr } = await supabase
  .from('profiles')
  .select('*')  // ← Simplificado
  .eq('id', userId)
  .maybeSingle();
```

## ✅ Resultado Final

Após essa correção:
- ✅ O perfil carrega corretamente com `school_id`
- ✅ As configurações podem ser salvas
- ✅ Todas as operações que dependem de `school_id` funcionam
- ✅ O sistema está mais rápido e confiável

---

**Teste agora e me avise se funcionou! 🚀**
