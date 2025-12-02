import { useState, useEffect } from "react";
import { useData, Teacher, TeacherAvailability } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type ToolType = 'P' | 'HA' | 'ND' | null;

const DAYS = [
    { id: 1, name: "Segunda" },
    { id: 2, name: "Terça" },
    { id: 3, name: "Quarta" },
    { id: 4, name: "Quinta" },
    { id: 5, name: "Sexta" },
];

export default function TeacherAvailabilityPage() {
    const { teachers, teacherAvailability, saveTeacherAvailability, schoolConfig, classes, setHasUnsavedChanges } = useData();
    const navigate = useNavigate();

    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
    const [selectedTool, setSelectedTool] = useState<ToolType>(null);
    const [localAvailability, setLocalAvailability] = useState<TeacherAvailability[]>([]);

    // Calculate maximum daily lessons from classes
    const maxDailyLessons = Math.max(...classes.map(c => c.aulasDiarias || 5), 5);
    const LESSONS = Array.from({ length: maxDailyLessons }, (_, i) => i + 1);

    useEffect(() => {
        setLocalAvailability(teacherAvailability);
    }, [teacherAvailability]);

    const handleCellClick = (day: number, lesson: number) => {
        if (!selectedTeacherId || !selectedTool) return;

        const teacher = teachers.find(t => t.id === selectedTeacherId);
        if (!teacher) return;

        setLocalAvailability(prev => {
            const existingIndex = prev.findIndex(
                a => a.teacher_id === selectedTeacherId && a.day_of_week === day && a.time_slot_index === lesson
            );

            // If clicking with same tool, remove it (toggle off)
            if (existingIndex >= 0 && prev[existingIndex].status === selectedTool) {
                setHasUnsavedChanges(true);
                return prev.filter((_, idx) => idx !== existingIndex);
            }

            // Check limits if adding P or HA
            // Calculate current counts (excluding the cell being modified if it was already P/HA)
            const currentStats = prev.filter(a => a.teacher_id === selectedTeacherId && a.status === selectedTool);
            const currentCount = currentStats.length;

            // Adjust count if we are replacing a cell that already had this status (should be covered by toggle off above, but for safety)
            // Actually, if we are here, we are either adding new or replacing a DIFFERENT status.
            // So currentCount is the count of OTHER cells with this status.

            if (selectedTool === 'P') {
                const limit = teacher.planning_hours || 0;
                // If replacing another status with P, we are adding 1 P.
                // If adding to empty cell, we are adding 1 P.
                if (currentCount >= limit) {
                    toast.warning(`Limite de Planejamento (${limit}) excedido para este professor.`);
                    return prev;
                }
            } else if (selectedTool === 'HA') {
                const limit = teacher.activity_hours || 0;
                if (currentCount >= limit) {
                    toast.warning(`Limite de Hora Atividade (${limit}) excedido para este professor.`);
                    return prev;
                }
            }

            setHasUnsavedChanges(true);

            // If existing, replace
            if (existingIndex >= 0) {
                const newArr = [...prev];
                newArr[existingIndex] = { ...newArr[existingIndex], status: selectedTool };
                return newArr;
            } else {
                // Add new availability
                return [...prev, {
                    id: `temp-${Date.now()}-${Math.random()}`, // Temp ID
                    teacher_id: selectedTeacherId,
                    day_of_week: day,
                    time_slot_index: lesson,
                    status: selectedTool
                }];
            }
        });
    };

    const getCellStatus = (teacherId: string, day: number, lesson: number) => {
        return localAvailability.find(
            a => a.teacher_id === teacherId && a.day_of_week === day && a.time_slot_index === lesson
        )?.status;
    };

    const getTeacherStats = (teacher: Teacher) => {
        const teacherAvail = localAvailability.filter(a => a.teacher_id === teacher.id);
        const pCount = teacherAvail.filter(a => a.status === 'P').length;
        const haCount = teacherAvail.filter(a => a.status === 'HA').length;
        return { pCount, haCount };
    };

    const handleSave = async () => {
        try {
            await saveTeacherAvailability(localAvailability);
            setHasUnsavedChanges(false);
            toast.success("Disponibilidade salva com sucesso!");
            navigate("/allocation");
        } catch (error) {
            toast.error("Erro ao salvar disponibilidade.");
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Configuração de Indisponibilidade</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                        {/* 1. Professores */}
                        <div className="md:col-span-3 space-y-4">
                            <h3 className="font-semibold text-center">1. Professores</h3>
                            <ScrollArea className="h-[500px] border rounded-md p-2">
                                <div className="space-y-2">
                                    {teachers.map(teacher => {
                                        const stats = getTeacherStats(teacher);
                                        const isSelected = selectedTeacherId === teacher.id;
                                        return (
                                            <div
                                                key={teacher.id}
                                                onClick={() => setSelectedTeacherId(teacher.id)}
                                                className={cn(
                                                    "p-3 rounded-md cursor-pointer transition-colors border",
                                                    isSelected
                                                        ? "bg-blue-900/50 dark:bg-blue-900/30 text-white border-l-4 border-blue-500 shadow-md"
                                                        : "hover:bg-accent bg-card dark:bg-slate-800 dark:border-slate-700"
                                                )}
                                            >
                                                <div className="font-bold uppercase">{teacher.name}</div>
                                                <div className="text-xs opacity-90">
                                                    (P: {stats.pCount}/{teacher.planning_hours || 0} | HA: {stats.haCount}/{teacher.activity_hours || 0})
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* 2. Indisponibilidade (Tools) */}
                        <div className="md:col-span-3 space-y-4 flex flex-col">
                            <h3 className="font-semibold text-center">2. Indisponibilidade</h3>
                            <div className="text-sm text-muted-foreground text-center mb-4">
                                Selecione um professor e clique em uma ferramenta para marcar na grade.
                            </div>

                            <div className="space-y-3 flex-1">
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start h-12 text-lg transition-all",
                                        selectedTool === 'P'
                                            ? "bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-600 shadow-md"
                                            : "bg-transparent text-yellow-700 dark:text-yellow-500 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                    )}
                                    onClick={() => setSelectedTool('P')}
                                >
                                    P - Planejamento
                                </Button>

                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start h-12 text-lg transition-all",
                                        selectedTool === 'HA'
                                            ? "bg-green-500 text-white hover:bg-green-600 border-green-600 shadow-md"
                                            : "bg-transparent text-green-700 dark:text-green-500 border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                    )}
                                    onClick={() => setSelectedTool('HA')}
                                >
                                    HA - Hora Atividade
                                </Button>

                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start h-12 text-lg transition-all",
                                        selectedTool === 'ND'
                                            ? "bg-red-500 text-white hover:bg-red-600 border-red-600 shadow-md"
                                            : "bg-transparent text-red-700 dark:text-red-500 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    )}
                                    onClick={() => setSelectedTool('ND')}
                                >
                                    ND - Não Disponível
                                </Button>
                            </div>

                            <div className="text-center font-semibold mt-auto">Ações</div>
                        </div>

                        {/* 3. Grade de Horários */}
                        <div className="md:col-span-6 space-y-4">
                            <h3 className="font-semibold text-center">3. Grade de Horários</h3>
                            <div className="border rounded-md overflow-hidden">
                                <div className="grid grid-cols-6 bg-muted text-muted-foreground text-sm font-medium text-center py-2 border-b">
                                    <div>Aulas</div>
                                    {DAYS.map(day => (
                                        <div key={day.id}>{day.name}</div>
                                    ))}
                                </div>

                                <div className="divide-y">
                                    {LESSONS.map(lesson => (
                                        <div key={lesson} className="grid grid-cols-6 text-center">
                                            <div className="py-4 font-medium flex items-center justify-center bg-muted/30 text-sm border-b">
                                                {lesson}º
                                            </div>
                                            {DAYS.map(day => {
                                                // Get all availability for this slot
                                                const slotAvailability = localAvailability.filter(
                                                    a => a.day_of_week === day.id && a.time_slot_index === lesson
                                                );

                                                return (
                                                    <div
                                                        key={`${day.id}-${lesson}`}
                                                        className="min-h-[6rem] border-l border-b p-1 cursor-pointer hover:bg-accent/20 transition-colors flex flex-col gap-1 relative"
                                                        onClick={() => handleCellClick(day.id, lesson)}
                                                    >
                                                        {slotAvailability.map(a => {
                                                            const t = teachers.find(t => t.id === a.teacher_id);
                                                            const tName = t ? t.name.toUpperCase() : "Unknown";

                                                            // Solid color blocks instead of badges
                                                            let cellClass = "w-full h-full flex items-center justify-center text-xs font-bold rounded ";
                                                            if (a.status === 'P') cellClass += "bg-yellow-500/20 text-yellow-700 dark:text-yellow-500 border border-yellow-400/30";
                                                            else if (a.status === 'HA') cellClass += "bg-green-500/20 text-green-700 dark:text-green-500 border border-green-400/30";
                                                            else if (a.status === 'ND') cellClass += "bg-red-500/20 text-red-700 dark:text-red-500 border border-red-400/30";

                                                            return (
                                                                <div key={a.id || `${a.teacher_id}-${a.status}`} className={cellClass} title={`${tName} - ${a.status}`}>
                                                                    <span className="truncate">{tName} [{a.status}]</span>
                                                                </div>
                                                            );
                                                        })}

                                                        {/* Visual indicator if current selected teacher is NOT in this slot but tool is selected (optional hover effect could go here) */}
                                                        {selectedTeacherId && selectedTool && !slotAvailability.some(a => a.teacher_id === selectedTeacherId) && (
                                                            <div className="absolute inset-0 bg-primary/5 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                                <span className="text-xs font-bold text-primary opacity-50">+ {selectedTool}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between">
                <Button
                    variant="outline"
                    className="border border-slate-600 dark:border-slate-500 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => navigate("/teachers")}
                >
                    Voltar (Professores)
                </Button>
                <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Salvar e Prosseguir
                </Button>
            </div>
        </div>
    );
}
