// Centraliza a lógica de rota padrão conforme papel do usuário
// Mantém consistência entre headers, navegação e pós-login

export type UserRole = 'admin' | 'staff' | 'teacher' | 'student' | null | undefined;

export function getDefaultRouteByRole(role: UserRole): string {
  // Sem role definido (perfil ausente ou incompleto) → ir para dashboard escola
  if (!role) return '/escola';
  if (role === 'admin') return '/admin';
  return '/escola';
}

// Opcional: base path por papel (útil para menus/header)
export function getBasePathByRole(role: UserRole): string {
  return getDefaultRouteByRole(role);
}