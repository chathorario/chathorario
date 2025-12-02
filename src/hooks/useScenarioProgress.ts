import { useMemo } from "react";
import { useData } from "@/context/DataContext";

export type StepStatus = 'completed' | 'current' | 'error' | 'pending';

export interface ProgressStep {
    id: string;
    label: string;
    path: string;
    status: StepStatus;
    errorMessage?: string;
    completionPercentage?: number;
}

export function useScenarioProgress(scenarioId: string | null) {
    const {
        schedules,
        classes,
        subjects,
        teachers,
        teacherAvailability,
        workloads,
        schoolConfig
    } = useData();

    const progress = useMemo(() => {
        if (!scenarioId) {
            return [];
        }

        const currentSchedule = schedules.find(s => s.id === scenarioId);
        if (!currentSchedule) {
            return [];
        }

        // Filter data for current scenario
        // Include: scenario-specific data OR global data (schedule_id === null/undefined)
        const scenarioClasses = classes.filter((c: any) =>
            c.schedule_id === scenarioId || !c.schedule_id
        );
        const scenarioSubjects = subjects.filter((s: any) =>
            s.schedule_id === scenarioId || !s.schedule_id
        );
        const scenarioTeachers = teachers.filter((t: any) =>
            t.schedule_id === scenarioId || !t.schedule_id
        );
        const scenarioWorkloads = workloads.filter(w => w.schedule_id === scenarioId);
        const scenarioAvailability = teacherAvailability.filter((a: any) =>
            a.schedule_id === scenarioId || !a.schedule_id
        );

        // Step 1: Configurações
        const configStep: ProgressStep = {
            id: 'config',
            label: 'Configurações',
            path: '/escola/config',
            status: schoolConfig ? 'completed' : 'error',
            errorMessage: !schoolConfig ? 'Configure os horários da escola' : undefined
        };

        // Step 2: Turmas
        const hasClasses = scenarioClasses.length > 0;

        // Helper to get shift and hours (handling different property names)
        const getClassShift = (c: any) => c.shift || c.turno;
        const getClassDailyHours = (c: any) => c.aulasDiarias || (c.carga_horaria_semanal ? c.carga_horaria_semanal / 5 : 0);
        const getClassWeeklyHours = (c: any) => c.carga_horaria_semanal || (c.aulasDiarias ? c.aulasDiarias * 5 : 0);

        // Debug shifts
        console.log('[useScenarioProgress] Class Shifts:', scenarioClasses.map((c: any) => ({
            id: c.id,
            nome: c.nome || c.name,
            shift: c.shift,
            turno: c.turno,
            resolvedShift: getClassShift(c)
        })));

        const allClassesHaveShift = scenarioClasses.every((c: any) => {
            const shift = getClassShift(c);
            return shift && String(shift).trim() !== '';
        });

        const allClassesHaveWeeklyHours = scenarioClasses.every((c: any) => {
            const weeklyHours = getClassWeeklyHours(c);
            return weeklyHours && weeklyHours > 0;
        });

        const classesValid = hasClasses && allClassesHaveShift && allClassesHaveWeeklyHours;

        const classesStep: ProgressStep = {
            id: 'classes',
            label: 'Turmas',
            path: '/classes',
            status: classesValid ? 'completed' : hasClasses ? 'error' : 'pending',
            errorMessage: !hasClasses
                ? 'Cadastre pelo menos uma turma'
                : !allClassesHaveShift
                    ? 'Defina o turno de todas as turmas'
                    : !allClassesHaveWeeklyHours
                        ? 'Defina a carga horária semanal de todas as turmas'
                        : undefined
        };

        // Step 3: Disciplinas (Critical: Carga horária deve bater)
        const hasSubjects = scenarioSubjects.length > 0;
        let subjectsValid = hasSubjects;
        let subjectsError: string | undefined;

        if (hasSubjects && scenarioClasses.length > 0) {
            const classHoursMismatch: string[] = [];

            scenarioClasses.forEach((cls: any) => {
                const classWeeklyHours = getClassWeeklyHours(cls);

                let totalSubjectHours = 0;
                scenarioSubjects.forEach((subject: any) => {
                    const aulasPorTurma = subject.aulas_por_turma || {};
                    const hoursForClass = aulasPorTurma[cls.id] || 0;
                    totalSubjectHours += hoursForClass;
                });

                if (totalSubjectHours !== classWeeklyHours) {
                    classHoursMismatch.push(
                        `${cls.nome || cls.name}: ${totalSubjectHours}/${classWeeklyHours}h`
                    );
                    subjectsValid = false;
                }
            });

            if (classHoursMismatch.length > 0) {
                subjectsError = `Carga horária incompatível: ${classHoursMismatch.join(', ')}`;
            }
        }

        const subjectsStep: ProgressStep = {
            id: 'subjects',
            label: 'Disciplinas',
            path: '/subjects',
            status: subjectsValid ? 'completed' : hasSubjects ? 'error' : 'pending',
            errorMessage: !hasSubjects
                ? 'Cadastre disciplinas e defina aulas por turma'
                : subjectsError
        };

        // Step 4: Professores (Critical: P e HA devem estar completos)
        const hasTeachers = scenarioTeachers.length > 0;
        let teachersValid = hasTeachers;
        let teachersError: string | undefined;

        if (hasTeachers && schoolConfig) {
            const teachersWithIncompleteAvailability: string[] = [];

            scenarioTeachers.forEach((teacher: any) => {
                const teacherSlots = scenarioAvailability.filter((a: any) => a.teacher_id === teacher.id);

                const pSlots = teacherSlots.filter((a: any) => a.status === 'P').length;
                const haSlots = teacherSlots.filter((a: any) => a.status === 'HA').length;

                const requiredP = teacher.horas_planejamento || 0;
                const requiredHA = teacher.horas_atividade || 0;

                if (requiredP > 0 && pSlots !== requiredP) {
                    teachersWithIncompleteAvailability.push(
                        `${teacher.name}: P ${pSlots}/${requiredP}`
                    );
                    teachersValid = false;
                }

                if (requiredHA > 0 && haSlots !== requiredHA) {
                    teachersWithIncompleteAvailability.push(
                        `${teacher.name}: HA ${haSlots}/${requiredHA}`
                    );
                    teachersValid = false;
                }
            });

            if (teachersWithIncompleteAvailability.length > 0) {
                teachersError = `Disponibilidade incompleta: ${teachersWithIncompleteAvailability.slice(0, 2).join(', ')}${teachersWithIncompleteAvailability.length > 2 ? '...' : ''}`;
            }
        }

        const teachersStep: ProgressStep = {
            id: 'teachers',
            label: 'Professores',
            path: '/teachers',
            status: teachersValid ? 'completed' : hasTeachers ? 'error' : 'pending',
            errorMessage: !hasTeachers
                ? 'Cadastre professores'
                : teachersError
        };

        // Step 5: Alocação (All workloads must be assigned)
        const hasWorkloads = scenarioWorkloads.length > 0;
        let allocationValid = hasWorkloads;
        let allocationError: string | undefined;

        if (hasSubjects && scenarioClasses.length > 0) {
            let totalExpectedSlots = 0;
            scenarioClasses.forEach((cls: any) => {
                scenarioSubjects.forEach((subject: any) => {
                    const aulasPorTurma = subject.aulas_por_turma || {};
                    const hoursForClass = aulasPorTurma[cls.id] || 0;
                    totalExpectedSlots += hoursForClass;
                });
            });

            const allocatedSlots = scenarioWorkloads.reduce((sum, w) => sum + (w.hours || 0), 0);

            if (allocatedSlots < totalExpectedSlots) {
                allocationValid = false;
                allocationError = `${allocatedSlots}/${totalExpectedSlots} aulas alocadas`;
            }
        }

        const allocationStep: ProgressStep = {
            id: 'allocation',
            label: 'Alocação',
            path: '/allocation',
            status: allocationValid ? 'completed' : hasWorkloads ? 'error' : 'pending',
            errorMessage: !hasWorkloads
                ? 'Aloque professores às disciplinas'
                : allocationError,
            completionPercentage: hasWorkloads && scenarioWorkloads.length > 0
                ? Math.round((scenarioWorkloads.length / (scenarioSubjects.length * scenarioClasses.length)) * 100)
                : 0
        };

        // Step 6: Geração
        const hasGeneratedSchedule = (currentSchedule as any).schedule_data &&
            Object.keys((currentSchedule as any).schedule_data).length > 0;

        const generateStep: ProgressStep = {
            id: 'generate',
            label: 'Geração',
            path: '/escola/gerar',
            status: hasGeneratedSchedule ? 'completed' : 'pending',
            errorMessage: !hasGeneratedSchedule ? 'Gere a grade horária' : undefined
        };

        const steps = [configStep, classesStep, subjectsStep, teachersStep, allocationStep, generateStep];

        // Determine current step (first non-completed step)
        const firstIncompleteIndex = steps.findIndex(s => s.status !== 'completed');
        if (firstIncompleteIndex !== -1 && steps[firstIncompleteIndex].status === 'pending') {
            steps[firstIncompleteIndex].status = 'current';
        }

        return steps;
    }, [scenarioId, schedules, classes, subjects, teachers, teacherAvailability, workloads, schoolConfig]);

    return progress;
}
