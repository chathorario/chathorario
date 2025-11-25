import { Home, School, Users, BookOpen, GraduationCap, Clock, Shield, User, BarChart3, Settings, CalendarX, LayoutGrid, Sliders, Play } from "lucide-react";
import { getDefaultRouteByRole } from "@/lib/routes";

export type DashboardRole = "admin" | "staff" | "teacher";

export interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const getDashboardNavItems = (role: DashboardRole): NavItem[] => {
  const baseItems: NavItem[] = [
    { path: role === "admin" ? "/admin" : "/escola", label: "Início", icon: Home },
  ];

  const schoolItems: NavItem[] = [
    { path: "/config", label: "Configurações", icon: Settings },
    { path: "/classes", label: "Turmas", icon: GraduationCap },
    { path: "/subjects", label: "Disciplinas", icon: BookOpen },
    { path: "/teachers", label: "Professores", icon: Users },
    { path: "/availability", label: "Indisponibilidades", icon: CalendarX },
    { path: "/allocation", label: "Alocação", icon: LayoutGrid },
    { path: "/generation-settings", label: "Parâmetros", icon: Sliders },
    { path: "/generate", label: "Geração", icon: Play },
  ];

  const adminItems: NavItem[] = [
    { path: "/admin", label: "Admin", icon: Shield },
    { path: "/admin/users", label: "Usuários", icon: User },
    { path: "/admin/reports", label: "Relatórios", icon: BarChart3 },
    { path: "/admin/settings", label: "Configurações", icon: Settings },
  ];

  if (role === "admin") {
    return [...baseItems, ...adminItems];
  }
  if (role === "staff" || role === "teacher") {
    return [...baseItems, ...schoolItems];
  }
  return baseItems;
};
