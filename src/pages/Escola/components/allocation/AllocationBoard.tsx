import React, { useRef } from 'react';
import { Class, Workload, Teacher, Subject } from '@/context/DataContext';
import { ClassColumn } from './ClassColumn';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AllocationBoardProps {
    classes: Class[];
    workloads: Workload[];
    teachers: Teacher[];
    subjects: Subject[];
    selectedSubjectIds: string[];
    onHeaderClick: (classItem: Class) => void;
    onUpdateWorkload: (workload: Workload, delta: number) => void;
    onDeleteWorkload: (workloadId: string) => void;
    onFixWorkload: (workload: Workload) => void;
}

export const AllocationBoard: React.FC<AllocationBoardProps> = ({
    classes,
    workloads,
    teachers,
    subjects,
    selectedSubjectIds,
    onHeaderClick,
    onUpdateWorkload,
    onDeleteWorkload,
    onFixWorkload,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (containerRef.current) {
            const scrollAmount = 300;
            containerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Helper to generate consistent colors for subjects
    const getSubjectColor = (subjectName: string) => {
        const colors = [
            "bg-red-500 border-red-500",
            "bg-orange-500 border-orange-500",
            "bg-amber-500 border-amber-500",
            "bg-yellow-500 border-yellow-500",
            "bg-lime-500 border-lime-500",
            "bg-green-500 border-green-500",
            "bg-emerald-500 border-emerald-500",
            "bg-teal-500 border-teal-500",
            "bg-cyan-500 border-cyan-500",
            "bg-sky-500 border-sky-500",
            "bg-blue-500 border-blue-500",
            "bg-indigo-500 border-indigo-500",
            "bg-violet-500 border-violet-500",
            "bg-purple-500 border-purple-500",
            "bg-fuchsia-500 border-fuchsia-500",
            "bg-pink-500 border-pink-500",
            "bg-rose-500 border-rose-500",
        ];
        let hash = 0;
        for (let i = 0; i < subjectName.length; i++) {
            hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="flex-1 relative bg-slate-950 overflow-hidden group">
            {/* Left Button */}
            <button
                onClick={() => scroll('left')}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-slate-800/80 backdrop-blur-sm text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-all border border-slate-700 hover:scale-110 opacity-0 group-hover:opacity-100 duration-300"
                aria-label="Scroll Left"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Button */}
            <button
                onClick={() => scroll('right')}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-slate-800/80 backdrop-blur-sm text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-all border border-slate-700 hover:scale-110 opacity-0 group-hover:opacity-100 duration-300"
                aria-label="Scroll Right"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            <div
                ref={containerRef}
                className="flex h-full overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth"
            >
                <div className="flex h-full min-w-max">
                    {classes.map(classItem => (
                        <ClassColumn
                            key={classItem.id}
                            classItem={classItem}
                            classWorkloads={workloads.filter(w => w.class_id === classItem.id)}
                            teachers={teachers}
                            subjects={subjects}
                            selectedSubjectIds={selectedSubjectIds}
                            onHeaderClick={onHeaderClick}
                            onUpdateWorkload={onUpdateWorkload}
                            onDeleteWorkload={onDeleteWorkload}
                            onFixWorkload={onFixWorkload}
                            getSubjectColor={getSubjectColor}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
