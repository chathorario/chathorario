import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { getDashboardNavItems } from "./dashboardNav";
import { getDefaultRouteByRole } from "@/lib/routes";
import { ScenarioSelector } from "@/components/ScenarioSelector";

export const AdminHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { profile } = useProfile(user?.id);

  const isActive = (path: string) => location.pathname === path;
  const navItems = getDashboardNavItems("admin");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <img
            src="/logo/logo_chathorario_fundo_transparente_2.png"
            alt="Logo ChatHorário"
            className="h-8 w-auto"
          />
          <span className="font-bold text-xl">ChatHorário</span>
          <span className="ml-2 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">Admin</span>
        </div>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavigationMenuItem key={item.path}>
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle()}
                    onClick={() => navigate(item.path)}
                    active={isActive(item.path)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          <div className="hidden lg:block mr-2">
            <ScenarioSelector />
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Administrador</span>
              </div>
              <span className="text-sm text-muted-foreground hidden md:inline">
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="md:hidden"
          onClick={() => navigate(getDefaultRouteByRole(profile?.role))}
        >
          Menu
        </Button>
      </div>
    </header>
  );
};