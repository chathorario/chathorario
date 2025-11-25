import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  School, 
  Users, 
  Building2, 
  TrendingUp,
  Settings,
  UserPlus,
  Calendar,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { DashboardFooter } from "@/components/layout/DashboardFooter";
import { StatsCards } from "@/components/dashboard/StatsCards";

interface SchoolStats {
  total: number;
  active: number;
  inactive: number;
}

interface UserStats {
  total: number;
  admin: number;
  staff: number;
  teacher: number;
}

interface SystemStats {
  schools: number;
  teachers: number;
  subjects: number;
  classes: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useProfile(user?.id);
  const { toast } = useToast();
  
  const [schoolStats, setSchoolStats] = useState<SchoolStats>({ total: 0, active: 0, inactive: 0 });
  const [userStats, setUserStats] = useState<UserStats>({ total: 0, admin: 0, staff: 0, teacher: 0 });
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState<SystemStats>({ schools: 0, teachers: 0, subjects: 0, classes: 0 });
  const roleChartData = [
    { role: "Administradores", count: userStats.admin, key: "admin" },
    { role: "Escolas/Staff", count: userStats.staff, key: "staff" },
    { role: "Professores", count: userStats.teacher, key: "teacher" },
  ];
  const roleChartConfig = {
    admin: { label: "Administradores", color: "hsl(var(--primary))" },
    staff: { label: "Escolas/Staff", color: "hsl(var(--secondary))" },
    teacher: { label: "Professores", color: "hsl(var(--accent))" },
  } as const;

  useEffect(() => {
    if (profile?.role !== 'admin') {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar o painel administrativo.",
        variant: "destructive",
      });
      navigate("/escola");
      return;
    }
    fetchStats();
  }, [profile, navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas de escolas
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id, created_at');

      if (schoolsError) throw schoolsError;

      // Buscar estatísticas de usuários por role
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('role');

      if (profilesError) throw profilesError;

      // Calcular estatísticas
      const totalSchools = schools?.length || 0;
      const totalUsers = profiles?.length || 0;
      const adminCount = profiles?.filter(p => p.role === 'admin').length || 0;
      const staffCount = profiles?.filter(p => p.role === 'staff').length || 0;
      const teacherCount = profiles?.filter(p => p.role === 'teacher').length || 0;

      setSchoolStats({
        total: totalSchools,
        active: totalSchools,
        inactive: 0
      });

      setUserStats({
        total: totalUsers,
        admin: adminCount,
        staff: staffCount,
        teacher: teacherCount
      });

      // Contagem agregado de escolas, professores, disciplinas e turmas
      let subjectsCount = 0;
      let classesCount = 0;

      // Tenta contar disciplinas e turmas caso as tabelas existam. Se não existirem, mantém 0.
      const { count: subjectsCnt, error: subjectsError } = await supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true });
      if (!subjectsError && typeof subjectsCnt === 'number') {
        subjectsCount = subjectsCnt;
      }

      const { count: classesCnt, error: classesError } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true });
      if (!classesError && typeof classesCnt === 'number') {
        classesCount = classesCnt;
      }

      setSystemStats({
        schools: totalSchools,
        teachers: teacherCount,
        subjects: subjectsCount,
        classes: classesCount,
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  if (profile?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Painel Administrativo
          </h1>
          <p className="text-gray-600">
            Gerencie escolas, usuários e visualize estatísticas do sistema
          </p>
        </div>

        {/* Gráfico: Distribuição de Usuários por Papel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Distribuição de Usuários por Papel</CardTitle>
            <CardDescription>Visão rápida da composição de usuários</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={roleChartConfig} className="h-64 w-full">
              <BarChart data={roleChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="role" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent nameKey="role" />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {roleChartData.map((d, i) => (
                    <Cell key={`cell-${i}`} fill={`var(--color-${d.key})`} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Escolas</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schoolStats.total}</div>
              <p className="text-xs text-muted-foreground">
                {schoolStats.active} ativas
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.total}</div>
              <p className="text-xs text-muted-foreground">
                Usuários cadastrados
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.admin}</div>
              <p className="text-xs text-muted-foreground">
                {((userStats.admin / userStats.total) * 100).toFixed(1)}% do total
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Escolas/Staff</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.staff}</div>
              <p className="text-xs text-muted-foreground">
                Usuários de escolas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas agregadas com componente padronizado do tema Educação */}
        <div className="mb-8">
          <StatsCards stats={systemStats} />
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Gerenciar Escolas
              </CardTitle>
              <CardDescription>
                Adicionar novas escolas ao sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => toast({
                  title: "Em desenvolvimento",
                  description: "Funcionalidade de gerenciamento de escolas em breve.",
                })}
              >
                Acessar
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Gerenciar Usuários
              </CardTitle>
              <CardDescription>
                Administrar usuários e permissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => toast({
                  title: "Em desenvolvimento",
                  description: "Funcionalidade de gerenciamento de usuários em breve.",
                })}
              >
                Acessar
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Relatórios
              </CardTitle>
              <CardDescription>
                Visualizar relatórios do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => toast({
                  title: "Em desenvolvimento",
                  description: "Relatórios detalhados em breve.",
                })}
              >
                Acessar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
            <CardDescription>
              Detalhes sobre a configuração atual do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Distribuição de Usuários</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Administradores:</span>
                    <Badge variant="outline">{userStats.admin}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Staff/Escolas:</span>
                    <Badge variant="outline">{userStats.staff}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Professores:</span>
                    <Badge variant="outline">{userStats.teacher}</Badge>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Status do Sistema</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total de Escolas:</span>
                    <Badge variant="default">{schoolStats.total}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Escolas Ativas:</span>
                    <Badge variant="success">{schoolStats.active}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <DashboardFooter />
    </div>
  );
};

export default AdminDashboard;