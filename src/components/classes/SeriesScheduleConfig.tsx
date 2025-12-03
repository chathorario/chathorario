import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Clock, Plus, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

interface BellSlot {
    type: 'lesson' | 'break';
    duration: number;
}

interface SeriesScheduleConfigProps {
    isOpen: boolean;
    onClose: () => void;
    seriesName: string;
    aulasDiarias: number;
    currentSchedule: BellSlot[];
    currentStartTime?: string; // Horário de início atual
    onSave: (schedule: BellSlot[], startTime: string) => void; // Incluir startTime
    onCopyToAll?: (schedule: BellSlot[], startTime: string) => void; // Incluir startTime
}

export function SeriesScheduleConfig({
    isOpen,
    onClose,
    seriesName,
    aulasDiarias,
    currentSchedule,
    currentStartTime,
    onSave,
    onCopyToAll
}: SeriesScheduleConfigProps) {
    const [startTime, setStartTime] = useState("07:00");
    const [lessonDuration, setLessonDuration] = useState(50);
    const [schedule, setSchedule] = useState<BellSlot[]>([]);

    // Inicializar schedule quando abrir o modal
    useEffect(() => {
        if (isOpen) {
            // Inicializar startTime se fornecido
            if (currentStartTime) {
                setStartTime(currentStartTime);
            }

            if (currentSchedule && currentSchedule.length > 0) {
                setSchedule(currentSchedule);
                // Extrair duração da primeira aula
                const firstLesson = currentSchedule.find(s => s.type === 'lesson');
                if (firstLesson) {
                    setLessonDuration(firstLesson.duration);
                }
            } else {
                // Criar schedule padrão com apenas aulas
                const defaultSchedule: BellSlot[] = Array(aulasDiarias).fill(null).map(() => ({
                    type: 'lesson',
                    duration: lessonDuration
                }));
                setSchedule(defaultSchedule);
            }
        }
    }, [isOpen, currentSchedule, aulasDiarias]);

    // Calcular horários reais baseado no schedule
    const calculateTimeSlots = () => {
        const slots: { type: string; start: string; end: string; duration: number }[] = [];
        const [hours, minutes] = startTime.split(':').map(Number);
        let currentMinutes = hours * 60 + minutes;

        schedule.forEach((slot) => {
            const startHour = Math.floor(currentMinutes / 60);
            const startMin = currentMinutes % 60;
            currentMinutes += slot.duration;
            const endHour = Math.floor(currentMinutes / 60);
            const endMin = currentMinutes % 60;

            slots.push({
                type: slot.type,
                start: `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`,
                end: `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`,
                duration: slot.duration
            });
        });

        return slots;
    };

    const addBreakAfter = (index: number) => {
        const newSchedule = [...schedule];
        newSchedule.splice(index + 1, 0, { type: 'break', duration: 20 });
        setSchedule(newSchedule);
    };

    const removeBreak = (index: number) => {
        const newSchedule = schedule.filter((_, i) => i !== index);
        setSchedule(newSchedule);
    };

    const updateBreakDuration = (index: number, duration: number) => {
        const newSchedule = [...schedule];
        newSchedule[index].duration = duration;
        setSchedule(newSchedule);
    };

    const updateLessonDuration = (newDuration: number) => {
        setLessonDuration(newDuration);
        // Atualizar todas as aulas existentes
        const newSchedule = schedule.map(slot =>
            slot.type === 'lesson' ? { ...slot, duration: newDuration } : slot
        );
        setSchedule(newSchedule);
    };

    const handleSave = () => {
        // Validar que temos o número correto de aulas
        const lessonCount = schedule.filter(s => s.type === 'lesson').length;
        if (lessonCount !== aulasDiarias) {
            toast.error(`Configuração inválida: esperado ${aulasDiarias} aulas, encontrado ${lessonCount}`);
            return;
        }

        onSave(schedule, startTime);
        toast.success("Configuração de horários salva!");
        onClose();
    };

    const timeSlots = calculateTimeSlots();
    let lessonNumber = 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-indigo-600" />
                        Configurar Horários do Sino - {seriesName}
                    </DialogTitle>
                    <DialogDescription>
                        Defina o horário de início, duração das aulas e intervalos para esta série
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Configurações Globais */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div>
                            <Label htmlFor="startTime">Horário de Início do Turno</Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="lessonDuration">Duração da Aula (minutos)</Label>
                            <Input
                                id="lessonDuration"
                                type="number"
                                min="30"
                                max="120"
                                value={lessonDuration}
                                onChange={(e) => updateLessonDuration(Number(e.target.value))}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {/* Timeline Visual */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Linha do Tempo ({schedule.filter(s => s.type === 'lesson').length} aulas)
                        </h3>

                        <div className="space-y-1">
                            {timeSlots.map((slot, index) => {
                                const isLesson = schedule[index].type === 'lesson';
                                const isLastLesson = isLesson && index === schedule.length - 1;
                                const nextIsLesson = index < schedule.length - 1 && schedule[index + 1].type === 'lesson';

                                if (isLesson) lessonNumber++;

                                return (
                                    <div key={index}>
                                        {/* Slot (Aula ou Intervalo) */}
                                        <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${isLesson
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                                            : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                                            }`}>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm">
                                                        {isLesson ? `${lessonNumber}ª Aula` : 'Intervalo'}
                                                    </span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        {slot.start} - {slot.end}
                                                    </span>
                                                </div>
                                                {!isLesson && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Input
                                                            type="number"
                                                            min="5"
                                                            max="60"
                                                            value={schedule[index].duration}
                                                            onChange={(e) => updateBreakDuration(index, Number(e.target.value))}
                                                            className="w-20 h-7 text-xs"
                                                        />
                                                        <span className="text-xs">minutos</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-sm font-mono text-slate-600 dark:text-slate-400">
                                                {slot.duration} min
                                            </div>
                                            {!isLesson && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => removeBreak(index)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>

                                        {/* Botão Adicionar Intervalo */}
                                        {isLesson && !isLastLesson && nextIsLesson && (
                                            <div className="flex justify-center my-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-6 text-xs gap-1 border-dashed"
                                                    onClick={() => addBreakAfter(index)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                    Adicionar Intervalo
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Horário de Término */}
                        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Término do Turno: {timeSlots[timeSlots.length - 1]?.end || '--:--'}
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-between items-center">
                    {onCopyToAll && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                onCopyToAll?.(schedule, startTime);
                                toast.success("Configuração copiada para todas as séries!");
                            }}
                            className="gap-2"
                        >
                            <Copy className="h-4 w-4" />
                            Copiar para Todas as Séries
                        </Button>
                    )}
                    <div className="flex gap-2 ml-auto">
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                            Salvar Configuração
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
