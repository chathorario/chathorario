import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { DashboardFooter } from "@/components/layout/DashboardFooter";

interface MainLayoutProps {
  children?: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {children || <Outlet />}
      </main>
      <DashboardFooter />
    </div>
  );
};

export default MainLayout;