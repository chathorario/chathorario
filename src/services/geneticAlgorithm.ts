import { Schedule, ScheduleEntry, TimeSlot } from "@/types/schedule";
import { ConversationData } from "@/hooks/useConversationState";
import { calculateFitnessScore, detectConflicts } from "./conflictDetection";

interface GeneticAlgorithmConfig {
  populationSize: number;
  generations: number;
  mutationRate: number;
  elitismRate: number;
}

const DEFAULT_CONFIG: GeneticAlgorithmConfig = {
  populationSize: 50,
  generations: 100,
  mutationRate: 0.1,
  elitismRate: 0.2,
};

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const PERIODS_PER_DAY = 5;

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 7;

  DAYS.forEach((day) => {
    for (let period = 1; period <= PERIODS_PER_DAY; period++) {
      const hour = startHour + period - 1;
      slots.push({
        day,
        period,
        startTime: `${hour.toString().padStart(2, "0")}:00`,
        endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
      });
    }
  });

  return slots;
};

const createRandomSchedule = (data: ConversationData, schoolId: string): Schedule => {
  const entries: ScheduleEntry[] = [];
  const timeSlots = generateTimeSlots();
  const { classes = [], teachers = [], subjects = [], workload = {} } = data;

  classes.forEach((classItem) => {
    Object.entries(workload).forEach(([subjectName, hours]) => {
      const subject = subjects.find((s) => s === subjectName);
      if (!subject) return;

      const availableTeachers = teachers.filter((t) => t.subjects.includes(subjectName));
      if (availableTeachers.length === 0) return;

      for (let i = 0; i < hours; i++) {
        const randomTeacher = availableTeachers[Math.floor(Math.random() * availableTeachers.length)];
        const randomSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];

        entries.push({
          id: `entry-${Date.now()}-${Math.random()}`,
          classId: classItem.name,
          className: classItem.name,
          subjectId: subjectName,
          subjectName: subjectName,
          teacherId: randomTeacher.name,
          teacherName: randomTeacher.name,
          timeSlot: { ...randomSlot },
        });
      }
    });
  });

  const schedule: Schedule = {
    id: `schedule-${Date.now()}`,
    schoolId,
    entries,
    createdAt: new Date(),
    conflicts: [],
  };

  schedule.conflicts = detectConflicts(schedule, data);
  schedule.fitnessScore = calculateFitnessScore(schedule, data);

  return schedule;
};

const crossover = (parent1: Schedule, parent2: Schedule, data: ConversationData): Schedule => {
  const crossoverPoint = Math.floor(parent1.entries.length / 2);
  
  const childEntries = [
    ...parent1.entries.slice(0, crossoverPoint),
    ...parent2.entries.slice(crossoverPoint),
  ];

  const child: Schedule = {
    id: `schedule-${Date.now()}-${Math.random()}`,
    schoolId: parent1.schoolId,
    entries: childEntries,
    createdAt: new Date(),
    conflicts: [],
  };

  child.conflicts = detectConflicts(child, data);
  child.fitnessScore = calculateFitnessScore(child, data);

  return child;
};

const mutate = (schedule: Schedule, data: ConversationData, mutationRate: number): Schedule => {
  const mutatedEntries = schedule.entries.map((entry) => {
    if (Math.random() < mutationRate) {
      const timeSlots = generateTimeSlots();
      const randomSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      
      return {
        ...entry,
        timeSlot: { ...randomSlot },
      };
    }
    return entry;
  });

  const mutated: Schedule = {
    ...schedule,
    id: `schedule-${Date.now()}-${Math.random()}`,
    entries: mutatedEntries,
    createdAt: new Date(),
  };

  mutated.conflicts = detectConflicts(mutated, data);
  mutated.fitnessScore = calculateFitnessScore(mutated, data);

  return mutated;
};

export const generateScheduleWithGeneticAlgorithm = (
  data: ConversationData,
  config: Partial<GeneticAlgorithmConfig> = {}
): Schedule => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const schoolId = data.schoolName || "school-1";

  // Create initial population
  let population: Schedule[] = [];
  for (let i = 0; i < finalConfig.populationSize; i++) {
    population.push(createRandomSchedule(data, schoolId));
  }

  // Evolution loop
  for (let gen = 0; gen < finalConfig.generations; gen++) {
    // Sort by fitness
    population.sort((a, b) => (b.fitnessScore || 0) - (a.fitnessScore || 0));

    // Elitism: keep best individuals
    const eliteCount = Math.floor(finalConfig.populationSize * finalConfig.elitismRate);
    const newPopulation: Schedule[] = population.slice(0, eliteCount);

    // Generate new individuals through crossover and mutation
    while (newPopulation.length < finalConfig.populationSize) {
      const parent1 = population[Math.floor(Math.random() * eliteCount)];
      const parent2 = population[Math.floor(Math.random() * eliteCount)];

      let child = crossover(parent1, parent2, data);
      child = mutate(child, data, finalConfig.mutationRate);

      newPopulation.push(child);
    }

    population = newPopulation;
  }

  // Return best schedule
  population.sort((a, b) => (b.fitnessScore || 0) - (a.fitnessScore || 0));
  return population[0];
};
