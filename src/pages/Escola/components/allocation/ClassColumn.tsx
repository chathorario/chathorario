import React from 'react';
import { Class, Workload, Teacher, Subject } from '@/context/DataContext';
import { AllocationBlock } from './AllocationBlock';
import { cn } from '@/lib/utils';

interface ClassColumnProps {
    classItem: Class;
    classWorkloads: Workload[];
    teachers: Teacher[];
    subjects: Subject[];
    selectedSubjectIds: string[];
    onHeaderClick: (classItem: Class) => void;
    onUpdateWorkload: (workload: Workload, delta: number) => void;
    onDeleteWorkload: (workloadId: string) => void;
    onFixWorkload: (workload: Workload) => void;
    getSubjectColor: (subjectName: string) => string;
}

export const ClassColumn: React.FC<ClassColumnProps> = ({
    // ... (props remain same)
    classItem,
    classWorkloads,
    teachers,
    subjects,
    selectedSubjectIds,
    onHeaderClick,
    onUpdateWorkload,
    onDeleteWorkload,
    onFixWorkload,
    getSubjectColor,
}) => {
    // ... (calculations remain same)
    const totalAllocated = classWorkloads.reduce((acc, w) => acc + w.hours, 0);
    const totalDemand = subjects.reduce((acc, s) => acc + (s.aulas_por_turma[classItem.id] || 0), 0);

    const isComplete = totalAllocated >= totalDemand;
    const isOver = totalAllocated > totalDemand;

    // ... (isTarget logic remains same)
    const isTarget = selectedSubjectIds.length > 0 && selectedSubjectIds.some(sid => {
        const subject = subjects.find(s => s.id === sid);
        if (!subject) return false;
        const demand = subject.aulas_por_turma[classItem.id] || 0;
        if (demand === 0) return false;

        const allocated = classWorkloads
            .filter(w => w.subject_id === sid)
            .reduce((acc, w) => acc + w.hours, 0);

        return allocated < demand;
    });

    const getShiftIcon = (shift: string) => {
        switch (shift) {
            case 'morning': return <span className="text-amber-400 text-sm">☀</span>;
            case 'afternoon': return <span className="text-orange-500 text-sm">🌤</span>;
            case 'night': return <span className="text-indigo-400 text-sm">🌙</span>;
            case 'fulltime': return <span className="text-emerald-400 text-sm">🔁</span>;
            default: return <span className="text-xs font-bold text-slate-500">?</span>;
        }
    };

    const getShiftLabel = (shift: string) => {
        switch (shift) {
            case 'morning': return 'Matutino';
            case 'afternoon': return 'Vespertino';
            case 'night': return 'Noturno';
            case 'fulltime': return 'Integral';
            default: return shift;
        }
    };

    return (
        <div className={cn(
            "flex-shrink-0 w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col h-full transition-colors duration-300",
            isTarget ? "bg-blue-900/10 border-blue-500/30" : ""
        )}>
            {/* Sticky Header */}
            <div
                className={cn(
                    "sticky top-0 z-10 p-3 border-b border-slate-800 cursor-pointer transition-all duration-300",
                    isTarget ? "bg-blue-900/40 border-b-blue-500 shadow-[0_4px_12px_-2px_rgba(59,130,246,0.3)]" :
                        isOver ? "bg-red-900/20" :
                            isComplete ? "bg-emerald-900/20" :
                                "bg-slate-900"
                )}
                onClick={() => onHeaderClick(classItem)}
            >
                <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-slate-100 truncate" title={classItem.name}>
                        {classItem.name}
                    </h3>
                    <div title={getShiftLabel(classItem.shift)}>
                        {getShiftIcon(classItem.shift)}
                    </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Disponível:</span>
                    <span className={cn(
                        "font-mono font-bold px-1.5 py-0.5 rounded",
                        isOver ? "bg-red-500/20 text-red-400" :
                            isComplete ? "bg-emerald-500/20 text-emerald-400" :
                                "bg-blue-500/20 text-blue-400"
                    )}>
                        {totalAllocated}/{totalDemand}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {classWorkloads.map(workload => {
                    const teacher = teachers.find(t => t.id === workload.teacher_id);
                    const subject = subjects.find(s => s.id === workload.subject_id);
                    const color = subject ? getSubjectColor(subject.name) : 'bg-slate-500';

                    return (
                        <AllocationBlock
                            key={workload.id}
                            workload={workload}
                            teacher={teacher}
                            subject={subject}
                            color={color}
                            onIncrement={() => onUpdateWorkload(workload, 1)}
                            onDecrement={() => onUpdateWorkload(workload, -1)}
                            onDelete={() => onDeleteWorkload(workload.id)}
                            onFix={() => onFixWorkload(workload)}
                        />
                    );
                })}

                {classWorkloads.length === 0 && (
                    <div className="text-center py-8 text-slate-600 text-xs italic">
                        Nenhuma alocação
                    </div>
                )}
            </div>
        </div>
    );
};
