import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import EscolaDashboard from "./pages/Dashboards/EscolaDashboard";
import AdminDashboard from "./pages/Dashboards/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import Auth from "./pages/Auth";
import SchoolConfig from "./pages/Escola/SchoolConfig";
import TeachersManagement from "./pages/Escola/TeachersManagement";
import SubjectsManagement from "./pages/Escola/SubjectsManagement";
import ClassesManagement from "./pages/Escola/ClassesManagement";
import TeacherAvailability from "./pages/Escola/TeacherAvailability";
import AllocationPage from "./pages/Escola/Allocation";
import GenerationParameters from "./pages/Escola/GenerationParameters";
import ScheduleGeneration from "./pages/Escola/ScheduleGeneration";
import NotFound from "./pages/NotFound";
import MainLayout from "@/components/layout/MainLayout";
import Config from "./pages/Config";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <AuthProvider>
        <DataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route element={<MainLayout />}>
                  <Route path="/escola/config" element={
                    <ProtectedRoute requiredRole={["staff", "teacher"]}>
                      <SchoolConfig />
                    </ProtectedRoute>
                  } />
                  {/* Alias para configurações da escola sem namespace */}
                  <Route path="/config" element={
                    <ProtectedRoute requiredRole={["staff", "teacher"]}>
                      <Config />
                    </ProtectedRoute>
                  } />
                  <Route path="/teachers" element={
                    <ProtectedRoute>
                      <TeachersManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/subjects" element={
                    <ProtectedRoute>
                      <SubjectsManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/classes" element={
                    <ProtectedRoute>
                      <ClassesManagement />
                    </ProtectedRoute>
                  } />

                  <Route path="/availability" element={
                    <ProtectedRoute>
                      <TeacherAvailability />
                    </ProtectedRoute>
                  } />
                  <Route path="/allocation" element={
                    <ProtectedRoute>
                      <AllocationPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/generation-settings" element={
                    <ProtectedRoute>
                      <GenerationParameters />
                    </ProtectedRoute>
                  } />
                  <Route path="/generate" element={
                    <ProtectedRoute>
                      <ScheduleGeneration />
                    </ProtectedRoute>
                  } />
                  <Route path="/escola" element={
                    <ProtectedRoute requiredRole={["staff", "teacher"]}>
                      <EscolaDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/users" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminUsers />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
