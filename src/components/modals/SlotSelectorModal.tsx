import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useData } from "@/context/DataContext";
import { Lock, Pin } from "lucide-react";

interface SlotSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacherId: string;
    classId: string;
    subjectId: string;
}

const DAYS = [
    { id: 0, name: "Seg" },
    { id: 1, name: "Ter" },
    { id: 2, name: "Qua" },
    { id: 3, name: "Qui" },
    { id: 4, name: "Sex" },
];

export const SlotSelectorModal = ({
    isOpen,
    onClose,
    teacherId,
    classId,
    subjectId,
}: SlotSelectorModalProps) => {
    const {
        teachers,
        subjects,
        classes,
        teacherAvailability,
        fixedLessons,
        saveFixedLesson,
        deleteFixedLesson,
    } = useData();

    const [selectedSlots, setSelectedSlots] = useState<{ day: number; slot: number }[]>([]);
    const [loading, setLoading] = useState(false);

    const teacher = teachers.find((t) => t.id === teacherId);
    const classItem = classes.find((c) => c.id === classId);
    const subject = subjects.find((s) => s.id === subjectId);

    const dailyLessons = classItem?.aulasDiarias || 5;
    const LESSONS = Array.from({ length: dailyLessons }, (_, i) => i + 1);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setSelectedSlots([]);
        }
    }, [isOpen]);

    const getTeacherAvailability = (day: number, slot: number) => {
        return teacherAvailability.find(
            (a) =>
                a.teacher_id === teacherId &&
                a.day_of_week === day + 1 &&
                a.time_slot_index === slot
        )?.status;
    };

    const getFixedLesson = (day: number, slot: number) => {
        return fixedLessons.find(
            (fl) =>
                fl.class_id === classId &&
                fl.day_of_week === day &&
                fl.slot_number === slot
        );
    };

    const isFixedForCurrentContext = (day: number, slot: number) => {
        const fl = getFixedLesson(day, slot);
        return fl && fl.teacher_id === teacherId && fl.subject_id === subjectId;
    };

    // Calculate progress
    const currentFixedCount = fixedLessons.filter(
        fl => fl.class_id === classId && fl.teacher_id === teacherId && fl.subject_id === subjectId
    ).length;

    // We need to account for:
    // - Slots currently fixed that are NOT selected (will remain fixed unless we treat selection as "additions")
    // - Wait, the logic in FixedLessons was: Selection = Toggle.
    // Let's refine the UX:
    // The grid should show the CURRENT state.
    // Clicking a slot toggles its "Pending State".
    // "Blue" means "Will be fixed". "White" means "Will be free".

    // Let's initialize selectedSlots with the CURRENTLY fixed slots for this context.
    useEffect(() => {
        if (isOpen) {
            const initialSlots = fixedLessons
                .filter(fl => fl.class_id === classId && fl.teacher_id === teacherId && fl.subject_id === subjectId)
                .map(fl => ({ day: fl.day_of_week, slot: fl.slot_number }));
            setSelectedSlots(initialSlots);
        }
    }, [isOpen, fixedLessons, classId, teacherId, subjectId]);

    const handleSlotClick = (day: number, slot: number) => {
        const teacherStatus = getTeacherAvailability(day, slot);
        const currentFixed = getFixedLesson(day, slot);
        const isMyFixed = currentFixed && currentFixed.teacher_id === teacherId && currentFixed.subject_id === subjectId;

        // 1. Check Availability
        if (teacherStatus && ["P", "HA", "ND"].includes(teacherStatus)) {
            toast.warning(`Professor indisponível: ${teacherStatus}`);
            return;
        }

        // 2. Check if occupied by OTHER teacher/subject
        if (currentFixed && !isMyFixed) {
            toast.warning("Horário ocupado por outra disciplina.");
            return;
        }

        // 3. Toggle Selection
        const isSelected = selectedSlots.some(s => s.day === day && s.slot === slot);

        if (isSelected) {
            setSelectedSlots(prev => prev.filter(s => !(s.day === day && s.slot === slot)));
        } else {
            // Check limit (optional, but good UX)
            // const limit = 4; // Example limit
            // if (selectedSlots.length >= limit) {
            //    toast.warning(`Limite de ${limit} aulas atingido.`);
            //    return;
            // }
            setSelectedSlots(prev => [...prev, { day, slot }]);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // We need to sync the state.
            // 1. Get currently fixed slots for this context in DB
            const dbFixed = fixedLessons.filter(
                fl => fl.class_id === classId && fl.teacher_id === teacherId && fl.subject_id === subjectId
            );

            // 2. Identify slots to ADD (in selected but not in DB)
            const toAdd = selectedSlots.filter(
                s => !dbFixed.some(db => db.day_of_week === s.day && db.slot_number === s.slot)
            );

            // 3. Identify slots to REMOVE (in DB but not in selected)
            const toRemove = dbFixed.filter(
                db => !selectedSlots.some(s => s.day === db.day_of_week && s.slot === db.slot_number)
            );

            // Execute operations
            for (const item of toRemove) {
                await deleteFixedLesson(teacherId, item.day_of_week, item.slot_number);
            }

            for (const item of toAdd) {
                await saveFixedLesson(teacherId, subjectId, classId, item.day, item.slot);
            }

            toast.success("Horários atualizados com sucesso!");
            onClose();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            toast.error("Erro ao salvar alterações.");
        } finally {
            setLoading(false);
        }
    };

    // Calculate counts for UI
    const totalSelected = selectedSlots.length;
    // Assuming 4 lessons per week as a standard example, or fetch from subject metadata if available
    // For now, just show the count.

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl w-full">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Fixar Aulas</span>
                        <div className="text-sm font-normal text-muted-foreground bg-slate-100 px-3 py-1 rounded-full">
                            Você fixou <strong className="text-indigo-600">{totalSelected}</strong> aulas para <span className="font-medium text-slate-700">{subject?.name}</span>
                        </div>
                    </DialogTitle>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                        <span>Turma: <strong className="text-foreground">{classItem?.name}</strong></span>
                        <span>Professor: <strong className="text-foreground">{teacher?.name}</strong></span>
                    </div>
                </DialogHeader>

                <div className="py-6">
                    <div className="grid grid-cols-[50px_repeat(5,1fr)] gap-2">
                        {/* Header Row */}
                        <div className="p-3 font-bold text-center text-slate-400">#</div>
                        {DAYS.map(d => (
                            <div key={d.id} className="p-3 font-bold text-center text-slate-600 bg-slate-50 rounded-lg uppercase text-xs tracking-wider">{d.name}</div>
                        ))}

                        {/* Rows */}
                        {LESSONS.map(slot => (
                            <>
                                <div key={`row-${slot}`} className="flex items-center justify-center font-bold text-slate-400 text-sm">
                                    {slot}º
                                </div>
                                {DAYS.map(day => {
                                    const isSelected = selectedSlots.some(s => s.day === day.id && s.slot === slot);
                                    const teacherStatus = getTeacherAvailability(day.id, slot);
                                    const isUnavailable = teacherStatus && ["P", "HA", "ND"].includes(teacherStatus);
                                    const currentFixed = getFixedLesson(day.id, slot);
                                    const isOccupiedByOther = currentFixed && (currentFixed.teacher_id !== teacherId || currentFixed.subject_id !== subjectId);

                                    let bgClass = "bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer";
                                    let content = null;
                                    let icon = null;

                                    if (isUnavailable) {
                                        // Darker gray for better contrast against white
                                        bgClass = "bg-slate-200/80 border-slate-300 cursor-not-allowed opacity-70";
                                        content = <span className="text-xs font-bold text-slate-500">{teacherStatus}</span>;
                                        icon = <Lock className="h-3 w-3 text-slate-500 mb-1" />;
                                    } else if (isOccupiedByOther) {
                                        bgClass = "bg-slate-100 border-slate-200 cursor-not-allowed";
                                        content = <span className="text-[10px] text-slate-400 font-medium">Ocupado</span>;
                                    } else if (isSelected) {
                                        bgClass = "bg-indigo-600 border-indigo-600 text-white shadow-md transform scale-[1.02] transition-all";
                                        content = <span className="text-xs font-bold">{subject?.name}</span>;
                                        icon = <Pin className="h-3 w-3 text-indigo-200 mb-1" />;
                                    } else {
                                        // Explicitly white for available, with clearer border
                                        bgClass = "bg-white border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer shadow-sm";
                                    }

                                    return (
                                        <div
                                            key={`${day.id}-${slot}`}
                                            className={cn(
                                                "h-20 border rounded-xl p-2 flex flex-col items-center justify-center transition-all duration-200 relative group",
                                                bgClass
                                            )}
                                            onClick={() => !isUnavailable && !isOccupiedByOther && handleSlotClick(day.id, slot)}
                                        >
                                            {icon}
                                            {content}

                                            {/* Hover hint for available slots */}
                                            {!isSelected && !isUnavailable && !isOccupiedByOther && (
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Pin className="h-4 w-4 text-indigo-400/50" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        ))}
                    </div>
                </div>

                <DialogFooter className="flex justify-between items-center border-t pt-4">
                    <div className="flex gap-4 text-xs text-muted-foreground mr-auto">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-600 rounded-sm"></div> Fixado</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white border border-slate-300 rounded-sm shadow-sm"></div> Disponível</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-200 border border-slate-300 rounded-sm"></div> Indisponível</div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                            {loading ? "Salvando..." : "Confirmar Bloqueio"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
