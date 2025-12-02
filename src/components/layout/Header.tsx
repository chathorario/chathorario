import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Shield,
  User,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Home
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getDefaultRouteByRole } from "@/lib/routes";
import { useProfile } from "@/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { SchoolSettingsModal } from "@/components/modals/SchoolSettingsModal";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { ScenarioSwitcher } from "./ScenarioSwitcher";
import { useWorkflowSteps } from "@/hooks/useWorkflowSteps";

import { useData } from "@/context/DataContext";
import { useModal } from "@/hooks/useModal";
import { ModalCenter } from "@/components/ModalCenter";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.id);
  const { hasUnsavedChanges, setHasUnsavedChanges } = useData();
  const { isOpen: isConfirmOpen, open: openConfirm, close: closeConfirm, content: confirmContent, setModal: setConfirmModal } = useModal();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { steps: workflowSteps } = useWorkflowSteps();

  interface NavItem {
    path: string;
    label: string;
    icon: any;
    highlight?: boolean;
  }

  const isActive = (path: string) => location.pathname === path;

  const getNavItems = (): NavItem[] => {
    const email = (user?.email || '').toLowerCase();
    const allowedAdmins = (import.meta.env.VITE_ALLOWED_ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const basePath = profileLoading
      ? (allowedAdmins.includes(email) ? '/admin' : '/escola')
      : getDefaultRouteByRole(profile?.role);

    const baseItems: NavItem[] = [
      { path: basePath, label: "Início", icon: Home },
    ];

    const schoolItems: NavItem[] = workflowSteps;

    const adminItems: NavItem[] = [
      { path: "/admin", label: "Admin", icon: Shield },
      { path: "/admin/users", label: "Usuários", icon: User },
      { path: "/admin/reports", label: "Relatórios", icon: BarChart3 },
      { path: "/admin/settings", label: "Configurações", icon: Settings },
    ];

    if (profile?.role === 'admin') {
      return [...baseItems, ...adminItems];
    }

    if (profile?.role === 'staff' || profile?.role === 'teacher') {
      return [...baseItems, ...schoolItems];
    }

    // Se o perfil ainda não carregou, assume que é usuário da escola
    // Isso evita que o menu fique vazio durante o carregamento
    if (!profile?.role) {
      return [...baseItems, ...schoolItems];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  const displayName = (profile?.full_name || (user?.email ? user.email.split("@")[0] : "Usuário"));
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const roleLabel = profile?.role === 'admin' ? 'Administrador' : profile?.role === 'staff' ? 'Gestor' : profile?.role === 'teacher' ? 'Professor' : 'Sem papel';

  const handleNavClick = (path: string) => {
    if (hasUnsavedChanges) {
      setConfirmModal({
        title: "Alterações não salvas",
        message: "Você tem alterações não salvas. Se sair agora, elas serão perdidas. Deseja continuar?",
        type: "confirm",
        confirmLabel: "Sair sem salvar",
        cancelLabel: "Permanecer",
        onConfirm: () => {
          setHasUnsavedChanges(false);
          closeConfirm();
          navigate(path);
          setIsOpen(false);
        }
      });
      openConfirm();
      return;
    }
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      <ModalCenter
        isOpen={isConfirmOpen}
        onClose={closeConfirm}
        title={confirmContent.title}
        type={confirmContent.type}
        onConfirm={confirmContent.onConfirm}
        confirmLabel={confirmContent.confirmLabel}
        cancelLabel={confirmContent.cancelLabel}
      >
        {confirmContent.message}
      </ModalCenter>
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="w-full px-4 h-16 flex items-center justify-between">

          {/* Logo Area */}
          <div className="flex items-center gap-3 cursor-pointer mr-8 shrink-0" onClick={() => handleNavClick("/")}>
            <img
              src="/logo/logo_chathorario_fundo_transparente_2.png"
              alt="Logo ChatHorário"
              className="h-8 w-auto"
            />
            <span className="font-bold text-xl hidden sm:inline-block">ChatHorário</span>
          </div>

          {/* Scenario Switcher - Global Context */}
          <div className="hidden md:block mr-6">
            <ScenarioSwitcher />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`
                  flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary
                  ${active ? "text-primary" : "text-muted-foreground"}
                  ${item.highlight ? "ml-auto bg-primary/10 text-primary px-4 py-2 rounded-md hover:bg-primary/20 border border-primary/20" : ""}
                `}
                >
                  <Icon className={`h-4 w-4 ${item.highlight ? "text-primary" : ""}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Profile Area */}
          <div className="flex items-center gap-4 ml-4 pl-4 lg:border-l lg:border-border/50">
            {user && (
              <div className="flex items-center gap-3">
                {profile?.school_name && (
                  <span className="text-xs text-muted-foreground hidden xl:inline max-w-[150px] truncate">
                    {profile.school_name}
                  </span>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="relative cursor-pointer group">
                      <Avatar className="h-9 w-9 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                        <AvatarImage src={(user as any)?.user_metadata?.avatar_url} alt={displayName} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background"
                        aria-hidden="true"
                      />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                    <DropdownMenuLabel className="flex flex-col px-2 py-1.5">
                      <span className="font-semibold text-sm">{displayName}</span>
                      {user?.email && (
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                      )}
                      <span className="mt-1.5 inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {roleLabel}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsSettingsModalOpen(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações da Escola
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="h-4 w-4 mr-2" />
                      Meu Perfil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-6 mt-6">
                  <div className="flex items-center gap-2 px-2">
                    <img
                      src="/logo/logo_chathorario_fundo_transparente_2.png"
                      alt="Logo"
                      className="h-8 w-auto"
                    />
                    <span className="font-bold text-lg">ChatHorário</span>
                  </div>
                  <nav className="flex flex-col gap-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <button
                          key={item.path}
                          onClick={() => handleNavClick(item.path)}
                          className={`
                          flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors
                          ${active
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }
                          ${item.highlight ? "mt-4 border border-primary/20 bg-primary/5" : ""}
                        `}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <SchoolSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </>
  );
};
