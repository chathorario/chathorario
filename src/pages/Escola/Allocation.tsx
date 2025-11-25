import { useState, useEffect } from "react";
import { useData, Teacher, Subject, Class } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import FixedLessons from "./FixedLessons";

export default function AllocationPage() {
    const { teachers, subjects, classes, workloads, saveWorkload, deleteWorkload, clearAllWorkloads } = useData();
    const navigate = useNavigate();

    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
    const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
    const [defaultLessons, setDefaultLessons] = useState<number>(2);
    const [showFixedDialog, setShowFixedDialog] = useState(false);
    const [fixedTeacherId, setFixedTeacherId] = useState<string | null>(null);
    const [fixedClassId, setFixedClassId] = useState<string | null>(null);
    const [fixedSubjectId, setFixedSubjectId] = useState<string | null>(null);

    // Determine number of slots (rows) - Weekly slots (5 days * max daily lessons)
    const maxDailyLessons = Math.max(...classes.map(c => c.aulasDiarias || 5), 5);
    const maxSlots = maxDailyLessons * 5;
    const slots = Array.from({ length: maxSlots }, (_, i) => i + 1);

    // Helper to generate consistent colors for subjects in the grid
    const getSubjectColor = (subjectName: string) => {
        const colors = [
            "bg-red-100 text-red-800 border-red-200",
            "bg-orange-100 text-orange-800 border-orange-200",
            "bg-amber-100 text-amber-800 border-amber-200",
            "bg-yellow-100 text-yellow-800 border-yellow-200",
            "bg-lime-100 text-lime-800 border-lime-200",
            "bg-green-100 text-green-800 border-green-200",
            "bg-emerald-100 text-emerald-800 border-emerald-200",
            "bg-teal-100 text-teal-800 border-teal-200",
            "bg-cyan-100 text-cyan-800 border-cyan-200",
            "bg-sky-100 text-sky-800 border-sky-200",
            "bg-blue-100 text-blue-800 border-blue-200",
            "bg-indigo-100 text-indigo-800 border-indigo-200",
            "bg-violet-100 text-violet-800 border-violet-200",
            "bg-purple-100 text-purple-800 border-purple-200",
            "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
            "bg-pink-100 text-pink-800 border-pink-200",
            "bg-rose-100 text-rose-800 border-rose-200",
        ];
        let hash = 0;
        for (let i = 0; i < subjectName.length; i++) {
            hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const toggleSubjectSelection = (subjectId: string) => {
        setSelectedSubjectIds(prev =>
            prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
        );
    };

    // NEW: Bulk allocation handler for clicking class headers
    const handleClassHeaderClick = async (classItem: Class) => {
        if (!selectedTeacherId || selectedSubjectIds.length === 0) {
            toast.warning("Selecione um professor e pelo menos uma disciplina.");
            return;
        }

        const teacher = teachers.find(t => t.id === selectedTeacherId);
        if (!teacher) return;

        // Check if ALL selected subjects are already allocated to this class by this teacher
        const allAllocated = selectedSubjectIds.every(subjectId =>
            workloads.some(w =>
                w.teacher_id === selectedTeacherId &&
                w.class_id === classItem.id &&
                w.subject_id === subjectId
            )
        );

        if (allAllocated) {
            // REMOVE Allocation
            try {
                for (const subjectId of selectedSubjectIds) {
                    await deleteWorkload(selectedTeacherId, subjectId, classItem.id);
                }
                toast.success("Alocação removida com sucesso.");
            } catch (error) {
                console.error(error);
                toast.error("Erro ao remover alocação.");
            }
            return;
        }

        // ADD Allocation (Bulk)
        try {
            let totalHoursToAllocate = 0;
            const allocationsToMake: { subjectId: string; hours: number }[] = [];

            for (const subjectId of selectedSubjectIds) {
                const subject = subjects.find(s => s.id === subjectId);
                if (!subject) continue;

                let hours = subject.aulas_por_turma[classItem.id] || 0;
                if (hours === 0) hours = defaultLessons;

                if (hours > 0) {
                    totalHoursToAllocate += hours;
                    allocationsToMake.push({ subjectId, hours });
                }
            }

            // Calculate teacher's current allocation and net lessons
            const currentAllocated = workloads
                .filter(w => w.teacher_id === selectedTeacherId)
                .reduce((acc, curr) => acc + curr.hours, 0);

            const netLessons = (teacher.workload_total || 0) - (teacher.planning_hours || 0) - (teacher.activity_hours || 0);
            const availableLessons = netLessons - currentAllocated;

            // Check if allocation would exceed limit
            if (totalHoursToAllocate > availableLessons) {
                toast.error(
                    `Impossível alocar ${totalHoursToAllocate} aulas. ` +
                    `Professor ${teacher.name} tem apenas ${availableLessons} aulas líquidas disponíveis ` +
                    `(${currentAllocated}/${netLessons} já alocadas).`
                );
                return;
            }

            for (const alloc of allocationsToMake) {
                await saveWorkload(selectedTeacherId, alloc.subjectId, classItem.id, alloc.hours);
            }
            toast.success(`Alocadas ${totalHoursToAllocate} aulas em ${allocationsToMake.length} disciplinas para ${classItem.name}.`);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar alocações.");
        }
    };

    const handleClearGrid = async () => {
        await clearAllWorkloads();
    };

    // Helper to get content for a specific slot
    const getClassSlots = (classId: string) => {
        const classWorkloads = workloads.filter(w => w.class_id === classId);
        const enrichedWorkloads = classWorkloads.map(w => {
            const subject = subjects.find(s => s.id === w.subject_id);
            const teacher = teachers.find(t => t.id === w.teacher_id);
            return {
                ...w,
                subjectName: subject?.name || "Unknown",
                teacherName: teacher?.name || "Unknown",
                color: getSubjectColor(subject?.name || "Unknown"),
                subjectIndex: subjects.findIndex(s => s.id === w.subject_id),
            };
        });

        // Sort by subject order
        enrichedWorkloads.sort((a, b) => {
            if (a.subjectIndex !== b.subjectIndex) return a.subjectIndex - b.subjectIndex;
            return a.subjectName.localeCompare(b.subjectName);
        });

        const filledSlots: { text: string; color: string; teacherId: string; subjectId: string }[] = [];
        enrichedWorkloads.forEach(w => {
            for (let i = 0; i < w.hours; i++) {
                filledSlots.push({
                    text: `${w.teacherName} - ${w.subjectName}`,
                    color: w.color,
                    teacherId: w.teacher_id,
                    subjectId: w.subject_id
                });
            }
        });
        return filledSlots;
    };

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <Card className="rounded-none border-x-0 border-t-0">
                <CardHeader className="pb-4">
                    <CardTitle>Alocação de Professores e Disciplinas</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Selecione um professor, uma ou mais disciplinas e clique no cabeçalho da turma para alocar em lote.
                    </p>
                </CardHeader>
            </Card>

            {/* 3-Column Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Column 1: Teachers (~20%) */}
                <div className="w-1/5 border-r flex flex-col">
                    <div className="p-4 border-b bg-muted/50">
                        <h3 className="font-semibold text-center">1. Professor</h3>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-2">
                            {teachers.map(teacher => {
                                const netWorkload = (teacher.workload_total || 0) - (teacher.planning_hours || 0) - (teacher.activity_hours || 0);
                                const allocated = workloads
                                    .filter(w => w.teacher_id === teacher.id)
                                    .reduce((acc, w) => acc + w.hours, 0);
                                let statusColor = "bg-green-100 text-green-900 border-green-300 hover:bg-green-200";
                                if (allocated >= netWorkload) {
                                    statusColor = "bg-red-100 text-red-900 border-red-300 hover:bg-red-200";
                                }
                                const isSelected = selectedTeacherId === teacher.id;
                                return (
                                    <div
                                        key={teacher.id}
                                        onClick={() => {
                                            setSelectedTeacherId(teacher.id);
                                            setSelectedSubjectIds([]);
                                        }}
                                        className={cn(
                                            "p-3 rounded-md cursor-pointer border flex items-center justify-between gap-2",
                                            isSelected ? "ring-2 ring-primary bg-primary/10" : statusColor
                                        )}
                                    >
                                        <span className="font-bold truncate">{teacher.name}</span>
                                        <span className="text-xs font-bold px-2 py-1 rounded bg-white/50">
                                            {allocated}/{netWorkload}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                {/* Column 2: Subjects (~20%) */}
                <div className="w-1/5 border-r flex flex-col">
                    <div className="p-4 border-b bg-muted/50">
                        <h3 className="font-semibold text-center">2. Disciplina(s)</h3>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-2">
                            {subjects.map(subject => {
                                const totalNeeded = classes.reduce((acc, c) => {
                                    return acc + (subject.aulas_por_turma[c.id] || defaultLessons);
                                }, 0);
                                const totalAllocated = workloads
                                    .filter(w => w.subject_id === subject.id)
                                    .reduce((acc, w) => acc + w.hours, 0);
                                let statusColor = "bg-green-100 text-green-900 border-green-300 hover:bg-green-200";
                                if (totalAllocated >= totalNeeded) {
                                    statusColor = "bg-red-100 text-red-900 border-red-300 hover:bg-red-200";
                                }
                                const isSelected = selectedSubjectIds.includes(subject.id);
                                return (
                                    <div
                                        key={subject.id}
                                        onClick={() => toggleSubjectSelection(subject.id)}
                                        className={cn(
                                            "p-3 rounded-md cursor-pointer border flex items-center justify-between gap-2",
                                            isSelected ? "ring-2 ring-primary bg-primary/10" : statusColor
                                        )}
                                    >
                                        <span className="font-bold truncate">{subject.name}</span>
                                        <span className="text-xs font-bold px-2 py-1 rounded bg-white/50">
                                            {totalAllocated}/{totalNeeded}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                {/* Column 3: Allocation Grid (~60%) */}
                <div className="flex-1 flex flex-col">
                    {/* Grid Header with Clear Button */}
                    <div className="p-4 border-b bg-muted/50 flex items-center justify-between">
                        <h3 className="font-semibold">Grade de Alocação</h3>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Limpar Grade
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Limpar Grade de Alocação</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tem certeza que deseja limpar toda a grade de alocação? Esta ação removerá todas as aulas alocadas para todos os professores e turmas. Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClearGrid} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Sim, limpar tudo
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                    {/* Scrollable Grid */}
                    <div className="flex-1 overflow-auto">
                        <table className="w-full border-collapse border text-sm">
                            <thead className="sticky top-0 bg-muted z-10">
                                <tr>
                                    <th className="border p-2 bg-muted">Aula</th>
                                    {classes.map(c => {
                                        // Calculate status for this class if subjects are selected
                                        let columnClass = "bg-muted";
                                        let statusText = "";

                                        if (selectedTeacherId && selectedSubjectIds.length > 0) {
                                            const totalTarget = selectedSubjectIds.reduce((acc, subjId) => {
                                                const subject = subjects.find(s => s.id === subjId);
                                                return acc + (subject?.aulas_por_turma[c.id] || defaultLessons);
                                            }, 0);

                                            const totalAllocated = workloads
                                                .filter(w => w.class_id === c.id && selectedSubjectIds.includes(w.subject_id))
                                                .reduce((acc, w) => acc + w.hours, 0);

                                            const isFullyAllocated = totalAllocated >= totalTarget && totalTarget > 0;

                                            if (isFullyAllocated) {
                                                columnClass = "bg-red-100 hover:bg-red-200 border-red-200 text-red-900";
                                                statusText = "(Alocado)";
                                            } else {
                                                columnClass = "bg-emerald-100 hover:bg-emerald-200 border-emerald-200 text-emerald-900";
                                                statusText = "(Disponível)";
                                            }
                                        }

                                        return (
                                            <th
                                                key={c.id}
                                                className={cn(
                                                    "border p-2 cursor-pointer transition-colors duration-200",
                                                    columnClass
                                                )}
                                                onClick={() => handleClassHeaderClick(c)}
                                                title={selectedTeacherId && selectedSubjectIds.length > 0 ? "Clique para alocar/desalocar" : "Selecione professor e disciplina primeiro"}
                                            >
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="font-bold">{c.name}</span>
                                                    <span className="text-xs opacity-70">
                                                        {workloads.filter(w => w.class_id === c.id).reduce((acc, w) => acc + w.hours, 0)}/{maxSlots}
                                                    </span>
                                                    {statusText && <span className="text-[10px] font-bold uppercase tracking-wider">{statusText}</span>}
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {slots.map((slotIndex) => (
                                    <tr key={slotIndex}>
                                        <td className="border p-2 text-center font-bold bg-muted/50">{slotIndex}º</td>
                                        {classes.map(c => {
                                            const filledSlots = getClassSlots(c.id);
                                            const slotContent = filledSlots[slotIndex - 1]; // 0-indexed

                                            // Determine cell background tint
                                            let cellClass = "";
                                            if (selectedTeacherId && selectedSubjectIds.length > 0) {
                                                const totalTarget = selectedSubjectIds.reduce((acc, subjId) => {
                                                    const subject = subjects.find(s => s.id === subjId);
                                                    return acc + (subject?.aulas_por_turma[c.id] || defaultLessons);
                                                }, 0);

                                                const totalAllocated = workloads
                                                    .filter(w => w.class_id === c.id && w.teacher_id === selectedTeacherId && selectedSubjectIds.includes(w.subject_id))
                                                    .reduce((acc, w) => acc + w.hours, 0);

                                                const isFullyAllocated = totalAllocated >= totalTarget && totalTarget > 0;

                                                if (isFullyAllocated) {
                                                    cellClass = "bg-red-50/30";
                                                } else {
                                                    cellClass = "bg-emerald-50/30";
                                                }
                                            }

                                            return (
                                                <td
                                                    key={c.id}
                                                    className={cn(
                                                        "border p-1 h-12 align-middle transition-colors duration-200",
                                                        slotContent ? "cursor-pointer hover:opacity-80" : ""
                                                    )}
                                                    onClick={() => {
                                                        if (slotContent) {
                                                            setFixedTeacherId(slotContent.teacherId);
                                                            setFixedClassId(c.id);
                                                            setFixedSubjectId(slotContent.subjectId);
                                                            setShowFixedDialog(true);
                                                        }
                                                    }}
                                                >
                                                    {slotContent ? (
                                                        <div className={cn("w-full h-full flex items-center justify-center text-xs font-medium p-1 rounded text-center leading-tight border shadow-sm", slotContent.color)}>
                                                            {slotContent.text}
                                                        </div>
                                                    ) : (
                                                        <div className={cn("w-full h-full transition-colors duration-200", cellClass || "bg-gray-50/50")} />
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Fixed Lessons Dialog - Managed internally by FixedLessons -> SlotSelectorModal */}
            {showFixedDialog && fixedTeacherId && fixedClassId && fixedSubjectId && (
                <FixedLessons
                    teacherId={fixedTeacherId}
                    classId={fixedClassId}
                    subjectId={fixedSubjectId}
                    onClose={() => {
                        setShowFixedDialog(false);
                        setFixedTeacherId(null);
                        setFixedClassId(null);
                        setFixedSubjectId(null);
                    }}
                />
            )}

            {/* Bottom Navigation */}
            <div className="border-t p-4 flex justify-between bg-background">
                <Button variant="secondary" onClick={() => navigate("/availability")}>Voltar (Indisponibilidade)</Button>
                <Button onClick={() => toast.success("Alocação concluída!")} className="bg-emerald-600 hover:bg-emerald-700 text-white">Concluir e Validar</Button>
            </div>
        </div>
    );
}
