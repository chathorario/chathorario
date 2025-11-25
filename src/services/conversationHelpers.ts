import { ConversationData } from "@/hooks/useConversationState";

/**
 * Formata o nome da escola para exibição no chat
 */
export const formatSchoolData = (schoolName: string): string => {
    return `🏫 **Escola**: ${schoolName}`;
};

/**
 * Formata a lista de turmas para exibição no chat
 */
export const formatClasses = (classes: Array<{ id: string; name: string; shift: string; aulasDiarias?: number }>): string => {
    if (!classes || classes.length === 0) return "";

    const formatted = classes
        .map((c, index) => {
            const aulasDiarias = c.aulasDiarias || 5;
            return `${index + 1}. ${c.name} - ${c.shift} (${aulasDiarias} aulas/dia)`;
        })
        .join("\n");

    return `🎓 **Turmas cadastradas** (${classes.length}):\n${formatted}`;
};

/**
 * Formata a lista de disciplinas para exibição no chat
 */
export const formatSubjects = (subjects: string[]): string => {
    if (!subjects || subjects.length === 0) return "";

    const formatted = subjects
        .map((s, index) => `${index + 1}. ${s}`)
        .join("\n");

    return `📚 **Disciplinas cadastradas** (${subjects.length}):\n${formatted}`;
};

/**
 * Formata a lista de professores para exibição no chat
 */
export const formatTeachers = (teachers: Array<{ name: string; subjects: string[] }>): string => {
    if (!teachers || teachers.length === 0) return "";

    const formatted = teachers
        .map((t, index) => `${index + 1}. ${t.name} - ${t.subjects.join(", ")}`)
        .join("\n");

    return `👨‍🏫 **Professores cadastrados** (${teachers.length}):\n${formatted}`;
};

/**
 * Formata a carga horária (workload) para exibição no chat
 */
export const formatWorkload = (workload: Record<string, number>): string => {
    if (!workload || Object.keys(workload).length === 0) return "";

    const formatted = Object.entries(workload)
        .map(([subject, hours], index) => `${index + 1}. ${subject}: ${hours} aulas/semana`)
        .join("\n");

    return `⏰ **Alocação de carga horária** (${Object.keys(workload).length} disciplinas):\n${formatted}`;
};

/**
 * Verifica se há dados existentes em uma etapa específica
 */
export const hasExistingData = (step: string, data: ConversationData): boolean => {
    switch (step) {
        case "configuracoes":
            return !!data.schoolName;
        case "turmas":
            return (data.classes?.length || 0) > 0;
        case "disciplinas":
            return (data.subjects?.length || 0) > 0;
        case "professores":
            return (data.teachers?.length || 0) > 0;
        case "alocacao":
            return Object.keys(data.workload || {}).length > 0;
        default:
            return false;
    }
};
