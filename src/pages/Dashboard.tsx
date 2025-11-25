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
  Eye
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
import { Header } from "@/components/layout/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { ensureSchool, upsertTeachers, upsertSubjects, upsertClasses, persistGeneratedScheduleAsWorkloads } from "@/services/chatPersistence";
// Removido QuickActions conforme solicitação

interface DashboardStats {
  schools: number;
  teachers: number;
  subjects: number;
  classes: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showChat, setShowChat] = useState(false);
  const [showDataSummary, setShowDataSummary] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState<Schedule | null>(null);
  const { user } = useAuth();
  const { profile, refetch: refetchProfile } = useProfile(user?.id);

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

  useEffect(() => {
    if (showChat && messages.length === 0) {
      const { message, quickReplies: replies } = getStepPrompt(currentStep, conversationData);
      setTimeout(() => {
        addAssistantMessage(message);
        setQuickReplies(replies || []);
      }, 500);
    }
  }, [showChat, messages.length, currentStep, conversationData, addAssistantMessage]);

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
        subjects: dataContext.subjects,
        classes: dataContext.classes.map(c => ({ name: c.name, shift: c.shift })),
        workload: dataContext.workload,
      });
    }
  }, [dataContext, updateData]);

  const steps = [
    { id: "start", label: "Início", icon: PlayCircle, description: "Começar novo horário" },
    { id: "school_setup", label: "Escola", icon: School, description: "Configurar escola" },
    { id: "teachers", label: "Professores", icon: Users, description: "Cadastrar professores" },
    { id: "subjects", label: "Disciplinas", icon: BookOpen, description: "Definir disciplinas" },
    { id: "classes", label: "Turmas", icon: Calendar, description: "Criar turmas" },
    { id: "generate", label: "Gerar", icon: CheckCircle2, description: "Gerar horário" }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const handleSendMessage = async (message: string) => {
    addUserMessage(message);
    setIsLoading(true);
    setQuickReplies([]);

    await new Promise(resolve => setTimeout(resolve, 800));

    const { nextData, shouldAdvance, generatedSchedule } = processUserMessage(message, currentStep, conversationData);

    if (generatedSchedule) {
      setGeneratedSchedule(generatedSchedule);
    }

    if (Object.keys(nextData).length > 0) {
      updateData(nextData);
    }

    if (shouldAdvance) {
      // Persistência por etapa conforme regras do PRD
      try {
        const effectiveData = { ...conversationData, ...nextData };
        let schoolId = profile?.school_id || null;

        if (currentStep === "school_setup") {
          const schoolName = effectiveData.schoolName || message;
          if (user?.id && schoolName) {
            const ensured = await ensureSchool(user.id, schoolName);
            schoolId = ensured.school_id;
            await refetchProfile();
          }
        }

        // Garantir schoolId após vinculação
        schoolId = schoolId || profile?.school_id || null;

        if (schoolId) {
          if (currentStep === "teachers") {
            // Ao avançar, persistir todos os professores coletados
            const teachersInputs = (effectiveData.teachers || []).map(t => ({ name: t.name, subjects: t.subjects }));
            if (teachersInputs.length > 0) {
              await upsertTeachers(schoolId, teachersInputs);
            }
          } else if (currentStep === "subjects") {
            const subjectsInputs = effectiveData.subjects || [];
            if (subjectsInputs.length > 0) {
              await upsertSubjects(schoolId, subjectsInputs, effectiveData.workload || {});
            }
          } else if (currentStep === "classes") {
            const classesInputs = (effectiveData.classes || []).map(c => ({ name: c.name, shift: c.shift }));
            if (classesInputs.length > 0) {
              await upsertClasses(schoolId, classesInputs);
            }
          } else if (currentStep === "generate" && generatedSchedule) {
            // Após geração, persistir workloads agregadas a partir do horário
            await persistGeneratedScheduleAsWorkloads(schoolId, generatedSchedule);
          }
        }
      } catch (err: any) {
        console.error("Erro de persistência no fluxo do chat:", err);
        toast({
          variant: "destructive",
          title: "Falha ao salvar dados",
          description: err?.message || "Verifique sua conexão e tente novamente.",
        });
      }

      nextStep();
      const nextStepId = currentStep === "generate" ? "completed" :
        steps[Math.min(getCurrentStepIndex() + 2, steps.length - 1)].id as any;
      const { message: responseMessage, quickReplies: replies } = getStepPrompt(
        nextStepId,
        { ...conversationData, ...nextData }
      );
      addAssistantMessage(responseMessage);
      setQuickReplies(replies || []);
    } else {
      addAssistantMessage("Entendi! Continue cadastrando ou digite 'continuar' para avançar.");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/30 to-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {showChat || showDataSummary ? (
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

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Estatísticas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StatsCards stats={stats} />
                  </CardContent>
                </Card>

                {/* Removido bloco de Ações Rápidas conforme solicitação */}
              </div>
            </div>
          </div>
        ) : (
          <>
            <Card className="mb-8 border-primary/20 shadow-soft">
              <CardHeader>
                <CardTitle>Bem-vindo ao ChatHorário</CardTitle>
                <CardDescription>Configure horários escolares de forma inteligente através de conversação</CardDescription>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
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

            <div className="mt-8">
              <StatsCards stats={stats} />
            </div>

            {/* Removido bloco de Ações Rápidas conforme solicitação */}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;