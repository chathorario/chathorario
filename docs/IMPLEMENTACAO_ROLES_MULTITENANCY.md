# Implementação de Roles e Multi-tenancy no ChatHorário

## Visão Geral

Este documento descreve a implementação do sistema de roles (papéis) e multi-tenancy no projeto ChatHorário, que permite diferentes níveis de acesso e isolamento de dados entre escolas.

## Arquitetura

### 1. Estrutura de Roles

O sistema possui três tipos de usuários:

- **admin**: Administrador do sistema
- **staff**: Gestor escolar
- **teacher**: Professor

### 2. Multi-tenancy por Escola

Cada escola possui seu próprio isolamento de dados através do campo `school_id` presente em todas as tabelas principais.

## Componentes Implementados

### 1. Hook useProfile

**Arquivo:** `src/hooks/useProfile.ts`

Hook personalizado para gerenciar os dados do perfil do usuário:

```typescript
interface Profile {
  id: string;
  school_id: string;
  role: 'admin' | 'staff' | 'teacher';
  full_name: string;
  school_name: string;
  created_at: string;
}
```

**Funcionalidades:**
- Busca dados do perfil no Supabase
- Gerencia estados de loading e erro
- Fornece informações de role e escola

### 2. Dashboard Administrativo

**Arquivo:** `src/pages/AdminDashboard.tsx`

Dashboard exclusivo para usuários admin:

**Funcionalidades:**
- Estatísticas gerais do sistema
- Visualização de total de escolas e usuários
- Ações rápidas para gerenciamento
- Acesso negado para usuários não-admin

**Estatísticas exibidas:**
- Total de escolas
- Total de usuários
- Usuários por role (admin, staff, teacher)

### 3. Dashboard Modificado

**Arquivo:** `src/pages/Dashboard.tsx`

Dashboard adaptativo baseado no role do usuário:

**Para staff/teacher:**
- Interface focada na escola do usuário
- Cards para gerenciar professores, turmas e disciplinas
- Acesso às funcionalidades específicas da escola

**Para admin:**
- Acesso ao dashboard administrativo via navegação

### 4. Navegação Baseada em Roles

**Arquivo:** `src/components/layout/Header.tsx`

Sistema de navegação que adapta os menus baseado no role:

**Admin:**
- Dashboard
- Admin (área administrativa)
- Usuários
- Relatórios
- Configurações

**Staff/Teacher:**
- Dashboard
- Escola
- Professores
- Disciplinas
- Turmas
- Carga Horária

**Visualização do perfil:**
- Badge com o role do usuário
- Nome da escola (quando aplicável)
- Email do usuário

### 5. Rotas Protegidas

**Arquivo:** `src/App.tsx`

Adicionada rota para o dashboard administrativo:

```typescript
<Route path="/admin" element={
  <ProtectedRoute>
    <AdminDashboard />
  </ProtectedRoute>
} />
```

## Segurança

### Row Level Security (RLS)

O banco de dados implementa políticas de segurança através de RLS:

- **Isolamento por escola:** Todas as consultas filtram por `school_id`
- **Controle por role:** Acesso baseado no role do usuário
- **Políticas implementadas:**
  - Usuários só acessam dados da sua escola
  - Admins têm acesso a todas as escolas
  - Staff têm controle total na sua escola
  - Teachers têm acesso limitado (leitura na maioria dos casos)

### Exemplos de Políticas

```sql
-- Política para tabela schools
CREATE POLICY "Users can view their school" ON schools
  FOR SELECT USING (
    id = (SELECT school_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

## Banco de Dados

### Tabela profiles

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  school_id UUID REFERENCES schools(id),
  role TEXT CHECK (role IN ('admin', 'staff', 'teacher')),
  full_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Relacionamentos

- `profiles.school_id` → `schools.id`
- Todas as tabelas escolares possuem `school_id` para isolamento

## Fluxo de Autenticação

1. Usuário faz login
2. Sistema busca perfil na tabela `profiles`
3. Role e school_id são armazenados no contexto
4. Navegação e dashboards se adaptam ao role
5. Todas as consultas respeitam o RLS do banco de dados

## Testes e Validação

### Cenários de Teste

1. **Login como admin:**
   - Acesso ao dashboard administrativo
   - Visualização de todas as escolas
   - Navegação completa

2. **Login como staff:**
   - Acesso ao dashboard da escola
   - Gerenciamento da própria escola
   - Isolamento de dados

3. **Login como teacher:**
   - Acesso limitado ao dashboard
   - Visualização de dados da escola
   - Restrições de edição

### Validação de Segurança

- Verificar se usuários não conseguem acessar dados de outras escolas
- Confirmar que apenas admins acessam o dashboard administrativo
- Validar que o RLS está funcionando corretamente

## Próximos Passos

1. **Implementar gerenciamento de usuários:**
   - CRUD de usuários para admins
   - Atribuição de roles
   - Gestão de escolas

2. **Relatórios específicos por role:**
   - Relatórios administrativos
   - Relatórios de gestão escolar
   - Relatórios de professor

3. **Configurações avançadas:**
   - Configurações por escola
   - Personalização de permissões
   - Auditoria de acessos

## Considerações de Performance

- Índices em `school_id` e `role` para otimização
- Cache de perfil no frontend
- Lazy loading de dashboards específicos

## Manutenção

### Adicionar novo role

1. Atualizar CHECK constraint na tabela `profiles`
2. Adicionar lógica no `Header.tsx`
3. Atualizar dashboards específicos
4. Ajustar RLS policies

### Modificar permissões

1. Revisar políticas RLS
2. Atualizar lógica nos componentes
3. Testar cenários de segurança
4. Documentar mudanças