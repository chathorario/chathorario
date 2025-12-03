import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScheduleEntry, TimeSlot } from "@/services/solver/types";
import { useData } from "@/context/DataContext";
import { Lock } from "lucide-react";

interface ScheduleViewerProps {
    schedule: ScheduleEntry[];
}

export function ScheduleViewer({ schedule }: ScheduleViewerProps) {
    const { classes, teachers, subjects, teacherAvailability, fixedLessons } = useData();
    const [viewMode, setViewMode] = useState<'class' | 'teacher'>('class');
    const [selectedId, setSelectedId] = useState<string>("");

    // Helper to get names
    const getClassName = (id: string) => classes.find(c => c.id === id)?.name || id;
    const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || id;
    const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || id;

    // Unique IDs for selection
    const classIds = Array.from(new Set(schedule.map(s => s.classId)));
    const teacherIds = Array.from(new Set(schedule.map(s => s.teacherId)));

    // Set initial selection if empty
    React.useEffect(() => {
        if (!selectedId) {
            if (viewMode === 'class' && classIds.length > 0) setSelectedId(classIds[0]);
            if (viewMode === 'teacher' && teacherIds.length > 0) setSelectedId(teacherIds[0]);
        }
    }, [viewMode, classIds, teacherIds, selectedId]);

    // Filter schedule
    const filteredSchedule = schedule.filter(s =>
        viewMode === 'class' ? s.classId === selectedId : s.teacherId === selectedId
    );

    const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

    // Determine max periods dynamically
    const maxPeriodsFromSchedule = schedule.length > 0
        ? Math.max(...schedule.map(s => s.period)) + 1
        : 5;

    const maxPeriodsFromClasses = classes.length > 0
        ? Math.max(...classes.map(c => c.aulasDiarias || 5))
        : 5;

    const totalPeriods = Math.max(maxPeriodsFromSchedule, maxPeriodsFromClasses);
    const periods = Array.from({ length: totalPeriods }, (_, i) => i);

    const getLesson = (day: number, period: number) => {
        return filteredSchedule.find(s => s.day === day && s.period === period);
    };

    const getAvailabilityStatus = (teacherId: string, day: number, period: number) => {
        const avail = teacherAvailability.find(a =>
            a.teacher_id === teacherId &&
            a.day_of_week === day + 1 &&
            a.time_slot_index === period + 1
        );
        return avail?.status;
    };

    const isFixed = (teacherId: string, day: number, period: number) => {
        return fixedLessons.some(fl =>
            fl.teacher_id === teacherId &&
            fl.day_of_week === day &&
            fl.slot_number === period + 1
        );
    };

    // Helper to add minutes to time string "HH:mm"
    const addMinutes = (time: string, minutes: number) => {
        const [h, m] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(h, m);
        date.setMinutes(date.getMinutes() + minutes);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    // Obter configuração da turma selecionada
    const selectedClass = viewMode === 'class' ? classes.find(c => c.id === selectedId) : null;
    const bellSchedule = selectedClass?.bell_schedule || [];

    const renderTableContent = () => {
        if (viewMode === 'class' && bellSchedule && bellSchedule.length > 0) {
            // Usar horario_inicio da turma, ou fallback baseado no shift
            let startTime = selectedClass?.horario_inicio ||
                (selectedClass?.shift === 'morning' || selectedClass?.shift === 'fulltime' ? "07:00" :
                    selectedClass?.shift === 'afternoon' ? "13:00" : "19:00");

            // Normalizar para HH:mm (remover segundos se vier como HH:mm:ss do PostgreSQL TIME)
            if (startTime && startTime.length > 5) {
                startTime = startTime.substring(0, 5);
            }

            console.log('[ScheduleViewer] DEBUG:');
            console.log('  - selectedClass:', selectedClass);
            console.log('  - horario_inicio:', selectedClass?.horario_inicio);
            console.log('  - shift:', selectedClass?.shift);
            console.log('  - startTime final:', startTime);

            let currentTime = startTime;
            let lessonCounter = 0;

            return bellSchedule.map((slot: any, index: number) => {
                const start = currentTime;
                const end = addMinutes(start, slot.duration);
                currentTime = end;

                if (slot.type === 'break') {
                    return (
                        <tr key={`break-${index}`} className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                            <td className="p-2 text-center text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200/30 dark:bg-slate-800/30">
                                {start} - {end}
                            </td>
                            <td colSpan={5} className="p-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400 italic">
                                Intervalo ({slot.duration} min)
                            </td>
                        </tr>
                    );
                }

                const periodIndex = lessonCounter++;

                return (
                    <tr key={`lesson-${periodIndex}`} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 text-center border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="font-bold text-slate-700 dark:text-slate-200">{periodIndex + 1}º Aula</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{start} - {end}</div>
                        </td>
                        {days.map((_, dayIndex) => {
                            const lesson = getLesson(dayIndex, periodIndex);
                            return (
                                <td key={dayIndex} className="p-2 text-center border-r border-slate-200 dark:border-slate-700 last:border-r-0 min-w-[140px]">
                                    {lesson ? (
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm">
                                                {getSubjectName(lesson.subjectId)}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                {viewMode === 'class' ? getTeacherName(lesson.teacherId) : getClassName(lesson.classId)}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-300 dark:text-slate-700">-</span>
                                    )}
                                </td>
                            );
                        })}
                    </tr>
                );
            });
        }

        // Fallback
        return periods.map((period) => (
            <tr key={period} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-3 text-center border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="font-bold text-slate-700 dark:text-slate-200">{period + 1}º Aula</div>
                </td>
                {days.map((_, dayIndex) => {
                    const lesson = getLesson(dayIndex, period);
                    const isUnavailable = viewMode === 'teacher' && selectedId
                        ? getAvailabilityStatus(selectedId, dayIndex, period)
                        : null;

                    const isFixedSlot = viewMode === 'teacher' && selectedId
                        ? isFixed(selectedId, dayIndex, period)
                        : false;

                    return (
                        <td key={dayIndex} className={`p-2 text-center border-r border-slate-200 dark:border-slate-700 last:border-r-0 min-w-[140px] ${isUnavailable ? 'bg-red-50 dark:bg-red-900/10' : ''
                            } ${isFixedSlot ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                            {lesson ? (
                                <div className="flex flex-col items-center gap-1">
                                    <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm">
                                        {viewMode === 'class' ? getSubjectName(lesson.subjectId) : getClassName(lesson.classId)}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        {viewMode === 'class' ? getTeacherName(lesson.teacherId) : getSubjectName(lesson.subjectId)}
                                        {isFixedSlot && <Lock size={10} className="text-blue-400" />}
                                    </span>
                                </div>
                            ) : (
                                isUnavailable ? (
                                    <span className="text-xs font-medium text-red-400">Indisponível</span>
                                ) : (
                                    <span className="text-slate-300 dark:text-slate-700">-</span>
                                )
                            )}
                        </td>
                    );
                })}
            </tr>
        ));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Tabs value={viewMode} onValueChange={(v) => { setViewMode(v as 'class' | 'teacher'); setSelectedId(""); }}>
                    <TabsList>
                        <TabsTrigger value="class">Por Turma</TabsTrigger>
                        <TabsTrigger value="teacher">Por Professor</TabsTrigger>
                    </TabsList>
                </Tabs>

                <Select value={selectedId} onValueChange={setSelectedId}>
                    <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                        {viewMode === 'class'
                            ? classIds.map(id => <SelectItem key={id} value={id}>{getClassName(id)}</SelectItem>)
                            : teacherIds.map(id => <SelectItem key={id} value={id}>{getTeacherName(id)}</SelectItem>)
                        }
                    </SelectContent>
                </Select>
            </div>

            {selectedId ? (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center justify-between">
                            <span>
                                Horário - {viewMode === 'class' ? getClassName(selectedId) : getTeacherName(selectedId)}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                            <th className="p-3 text-center font-medium text-slate-500 dark:text-slate-400 w-24">Horário</th>
                                            {days.map(day => (
                                                <th key={day} className="p-3 text-center font-medium text-slate-500 dark:text-slate-400 min-w-[140px]">
                                                    {day}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-950">
                                        {renderTableContent()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                    Selecione uma {viewMode === 'class' ? 'turma' : 'professor'} para visualizar o horário
                </div>
            )}
        </div>
    );
}
