import { Schedule, ScheduleEntry, ScheduleConflict } from "@/types/schedule";
import { ConversationData } from "@/hooks/useConversationState";

export const detectConflicts = (schedule: Schedule, data: ConversationData): ScheduleConflict[] => {
  const conflicts: ScheduleConflict[] = [];
  const entries = schedule.entries;

  // Check for teacher overlaps (same teacher, same time slot)
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const entry1 = entries[i];
      const entry2 = entries[j];

      if (
        entry1.teacherId === entry2.teacherId &&
        entry1.timeSlot.day === entry2.timeSlot.day &&
        entry1.timeSlot.period === entry2.timeSlot.period
      ) {
        conflicts.push({
          type: "teacher_overlap",
          severity: "high",
          description: `${entry1.teacherName} está alocado em duas turmas ao mesmo tempo (${entry1.className} e ${entry2.className})`,
          affectedEntries: [entry1.id, entry2.id],
        });
      }

      // Check for class overlaps (same class, same time slot)
      if (
        entry1.classId === entry2.classId &&
        entry1.timeSlot.day === entry2.timeSlot.day &&
        entry1.timeSlot.period === entry2.timeSlot.period
      ) {
        conflicts.push({
          type: "class_overlap",
          severity: "high",
          description: `Turma ${entry1.className} tem duas aulas ao mesmo tempo (${entry1.subjectName} e ${entry2.subjectName})`,
          affectedEntries: [entry1.id, entry2.id],
        });
      }
    }
  }

  // Check for consecutive class limits (no more than 3 consecutive periods)
  const classPeriods: Record<string, Record<string, number[]>> = {};
  entries.forEach((entry) => {
    if (!classPeriods[entry.classId]) {
      classPeriods[entry.classId] = {};
    }
    if (!classPeriods[entry.classId][entry.timeSlot.day]) {
      classPeriods[entry.classId][entry.timeSlot.day] = [];
    }
    classPeriods[entry.classId][entry.timeSlot.day].push(entry.timeSlot.period);
  });

  Object.entries(classPeriods).forEach(([classId, days]) => {
    Object.entries(days).forEach(([day, periods]) => {
      const sorted = periods.sort((a, b) => a - b);
      let consecutive = 1;
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === sorted[i - 1] + 1) {
          consecutive++;
          if (consecutive > 3) {
            const className = entries.find(e => e.classId === classId)?.className || classId;
            conflicts.push({
              type: "class_overlap",
              severity: "medium",
              description: `Turma ${className} tem mais de 3 aulas consecutivas na ${day}`,
              affectedEntries: entries
                .filter(e => e.classId === classId && e.timeSlot.day === day)
                .map(e => e.id),
            });
            break;
          }
        } else {
          consecutive = 1;
        }
      }
    });
  });

  // Check workload distribution (validate against expected hours)
  if (data.workload) {
    const classSubjectHours: Record<string, Record<string, number>> = {};

    entries.forEach((entry) => {
      if (!classSubjectHours[entry.classId]) {
        classSubjectHours[entry.classId] = {};
      }
      if (!classSubjectHours[entry.classId][entry.subjectId]) {
        classSubjectHours[entry.classId][entry.subjectId] = 0;
      }
      classSubjectHours[entry.classId][entry.subjectId]++;
    });

    Object.entries(classSubjectHours).forEach(([classId, subjects]) => {
      Object.entries(subjects).forEach(([subjectId, hours]) => {
        const entry = entries.find((e) => e.classId === classId && e.subjectId === subjectId);
        if (!entry) return;

        const expectedWorkload = data.workload![entry.subjectName];
        if (expectedWorkload) {
          if (hours > expectedWorkload) {
            conflicts.push({
              type: "workload_exceeded",
              severity: "medium",
              description: `${entry.className} tem ${hours}h de ${entry.subjectName} (esperado: ${expectedWorkload}h por semana)`,
              affectedEntries: entries
                .filter((e) => e.classId === classId && e.subjectId === subjectId)
                .map((e) => e.id),
            });
          } else if (hours < expectedWorkload) {
            conflicts.push({
              type: "workload_exceeded",
              severity: "low",
              description: `${entry.className} tem apenas ${hours}h de ${entry.subjectName} (esperado: ${expectedWorkload}h por semana)`,
              affectedEntries: entries
                .filter((e) => e.classId === classId && e.subjectId === subjectId)
                .map((e) => e.id),
            });
          }
        }
      });
    });
  }

  // Check teacher workload distribution per day
  const teacherDailyLoad: Record<string, Record<string, number>> = {};
  entries.forEach((entry) => {
    if (!teacherDailyLoad[entry.teacherId]) {
      teacherDailyLoad[entry.teacherId] = {};
    }
    if (!teacherDailyLoad[entry.teacherId][entry.timeSlot.day]) {
      teacherDailyLoad[entry.teacherId][entry.timeSlot.day] = 0;
    }
    teacherDailyLoad[entry.teacherId][entry.timeSlot.day]++;
  });

  Object.entries(teacherDailyLoad).forEach(([teacherId, days]) => {
    Object.entries(days).forEach(([day, hours]) => {
      if (hours > 4) {
        const teacherName = entries.find(e => e.teacherId === teacherId)?.teacherName || teacherId;
        conflicts.push({
          type: "teacher_overlap",
          severity: "low",
          description: `${teacherName} tem ${hours}h de aula na ${day} (recomendado: máx. 4h/dia)`,
          affectedEntries: entries
            .filter((e) => e.teacherId === teacherId && e.timeSlot.day === day)
            .map((e) => e.id),
        });
      }
    });
  });

  return conflicts;
};

export const calculateFitnessScore = (schedule: Schedule, data: ConversationData): number => {
  const conflicts = detectConflicts(schedule, data);
  
  let score = 1000;

  conflicts.forEach((conflict) => {
    switch (conflict.severity) {
      case "high":
        score -= 100;
        break;
      case "medium":
        score -= 50;
        break;
      case "low":
        score -= 10;
        break;
    }
  });

  return Math.max(0, score);
};
