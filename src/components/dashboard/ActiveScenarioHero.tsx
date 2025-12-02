import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, GraduationCap, Play, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ScenarioModal } from "@/components/modals/ScenarioModal";
import { ScenarioTimeline } from "./ScenarioTimeline";
import { useScenarioProgress } from "@/hooks/useScenarioProgress";

export function ActiveScenarioHero() {
    const { schedules, currentScheduleId, teachers, classes } = useData();
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const currentSchedule = schedules.find(s => s.id === currentScheduleId);

    // Get validated progress steps
    const timelineSteps = useScenarioProgress(currentScheduleId);

    if (!currentSchedule) {
        return (
            <Card className="w-full bg-slate-900 border-slate-800 text-white mb-8 border-dashed">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                    <Calendar className="h-12 w-12 text-slate-600 mb-4" />
                    <h2 className="text-xl font-semibold text-slate-300">Nenhum Cenário Selecionado</h2>
                    <p className="text-slate-500 mt-2 mb-6 max-w-md">
                        Selecione um cenário no menu superior ou crie um novo para começar a editar sua grade horária.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="w-full bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700 text-white shadow-xl overflow-hidden relative mb-8">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}
                />

                <CardContent className="p-6 sm:p-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

                        {/* Left: Title & Status */}
                        <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/50 px-3 py-1 text-xs uppercase tracking-wider font-semibold">
                                    Cenário Ativo
                                </Badge>
                                {currentSchedule.is_active && (
                                    <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-0">
                                        Em Uso
                                    </Badge>
                                )}
                            </div>

                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                                    {currentSchedule.name}
                                </h1>
                                <p className="text-slate-400 text-sm max-w-xl">
                                    {currentSchedule.description || "Sem descrição definida para este cenário."}
                                </p>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-slate-300 pt-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-400" />
                                    <span>Criado em {new Date(currentSchedule.created_at || "").toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="h-4 w-px bg-slate-700" />
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-purple-400" />
                                    <span>{teachers.length} Professores</span>
                                </div>
                                <div className="h-4 w-px bg-slate-700" />
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-emerald-400" />
                                    <span>{classes.length} Turmas</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <Button
                                variant="secondary"
                                size="lg"
                                className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 shadow-lg"
                                onClick={() => setIsEditModalOpen(true)}
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Configurar
                            </Button>

                            <Button
                                size="lg"
                                className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 font-semibold px-8"
                                onClick={() => navigate("/escola/alocacao")}
                            >
                                <Play className="h-4 w-4 mr-2 fill-current" />
                                Continuar Edição
                            </Button>
                        </div>
                    </div>

                    {/* Timeline Section */}
                    {timelineSteps.length > 0 && (
                        <>
                            <div className="w-full h-px bg-slate-700/50 my-6" />
                            <ScenarioTimeline steps={timelineSteps} />
                        </>
                    )}
                </CardContent>
            </Card>

            <ScenarioModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                mode="edit"
                initialData={{
                    id: currentSchedule.id,
                    name: currentSchedule.name,
                    description: currentSchedule.description || ""
                }}
            />
        </>
    );
}
