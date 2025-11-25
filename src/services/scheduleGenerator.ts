import { Schedule } from "@/types/schedule";
import { ConversationData } from "@/hooks/useConversationState";
import { generateScheduleWithGeneticAlgorithm } from "./geneticAlgorithm";

export const generateSchedule = (data: ConversationData): Schedule => {
  console.log("Generating schedule with genetic algorithm...");
  
  const schedule = generateScheduleWithGeneticAlgorithm(data, {
    populationSize: 50,
    generations: 100,
    mutationRate: 0.15,
    elitismRate: 0.2,
  });

  console.log(`Schedule generated with fitness score: ${schedule.fitnessScore}`);
  console.log(`Total conflicts: ${schedule.conflicts.length}`);

  return schedule;
};
