import React, { useState, useMemo } from 'react';
import { Teacher, Class, Workload, Subject, useData } from '@/context/DataContext';
import { cn } from '@/lib/utils';
import { Search, Filter, CheckCircle, Zap, ArrowRight, User, ChevronLeft, Book } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface AllocationFocusModeProps {
    onBack: () => void;
    selectedTeacherId: string | null;
    selectedSubjectIds: string[];
    onSelectTeacher: (id: string | null) => void;
    onSelectSubject: (id: string) => void;
}

export const AllocationFocusMode: React.FC<AllocationFocusModeProps> = ({
    onBack,
    selectedTeacherId,
    selectedSubjectIds,
    onSelectTeacher,
    onSelectSubject
}) => {
    const { teachers, classes, workloads, subjects, saveWorkload, knowledgeAreas } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAutoAssigning, setIsAutoAssigning] = useState(false);
    const [activeTab, setActiveTab] = useState<'teachers' | 'subjects'>('teachers');

    // --- Helpers ---

    const getTeacherAllocated = (teacherId: string) => {
        return workloads
            .filter(w => w.teacher_id === teacherId)
            .reduce((acc, w) => acc + w.hours, 0);
    };

    const getTeacherSubject = (teacher: Teacher) => {
        if (teacher.knowledge_area) {
            return teacher.knowledge_area;
        }
        return 'Geral';
    };

    const getTeacherSubjectId = (teacher: Teacher) => {
        const existing = workloads.find(w => w.teacher_id === teacher.id);
        if (existing) return existing.subject_id;

        if (teacher.knowledge_area) {
            const area = knowledgeAreas.find(k => k.name === teacher.knowledge_area);
            if (area) {
                const subject = subjects.find(s => s.knowledge_area_id === area.id);
                return subject?.id;
            }
        }
        return null;
    };

    // --- Derived State ---

    const teacherStats = useMemo(() => {
        return teachers.map(t => {
            const allocated = getTeacherAllocated(t.id);
            const total = t.workload_total || 0;
            const net = (t.workload_total || 0) - (t.planning_hours || 0) - (t.activity_hours || 0);
            const remaining = Math.max(0, net - allocated);
            const progress = Math.min(100, (allocated / net) * 100);
            const isComplete = allocated >= net;

            return {
                ...t,
                allocated,
                net,
                remaining,
                progress,
                isComplete,
                subjectDisplay: getTeacherSubject(t),
                primarySubjectId: getTeacherSubjectId(t)
            };
        }).sort((a, b) => {
            return b.remaining - a.remaining;
        });
    }, [teachers, workloads, subjects, knowledgeAreas]);

    const subjectStats = useMemo(() => {
        return subjects.map(s => {
            const allocated = workloads.filter(w => w.subject_id === s.id).reduce((acc, w) => acc + w.hours, 0);
            const demand = classes.reduce((acc, c) => acc + (s.aulas_por_turma[c.id] || 0), 0);
            const progress = demand > 0 ? (allocated / demand) * 100 : 0;
            return { ...s, allocated, demand, progress };
        }).sort((a, b) => b.demand - a.demand);
    }, [subjects, workloads, classes]);

    const filteredTeachers = useMemo(() => {
        return teacherStats.filter(t =>
            t.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [teacherStats, searchTerm]);

    const filteredSubjects = useMemo(() => {
        return subjectStats.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [subjectStats, searchTerm]);

    const selectedTeacher = useMemo(() => {
        return selectedTeacherId ? teacherStats.find(t => t.id === selectedTeacherId) : null;
    }, [selectedTeacherId, teacherStats]);

    const availableClasses = useMemo(() => {
        // Determine which subjects to show
        let subjectIdsToUse: string[] = [];

        if (selectedSubjectIds.length > 0) {
            subjectIdsToUse = selectedSubjectIds;
        } else if (selectedTeacher && selectedTeacher.primarySubjectId) {
            subjectIdsToUse = [selectedTeacher.primarySubjectId];
        }

        if (subjectIdsToUse.length === 0) return [];

        const results: any[] = [];

        for (const subjectId of subjectIdsToUse) {
            const subject = subjects.find(s => s.id === subjectId);
            if (!subject) continue;

            const classesForSubject = classes.map(c => {
                const required = subject.aulas_por_turma[c.id] || 0;
                if (required === 0) return null;

                const current = workloads
                    .filter(w => w.class_id === c.id && w.subject_id === subjectId)
                    .reduce((acc, w) => acc + w.hours, 0);

                const free = Math.max(0, required - current);

                const teacherInClass = selectedTeacher ? workloads.find(w =>
                    w.class_id === c.id &&
                    w.subject_id === subjectId &&
                    w.teacher_id === selectedTeacher.id
                ) : null;

                return {
                    ...c,
                    subjectId,
                    subjectName: subject.name,
                    required,
                    current,
                    free,
                    teacherAllocated: teacherInClass ? teacherInClass.hours : 0
                };
            }).filter(c => c !== null && c.free > 0);

            results.push(...classesForSubject);
        }

        return results;
    }, [selectedTeacher, classes, workloads, subjects, selectedSubjectIds]);


    // --- Actions ---

    const handleAllocate = async (classId: string, subjectId: string) => {
        if (!selectedTeacher) {
            toast.error("Selecione um professor primeiro.");
            return;
        }

        try {
            await saveWorkload(selectedTeacher.id, subjectId, classId, 1);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAutoAssign = async () => {
        if (!selectedTeacher || !selectedTeacher.primarySubjectId || availableClasses.length === 0) return;

        setIsAutoAssigning(true);
        try {
            let remainingToAllocate = selectedTeacher.remaining;
            const subjectId = selectedTeacher.primarySubjectId;

            for (const classItem of availableClasses) {
                if (remainingToAllocate <= 0) break;
                if (!classItem) continue;
                // Ensure we only auto-assign to the teacher's primary subject if multiple are shown?
                // For now, assume availableClasses are filtered correctly.
                if (classItem.subjectId !== subjectId) continue;

                const canTake = Math.min(remainingToAllocate, classItem.free);
                if (canTake > 0) {
                    const currentTeacherHours = classItem.teacherAllocated;
                    const newTotal = currentTeacherHours + canTake;

                    await saveWorkload(selectedTeacher.id, subjectId, classItem.id, newTotal);
                    remainingToAllocate -= canTake;
                }
            }
            toast.success("Atribuição automática concluída!");
        } catch (error) {
            toast.error("Erro na atribuição automática.");
        } finally {
            setIsAutoAssigning(false);
        }
    };

    const handleNextTeacher = () => {
        const currentIndex = filteredTeachers.findIndex(t => t.id === selectedTeacherId);
        if (currentIndex !== -1 && currentIndex < filteredTeachers.length - 1) {
            onSelectTeacher(filteredTeachers[currentIndex + 1].id);
        }
    };

    // Auto-select first teacher if none selected (and no subjects selected?)
    // Maybe only if we are in "Teachers" tab and nothing is selected.
    React.useEffect(() => {
        if (!selectedTeacherId && filteredTeachers.length > 0 && activeTab === 'teachers') {
            onSelectTeacher(filteredTeachers[0].id);
        }
    }, [filteredTeachers, selectedTeacherId, onSelectTeacher, activeTab]);

    return (
        <div className="flex h-full w-full bg-slate-50 text-slate-900 font-sans">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-10">
                <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-4 text-slate-700 cursor-pointer hover:text-blue-600 transition-colors" onClick={onBack}>
                        <ChevronLeft size={20} />
                        <h2 className="font-bold text-lg">Alocação</h2>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-slate-100 rounded-lg mb-4">
                        <button
                            onClick={() => setActiveTab('teachers')}
                            className={cn(
                                "flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-2",
                                activeTab === 'teachers'
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <User size={14} />
                            Professores
                        </button>
                        <button
                            onClick={() => setActiveTab('subjects')}
                            className={cn(
                                "flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-2",
                                activeTab === 'subjects'
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <Book size={14} />
                            Disciplinas
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input
                            placeholder={activeTab === 'teachers' ? "Buscar professor..." : "Buscar disciplina..."}
                            className="pl-9 bg-slate-50 border-slate-200 focus:ring-blue-500/20"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs text-slate-500 font-medium">
                    <span>{activeTab === 'teachers' ? 'Fila de trabalho' : 'Lista de Disciplinas'}</span>
                    {activeTab === 'teachers' && (
                        <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
                            <Filter size={12} />
                            <span>Ordenar por Pendência</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'teachers' ? (
                        filteredTeachers.map(teacher => (
                            <div
                                key={teacher.id}
                                onClick={() => onSelectTeacher(teacher.id)}
                                className={cn(
                                    "p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50 relative",
                                    selectedTeacherId === teacher.id ? "bg-blue-50/50 border-l-4 border-l-blue-600" : "border-l-4 border-l-transparent"
                                )}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                                            teacher.isComplete ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                        )}>
                                            {teacher.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-800 text-sm leading-tight">{teacher.name}</div>
                                            <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0 h-5 bg-slate-100 text-slate-500 hover:bg-slate-200">
                                                {teacher.subjectDisplay}
                                            </Badge>
                                        </div>
                                    </div>
                                    {teacher.isComplete && <CheckCircle className="text-green-500" size={18} />}
                                </div>

                                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                                    <span>Carga Horária</span>
                                    <span className="font-medium">{teacher.allocated}/{teacher.net} aulas</span>
                                </div>
                                <Progress
                                    value={teacher.progress}
                                    className="h-1.5 bg-slate-100"
                                    indicatorClassName={cn(
                                        teacher.isComplete ? "bg-green-500" : "bg-blue-600"
                                    )}
                                />
                            </div>
                        ))
                    ) : (
                        filteredSubjects.map(subject => (
                            <div
                                key={subject.id}
                                onClick={() => onSelectSubject(subject.id)}
                                className={cn(
                                    "p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50 relative",
                                    selectedSubjectIds.includes(subject.id) ? "bg-blue-50/50 border-l-4 border-l-blue-600" : "border-l-4 border-l-transparent"
                                )}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                            <Book size={16} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-800 text-sm leading-tight">{subject.name}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                                    <span>Alocado</span>
                                    <span className="font-medium">{subject.allocated}/{subject.demand} aulas</span>
                                </div>
                                <Progress
                                    value={subject.progress}
                                    className="h-1.5 bg-slate-100"
                                    indicatorClassName="bg-indigo-600"
                                />
                            </div>
                        ))
                    )}

                    <div className="p-4 text-center text-xs text-slate-400">
                        {activeTab === 'teachers'
                            ? `${filteredTeachers.filter(t => t.isComplete).length} de ${filteredTeachers.length} professores finalizados`
                            : `${filteredSubjects.length} disciplinas encontradas`
                        }
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
                {selectedTeacher ? (
                    <>
                        {/* Header */}
                        <div className="bg-white border-b border-slate-200 p-6 flex items-center justify-between shadow-sm">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                    Alocando <span className="text-blue-600">{selectedTeacher.name}</span>
                                </h1>
                                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                                    <Badge variant="outline" className="bg-red-50 text-red-600 border-red-100 font-normal">
                                        {selectedTeacher.subjectDisplay}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-400">🕒</span>
                                        <span>Meta: <strong>{selectedTeacher.net} aulas</strong></span>
                                    </div>
                                    {selectedTeacher.remaining > 0 ? (
                                        <div className="flex items-center gap-1 text-orange-600 font-medium">
                                            <span className="text-orange-500">⚡</span>
                                            <span>Faltam: {selectedTeacher.remaining} alocações</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-green-600 font-medium">
                                            <CheckCircle size={14} />
                                            <span>Meta atingida!</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!selectedTeacher.isComplete && (
                                <Button
                                    onClick={handleAutoAssign}
                                    disabled={isAutoAssigning || !selectedTeacher.primarySubjectId}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 gap-2"
                                >
                                    <Zap size={16} />
                                    {isAutoAssigning ? 'Atribuindo...' : 'Atribuição Automática'}
                                </Button>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {selectedTeacher.isComplete ? (
                                <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                        <CheckCircle className="w-12 h-12 text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Alocação Concluída!</h2>
                                    <p className="text-slate-500 mb-8 max-w-md">
                                        {selectedTeacher.name} atingiu a meta de {selectedTeacher.net} aulas.
                                    </p>
                                    <Button onClick={handleNextTeacher} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg shadow-lg shadow-blue-200">
                                        Ir para Próximo Professor
                                        <ArrowRight className="ml-2" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                            {selectedSubjectIds.length > 0
                                                ? `Turmas com vagas em ${selectedSubjectIds.length} disciplina(s) selecionada(s)`
                                                : `Turmas com vagas em ${selectedTeacher.subjectDisplay}`
                                            }
                                        </h3>
                                        <Badge variant="secondary" className="bg-slate-200 text-slate-600">
                                            {availableClasses.length} turmas disponíveis
                                        </Badge>
                                    </div>

                                    {availableClasses.length === 0 ? (
                                        <div className="text-center py-20 text-slate-400">
                                            <p>Nenhuma turma com vagas disponíveis para esta disciplina.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {availableClasses.map((classItem, idx) => (
                                                <div
                                                    key={`${classItem?.id}-${classItem?.subjectId}-${idx}`}
                                                    onClick={() => classItem && handleAllocate(classItem.id, classItem.subjectId)}
                                                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 hover:scale-[1.02] transition-all cursor-pointer group"
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h4 className="font-bold text-lg text-slate-800 group-hover:text-blue-700 transition-colors">
                                                                {classItem?.name}
                                                            </h4>
                                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                                <User size={12} />
                                                                <span>32 alunos</span>
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">
                                                            Manhã
                                                        </Badge>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-xs font-medium">
                                                            <span className="text-slate-400 uppercase truncate max-w-[150px]" title={classItem?.subjectName}>
                                                                Vagas de {classItem?.subjectName}
                                                            </span>
                                                            <span className="text-blue-600">{classItem?.free} livres</span>
                                                        </div>
                                                        <Progress value={(classItem!.current / classItem!.required) * 100} className="h-2 bg-slate-100" indicatorClassName="bg-blue-600" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        Selecione um professor para começar
                    </div>
                )}
            </div>
        </div>
    );
};
