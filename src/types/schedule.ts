export interface TimeSlot {
  day: string;
  period: number;
  startTime: string;
  endTime: string;
}

export interface ScheduleEntry {
  id: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  timeSlot: TimeSlot;
}

export interface Schedule {
  id: string;
  schoolId: string;
  entries: ScheduleEntry[];
  createdAt: Date;
  conflicts: ScheduleConflict[];
  fitnessScore?: number;
}

export interface ScheduleConflict {
  type: "teacher_overlap" | "class_overlap" | "workload_exceeded" | "unavailable_time";
  severity: "low" | "medium" | "high";
  description: string;
  affectedEntries: string[];
}

export type ViewMode = "by-class" | "by-teacher";
