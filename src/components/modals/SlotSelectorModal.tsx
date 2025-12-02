import { useState, useEffect, useRef, Fragment } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useData } from "@/context/DataContext";
import { Lock, Pin, Plus, ChevronUp, ChevronDown } from "lucide-react";

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
        setHasUnsavedChanges,
    } = useData();

    const [selectedSlots, setSelectedSlots] = useState<{ day: number; slot: number }[]>([]);
    const [loading, setLoading] = useState(false);
    const [showScrollUp, setShowScrollUp] = useState(false);
    const [showScrollDown, setShowScrollDown] = useState(false);
    const gridRef = useRef<HTMLDivElement>(null);

    const teacher = teachers.find((t) => t.id === teacherId);
    const classItem = classes.find((c) => c.id === classId);
    const subject = subjects.find((s) => s.id === subjectId);

    const dailyLessons = classItem?.aulasDiarias || 5;
    const LESSONS = Array.from({ length: dailyLessons }, (_, i) => i + 1);
    const totalLessonsNeeded = subject?.aulas_por_turma?.[classId] || 0;

    useEffect(() => {
        if (isOpen) {
            const initialSlots = fixedLessons
                .filter(fl => fl.class_id === classId && fl.teacher_id === teacherId && fl.subject_id === subjectId)
                .map(fl => ({ day: fl.day_of_week, slot: fl.slot_number }));
            setSelectedSlots(initialSlots);
        }
    }, [isOpen, fixedLessons, classId, teacherId, subjectId]);

    const handleScroll = () => {
        if (gridRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = gridRef.current;
            setShowScrollUp(scrollTop > 10);
            setShowScrollDown(scrollTop + clientHeight < scrollHeight - 10);
        }
    };

    useEffect(() => {
        const grid = gridRef.current;
        if (grid) {
            handleScroll();
            grid.addEventListener('scroll', handleScroll);
            return () => grid.removeEventListener('scroll', handleScroll);
        }
    }, [isOpen]);

    const scrollUp = () => gridRef.current?.scrollBy({ top: -150, behavior: 'smooth' });
    const scrollDown = () => gridRef.current?.scrollBy({ top: 150, behavior: 'smooth' });

    const getTeacherAvailability = (day: number, slot: number) => {
        return teacherAvailability.find(
            (a) => a.teacher_id === teacherId && a.day_of_week === day + 1 && a.time_slot_index === slot
        )?.status;
    };

    const getFixedLesson = (day: number, slot: number) => {
        return fixedLessons.find(
            (fl) => fl.class_id === classId && fl.day_of_week === day && fl.slot_number === slot
        );
    };

    const handleSlotClick = (day: number, slot: number) => {
        const teacherStatus = getTeacherAvailability(day, slot);
        const currentFixed = getFixedLesson(day, slot);
        const isMyFixed = currentFixed && currentFixed.teacher_id === teacherId && currentFixed.subject_id === subjectId;

        if (teacherStatus && ["P", "HA", "ND"].includes(teacherStatus)) {
            toast.warning(`Professor indisponível: ${teacherStatus}`);
            return;
        }

        if (currentFixed && !isMyFixed) {
            toast.warning("Horário ocupado por outra disciplina.");
            return;
        }

        setHasUnsavedChanges(true);

        const isSelected = selectedSlots.some(s => s.day === day && s.slot === slot);
        if (isSelected) {
            setSelectedSlots(prev => prev.filter(s => !(s.day === day && s.slot === slot)));
        } else {
            setSelectedSlots(prev => [...prev, { day, slot }]);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const dbFixed = fixedLessons.filter(
                fl => fl.class_id === classId && fl.teacher_id === teacherId && fl.subject_id === subjectId
            );

            const toAdd = selectedSlots.filter(
                s => !dbFixed.some(db => db.day_of_week === s.day && db.slot_number === s.slot)
            );

            const toRemove = dbFixed.filter(
                db => !selectedSlots.some(s => s.day === db.day_of_week && s.slot === db.slot_number)
            );

            for (const item of toRemove) {
                await deleteFixedLesson(teacherId, item.day_of_week, item.slot_number);
            }

            for (const item of toAdd) {
                await saveFixedLesson(teacherId, subjectId, classId, item.day, item.slot);
            }

            setHasUnsavedChanges(false);
            toast.success("Horários fixados com sucesso!");
            onClose();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            toast.error("Erro ao salvar alterações.");
        } finally {
            setLoading(false);
        }
    };

    const totalSelected = selectedSlots.length;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl w-full bg-slate-900 border-slate-700 max-h-[92vh] flex flex-col p-0">
                {/* Header - Ultra Compact */}
                <DialogHeader className="flex-none border-b border-slate-700 pb-2 px-4 pt-3">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-lg font-bold text-white">
                                Fixar Aulas - {subject?.name}
                            </DialogTitle>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="font-medium text-slate-300">{teacher?.name}</span>
                                <span className="text-slate-600">•</span>
                                <span className="font-medium text-slate-300">{classItem?.name}</span>
                            </div>
                        </div>

                        <Badge
                            variant="outline"
                            className={cn(
                                "px-2 py-1 text-xs font-semibold border",
                                totalSelected === totalLessonsNeeded
                                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                                    : "bg-blue-500/10 border-blue-500 text-blue-400"
                            )}
                        >
                            {totalSelected} / {totalLessonsNeeded}
                        </Badge>
                    </div>
                </DialogHeader>

                {/* Grid - Ultra Compact */}
                <div className="flex-1 relative overflow-hidden px-4">
                    {showScrollUp && (
                        <button
                            onClick={scrollUp}
                            className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-slate-800/90 backdrop-blur text-white p-1.5 rounded-full shadow-lg border border-slate-700 hover:bg-blue-600 transition-all"
                        >
                            <ChevronUp className="h-3 w-3" />
                        </button>
                    )}

                    <div
                        ref={gridRef}
                        className="h-full overflow-y-auto py-2 scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <div className="grid grid-cols-[40px_repeat(5,1fr)] gap-1.5">
                            <div className="p-1 font-bold text-center text-slate-500 text-[10px]">#</div>
                            {DAYS.map(d => (
                                <div key={d.id} className="p-1 font-bold text-center text-slate-300 bg-slate-800/50 rounded uppercase text-[10px] tracking-wide border border-slate-700">
                                    {d.name}
                                </div>
                            ))}

                            {LESSONS.map(slot => (
                                <Fragment key={slot}>
                                    <div className="flex items-center justify-center font-bold text-slate-400 text-xs">
                                        {slot}º
                                    </div>
                                    {DAYS.map(day => {
                                        const isSelected = selectedSlots.some(s => s.day === day.id && s.slot === slot);
                                        const teacherStatus = getTeacherAvailability(day.id, slot);
                                        const isUnavailable = teacherStatus && ["P", "HA", "ND"].includes(teacherStatus);
                                        const currentFixed = getFixedLesson(day.id, slot);
                                        const isOccupiedByOther = currentFixed && (currentFixed.teacher_id !== teacherId || currentFixed.subject_id !== subjectId);

                                        let cellClasses = "";
                                        let content = null;

                                        if (isUnavailable) {
                                            cellClasses = "bg-slate-900/50 border-slate-800 cursor-not-allowed relative overflow-hidden";
                                            content = (
                                                <div className="flex items-center justify-center gap-1 z-10 relative">
                                                    <Lock className="h-2.5 w-2.5 text-slate-600" />
                                                    <span className="text-[10px] font-bold text-slate-500">{teacherStatus}</span>
                                                </div>
                                            );
                                        } else if (isOccupiedByOther) {
                                            cellClasses = "bg-slate-800/30 border-slate-700 cursor-not-allowed";
                                            content = <span className="text-[9px] text-slate-500 font-medium">Ocupado</span>;
                                        } else if (isSelected) {
                                            cellClasses = "bg-blue-600 border-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.5)] cursor-pointer hover:bg-blue-500 transition-all duration-200";
                                            content = <Pin className="h-3.5 w-3.5 text-blue-200" />;
                                        } else {
                                            cellClasses = "bg-slate-700 hover:bg-slate-600 border-slate-600 cursor-pointer transition-all duration-200 group";
                                        }

                                        return (
                                            <div
                                                key={`${day.id}-${slot}`}
                                                className={cn("h-10 border rounded-lg p-1 flex items-center justify-center relative", cellClasses)}
                                                onClick={() => !isUnavailable && !isOccupiedByOther && handleSlotClick(day.id, slot)}
                                            >
                                                {isUnavailable && (
                                                    <div
                                                        className="absolute inset-0 opacity-10"
                                                        style={{
                                                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(148, 163, 184, 0.1) 6px, rgba(148, 163, 184, 0.1) 12px)'
                                                        }}
                                                    />
                                                )}

                                                {content}

                                                {!isSelected && !isUnavailable && !isOccupiedByOther && (
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Plus className="h-4 w-4 text-slate-400" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </Fragment>
                            ))}
                        </div>
                    </div>

                    {showScrollDown && (
                        <button
                            onClick={scrollDown}
                            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 bg-slate-800/90 backdrop-blur text-white p-1.5 rounded-full shadow-lg border border-slate-700 hover:bg-blue-600 transition-all"
                        >
                            <ChevronDown className="h-3 w-3" />
                        </button>
                    )}

                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900 to-transparent z-10" />
                </div>

                {/* Footer - Ultra Compact */}
                <DialogFooter className="flex-none flex justify-between items-center border-t border-slate-700 pt-2 px-4 pb-3">
                    <div className="flex gap-3 text-[10px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 bg-blue-600 rounded border border-blue-500 shadow-[0_0_6px_rgba(37,99,235,0.4)]"></div>
                            <span>Fixado</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 bg-slate-700 border border-slate-600 rounded"></div>
                            <span>Disponível</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 bg-slate-900/50 border border-slate-800 rounded"></div>
                            <span>Indisponível</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            disabled={loading}
                            className="text-slate-300 hover:text-white hover:bg-slate-800 h-8 px-3 text-sm"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 h-8 px-3 text-sm"
                        >
                            {loading ? "Salvando..." : "Confirmar Fixação"}
                        </Button>
                    </div>
                </DialogFooter>

                <style>{`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    );
};
