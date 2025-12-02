import { useState } from "react";
import { useData, Teacher, Subject, Class, Workload } from "@/context/DataContext";
import { AllocationSidebar } from "./components/allocation/AllocationSidebar";
import { AllocationBoard } from "./components/allocation/AllocationBoard";
import { ModalCenter } from "@/components/ModalCenter";
import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";
import { X, Eraser, Calendar as CalendarIcon } from "lucide-react";
import { SlotSelectorModal } from "@/components/modals/SlotSelectorModal";
import { cn } from "@/lib/utils";

export default function AllocationPage() {
    const { teachers, subjects, classes, workloads, saveWorkload, deleteWorkload } = useData();

    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
    const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
    const [isFixingMode, setIsFixingMode] = useState(false);
    const [slotModalData, setSlotModalData] = useState<{
        isOpen: boolean;
        teacherId: string;
        classId: string;
        subjectId: string;
    }>({ isOpen: false, teacherId: '', classId: '', subjectId: '' });

    const { isOpen, content, open, close, setModal } = useModal();

    const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
    const selectedSubjects = subjects.filter(s => selectedSubjectIds.includes(s.id));

    const handleSelectTeacher = (id: string | null) => {
        setSelectedTeacherId(id);
    };

    const handleSelectSubject = (id: string) => {
        setSelectedSubjectIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handleClearSelection = () => {
        setSelectedTeacherId(null);
        setSelectedSubjectIds([]);
        setIsFixingMode(false);
    };

    const handleFixWorkload = (workload: Workload) => {
        setSlotModalData({
            isOpen: true,
            teacherId: workload.teacher_id,
            classId: workload.class_id,
            subjectId: workload.subject_id
        });
    };

    const handleHeaderClick = async (classItem: Class) => {
        if (isFixingMode) {
            if (!selectedTeacherId || selectedSubjectIds.length === 0) {
                setModal({
                    title: 'Seleção Necessária',
                    message: 'Selecione um professor e uma disciplina para fixar horários nesta turma.',
                    type: 'info',
                    autoClose: true
                });
                open();
                return;
            }

            // Open modal for the first selected subject
            // Ideally we might want to ask which subject if multiple, but for now default to first
            setSlotModalData({
                isOpen: true,
                teacherId: selectedTeacherId,
                classId: classItem.id,
                subjectId: selectedSubjectIds[0]
            });
            return;
        }

        if (!selectedTeacherId || selectedSubjectIds.length === 0) {
            setModal({
                title: 'Seleção Necessária',
                message: 'Selecione um professor e pelo menos uma disciplina na barra lateral para atribuir aulas.',
                type: 'info',
                autoClose: true
            });
            open();
            return;
        }

        const teacher = teachers.find(t => t.id === selectedTeacherId);
        if (!teacher) return;

        // Calculate current allocated hours for teacher
        const currentAllocated = workloads
            .filter(w => w.teacher_id === selectedTeacherId)
            .reduce((acc, w) => acc + w.hours, 0);

        const netWorkload = (teacher.workload_total || 0) - (teacher.planning_hours || 0) - (teacher.activity_hours || 0);

        // Calculate hours to be added
        let hoursToAdd = 0;
        const updates: { subjectId: string, hours: number }[] = [];

        for (const subjectId of selectedSubjectIds) {
            const existing = workloads.find(w =>
                w.teacher_id === selectedTeacherId &&
                w.subject_id === subjectId &&
                w.class_id === classItem.id
            );

            if (existing) {
                // Increment existing
                updates.push({ subjectId, hours: existing.hours + 1 });
                hoursToAdd += 1;
            } else {
                // New allocation
                const subject = subjects.find(s => s.id === subjectId);
                const defaultHours = subject?.aulas_por_turma[classItem.id] || 2;
                updates.push({ subjectId, hours: defaultHours });
                hoursToAdd += defaultHours;
            }
        }

        // Check if exceeds limit
        if (currentAllocated + hoursToAdd > netWorkload) {
            setModal({
                title: 'Limite de Carga Horária Excedido',
                message: `Esta ação excederia a carga horária líquida do professor (${netWorkload} aulas). Atual: ${currentAllocated}. Tentativa de adicionar: ${hoursToAdd}.`,
                type: 'error',
                confirmLabel: 'Entendi'
            });
            open();
            return;
        }

        // Apply updates
        try {
            for (const update of updates) {
                await saveWorkload(selectedTeacherId, update.subjectId, classItem.id, update.hours);
            }
        } catch (error) {
            console.error(error);
            setModal({
                title: 'Erro',
                message: 'Falha ao salvar alocação.',
                type: 'error'
            });
            open();
        }
    };

    const handleUpdateWorkload = async (workload: Workload, delta: number) => {
        const newHours = workload.hours + delta;

        // Check limit if incrementing
        if (delta > 0) {
            const teacher = teachers.find(t => t.id === workload.teacher_id);
            if (teacher) {
                const currentAllocated = workloads
                    .filter(w => w.teacher_id === workload.teacher_id)
                    .reduce((acc, w) => acc + w.hours, 0);
                const netWorkload = (teacher.workload_total || 0) - (teacher.planning_hours || 0) - (teacher.activity_hours || 0);

                if (currentAllocated + delta > netWorkload) {
                    setModal({
                        title: 'Limite Atingido',
                        message: `O professor já atingiu ou excederá o limite de carga horária (${netWorkload} aulas).`,
                        type: 'error',
                        autoClose: true
                    });
                    open();
                    return;
                }
            }
        }

        try {
            if (newHours <= 0) {
                await deleteWorkload(workload.teacher_id, workload.subject_id, workload.class_id);
            } else {
                await saveWorkload(workload.teacher_id, workload.subject_id, workload.class_id, newHours);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteWorkload = async (workloadId: string) => {
        const workload = workloads.find(w => w.id === workloadId);
        if (workload) {
            try {
                await deleteWorkload(workload.teacher_id, workload.subject_id, workload.class_id);
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden">
            <AllocationSidebar
                teachers={teachers}
                subjects={subjects}
                classes={classes}
                workloads={workloads}
                selectedTeacherId={selectedTeacherId}
                selectedSubjectIds={selectedSubjectIds}
                onSelectTeacher={handleSelectTeacher}
                onSelectSubject={handleSelectSubject}
            />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Sticky Toolbar */}
                <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between flex-shrink-0 shadow-sm z-20">
                    <div className="flex items-center gap-4">
                        <div className="text-sm font-medium text-slate-400">
                            Ferramenta de Atribuição:
                        </div>

                        {selectedTeacher && selectedSubjects.length > 0 ? (
                            <div className="flex items-center gap-2 bg-blue-900/30 text-blue-200 px-3 py-1.5 rounded-full border border-blue-500/30 animate-in fade-in slide-in-from-left-4">
                                <span>🖌️</span>
                                <span>
                                    Aplicando <span className="font-bold text-white">{selectedTeacher.name}</span> em
                                    <span className="font-bold text-white ml-1">
                                        {selectedSubjects.length === 1
                                            ? selectedSubjects[0].name
                                            : `${selectedSubjects.length} Disciplinas`}
                                    </span>
                                </span>
                                <button
                                    onClick={handleClearSelection}
                                    className="ml-2 hover:bg-blue-800/50 p-0.5 rounded-full transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="text-slate-500 text-sm italic flex items-center gap-2">
                                <Eraser size={14} />
                                <span>Selecione Professor e Disciplina(s) para começar</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant={isFixingMode ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsFixingMode(!isFixingMode)}
                            className={cn(
                                "gap-2 transition-all",
                                isFixingMode
                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500"
                                    : "border-slate-700 text-slate-300 hover:bg-slate-800"
                            )}
                        >
                            <CalendarIcon size={16} />
                            {isFixingMode ? "Modo Fixação Ativo" : "Fixar Horários"}
                        </Button>

                        {selectedTeacher || selectedSubjects.length > 0 ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearSelection}
                                className="text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                                Limpar Seleção
                            </Button>
                        ) : null}
                    </div>
                </div>

                {/* Board */}
                <AllocationBoard
                    classes={classes}
                    workloads={workloads}
                    teachers={teachers}
                    subjects={subjects}
                    selectedSubjectIds={selectedSubjectIds}
                    onHeaderClick={handleHeaderClick}
                    onUpdateWorkload={handleUpdateWorkload}
                    onDeleteWorkload={handleDeleteWorkload}
                    onFixWorkload={handleFixWorkload}
                />
            </div>

            <ModalCenter
                isOpen={isOpen}
                title={content.title}
                type={content.type}
                onClose={close}
                onConfirm={content.onConfirm}
                confirmLabel={content.confirmLabel}
                cancelLabel={content.cancelLabel}
                autoClose={content.autoClose}
            >
                {content.message}
            </ModalCenter>

            <SlotSelectorModal
                isOpen={slotModalData.isOpen}
                onClose={() => setSlotModalData(prev => ({ ...prev, isOpen: false }))}
                teacherId={slotModalData.teacherId}
                classId={slotModalData.classId}
                subjectId={slotModalData.subjectId}
            />
        </div>
    );
}
