import { GenerationInput, GenerationOutput, Lesson, ScheduleEntry, TimeSlot } from "./types";

export class ScheduleEngine {
    private input: GenerationInput;
    private schedule: ScheduleEntry[] = [];
    private bestSchedule: ScheduleEntry[] = [];
    private bestScore: number = -Infinity;
    private startTime: number = 0;
    private timeLimit: number = 60000; // 60 seconds

    constructor(input: GenerationInput) {
        this.input = input;
    }

    public solve(): GenerationOutput {
        this.startTime = Date.now();
        this.schedule = [];
        this.bestSchedule = [];
        this.bestScore = -Infinity;

        // Flatten lessons into individual units to schedule
        const unitsToSchedule: { lesson: Lesson; index: number }[] = [];
        this.input.lessons.forEach((lesson) => {
            for (let i = 0; i < lesson.quantity; i++) {
                unitsToSchedule.push({ lesson, index: i });
            }
        });

        // Sort by most constrained (simple heuristic: teachers with most lessons first)
        // A better heuristic would be MRV (Minimum Remaining Values) dynamically, but static ordering helps too.
        unitsToSchedule.sort((a, b) => {
            // Sort by teacher load (descending) - harder to fit busy teachers
            const loadA = this.input.lessons.filter(l => l.teacherId === a.lesson.teacherId).reduce((acc, l) => acc + l.quantity, 0);
            const loadB = this.input.lessons.filter(l => l.teacherId === b.lesson.teacherId).reduce((acc, l) => acc + l.quantity, 0);
            return loadB - loadA;
        });

        if (this.backtrack(unitsToSchedule, 0)) {
            return {
                schedule: this.bestSchedule.length > 0 ? this.bestSchedule : this.schedule,
                fitness: this.bestScore,
                conflicts: [],
            };
        } else {
            // If no perfect solution, return best found or partial
            return {
                schedule: this.bestSchedule,
                fitness: this.bestScore,
                conflicts: ["Não foi possível encontrar uma solução completa perfeita. Retornando melhor parcial encontrada."],
            };
        }
    }

    private backtrack(units: { lesson: Lesson; index: number }[], depth: number): boolean {
        // Track best partial solution (deepest recursion)
        if (this.schedule.length > this.bestSchedule.length) {
            this.bestSchedule = [...this.schedule];
            this.bestScore = this.calculateScore(this.schedule); // Calculate score for partial too
        }

        // Check time limit
        if (Date.now() - this.startTime > this.timeLimit) {
            return false; // Timeout
        }

        // Base case: all units scheduled
        if (depth === units.length) {
            const score = this.calculateScore(this.schedule);
            if (score > this.bestScore) {
                this.bestScore = score;
                this.bestSchedule = [...this.schedule];
            }
            return true; // Found a valid full schedule
        }

        const currentUnit = units[depth];
        const { lesson } = currentUnit;

        // Try all slots
        // Shuffle slots to add randomness and avoid getting stuck in same local optima if restarted
        const shuffledSlots = [...this.input.slots].sort(() => Math.random() - 0.5);

        for (const slot of shuffledSlots) {
            if (this.isValid(lesson, slot)) {
                // Assign
                const entry: ScheduleEntry = {
                    lessonId: lesson.id,
                    day: slot.day,
                    period: slot.period,
                    subjectId: lesson.subjectId,
                    teacherId: lesson.teacherId,
                    classId: lesson.classId,
                };
                this.schedule.push(entry);

                // Recurse
                if (this.backtrack(units, depth + 1)) {
                    return true; // Stop at first valid full solution for speed, or continue for optimization
                }

                // Backtrack
                this.schedule.pop();
            }
        }

        return false;
    }

    private isValid(lesson: Lesson, slot: TimeSlot): boolean {
        // 1. Teacher Availability (Hard)
        const teacherAvail = this.input.availability.find((a) => a.teacherId === lesson.teacherId);
        if (teacherAvail) {
            const isUnavailable = teacherAvail.unavailableSlots.some(
                (s) => s.day === slot.day && s.period === slot.period
            );
            if (isUnavailable) return false;
        }

        // 2. Class Uniqueness (Hard) - Class cannot have 2 lessons at same time
        const classClash = this.schedule.some(
            (e) => e.classId === lesson.classId && e.day === slot.day && e.period === slot.period
        );
        if (classClash) return false;

        // 3. Teacher Uniqueness (Hard) - Teacher cannot be in 2 places
        const teacherClash = this.schedule.some(
            (e) => e.teacherId === lesson.teacherId && e.day === slot.day && e.period === slot.period
        );
        if (teacherClash) return false;

        // 4. Max Daily Lessons per Class (Hard/Soft depending on strictness)
        // Let's treat as Hard for now based on prompt "Limite máximo de aulas diárias"
        const dailyLessons = this.schedule.filter(
            (e) => e.classId === lesson.classId && e.day === slot.day
        ).length;
        if (dailyLessons >= this.input.config.maxDailyLessonsPerClass) return false;

        return true;
    }

    private calculateScore(schedule: ScheduleEntry[]): number {
        let score = 0;
        const { minimizeGaps, gapWeight, preferDoubleLessons } = this.input.config;

        // Group by teacher
        const teacherSchedules = new Map<string, ScheduleEntry[]>();
        schedule.forEach(e => {
            if (!teacherSchedules.has(e.teacherId)) teacherSchedules.set(e.teacherId, []);
            teacherSchedules.get(e.teacherId)?.push(e);
        });

        // 1. Minimize Gaps (Soft)
        if (minimizeGaps) {
            teacherSchedules.forEach((entries) => {
                // Sort by day and period
                entries.sort((a, b) => (a.day * 10 + a.period) - (b.day * 10 + b.period));

                for (let i = 0; i < entries.length - 1; i++) {
                    const current = entries[i];
                    const next = entries[i + 1];

                    if (current.day === next.day) {
                        const gapSize = next.period - current.period - 1;
                        if (gapSize > 0) {
                            score -= (gapSize * gapWeight); // Penalize gaps
                        }
                    }
                }
            });
        }

        // 2. Double Lessons (Soft)
        if (preferDoubleLessons) {
            // Check for consecutive lessons of same subject in same class
            const classSchedules = new Map<string, ScheduleEntry[]>();
            schedule.forEach(e => {
                if (!classSchedules.has(e.classId)) classSchedules.set(e.classId, []);
                classSchedules.get(e.classId)?.push(e);
            });

            classSchedules.forEach((entries) => {
                entries.sort((a, b) => (a.day * 10 + a.period) - (b.day * 10 + b.period));
                for (let i = 0; i < entries.length - 1; i++) {
                    const current = entries[i];
                    const next = entries[i + 1];
                    if (current.day === next.day && current.period + 1 === next.period && current.subjectId === next.subjectId) {
                        score += 10; // Bonus for double lesson
                    }
                }
            });
        }

        return score;
    }
}
