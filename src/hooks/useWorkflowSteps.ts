import {
    Settings,
    GraduationCap,
    BookOpen,
    Users,
    LayoutGrid,
    Play,
    Home
} from "lucide-react";

export type WorkflowStepId =
    | 'configuracoes'
    | 'turmas'
    | 'disciplinas'
    | 'professores'
    | 'alocacao'
    | 'geracao';

export interface WorkflowStep {
    id: WorkflowStepId;
    label: string;
    path: string;
    icon: any;
    highlight?: boolean;
}

export const useWorkflowSteps = () => {
    const steps: WorkflowStep[] = [
        {
            id: 'configuracoes',
            label: 'Configurações',
            path: '/config',
            icon: Settings
        },
        {
            id: 'turmas',
            label: 'Turmas',
            path: '/classes',
            icon: GraduationCap
        },
        {
            id: 'disciplinas',
            label: 'Disciplinas',
            path: '/subjects',
            icon: BookOpen
        },
        {
            id: 'professores',
            label: 'Professores',
            path: '/teachers',
            icon: Users
        },
        {
            id: 'alocacao',
            label: 'Alocação',
            path: '/allocation',
            icon: LayoutGrid
        },
        {
            id: 'geracao',
            label: 'Geração',
            path: '/generate',
            icon: Play,
            highlight: true
        }
    ];

    return { steps };
};
