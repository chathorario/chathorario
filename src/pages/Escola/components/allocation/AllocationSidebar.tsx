import React, { useState, useEffect, useRef } from 'react';
import { Teacher, Subject, Workload, Class } from '@/context/DataContext';
import { User, Book, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface AllocationSidebarProps {
    teachers: Teacher[];
    subjects: Subject[];
    classes: Class[];
    workloads: Workload[];
    selectedTeacherId: string | null;
    selectedSubjectIds: string[];
    onSelectTeacher: (id: string | null) => void;
    onSelectSubject: (id: string) => void;
}

export const AllocationSidebar: React.FC<AllocationSidebarProps> = ({
    teachers,
    subjects,
    classes,
    workloads,
    selectedTeacherId,
    selectedSubjectIds,
    onSelectTeacher,
    onSelectSubject,
}) => {
    const [activeTab, setActiveTab] = useState<'teachers' | 'subjects'>('teachers');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAllSubjects, setShowAllSubjects] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'up' | 'down') => {
        if (listRef.current) {
            const scrollAmount = 200;
            listRef.current.scrollBy({
                top: direction === 'up' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Auto-switch to subjects tab when a teacher is selected
    useEffect(() => {
        if (selectedTeacherId) {
            setActiveTab('subjects');
            setShowAllSubjects(false); // Reset to filtered view by default
        }
    }, [selectedTeacherId]);

    // Filtered lists
    const filteredTeachers = teachers
        .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);

    const filteredSubjects = subjects.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());

        if (showAllSubjects) return matchesSearch;

        // If a teacher is selected, filter by their subjects (if they have any defined)
        // We assume teacher.subjects contains subject names or IDs. We check both.
        const matchesTeacher = !selectedTeacher ||
            !selectedTeacher.subjects ||
            selectedTeacher.subjects.length === 0 ||
            selectedTeacher.subjects.includes(s.name) ||
            selectedTeacher.subjects.includes(s.id);

        return matchesSearch && matchesTeacher;
    }).sort((a, b) => a.name.localeCompare(b.name));

    // Helper to calculate hours
    const getTeacherAllocated = (teacherId: string) => {
        return workloads
            .filter(w => w.teacher_id === teacherId)
            .reduce((acc, w) => acc + w.hours, 0);
    };

    const getSubjectAllocated = (subjectId: string) => {
        return workloads
            .filter(w => w.subject_id === subjectId)
            .reduce((acc, w) => acc + w.hours, 0);
    };

    const getSubjectDemand = (subject: Subject) => {
        return classes.reduce((acc, c) => acc + (subject.aulas_por_turma[c.id] || 0), 0);
    };

    return (
        <div className="w-80 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
            {/* Tabs */}
            <div className="flex border-b border-slate-800">
                <button
                    onClick={() => setActiveTab('teachers')}
                    className={cn(
                        "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                        activeTab === 'teachers'
                            ? "bg-slate-800 text-slate-100 border-b-2 border-blue-500"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    )}
                >
                    <User size={16} />
                    Professores
                </button>
                <button
                    onClick={() => setActiveTab('subjects')}
                    className={cn(
                        "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                        activeTab === 'subjects'
                            ? "bg-slate-800 text-slate-100 border-b-2 border-blue-500"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    )}
                >
                    <Book size={16} />
                    Disciplinas
                </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-slate-800 space-y-2">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder={activeTab === 'teachers' ? "Buscar professor..." : "Buscar disciplina..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-500/50"
                    />
                </div>

                {activeTab === 'subjects' && selectedTeacher && (
                    <div className="flex items-center gap-2 px-1">
                        <input
                            type="checkbox"
                            id="showAllSubjects"
                            checked={showAllSubjects}
                            onChange={(e) => setShowAllSubjects(e.target.checked)}
                            className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500/20"
                        />
                        <label htmlFor="showAllSubjects" className="text-xs text-slate-400 cursor-pointer select-none">
                            Mostrar todas as disciplinas
                        </label>
                    </div>
                )}
            </div>

            {/* List Container */}
            <div className="flex-1 relative overflow-hidden flex flex-col group">
                {/* Up Button */}
                <button
                    onClick={() => scroll('up')}
                    className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-900 to-transparent z-10 flex items-start justify-center pt-1 text-slate-400 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Scroll Up"
                >
                    <ChevronUp size={20} />
                </button>

                {/* List */}
                <div
                    ref={listRef}
                    className="flex-1 overflow-y-auto scrollbar-hide scroll-smooth py-2"
                >
                    {activeTab === 'teachers' ? (
                        <div className="divide-y divide-slate-800/50">
                            {filteredTeachers.map(teacher => {
                                const allocated = getTeacherAllocated(teacher.id);
                                const total = teacher.workload_total || 0;
                                const net = (teacher.workload_total || 0) - (teacher.planning_hours || 0) - (teacher.activity_hours || 0);
                                const isComplete = allocated >= net;
                                const isOver = allocated > net;

                                return (
                                    <button
                                        key={teacher.id}
                                        onClick={() => onSelectTeacher(teacher.id)}
                                        className={cn(
                                            "w-full text-left p-3 hover:bg-slate-800/50 transition-colors flex justify-between items-center group",
                                            selectedTeacherId === teacher.id ? "bg-blue-900/20 border-l-2 border-blue-500" : "border-l-2 border-transparent"
                                        )}
                                    >
                                        <div className="min-w-0 flex-1 pr-2">
                                            <div className={cn("font-medium truncate", selectedTeacherId === teacher.id ? "text-blue-400" : "text-slate-300")}>
                                                {teacher.name}
                                            </div>
                                            <div className="text-xs text-slate-500 truncate">
                                                {teacher.knowledge_area || 'Sem área'}
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-2 py-1 rounded text-xs font-mono font-bold",
                                            isOver ? "bg-red-900/30 text-red-400" :
                                                isComplete
                                                    ? "bg-emerald-900/30 text-emerald-400"
                                                    : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
                                        )}>
                                            {allocated}/{net}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800/50">
                            {filteredSubjects.map(subject => {
                                const allocated = getSubjectAllocated(subject.id);
                                const demand = getSubjectDemand(subject);
                                const isComplete = allocated >= demand;
                                const isSelected = selectedSubjectIds.includes(subject.id);

                                return (
                                    <button
                                        key={subject.id}
                                        onClick={() => onSelectSubject(subject.id)}
                                        className={cn(
                                            "w-full text-left p-3 hover:bg-slate-800/50 transition-colors flex justify-between items-center group",
                                            isSelected ? "bg-blue-900/20 border-l-2 border-blue-500" : "border-l-2 border-transparent"
                                        )}
                                    >
                                        <div className="min-w-0 flex-1 pr-2">
                                            <div className={cn("font-medium truncate", isSelected ? "text-blue-400" : "text-slate-300")}>
                                                {subject.name}
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-2 py-1 rounded text-xs font-mono font-bold",
                                            isComplete
                                                ? "bg-emerald-900/30 text-emerald-400"
                                                : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
                                        )}>
                                            {allocated}/{demand}
                                        </div>
                                    </button>
                                );
                            })}
                            {filteredSubjects.length === 0 && (
                                <div className="p-4 text-center text-slate-500 text-sm">
                                    Nenhuma disciplina encontrada para este professor.
                                    <br />
                                    <button
                                        onClick={() => setShowAllSubjects(true)}
                                        className="text-blue-400 hover:underline mt-2"
                                    >
                                        Mostrar todas
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Down Button */}
                <button
                    onClick={() => scroll('down')}
                    className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900 to-transparent z-10 flex items-end justify-center pb-1 text-slate-400 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Scroll Down"
                >
                    <ChevronDown size={20} />
                </button>
            </div>
        </div>
    );
};
