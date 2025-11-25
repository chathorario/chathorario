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

    // Grid structure
    const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
    const periods = [0, 1, 2, 3, 4]; // 5 periods

    const getLesson = (day: number, period: number) => {
        return filteredSchedule.find(s => s.day === day && s.period === period);
    };

    const getAvailabilityStatus = (teacherId: string, day: number, period: number) => {
        // teacherAvailability uses 1-based indexing (1=Segunda, 1=1º Aula)
        // day is 0-based (0=Segunda), period is 0-based (0=1º Aula)
        const avail = teacherAvailability.find(a =>
            a.teacher_id === teacherId &&
            a.day_of_week === day + 1 &&
            a.time_slot_index === period + 1
        );
        return avail?.status;
    };

    const isFixed = (teacherId: string, day: number, period: number) => {
        // fixedLessons uses 1-based slot_number
        return fixedLessons.some(fl =>
            fl.teacher_id === teacherId &&
            fl.day_of_week === day &&
            fl.slot_number === period + 1
        );
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

            <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-6 bg-gray-100 border-b">
                    <div className="p-3 font-semibold text-center text-gray-600 border-r">Horário</div>
                    {days.map((day, i) => (
                        <div key={i} className="p-3 font-semibold text-center text-gray-600 border-r last:border-r-0">
                            {day}
                        </div>
                    ))}
                </div>
                {periods.map((period) => (
                    <div key={period} className="grid grid-cols-6 border-b last:border-b-0">
                        <div className="p-3 flex items-center justify-center bg-gray-50 font-medium text-gray-500 border-r">
                            {period + 1}º Aula
                        </div>
                        {days.map((day, dIndex) => {
                            const lesson = getLesson(dIndex, period);

                            // Determine background and status
                            let cellClass = "bg-white";
                            let status = null;

                            // If in Teacher View, check availability for the selected teacher
                            if (viewMode === 'teacher' && selectedId) {
                                status = getAvailabilityStatus(selectedId, dIndex, period);
                                if (status === 'ND') cellClass = "bg-red-50";
                                else if (status === 'P') cellClass = "bg-yellow-50";
                                else if (status === 'HA') cellClass = "bg-blue-50";
                            }

                            let content = null;

                            if (lesson) {
                                const fixed = isFixed(lesson.teacherId, dIndex, period);
                                content = (
                                    <div className="flex flex-col h-full justify-center items-center text-center text-sm relative w-full">
                                        {fixed && <Lock className="h-3 w-3 absolute top-0 right-0 text-gray-400" />}
                                        {status && (
                                            <span className={`absolute top-0 left-0 text-[10px] font-bold px-1 rounded 
                                                ${status === 'ND' ? 'text-red-600 bg-red-100' :
                                                    status === 'P' ? 'text-yellow-600 bg-yellow-100' :
                                                        'text-blue-600 bg-blue-100'}`}>
                                                {status}
                                            </span>
                                        )}
                                        <span className="font-bold text-blue-700 mt-1">
                                            {getSubjectName(lesson.subjectId)}
                                        </span>
                                        <span className="text-xs text-gray-600">
                                            {viewMode === 'class' ? getTeacherName(lesson.teacherId) : getClassName(lesson.classId)}
                                        </span>
                                    </div>
                                );
                            } else {
                                // Empty slot
                                if (status) {
                                    content = (
                                        <span className={`text-xs font-bold 
                                            ${status === 'ND' ? 'text-red-300' :
                                                status === 'P' ? 'text-yellow-600' :
                                                    'text-blue-400'}`}>
                                            {status}
                                        </span>
                                    );
                                } else {
                                    content = <span className="text-gray-300 text-xs">-</span>;
                                }
                            }

                            return (
                                <div key={dIndex} className={`p-2 min-h-[80px] border-r last:border-r-0 relative group hover:bg-gray-100 transition-colors ${cellClass} flex items-center justify-center`}>
                                    {content}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
