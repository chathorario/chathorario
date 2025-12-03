import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Loader2, CheckCircle, AlertTriangle, FileText, ArrowRight, Sliders } from "lucide-react";
import { useData } from "@/context/DataContext";
import { GenerationInput, GenerationOutput, Lesson, TimeSlot, TeacherAvailability } from "@/services/solver/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { ScheduleViewer } from "@/components/dashboard/ScheduleViewer";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

interface ValidationError {
    message: string;
    path: string;
    label: string;
}

export default function ScheduleGeneration() {
    const { teachers, classes, subjects, workloads, schoolConfig, generationConfig, teacherAvailability, currentScheduleId } = useData();
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState("");
    const [result, setResult] = useState<GenerationOutput | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
    const [scenarioName, setScenarioName] = useState("");
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const workerRef = useRef<Worker | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        workerRef.current = new Worker(new URL("../../workers/schedule.worker.ts", import.meta.url), {
            type: "module",
        });

        workerRef.current.onmessage = (e) => {
            const { type, result, error } = e.data;
            if (type === "complete") {
                setResult(result);
                setIsGenerating(false);
                setProgress(100);
                setProgressMessage("Concluído!");
                toast.success("Horário gerado com sucesso!");
            } else if (type === "error") {
                setIsGenerating(false);
                toast.error(`Erro na geração: ${error}`);
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isGenerating) {
            setProgress(0);
            setProgressMessage("Inicializando...");
            let p = 0;
            interval = setInterval(() => {
                p += Math.random() * 2;
                if (p > 90) p = 90;
                setProgress(p);
                if (p < 30) setProgressMessage("Analisando restrições...");
                else if (p < 60) setProgressMessage("Alocando aulas...");
                else setProgressMessage("Otimizando horários...");
            }, 500);
        }
        return () => clearInterval(interval);
    }, [isGenerating]);

    const analyzeAllocation = (schedule: GenerationOutput['schedule']) => {
        const allocationReport: { subjectName: string; className: string; required: number; allocated: number; missing: number }[] = [];
        workloads.forEach(w => {
            if (!w.class_id || !w.subject_id) return;
            const classObj = classes.find(c => c.id === w.class_id);
            const subjectObj = subjects.find(s => s.id === w.subject_id);
            if (!classObj || !subjectObj) return;
            const required = w.hours || 0;
            const allocated = schedule.filter(s =>
                s.classId === w.class_id && s.subjectId === w.subject_id
            ).length;
            if (allocated < required) {
                allocationReport.push({
                    subjectName: subjectObj.name,
                    className: classObj.name,
                    required,
                    allocated,
                    missing: required - allocated
                });
            }
        });
        return allocationReport;
    };

    const handleSaveClick = () => {
        setScenarioName(`Horário Gerado - ${new Date().toLocaleString()}`);
        setIsSaveDialogOpen(true);
    };

    const confirmSave = async () => {
        if (!result) return;
        setIsSaveDialogOpen(false);
        await saveScenario(result, scenarioName);
    };

    const saveScenario = async (output: GenerationOutput, name: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Erro: Usuário não autenticado.");
                return;
            }
            const { data: profile } = await supabase
                .from('profiles')
                .select('school_id')
                .eq('id', user.id)
                .single();

            if (!profile?.school_id) {
                toast.error("Erro: Escola não encontrada no perfil.");
                return;
            }

            if (!currentScheduleId) {
                toast.error("Nenhum cenário selecionado. Por favor, selecione ou crie um cenário antes de salvar.");
                return;
            }

            const { data: savedScenario, error: saveError } = await supabase.from('schedule_scenarios').insert({
                name: name,
                description: `Fitness: ${output.fitness.toFixed(2)} | ${output.schedule.length} aulas`,
                status: 'Concluído',
                is_validated: output.conflicts.length === 0,
                school_id: profile.school_id,
                schedule_id: currentScheduleId,
                fitness_score: output.fitness,
                schedule_data: {
                    schedule: output.schedule,
                    fitness: output.fitness,
                    conflicts: output.conflicts,
                    generated_at: new Date().toISOString()
                }
            }).select().single();

            if (saveError) throw saveError;

            if (savedScenario) {
                const { error: snapshotError } = await supabase.rpc('freeze_schedule_snapshot', {
                    p_schedule_id: savedScenario.id
                });
                if (snapshotError) {
                    console.error("Erro ao gerar snapshot:", snapshotError);
                    toast.warning("Cenário salvo, mas houve erro ao gerar o snapshot de auditoria.");
                } else {
                    toast.success("Cenário salvo com sucesso!");
                }

                // Redirecionar para o dashboard com o cenário expandido
                navigate('/escola', {
                    state: {
                        expandedScenarioId: currentScheduleId,
                        newVersionId: savedScenario.id
                    }
                });
            }
        } catch (e) {
            console.error("Erro ao salvar cenário:", e);
            toast.error("Erro ao salvar horário no banco de dados.");
        }
    };

    const validateConstraints = (): ValidationError[] => {
        const errors: ValidationError[] = [];
        teachers.forEach(t => {
            const teacherWorkload = workloads
                .filter(w => w.teacher_id === t.id)
                .reduce((sum, w) => sum + (w.hours || 0), 0);
            const unavailableCount = teacherAvailability.filter(a =>
                a.teacher_id === t.id && ['ND', 'P', 'HA'].includes(a.status)
            ).length;
            const availableSlots = 25 - unavailableCount;
            if (teacherWorkload > availableSlots) {
                errors.push({
                    message: `Professor(a) ${t.name} precisa de ${teacherWorkload} aulas, mas só tem ${availableSlots} horários disponíveis.`,
                    path: "/availability",
                    label: "Ajustar Disponibilidade"
                });
            }
        });
        classes.forEach(c => {
            const classWorkload = workloads
                .filter(w => w.class_id === c.id)
                .reduce((sum, w) => sum + (w.hours || 0), 0);
            if (classWorkload > 25) {
                errors.push({
                    message: `Turma ${c.name} tem ${classWorkload} aulas cadastradas (limite 25).`,
                    path: "/allocation",
                    label: "Ajustar Alocação"
                });
            }
        });
        return errors;
    };

    const handleGenerate = () => {
        const errors = validateConstraints();
        if (errors.length > 0) {
            setValidationErrors(errors);
            setIsValidationDialogOpen(true);
            return;
        }
        startGeneration();
    };

    const startGeneration = () => {
        setIsValidationDialogOpen(false);
        setIsGenerating(true);
        setResult(null);
        setProgress(0);

        const maxDailyLessons = classes.length > 0
            ? Math.max(...classes.map(c => c.aulasDiarias || 5))
            : 5;

        const slots: TimeSlot[] = [];
        for (let d = 0; d < 5; d++) {
            for (let p = 0; p < maxDailyLessons; p++) {
                slots.push({ day: d, period: p });
            }
        }

        const lessons: Lesson[] = [];
        workloads.forEach(w => {
            if (w.teacher_id && w.class_id && w.subject_id) {
                lessons.push({
                    id: w.id,
                    subjectId: w.subject_id,
                    teacherId: w.teacher_id,
                    classId: w.class_id,
                    duration: 1,
                    quantity: w.hours || 2
                });
            }
        });

        const availability: TeacherAvailability[] = teachers.map(t => {
            const teacherSlots = teacherAvailability
                .filter(a => a.teacher_id === t.id && ['ND', 'P', 'HA'].includes(a.status))
                .map(a => ({
                    day: a.day_of_week - 1,
                    period: a.time_slot_index - 1
                }));
            return {
                teacherId: t.id,
                unavailableSlots: teacherSlots
            };
        });

        // Preparar configurações de bell_schedule por turma
        const classSchedules = classes.map(c => {
            const lessonSlots = c.bell_schedule?.filter(slot => slot.type === 'lesson') || [];
            return {
                classId: c.id,
                bellSchedule: c.bell_schedule || [],
                maxDailyLessons: lessonSlots.length > 0 ? lessonSlots.length : (c.aulasDiarias || 5)
            };
        });

        const input: GenerationInput = {
            lessons,
            slots,
            availability,
            classSchedules,
            config: {
                maxDailyLessonsPerClass: generationConfig.pedagogical.maxDailyLessonsPerClass,
                minimizeGaps: generationConfig.pedagogical.teacherGaps > 0,
                gapWeight: generationConfig.pedagogical.teacherGaps / 10,
                preferDoubleLessons: generationConfig.pedagogical.groupDoubleLessons
            }
        };

        workerRef.current?.postMessage(input);
    };

    const allocationReport = result ? analyzeAllocation(result.schedule) : [];

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Play className="h-6 w-6 text-primary" />
                            <CardTitle>Geração do Horário (Nativo)</CardTitle>
                        </div>
                        <CardDescription>
                            Utilize o motor de otimização nativo para gerar o horário escolar.
                        </CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => navigate("/generation-settings")} className="gap-2">
                        <Sliders className="h-4 w-4" />
                        Parâmetros
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                        {isGenerating ? (
                            <div className="flex flex-col items-center gap-4 w-full max-w-md">
                                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                                <div className="w-full space-y-2">
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>{progressMessage}</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <Progress value={progress} className="w-full" />
                                </div>
                                <p className="text-sm text-muted-foreground">Isso pode levar até 1 minuto.</p>
                            </div>
                        ) : result ? (
                            <div className="flex flex-col items-center gap-4 w-full">
                                <CheckCircle className="h-16 w-16 text-green-500" />
                                <h3 className="text-xl font-bold text-green-700">Geração Concluída!</h3>

                                <div className="grid grid-cols-2 gap-4 text-sm text-left bg-slate-50 p-4 rounded-lg border w-full max-w-2xl">
                                    <div>
                                        <span className="font-semibold">Fitness Score:</span> {result.fitness === -Infinity ? "Parcial" : result.fitness}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Aulas Alocadas:</span> {result.schedule.length}
                                    </div>
                                    <div className="col-span-2">
                                        <span className="font-semibold">Conflitos:</span> {result.conflicts.length === 0 ? "Nenhum" : result.conflicts.length}
                                    </div>
                                </div>

                                {result.conflicts.length > 0 && (
                                    <div className="bg-yellow-50 p-4 rounded-md text-left max-w-2xl w-full border border-yellow-200">
                                        <div className="flex items-center gap-2 text-yellow-700 font-bold mb-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            Avisos de Geração:
                                        </div>
                                        <ul className="list-disc pl-5 text-sm text-yellow-700 max-h-40 overflow-y-auto">
                                            {result.conflicts.map((c, i) => <li key={i}>{c}</li>)}
                                        </ul>
                                    </div>
                                )}

                                {allocationReport.length > 0 && (
                                    <div className="bg-red-50 p-4 rounded-md text-left max-w-2xl w-full border border-red-200">
                                        <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            Disciplinas Não Alocadas (Faltam Aulas):
                                        </div>
                                        <div className="max-h-40 overflow-y-auto">
                                            <table className="w-full text-sm text-red-800">
                                                <thead>
                                                    <tr className="text-left border-b border-red-200">
                                                        <th className="pb-1">Turma</th>
                                                        <th className="pb-1">Disciplina</th>
                                                        <th className="pb-1 text-right">Faltam</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {allocationReport.map((item, i) => (
                                                        <tr key={i} className="border-b border-red-100 last:border-0">
                                                            <td className="py-1">{item.className}</td>
                                                            <td className="py-1">{item.subjectName}</td>
                                                            <td className="py-1 text-right font-bold">{item.missing}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs text-red-600 mt-2">
                                            * Isso geralmente ocorre quando não há horários disponíveis suficientes para o professor ou para a turma.
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={handleGenerate}>Gerar Novamente</Button>

                                    <Button variant="secondary" onClick={handleSaveClick} className="gap-2">
                                        <FileText className="h-4 w-4" />
                                        Salvar Horário
                                    </Button>

                                    <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
                                        <DialogTrigger asChild>
                                            <Button>Visualizar Horário</Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Visualização do Horário Gerado</DialogTitle>
                                            </DialogHeader>
                                            <ScheduleViewer schedule={result.schedule} />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 bg-primary/10 rounded-full">
                                    <Play className="h-12 w-12 text-primary" />
                                </div>
                                <h3 className="text-lg font-medium">Pronto para Gerar</h3>
                                <p className="text-muted-foreground max-w-md">
                                    O sistema analisará as restrições e tentará encontrar a melhor combinação.
                                </p>
                                <Button size="lg" onClick={handleGenerate} className="gap-2">
                                    <Play className="h-4 w-4" />
                                    Iniciar Geração
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Salvar Horário</DialogTitle>
                        <DialogDescription>
                            Dê um nome para este cenário de horário para identificá-lo posteriormente.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="text-sm font-medium mb-2 block">Nome do Cenário</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-md"
                            value={scenarioName}
                            onChange={(e) => setScenarioName(e.target.value)}
                            placeholder="Ex: Horário Matutino 2025 - Versão 1"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={confirmSave}>Salvar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Inconsistências Encontradas
                        </DialogTitle>
                        <DialogDescription>
                            Foram encontrados problemas que podem impedir a geração do horário. Recomendamos corrigir antes de continuar.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                        {validationErrors.map((error, index) => (
                            <Alert key={index} variant="destructive" className="flex flex-col gap-2 bg-red-50 border-red-200 text-red-900">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 mt-1 text-red-600" />
                                    <div className="flex-1">
                                        <AlertTitle className="text-red-700 font-bold">Problema #{index + 1}</AlertTitle>
                                        <AlertDescription className="text-red-800">{error.message}</AlertDescription>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-white hover:bg-red-100 text-red-700 border-red-300 gap-2"
                                        onClick={() => {
                                            setIsValidationDialogOpen(false);
                                            navigate(error.path);
                                        }}
                                    >
                                        {error.label}
                                        <ArrowRight className="h-3 w-3" />
                                    </Button>
                                </div>
                            </Alert>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => setIsValidationDialogOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={startGeneration}>Ignorar e Gerar Mesmo Assim</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
