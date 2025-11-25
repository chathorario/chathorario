import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  School,
  Users,
  BookOpen,
  Calendar,
  PlayCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Eye,
  User,
  Settings,
  BarChart3,
  FileText,
  Bot
} from "lucide-react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { DataSummary } from "@/components/visualization/DataSummary";
import { ScheduleGrid } from "@/components/visualization/ScheduleGrid";
import { ConflictsList } from "@/components/visualization/ConflictsList";
import { Schedule } from "@/types/schedule";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useConversationState } from "@/hooks/useConversationState";
import { useData } from "@/context/DataContext";
import { getStepPrompt, processUserMessage } from "@/services/conversationFlow";
import { useToast } from "@/hooks/use-toast";
import { exportToPDF, exportToCSV } from "@/services/exportService";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ScheduleScenariosList } from "@/components/dashboard/ScheduleScenariosList";
import { useWorkflowSteps } from "@/hooks/useWorkflowSteps";
// Removido QuickActions conforme solicitação


interface DashboardStats {
  schools: number;
  teachers: number;
  subjects: number;
  classes: number;
}

const EscolaDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const [showChat, setShowChat] = useState(false);
  const [showDataSummary, setShowDataSummary] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState<Schedule | null>(null);

  // Integração com DataContext
  const dataContext = useData();
  const [stats, setStats] = useState<DashboardStats>({
    schools: 0,
    teachers: 0,
    subjects: 0,
    classes: 0
  });

  const {
    messages,
    isLoading,
    setIsLoading,
    addUserMessage,
    addAssistantMessage,
    clearMessages
  } = useChatMessages();

  const {
    currentStep,
    conversationData,
    updateData,
    nextStep,
    reset: resetConversation,
    setCurrentStep
  } = useConversationState();

  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [chatInitialized, setChatInitialized] = useState(false);
  const [didPostScheduleSummary, setDidPostScheduleSummary] = useState(false);

  // Removido efeito inicial duplicado: inicialização do chat é feita no efeito de pré-carregamento

  // Pré-carregar dados existentes e definir passo inicial do chat
  useEffect(() => {
    if (showChat && messages.length === 0 && !chatInitialized) {
      const initialData = {
        schoolName: dataContext.schoolName,
        teachers: (dataContext.teachers || []).map(t => ({ name: t.name, subjects: t.subjects })),
        subjects: (dataContext.subjects || []).map(s => s.name),
        classes: (dataContext.classes || []).map(c => ({
          id: c.id,
          name: c.name,
          shift: c.shift,
          aulasDiarias: c.aulasDiarias || 5
        })),
        workload: dataContext.workload || {}
      };

      updateData(initialData);

      // Sempre iniciar pelo passo 'start' conforme documentação do fluxo
      setCurrentStep("start");

      const hasExisting = !!initialData.schoolName || (initialData.teachers || []).length > 0 ||
        (initialData.subjects || []).length > 0 || (initialData.classes || []).length > 0 ||
        Object.keys(initialData.workload || {}).length > 0;

      const summaryParts: string[] = [];
      if (initialData.schoolName) summaryParts.push(`🏫 Escola: ${initialData.schoolName}`);
      if ((initialData.teachers || []).length) summaryParts.push(`👨‍🏫 Professores: ${(initialData.teachers || []).length}`);
      if ((initialData.subjects || []).length) summaryParts.push(`📚 Disciplinas: ${(initialData.subjects || []).length}`);
      if ((initialData.classes || []).length) summaryParts.push(`🎓 Turmas: ${(initialData.classes || []).length}`);
      const summary = summaryParts.length ? `Encontrei dados já cadastrados:\n\n${summaryParts.join("\n")}\n\nVocê poderá revisar, manter ou alterar cada módulo durante o processo.` : "";

      const { message, quickReplies: replies } = getStepPrompt("start", initialData);

      setTimeout(() => {
        if (hasExisting) {
          addAssistantMessage(summary);
        }
        addAssistantMessage(message);
        setQuickReplies(replies || []);
        setChatInitialized(true);
      }, 500);
    }
  }, [showChat, messages.length, chatInitialized, dataContext.schoolName, dataContext.teachers, dataContext.subjects, dataContext.classes, dataContext.workload, updateData, setCurrentStep, addAssistantMessage]);

  useEffect(() => {
    // Atualiza stats com dados do DataContext
    setStats({
      schools: dataContext.schoolName ? 1 : 0,
      teachers: dataContext.teachers.length,
      subjects: dataContext.subjects.length,
      classes: dataContext.classes.length,
    });

    // Sincroniza com conversationData
    if (dataContext.schoolName || dataContext.teachers.length > 0) {
      updateData({
        schoolName: dataContext.schoolName,
        teachers: dataContext.teachers.map(t => ({ name: t.name, subjects: t.subjects })),
        subjects: dataContext.subjects.map(s => s.name),
        classes: dataContext.classes.map(c => ({
          id: c.id,
          name: c.name,
          shift: c.shift,
          aulasDiarias: c.aulasDiarias || 5
        })),
        workload: dataContext.workload,
      });
    }
  }, [dataContext, updateData]);

  const { steps: workflowSteps } = useWorkflowSteps();

  const steps = [
    { id: "start", label: "Início", icon: PlayCircle, description: "Começar novo horário" },
    ...workflowSteps.map(step => ({
      id: step.id,
      label: step.label,
      icon: step.icon,
      description: step.id === 'configuracoes' ? "Configurar escola" :
        step.id === 'turmas' ? "Criar turmas" :
          step.id === 'disciplinas' ? "Definir disciplinas" :
            step.id === 'professores' ? "Cadastrar professores" :
              step.id === 'alocacao' ? "Definir alocação" :
                step.id === 'geracao' ? "Gerar horário" : ""
    }))
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };


  const handleSendMessage = async (message: string) => {
    addUserMessage(message);
    setIsLoading(true);
    setQuickReplies([]);

    // Intercepta ações de exportação diretamente pelo chat
    const normalized = message.trim().toLowerCase();
    if (normalized === "exportar pdf") {
      if (!generatedSchedule) {
        addAssistantMessage("Nenhuma grade gerada ainda para exportar.");
        setIsLoading(false);
        return;
      }
      const classes = [...new Set(generatedSchedule.entries.map(e => e.className))];
      const filter = classes[0] || generatedSchedule.entries[0]?.className || "Geral";
      try {
        exportToPDF(generatedSchedule, "by-class", filter);
        addAssistantMessage("PDF exportado com sucesso!");
      } catch (err) {
        addAssistantMessage("Falha ao exportar PDF. Tente novamente.");
      }
      setIsLoading(false);
      return;
    }

    if (normalized === "exportar csv") {
      if (!generatedSchedule) {
        addAssistantMessage("Nenhuma grade gerada ainda para exportar.");
        setIsLoading(false);
        return;
      }
      const classes = [...new Set(generatedSchedule.entries.map(e => e.className))];
      const filter = classes[0] || generatedSchedule.entries[0]?.className || "Geral";
      try {
        exportToCSV(generatedSchedule, "by-class", filter);
        addAssistantMessage("CSV exportado com sucesso!");
      } catch (err) {
        addAssistantMessage("Falha ao exportar CSV. Tente novamente.");
      }
      setIsLoading(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    const { nextData, shouldAdvance, generatedSchedule: newSchedule, navigationUrl, helpMessage, successMessage, errorMessage, quickReplies: newQuickReplies } = processUserMessage(message, currentStep, conversationData);

    if (newSchedule) {
      setGeneratedSchedule(newSchedule);
    }

    // Handle navigation to specific page
    if (navigationUrl) {
      addAssistantMessage(`Redirecionando para a página de ${currentStep}...`);
      setIsLoading(false);
      setTimeout(() => {
        navigate(navigationUrl);
      }, 500);
      return;
    }

    // Handle help message (when user chooses "Adicionar mais")
    if (helpMessage) {
      addAssistantMessage(helpMessage);
      setIsLoading(false);
      return;
    }

    // Handle error message (invalid format)
    if (errorMessage) {
      addAssistantMessage(errorMessage);
      setIsLoading(false);
      return;
    }

    // Handle success message (item added successfully)
    if (successMessage) {
      addAssistantMessage(successMessage);
      if (newQuickReplies) {
        setQuickReplies(newQuickReplies);
      }
      setIsLoading(false);
      return;
    }

    if (Object.keys(nextData).length > 0) {
      updateData(nextData);
    }

    if (shouldAdvance) {
      // Salvar turmas no Supabase antes de avançar
      if (currentStep === "turmas") {
        // Usar os dados atualizados que já incluem as novas turmas
        const updatedData = { ...conversationData, ...nextData };
        const allClasses = updatedData.classes || [];

        console.log("=== DEBUG SAVE CLASSES ===");
        console.log("currentStep:", currentStep);
        console.log("conversationData.classes:", conversationData.classes);
        console.log("nextData.classes:", nextData.classes);
        console.log("allClasses to save:", allClasses);
        console.log("========================");

        if (allClasses.length > 0) {
          try {
            await dataContext.saveClasses(allClasses);
            console.log("✅ Turmas salvas no Supabase com sucesso:", allClasses);

            // Informar usuário que as turmas foram salvas
            addAssistantMessage(
              `✅ Turmas salvas com sucesso no banco de dados!\n\n` +
              `💡 **Dica**: Se você for para a página de Gerenciamento de Turmas, ` +
              `recarregue a página (F5) para ver as turmas atualizadas.`
            );
          } catch (error) {
            console.error("❌ Erro ao salvar turmas:", error);
            addAssistantMessage("⚠️ Houve um erro ao salvar as turmas. Por favor, tente novamente.");
            setIsLoading(false);
            return;
          }
        } else {
          console.warn("⚠️ Nenhuma turma para salvar (allClasses está vazio)");
        }
      }

      const currentIndex = getCurrentStepIndex();
      const nextIndex = Math.min(currentIndex + 1, steps.length - 1);
      const nextStepId = currentStep === "geracao" ? "completed" : steps[nextIndex].id as any;
      nextStep();
      const { message: responseMessage, quickReplies: replies } = getStepPrompt(
        nextStepId,
        { ...conversationData, ...nextData }
      );
      addAssistantMessage(responseMessage);
      setQuickReplies(replies || []);
    } else {
      // Provide contextual help based on current step
      let helpMsg = "Entendi! ";

      switch (currentStep) {
        case "turmas":
          helpMsg += "Para adicionar uma turma, digite no formato:\n\n\"Nome da Turma - Turno\"\n\nExemplo: 3º Ano C - Noite\n\nQuando terminar, digite 'continuar' para avançar.";
          break;
        case "disciplinas":
          helpMsg += "Para adicionar disciplinas, digite-as separadas por vírgula:\n\nExemplo: Química, Biologia, Educação Física\n\nQuando terminar, digite 'continuar' para avançar.";
          break;
        case "professores":
          helpMsg += "Para adicionar um professor, digite no formato:\n\n\"Nome do Professor - Disciplinas\"\n\nExemplo: Maria Santos - Química, Biologia\n\nQuando terminar, digite 'continuar' para avançar.";
          break;
        case "alocacao":
          helpMsg += "Para definir a carga horária, digite no formato:\n\n\"Disciplina - Número de aulas\"\n\nExemplo: Matemática - 5, Português - 4\n\nQuando terminar, digite 'continuar' para avançar.";
          break;
        default:
          helpMsg += "Continue cadastrando ou digite 'continuar' para avançar.";
      }

      addAssistantMessage(helpMsg);
    }

    setIsLoading(false);
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const handleStartNew = () => {
    setShowChat(true);
    setShowDataSummary(false);
    setGeneratedSchedule(null);
    resetConversation();
    clearMessages();
    // Permitir nova inicialização do chat
    setChatInitialized(false);
    setDidPostScheduleSummary(false);
  };

  const handleLoadExisting = () => {
    toast({
      title: "Em desenvolvimento",
      description: "Esta funcionalidade estará disponível em breve.",
    });
  };

  const handleViewData = () => {
    setShowDataSummary(true);
    setShowChat(false);
  };

  const handleBackToChat = () => {
    setShowDataSummary(false);
    setShowChat(true);
  };

  // Funções de navegação para staff/teacher
  const handleManageTeachers = () => {
    navigate("/teachers");
  };

  // Publica mensagens de validação e ações da grade dentro do chat
  useEffect(() => {
    if (generatedSchedule && showChat && !didPostScheduleSummary) {
      const conflicts = generatedSchedule.conflicts || [];
      if (conflicts.length === 0) {
        addAssistantMessage("Validações\n\nNenhum conflito detectado! A grade está válida e pronta para uso.");
      } else {
        addAssistantMessage(`Validações\n\n${conflicts.length} conflito(s) detectado(s). Revise a grade antes de finalizar.`);
      }

      const scoreText = generatedSchedule.fitnessScore !== undefined
        ? `Qualidade da grade: ${generatedSchedule.fitnessScore.toFixed(1)}%`
        : undefined;

      const classes = [...new Set(generatedSchedule.entries.map(e => e.className))];
      const teachers = [...new Set(generatedSchedule.entries.map(e => e.teacherName))];

      addAssistantMessage([
        "Grade de Horários",
        "Por Turma",
        "Por Professor",
        "Buscar turma...",
        "Exportar PDF",
        "Exportar CSV",
      ].join("\n"));

      if (scoreText) {
        addAssistantMessage(scoreText);
      }

      if (classes.length === 0 && teachers.length === 0) {
        addAssistantMessage('Nenhum resultado encontrado para ""');
      }

      // Disponibiliza ações rápidas no chat
      setQuickReplies(["Exportar PDF", "Exportar CSV", "Ver horário"]);
      setDidPostScheduleSummary(true);
    }
  }, [generatedSchedule, showChat, didPostScheduleSummary, addAssistantMessage]);

  const handleManageClasses = () => {
    navigate("/classes");
  };

  const handleManageSubjects = () => {
    navigate("/subjects");
  };

  const handleViewReports = () => {
    toast({
      title: "Em desenvolvimento",
      description: "Relatórios em breve disponíveis.",
    });
  };

  const handleViewProfile = () => {
    navigate("/profile");
  };

  // Verificar se é staff/teacher (usuário da escola)
  // Evita flicker: enquanto o perfil estiver indefinido, mantém estado nulo
  const isSchoolUser = profile ? (profile.role === 'staff' || profile.role === 'teacher') : null;

  // Dados para gráficos
  const subjectCounts = dataContext.teachers.reduce((acc, t) => {
    t.subjects.forEach((s) => {
      acc[s] = (acc[s] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  const subjectData = Object.entries(subjectCounts).map(([subject, count]) => ({ subject, count, key: "subject" }));
  const subjectChartConfig = {
    subject: { label: "Professores por Disciplina", color: "hsl(var(--primary))" },
  } as const;

  const shiftCounts = dataContext.classes.reduce((acc, c) => {
    acc[c.shift] = (acc[c.shift] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const shiftData = Object.entries(shiftCounts).map(([shift, count]) => ({ shift, count, key: shift.toLowerCase() }));
  const shiftChartConfig = {
    matutino: { label: "Matutino", color: "hsl(var(--secondary))" },
    vespertino: { label: "Vespertino", color: "hsl(var(--accent))" },
    noturno: { label: "Noturno", color: "hsl(var(--muted))" },
  } as const;

  return (
    <>
      <main className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 dark:bg-slate-900">
        {/* Dashboard para usuários da escola (staff/teacher) */}
        {isSchoolUser === true && !showChat && !showDataSummary && (
          <>
            <div className="mb-8 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bem-vindo ao ChatHorário</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Gerencie sua escola e visualize informações do sistema
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1">
                  <School className="h-3 w-3 mr-2" />
                  {profile?.school_name || "Não definida"}
                </Badge>
                <Badge variant="outline" className="text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 px-3 py-1">
                  <User className="h-3 w-3 mr-2" />
                  {profile?.role === 'staff' ? 'Administrador' : 'Professor'}
                </Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Assistente de Horario - abre o chat */}
              <Card className="cursor-pointer hover:shadow-md transition-all duration-300 border-slate-100 dark:border-slate-700 dark:bg-slate-800 group" onClick={handleStartNew} role="button" aria-label="Abrir Assistente de Horário">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-12 w-12 rounded-full bg-indigo-50 dark:bg-slate-700 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-slate-600 transition-colors">
                      <Bot className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <Badge className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">Novo</Badge>
                  </div>
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-100">Assistente de Horário</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    Criar novo horário via chat
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" onClick={handleStartNew}>
                    Iniciar Chat
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-all duration-300 border-slate-100 dark:border-slate-700 dark:bg-slate-800 group">
                <CardHeader className="pb-2">
                  <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-slate-700 flex items-center justify-center mb-4 group-hover:bg-amber-100 dark:group-hover:bg-slate-600 transition-colors">
                    <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-100">Turmas</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    Gerenciar turmas e séries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-slate-700" variant="ghost" onClick={handleManageClasses}>
                    Acessar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-all duration-300 border-slate-100 dark:border-slate-700 dark:bg-slate-800 group">
                <CardHeader className="pb-2">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-slate-700 flex items-center justify-center mb-4 group-hover:bg-emerald-100 dark:group-hover:bg-slate-600 transition-colors">
                    <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-100">Disciplinas</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    Gerenciar grade curricular
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-700" variant="ghost" onClick={handleManageSubjects}>
                    Acessar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-all duration-300 border-slate-100 dark:border-slate-700 dark:bg-slate-800 group">
                <CardHeader className="pb-2">
                  <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-slate-700 flex items-center justify-center mb-4 group-hover:bg-blue-100 dark:group-hover:bg-slate-600 transition-colors">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-100">Professores</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    Gerenciar corpo docente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700 dark:border-blue-400" variant="ghost" onClick={handleManageTeachers}>
                    Acessar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Estatísticas do painel da escola */}
            <div className="mb-8">
              <StatsCards stats={stats} />
            </div>

            {/* Gráficos de visão geral */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-slate-100 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Professores por Disciplina</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">Distribuição do corpo docente</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={subjectChartConfig} className="h-[300px] w-full">
                    <BarChart data={subjectData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                      <XAxis
                        dataKey="subject"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        className="dark:[&_text]:fill-slate-400"
                        dy={10}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        className="dark:[&_text]:fill-slate-400"
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent nameKey="subject" />}
                        cursor={{ fill: '#f1f5f9' }}
                      />
                      <Bar
                        dataKey="count"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={50}
                      >
                        {subjectData.map((d, i) => (
                          <Cell key={`cell-subject-${i}`} fill={`var(--color-${d.key})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="border-slate-100 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Turmas por Turno</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">Ocupação por período</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={shiftChartConfig} className="h-[300px] w-full">
                    <BarChart data={shiftData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                      <XAxis
                        dataKey="shift"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        className="dark:[&_text]:fill-slate-400"
                        dy={10}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        className="dark:[&_text]:fill-slate-400"
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent nameKey="shift" />}
                        cursor={{ fill: '#f1f5f9' }}
                      />
                      <Bar
                        dataKey="count"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={50}
                      >
                        {shiftData.map((d, i) => (
                          <Cell key={`cell-shift-${i}`} fill={`var(--color-${d.key})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Gerenciamento de Cenários de Horários */}
            <div className="mb-8">
              <ScheduleScenariosList />
            </div>

            {profile?.role === 'staff' && (
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="cursor-pointer hover:shadow-medium transition-shadow border-2 hover:border-warning">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-warning" />
                      </div>
                    </div>
                    <CardTitle>Relatórios</CardTitle>
                    <CardDescription>
                      Visualizar relatórios e estatísticas da escola
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline" onClick={handleViewReports}>
                      Acessar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-medium transition-shadow border-2 hover:border-info">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-info" />
                      </div>
                    </div>
                    <CardTitle>Perfil da Escola</CardTitle>
                    <CardDescription>
                      Visualizar e editar informações da escola
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline" onClick={handleViewProfile}>
                      Acessar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Removido Progresso/Estatísticas do dashboard principal da escola */}
          </>
        )}

        {/* Dashboard original para admin ou quando em modo chat/dados */}
        {(showChat || showDataSummary || isSchoolUser === false) && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {showChat && (
                <ChatInterface
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  quickReplies={quickReplies}
                  onQuickReply={handleQuickReply}
                  title="Assistente de Configuração"
                />
              )}

              {showDataSummary && (
                <DataSummary data={conversationData} />
              )}

              {generatedSchedule && (
                <div className="space-y-6">
                  <ConflictsList conflicts={generatedSchedule.conflicts} />
                  <ScheduleGrid schedule={generatedSchedule} />
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Action Buttons */}
              {(stats.teachers > 0 || stats.subjects > 0 || stats.classes > 0) && (
                <Card>
                  <CardContent className="pt-6 space-y-2">
                    {showChat && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleViewData}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Dados Coletados
                      </Button>
                    )}
                    {showDataSummary && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleBackToChat}
                      >
                        Voltar ao Chat
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {showChat && (
                <>
                  <Card className="border-primary/20 shadow-soft">
                    <CardHeader>
                      <CardTitle className="text-base">Progresso</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {steps.map((step, index) => {
                        const StepIcon = step.icon;
                        const isCompleted = index < getCurrentStepIndex();
                        const isCurrent = index === getCurrentStepIndex();

                        return (
                          <div key={step.id} className="flex items-center gap-3">
                            <div
                              className={`
                                h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-all
                                ${isCurrent ? "bg-primary text-primary-foreground" : ""}
                                ${isCompleted ? "bg-secondary text-secondary-foreground" : ""}
                                ${!isCurrent && !isCompleted ? "bg-muted text-muted-foreground" : ""}
                              `}
                            >
                              <StepIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${isCurrent ? "text-primary" : "text-foreground"}`}>
                                {step.label}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {step.description}
                              </p>
                            </div>
                            {isCompleted && <CheckCircle2 className="h-4 w-4 text-secondary" />}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  {/* Removido bloco de Ações Rápidas conforme solicitação */}
                </>
              )}
            </div>
          </div>
        )}

        {/* Dashboard para usuários não escolares (admin ou visitantes) */}
        {isSchoolUser === false && !showChat && !showDataSummary && (
          <>
            <Card className="mb-8 border-primary/20 shadow-soft">
              <CardHeader>
                <CardTitle>Bem-vindo ao ChatHorário</CardTitle>
                <CardDescription>Configure horários escolares de forma inteligente através de conversação</CardDescription>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="cursor-pointer hover:shadow-medium transition-shadow border-2 hover:border-primary">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <PlayCircle className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="default">Recomendado</Badge>
                  </div>
                  <CardTitle>Começar do Zero</CardTitle>
                  <CardDescription>
                    Configure uma nova escola e crie horários do início através do chat
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={handleStartNew}>
                    Iniciar Chat
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-medium transition-shadow border-2 hover:border-secondary">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <School className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                  <CardTitle>Usar Dados Existentes</CardTitle>
                  <CardDescription>
                    Carregue dados já cadastrados e continue de onde parou
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" onClick={handleLoadExisting}>
                    Carregar Dados
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Removido Progresso/Estatísticas do dashboard de visitantes/admin */}
          </>
        )}
      </main>
    </>
  );
};

export default EscolaDashboard;