import { useState, useCallback } from "react";

export type ConversationStep =
  | "start"
  | "configuracoes"
  | "turmas"
  | "disciplinas"
  | "professores"
  | "alocacao"
  | "geracao"
  | "completed";

export interface ConversationData {
  schoolName?: string;
  teachers?: Array<{ name: string; subjects: string[] }>;
  subjects?: string[];
  classes?: Array<{ id: string; name: string; shift: string; aulasDiarias?: number }>;
  workload?: Record<string, number>;
}

export const useConversationState = () => {
  const [currentStep, setCurrentStep] = useState<ConversationStep>("start");
  const [conversationData, setConversationData] = useState<ConversationData>({});

  const updateData = useCallback((data: Partial<ConversationData>) => {
    setConversationData((prev) => ({ ...prev, ...data }));
  }, []);

  const nextStep = useCallback(() => {
    const steps: ConversationStep[] = [
      "start",
      "configuracoes",
      "turmas",
      "disciplinas",
      "professores",
      "alocacao",
      "geracao",
      "completed"
    ];

    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  }, [currentStep]);

  const reset = useCallback(() => {
    setCurrentStep("start");
    setConversationData({});
  }, []);

  return {
    currentStep,
    conversationData,
    updateData,
    nextStep,
    reset,
    setCurrentStep,
  };
};