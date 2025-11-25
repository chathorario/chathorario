import { ConversationStep, ConversationData } from "@/hooks/useConversationState";
import { Schedule } from "@/types/schedule";
import { generateSchedule } from "./scheduleGenerator";
import {
  formatSchoolData,
  formatClasses,
  formatSubjects,
  formatTeachers,
  formatWorkload,
  hasExistingData
} from "./conversationHelpers";

// Helper function to normalize shift/turno input
function normalizeShift(turno: string): string {
  const lower = turno.toLowerCase();
  if (lower.includes("manh") || lower.includes("matut")) return "matutino";
  if (lower.includes("tard") || lower.includes("vesp")) return "vespertino";
  if (lower.includes("noit") || lower.includes("notur")) return "noturno";
  return lower;
}

// Helper function to generate UUIDs for new classes
// Uses 'new-' prefix so saveClasses knows these are new and lets the database generate the real ID
function generateUUID(): string {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return `new-${uuid}`;
}

interface FlowResponse {
  message: string;
  quickReplies?: string[];
}

export const getStepPrompt = (step: ConversationStep, data: ConversationData): FlowResponse => {
  switch (step) {
    case "start":
      return {
        message: "Olá! 👋 Sou o assistente do ChatHorário.\n\nVou te ajudar a criar horários escolares de forma inteligente e automática.\n\nVamos começar?",
        quickReplies: ["Sim, vamos começar!", "Preciso de ajuda"]
      };

    case "configuracoes":
      if (hasExistingData("configuracoes", data)) {
        return {
          message: `Encontrei a seguinte configuração:\n\n${formatSchoolData(data.schoolName!)}\n\nDeseja manter ou alterar?`,
          quickReplies: ["Manter e continuar", "Alterar", "Ir para página"]
        };
      }
      return {
        message: "Ótimo! Vamos começar pelas configurações da escola.\n\nQual é o nome da escola?",
        quickReplies: []
      };

    case "turmas":
      if (hasExistingData("turmas", data)) {
        return {
          message: `${formatClasses(data.classes!)}\n\nO que deseja fazer?`,
          quickReplies: ["Manter e continuar", "Adicionar mais", "Ir para página"]
        };
      }
      return {
        message: `Perfeito! A escola "${data.schoolName}" foi configurada.\n\nAgora, vamos criar as turmas.\n\nDigite no formato:\n"Série - Identificação - Turno - Aulas Diárias"\n\nExemplo: 1º Ano - 1201 - Matutino - 5\n\nOu use o formato simplificado (5 aulas como padrão):\n1º Ano - 1201 - Matutino\n\n💡 Você pode usar vírgulas (,) ou traços (-) como separadores.`,
        quickReplies: ["Já cadastrei todas", "Continuar depois"]
      };

    case "disciplinas":
      if (hasExistingData("disciplinas", data)) {
        return {
          message: `${formatSubjects(data.subjects!)}\n\nO que deseja fazer?`,
          quickReplies: ["Manter e continuar", "Adicionar mais", "Ir para página"]
        };
      }
      return {
        message: "Agora vamos definir as disciplinas oferecidas.\n\nQuais disciplinas serão ministradas?\n\nExemplo: Matemática, Português, História, Geografia",
        quickReplies: []
      };

    case "professores":
      if (hasExistingData("professores", data)) {
        return {
          message: `${formatTeachers(data.teachers!)}\n\nO que deseja fazer?`,
          quickReplies: ["Manter e continuar", "Adicionar mais", "Ir para página"]
        };
      }
      return {
        message: "Vamos cadastrar os professores.\n\nMe informe o nome do professor e as disciplinas que ele leciona.\n\nExemplo: \"João Silva - Matemática, Física\"",
        quickReplies: ["Já cadastrei todos", "Pular esta etapa"]
      };

    case "alocacao":
      if (hasExistingData("alocacao", data)) {
        return {
          message: `${formatWorkload(data.workload!)}\n\nDeseja manter ou alterar?`,
          quickReplies: ["Manter e continuar", "Alterar", "Ir para página"]
        };
      }
      return {
        message: "Agora vamos definir a alocação e carga horária semanal de cada disciplina.\n\nExemplo: Matemática - 5 aulas, Português - 4 aulas",
        quickReplies: []
      };

    case "geracao":
      return {
        message: "Excelente! Tenho todas as informações necessárias:\n\n" +
          `🏫 Escola: ${data.schoolName}\n` +
          `🎓 Turmas: ${data.classes?.length || 0}\n` +
          `📚 Disciplinas: ${data.subjects?.length || 0}\n` +
          `👨‍🏫 Professores: ${data.teachers?.length || 0}\n\n` +
          "Posso gerar o horário automaticamente agora?",
        quickReplies: ["Sim, gerar horário!", "Revisar informações"]
      };

    case "completed":
      return {
        message: "🎉 Horário gerado com sucesso!\n\nO algoritmo genético encontrou a melhor distribuição possível considerando todas as restrições.\n\nVocê pode visualizar, exportar ou fazer ajustes no horário.",
        quickReplies: ["Ver horário", "Exportar PDF", "Fazer ajustes"]
      };

    default:
      return {
        message: "Desculpe, algo deu errado. Vamos recomeçar?",
        quickReplies: ["Recomeçar"]
      };
  }
};

interface ProcessResult {
  nextData: Partial<ConversationData>;
  shouldAdvance: boolean;
  generatedSchedule?: Schedule;
  navigationUrl?: string;
  helpMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  quickReplies?: string[];
}

export const processUserMessage = (
  message: string,
  step: ConversationStep,
  data: ConversationData
): ProcessResult => {
  const lowerMessage = message.toLowerCase().trim();

  // Processar opções comuns a todas as etapas
  if (lowerMessage === "manter e continuar") {
    return { nextData: {}, shouldAdvance: true };
  }

  if (lowerMessage === "ir para página") {
    const urlMap: Record<string, string> = {
      "configuracoes": "/config",
      "turmas": "/classes",
      "disciplinas": "/subjects",
      "professores": "/teachers",
      "alocacao": "/allocation"
    };
    return {
      nextData: {},
      shouldAdvance: false,
      navigationUrl: urlMap[step] || "/"
    };
  }

  switch (step) {
    case "start":
      return { nextData: {}, shouldAdvance: true };

    case "configuracoes":
      if (lowerMessage === "alterar") {
        return { nextData: {}, shouldAdvance: false };
      }
      return {
        nextData: { schoolName: message },
        shouldAdvance: true
      };

    case "turmas":
      if (lowerMessage.includes("já cadastrei") || lowerMessage.includes("continuar")) {
        return { nextData: {}, shouldAdvance: true };
      }
      if (lowerMessage === "adicionar mais") {
        return {
          nextData: {},
          shouldAdvance: false,
          helpMessage: "Ótimo! Para adicionar uma turma, digite no formato:\n\n\"Série - Identificação - Turno - Aulas Diárias\"\n\nExemplo: 1º Ano - 1201 - Matutino - 5\n\nOu use o formato simplificado (5 aulas como padrão):\n1º Ano - 1201 - Matutino\n\n💡 Você pode usar vírgulas (,) ou traços (-) como separadores."
        };
      }

      // Aceita tanto vírgulas quanto traços como separadores
      const separator = message.includes(',') ? ',' : '-';
      const parts = message.split(separator).map(p => p.trim());

      // Formato completo: Série, Identificação, Turno, Aulas Diárias
      if (parts.length === 4) {
        const serie = parts[0];
        const identificacao = parts[1];
        const turno = parts[2];
        const aulasDiarias = parseInt(parts[3]);

        if (isNaN(aulasDiarias) || aulasDiarias < 1) {
          return {
            nextData: {},
            shouldAdvance: false,
            errorMessage: "Número de aulas diárias inválido. Use um número maior que 0.\n\nExemplo: 1º Ano - 1201 - Matutino - 5"
          };
        }

        const shift = normalizeShift(turno);
        const name = `${serie} - ${identificacao}`;
        const id = generateUUID();

        const classes = data.classes || [];
        return {
          nextData: { classes: [...classes, { id, name, shift, aulasDiarias }] },
          shouldAdvance: false,
          successMessage: `✅ Turma "${name}" (${shift}, ${aulasDiarias} aulas/dia) adicionada!\n\nDeseja adicionar mais uma turma ou continuar?`,
          quickReplies: ["Adicionar mais", "Continuar"]
        };
      }

      // Formato simplificado: Série, Identificação, Turno (aulas diárias = 5)
      if (parts.length === 3) {
        const serie = parts[0];
        const identificacao = parts[1];
        const turno = parts[2];

        const shift = normalizeShift(turno);
        const name = `${serie} - ${identificacao}`;
        const id = generateUUID();
        const aulasDiarias = 5;

        const classes = data.classes || [];
        return {
          nextData: { classes: [...classes, { id, name, shift, aulasDiarias }] },
          shouldAdvance: false,
          successMessage: `✅ Turma "${name}" (${shift}, ${aulasDiarias} aulas/dia) adicionada!\n\nDeseja adicionar mais uma turma ou continuar?`,
          quickReplies: ["Adicionar mais", "Continuar"]
        };
      }

      return {
        nextData: {},
        shouldAdvance: false,
        errorMessage: "Formato inválido. Use:\n\nSérie - Identificação - Turno - Aulas Diárias\n\nExemplo: 1º Ano - 1201 - Matutino - 5\n\nOu formato simplificado:\n1º Ano - 1201 - Matutino\n\n💡 Você pode usar vírgulas (,) ou traços (-) como separadores."
      };

    case "disciplinas":
      if (lowerMessage === "adicionar mais") {
        return {
          nextData: {},
          shouldAdvance: false,
          helpMessage: "Ótimo! Para adicionar disciplinas, digite-as separadas por vírgula:\n\nExemplo: Química, Biologia, Educação Física"
        };
      }
      const subjects = message.split(',').map(s => s.trim()).filter(Boolean);
      if (subjects.length > 0) {
        const existingSubjects = data.subjects || [];
        return {
          nextData: { subjects: [...existingSubjects, ...subjects] },
          shouldAdvance: true,
          successMessage: `✅ ${subjects.length} disciplina(s) adicionada(s): ${subjects.join(", ")}!`
        };
      }
      return {
        nextData: {},
        shouldAdvance: false,
        errorMessage: "Por favor, digite pelo menos uma disciplina.\n\nExemplo: Química, Biologia"
      };

    case "professores":
      if (lowerMessage.includes("já cadastrei") || lowerMessage.includes("pular")) {
        return { nextData: {}, shouldAdvance: true };
      }
      if (lowerMessage === "adicionar mais") {
        return {
          nextData: {},
          shouldAdvance: false,
          helpMessage: "Ótimo! Para adicionar um professor, digite no formato:\n\n\"Nome do Professor - Disciplinas\"\n\nExemplo: Maria Santos - Química, Biologia"
        };
      }
      const teacherMatch = message.match(/(.+?)\s*[-–]\s*(.+)/);
      if (teacherMatch) {
        const name = teacherMatch[1].trim();
        const teacherSubjects = teacherMatch[2].split(',').map(s => s.trim());
        const teachers = data.teachers || [];
        return {
          nextData: { teachers: [...teachers, { name, subjects: teacherSubjects }] },
          shouldAdvance: false,
          successMessage: `✅ Professor(a) "${name}" adicionado(a) com ${teacherSubjects.length} disciplina(s)!\n\nDeseja adicionar mais um professor ou continuar?`,
          quickReplies: ["Adicionar mais", "Continuar"]
        };
      }
      return {
        nextData: {},
        shouldAdvance: false,
        errorMessage: "Formato inválido. Use: Nome do Professor - Disciplinas\n\nExemplo: João Silva - Matemática, Física"
      };

    case "alocacao":
      if (lowerMessage === "alterar") {
        return { nextData: {}, shouldAdvance: false };
      }
      const workloadMatches = message.matchAll(/([^,]+?)\s*[-–]\s*(\d+)/g);
      const workload: Record<string, number> = {};
      for (const match of workloadMatches) {
        const subject = match[1].trim();
        const hours = parseInt(match[2]);
        workload[subject] = hours;
      }
      if (Object.keys(workload).length > 0) {
        return {
          nextData: { workload },
          shouldAdvance: true
        };
      }
      return { nextData: {}, shouldAdvance: false };

    case "geracao":
      if (lowerMessage.includes("sim") || lowerMessage.includes("gerar")) {
        const schedule = generateSchedule(data);
        return {
          nextData: {},
          shouldAdvance: true,
          generatedSchedule: schedule
        };
      }
      return { nextData: {}, shouldAdvance: false };

    default:
      return { nextData: {}, shouldAdvance: false };
  }
}
