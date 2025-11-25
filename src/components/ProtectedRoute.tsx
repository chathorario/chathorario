import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { getDefaultRouteByRole } from "@/lib/routes";

type Role = 'admin' | 'staff' | 'teacher';

export default function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: Role | Role[] }) {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.id);
  const location = useLocation();

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const userRole = profile?.role ?? undefined;

    // Evitar redirecionamento redundante quando role ainda não foi definida
    // Regra: permitir acesso às rotas da escola sem role carregada; bloquear admin
    if (!userRole) {
      const allowsSchool = roles.includes("staff") || roles.includes("teacher");
      if (allowsSchool) {
        // Quando a rota já é do contexto escola, não redirecionar para evitar "duas páginas".
        return <>{children}</>;
      }
      // Para rotas administrativas, enviar ao dashboard padrão da escola.
      const target = getDefaultRouteByRole(userRole);
      // Se já estamos no alvo, mantém sem redirecionar.
      if (location.pathname === target) {
        return <>{children}</>;
      }
      return <Navigate to={target} replace />;
    }

    // Com role definido, validar permissão
    if (!roles.includes(userRole)) {
      const target = getDefaultRouteByRole(userRole);
      if (location.pathname === target) {
        return <>{children}</>;
      }
      return <Navigate to={target} replace />;
    }
  }

  return <>{children}</>;
}
