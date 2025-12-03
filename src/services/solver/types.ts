export interface TimeSlot {
    day: number; // 0-4 (Monday-Friday)
    period: number; // 0-4 (Morning 1-5)
}

export interface Lesson {
    id: string;
    subjectId: string;
    teacherId: string;
    classId: string;
    duration: number; // Usually 1
    quantity: number; // Total lessons to schedule
}

export interface ScheduleEntry {
    lessonId: string;
    day: number;
    period: number;
    subjectId: string;
    teacherId: string;
    classId: string;
}

export interface TeacherAvailability {
    teacherId: string;
    unavailableSlots: TimeSlot[]; // "ND", "P", "HA"
}

export interface ClassSchedule {
    classId: string;
    bellSchedule: { type: 'lesson' | 'break'; duration: number }[];
    maxDailyLessons: number; // Número de aulas (slots do tipo 'lesson')
}

export interface GenerationInput {
    lessons: Lesson[];
    slots: TimeSlot[];
    availability: TeacherAvailability[];
    classSchedules: ClassSchedule[]; // Configuração específica de cada turma
    config: {
        maxDailyLessonsPerClass: number; // Fallback global se não houver bell_schedule
        minimizeGaps: boolean;
        gapWeight: number;
        preferDoubleLessons: boolean;
    };
}

export interface GenerationOutput {
    schedule: ScheduleEntry[];
    fitness: number;
    conflicts: string[];
}
