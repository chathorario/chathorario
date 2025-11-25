# Implementação: Redirecionamento por Papel, Onboarding de Escola e Gestão de Usuários

Este guia documenta, de forma passo a passo, como o sistema identifica o papel (`role`) do usuário ao logar, redireciona para o painel adequado, e como implementar o fluxo de cadastro de escolas e de funcionários com segurança e boa UX.

## Visão Geral
- Identificação de `role` é feita via `profiles` (Supabase) usando o hook `useProfile(user?.id)`.
- Redirecionamento padrão por papel:
  - `admin` → `'/admin'`
  - `staff/teacher` → `'/escola'`
- Onboarding de escola: após login, permitir criar escola nova (criador vira `staff`) ou entrar em uma escola existente via `invite_code`. Finalizar dados em `'/school-setup'`.
- Gestão de funcionários da escola: listar e gerenciar usuários por `school_id`, definindo `role` e vinculação.

## Onde o Sistema Identifica a Role e Redireciona

### Pontos atuais do código
- `src/pages/Auth.tsx`: usa `useProfile(user?.id)` e decide a rota padrão por `role` no `useEffect` e após `signIn`.
- `src/App.tsx`: define rotas protegidas `'/admin'` (AdminDashboard) e `'/escola'` (EscolaDashboard).
- `src/components/layout/dashboardNav.ts`: item “Dashboard” aponta para `'/admin'` ou `'/escola'` conforme `role`.
- `src/components/layout/Header.tsx`, `AdminHeader.tsx`, `EscolaHeader.tsx`: menus e botões “Menu” direcionam por papel.
- `src/components/ProtectedRoute.tsx`: garante autenticação (pode evoluir para validar papel).

## Melhor Arquitetura (Centralização e Robustez)

### 1) Centralizar a rota padrão por papel
Crie `src/lib/routes.ts` com uma função utilitária:

```ts
// src/lib/routes.ts
export type UserRole = 'admin' | 'staff' | 'teacher' | undefined;

export const getDefaultRouteByRole = (role: UserRole): '/admin' | '/escola' => {
  return role === 'admin' ? '/admin' : '/escola';
};
```

Atualize os pontos que decidem rota para usar `getDefaultRouteByRole(role)`:
- `src/pages/Auth.tsx`: após login e no `useEffect`.
- `src/components/layout/dashboardNav.ts`: item base “Dashboard”.
- `src/components/layout/Header.tsx`, `AdminHeader.tsx`, `EscolaHeader.tsx`: botão “Menu”.

### 2) Fortalecer proteção por papel nas rotas
Evolua `ProtectedRoute` para aceitar `requiredRole` e bloquear acesso fora do papel permitido.

```tsx
// src/components/ProtectedRoute.tsx (exemplo)
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { getDefaultRouteByRole } from '@/lib/routes';

type Role = 'admin' | 'staff' | 'teacher';

export default function ProtectedRoute({ children, requiredRole }: { children: ReactNode; requiredRole?: Role | Role[] }) {
  const { user } = useAuth();
  const { profile, loading } = useProfile(user?.id);

  if (!user) return <Navigate to="/auth" replace />;
  if (loading) return null; // ou um spinner

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!profile?.role || !roles.includes(profile.role)) {
      return <Navigate to={getDefaultRouteByRole(profile?.role)} replace />;
    }
  }
  return <>{children}</>;
}
```

No `src/App.tsx`, aplique:

```tsx
<Route path="/admin" element={
  <ProtectedRoute requiredRole="admin">
    <AdminDashboard />
  </ProtectedRoute>
} />
<Route path="/escola" element={
  <ProtectedRoute requiredRole={["staff","teacher"]}>
    <EscolaDashboard />
  </ProtectedRoute>
} />
```

### 3) Remover a rota antiga `/dashboard`
- Substituir todas as referências por `'/escola'` (exceto admin → `'/admin'`).
- Verificar arquivos: `Auth.tsx`, `Header.tsx`, `dashboardNav.ts`, `EscolaHeader.tsx`, páginas escola.

## Onboarding de Escola (Pós-login)

### Fluxo
1. Usuário loga em `/auth`.
2. Se `profile.school_id` estiver vazio:
   - Opção A: “Criar escola nova” (o criador vira `staff`).
   - Opção B: “Entrar na escola existente” via `invite_code`.
3. Após vincular a escola, redirecionar para `'/school-setup'` para finalizar cadastro.

### Implementação (exemplos com Supabase JS)

Criar escola e vincular criador:
```ts
import { supabase } from '@/integrations/supabase/client';

async function createSchoolAndLinkProfile(userId: string, schoolName: string) {
  const invite_code = crypto.randomUUID();
  const { data: school, error } = await supabase
    .from('schools')
    .insert({ name: schoolName, invite_code })
    .select('*')
    .single();
  if (error) throw error;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ school_id: school.id, role: 'staff' })
    .eq('id', userId);
  if (updateError) throw updateError;

  return school;
}
```

Entrar em escola existente por `invite_code`:
```ts
async function joinSchoolByInvite(userId: string, inviteCode: string, role: 'teacher' | 'staff' = 'teacher') {
  const { data: school, error } = await supabase
    .from('schools')
    .select('id')
    .eq('invite_code', inviteCode)
    .single();
  if (error || !school) throw error || new Error('Código inválido');

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ school_id: school.id, role })
    .eq('id', userId);
  if (updateError) throw updateError;
}
```

Após vincular:
```ts
navigate('/school-setup');
```

### `SchoolSetup` (cadastro completo)
- Completar dados: nome, endereço, turnos, parâmetros escolares.
- Persistir em `schools` e (se necessário) coleções relacionadas (ex.: `shifts`, `parameters`).
- Ao finalizar, redirecionar para `'/escola'`.

## Gestão de Funcionários da Escola

Crie uma página (ex.: `src/pages/Escola/UsersManagement.tsx`):
- Lista usuários (`profiles`) com `school_id` igual ao do gestor.
- Ações:
  - Definir `role` (`staff`/`teacher`).
  - Copiar/compartilhar `invite_code` da escola.
  - Vincular/desvincular usuários (alterando `profiles.school_id`).

Exemplo de listagem:
```ts
async function listSchoolUsers(schoolId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('school_id', schoolId);
  if (error) throw error;
  return data;
}
```

Atualização de papel:
```ts
async function updateUserRole(userId: string, role: 'teacher' | 'staff') {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);
  if (error) throw error;
}
```

## Supabase e Segurança

### Tabelas
- `schools`: `id`, `name`, `invite_code`, `created_at`.
- `profiles`: `id`, `email`, `full_name`, `role ('admin'|'staff'|'teacher')`, `school_id`.

### Políticas RLS (conceito)
- Usuários só leem/alteram registros da sua `school_id`.
- `admin` tem acesso amplo (ou por políticas específicas).
- Ao vincular `school_id`, o usuário passa a ter acesso aos dados daquela escola.

### Notas de implementação
- Use o cliente Supabase JS do projeto (não a CLI) e/ou a MCP do Supabase para operações administrativas externas ao app.
- Evite armazenar `invite_code` em texto aberto; se possível, usar formatos assinados ou hashes.

## Passo a Passo de Implementação (Checklist)

1. Criar `src/lib/routes.ts` com `getDefaultRouteByRole(role)`.
2. Atualizar `Auth.tsx` para usar a função central e passar `user?.id` a `useProfile`.
3. Atualizar `dashboardNav.ts` para usar a rota padrão dinâmica.
4. Atualizar `Header.tsx`, `AdminHeader.tsx`, `EscolaHeader.tsx` para usar a rota padrão em “Menu”.
5. Evoluir `ProtectedRoute` com `requiredRole`; aplicar em `App.tsx`.
6. Remover/alterar todas as referências a `'/dashboard'` → `'/escola'`.
7. Implementar onboarding pós-login: criar/entrar na escola, vincular `profile.school_id`, navegar para `'/school-setup'`.
8. Implementar página de gestão de usuários da escola.
9. Validar fluxos com contas `admin`, `staff`, `teacher` e com `school_id` vazio.

## Testes Sugeridos
- Login `admin`: deve ir para `'/admin'`; acesso negado a páginas da escola com RLS.
- Login `staff` sem escola: onboarding aparece; após criar, `'/school-setup'` e depois `'/escola'`.
- Login `teacher` com `invite_code`: vincula e vai para `'/school-setup'` se incompleto ou `'/escola'` se já configurada.
- Acesso indevido: `ProtectedRoute` redireciona para rota padrão do papel.

## Observações Finais
- A rota antiga `'/dashboard'` foi descontinuada em favor de `'/escola'`.
- Centralizar a decisão de rota minimiza bugs e duplicidade.
- O fluxo híbrido (self‑serve com moderação) oferece melhor UX e governança.