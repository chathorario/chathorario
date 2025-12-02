import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Lock,
    CheckCircle2,
    AlertTriangle,
    Clock,
    CalendarDays,
    Users,
    School,
    MapPin,
    ArrowRight,
    Save
} from "lucide-react";
import { toast } from "sonner";

// Interface representing the configuration object
interface GenerationConfig {
    // Hard constraints (implicit, but good to track)
    hardConstraints: {
        avoidTeacherClashes: boolean;
        respectAvailability: boolean;
        fulfillWorkload: boolean;
    };
    // Pedagogical Preferences
    pedagogical: {
        teacherGaps: number; // 0 (Acceptable) - 50 (Avoid) - 100 (Prohibited)
        groupDoubleLessons: boolean; // true = Try to group, false = Spread
        maxDailyLessonsPerClass: number; // 2, 3, 4, 5, 6...
    };
    // Advanced Settings
    advanced: {
        allocationPriority: boolean;
        classLocations: boolean;
        studentGaps: boolean;
        teacherMovement: boolean;
        subjectGrouping: boolean;
    };
}

import { useData } from "@/context/DataContext";

// ... (imports remain the same)

const GenerationParameters = () => {
    const { generationConfig, saveGenerationConfig } = useData();
    const [config, setConfig] = useState(generationConfig);

    // Sync local state with context when context changes (initial load)
    React.useEffect(() => {
        if (generationConfig) {
            setConfig(generationConfig);
        }
    }, [generationConfig]);

    const handleSave = () => {
        saveGenerationConfig(config);
        toast.success("Configurações salvas com sucesso!", {
            description: "Os parâmetros serão usados na próxima geração."
        });
    };

    const getGapLabel = (value: number) => {
        if (value <= 33) return { label: "Aceitável", color: "bg-yellow-500" };
        if (value <= 66) return { label: "Evitar", color: "bg-blue-500" };
        return { label: "Proibido", color: "bg-red-500" };
    };

    return (
        <div className="w-full px-4 py-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Parâmetros de Geração</h1>
                    <p className="text-slate-500 mt-2">Defina como o sistema deve priorizar a qualidade do horário escolar.</p>
                </div>
                <Button onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" />
                    Salvar Parâmetros
                </Button>
            </div>

            {/* Bloco 1: Premissas Intocáveis */}
            <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/50 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-emerald-600" />
                        <CardTitle className="text-lg text-emerald-900">Premissas Intocáveis</CardTitle>
                    </div>
                    <CardDescription className="text-emerald-700">
                        Regras fundamentais que o sistema respeitará obrigatoriamente.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-3 bg-white p-3 rounded-md border border-emerald-100 shadow-sm">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <span className="text-sm font-medium text-slate-700">Sem Choque de Horário</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-md border border-emerald-100 shadow-sm">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <span className="text-sm font-medium text-slate-700">Respeitar Disponibilidade</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-md border border-emerald-100 shadow-sm">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <span className="text-sm font-medium text-slate-700">Carga Horária Completa</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-md border border-emerald-100 shadow-sm">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <span className="text-sm font-medium text-slate-700">Aulas Fixas Respeitadas</span>
                    </div>
                </CardContent>
            </Card>

            {/* Bloco 2: Preferências Pedagógicas */}
            <Card className="shadow-md border-slate-200">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <School className="h-5 w-5 text-indigo-600" />
                        <CardTitle>Preferências Pedagógicas</CardTitle>
                    </div>
                    <CardDescription>
                        Ajuste o equilíbrio entre qualidade pedagógica e flexibilidade do horário.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">

                    {/* Controle 1: Janelas */}
                    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-slate-500" />
                                    Janelas (Buracos) do Professor
                                </Label>
                                <p className="text-sm text-slate-500">
                                    O quão rígido o sistema deve ser com tempos vagos entre aulas?
                                </p>
                            </div>
                            <Badge className={`${getGapLabel(config.pedagogical.teacherGaps).color} hover:${getGapLabel(config.pedagogical.teacherGaps).color}`}>
                                {getGapLabel(config.pedagogical.teacherGaps).label}
                            </Badge>
                        </div>
                        <div className="pt-4 px-2">
                            <Slider
                                defaultValue={[config.pedagogical.teacherGaps]}
                                max={100}
                                step={50}
                                className="w-full"
                                onValueChange={(vals) => setConfig({
                                    ...config,
                                    pedagogical: { ...config.pedagogical, teacherGaps: vals[0] }
                                })}
                            />
                            <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
                                <span>Aceitável</span>
                                <span>Evitar</span>
                                <span>Proibido</span>
                            </div>
                        </div>
                        {/* Logic Mapping Comment */}
                        <p className="text-[10px] font-mono text-slate-400 mt-2 border-t pt-2">
                            Mapeamento: {`{ rule: "avoid_gaps", weight: ${config.pedagogical.teacherGaps}, hard_constraint: ${config.pedagogical.teacherGaps === 100} }`}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Controle 2: Aulas Duplas */}
                        <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-slate-500" />
                                    Aulas Duplas / Conjugadas
                                </Label>
                                <p className="text-sm text-slate-500">
                                    Preferência por agrupar aulas da mesma disciplina.
                                </p>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span className={`text-sm ${!config.pedagogical.groupDoubleLessons ? "font-bold text-slate-900" : "text-slate-500"}`}>
                                    Espalhar
                                </span>
                                <Switch
                                    checked={config.pedagogical.groupDoubleLessons}
                                    onCheckedChange={(checked) => setConfig({
                                        ...config,
                                        pedagogical: { ...config.pedagogical, groupDoubleLessons: checked }
                                    })}
                                />
                                <span className={`text-sm ${config.pedagogical.groupDoubleLessons ? "font-bold text-indigo-600" : "text-slate-500"}`}>
                                    Agrupar (Dobradinhas)
                                </span>
                            </div>
                        </div>

                        {/* Controle 3: Dias Letivos */}
                        <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-slate-500" />
                                    Máximo de Aulas Diárias por Turma
                                </Label>
                                <p className="text-sm text-slate-500">
                                    Limite de aulas do mesmo professor na mesma turma em um dia.
                                </p>
                            </div>
                            <div className="flex items-center gap-4 pt-2">
                                <input
                                    type="range"
                                    min="2"
                                    max="8"
                                    value={config.pedagogical.maxDailyLessonsPerClass}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        pedagogical: { ...config.pedagogical, maxDailyLessonsPerClass: parseInt(e.target.value) }
                                    })}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-indigo-100 shadow-sm">
                                    <span className="text-xl font-bold text-indigo-600">{config.pedagogical.maxDailyLessonsPerClass}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </CardContent>
            </Card>

            {/* Bloco 3: Ajustes Finos */}
            <Accordion type="single" collapsible className="w-full bg-white rounded-lg border border-slate-200 shadow-sm">
                <AccordionItem value="advanced" className="border-none">
                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 hover:no-underline rounded-t-lg">
                        <div className="flex items-center gap-2 text-slate-700">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <span className="font-semibold text-lg">Configurações Avançadas do Sistema</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                            <div className="flex items-start space-x-3 p-3 rounded-md hover:bg-slate-50 transition-colors">
                                <Switch
                                    id="allocation-priority"
                                    checked={config.advanced.allocationPriority}
                                    onCheckedChange={(c) => setConfig({ ...config, advanced: { ...config.advanced, allocationPriority: c } })}
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="allocation-priority" className="cursor-pointer">Prioridade de Alocação</Label>
                                    <p className="text-xs text-slate-500">Dar preferência a professores mais antigos.</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 rounded-md hover:bg-slate-50 transition-colors">
                                <Switch
                                    id="class-locations"
                                    checked={config.advanced.classLocations}
                                    onCheckedChange={(c) => setConfig({ ...config, advanced: { ...config.advanced, classLocations: c } })}
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="class-locations" className="cursor-pointer">Locais das Turmas</Label>
                                    <p className="text-xs text-slate-500">Considerar distância entre salas (minimizar deslocamento).</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 rounded-md hover:bg-slate-50 transition-colors">
                                <Switch
                                    id="student-gaps"
                                    checked={config.advanced.studentGaps}
                                    onCheckedChange={(c) => setConfig({ ...config, advanced: { ...config.advanced, studentGaps: c } })}
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="student-gaps" className="cursor-pointer">Eliminar Janelas de Alunos</Label>
                                    <p className="text-xs text-slate-500">Evitar buracos na grade dos alunos (Prioridade Alta).</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 rounded-md hover:bg-slate-50 transition-colors">
                                <Switch
                                    id="teacher-movement"
                                    checked={config.advanced.teacherMovement}
                                    onCheckedChange={(c) => setConfig({ ...config, advanced: { ...config.advanced, teacherMovement: c } })}
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="teacher-movement" className="cursor-pointer">Minimizar Troca de Sala</Label>
                                    <p className="text-xs text-slate-500">Tentar manter o professor na mesma sala.</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 rounded-md hover:bg-slate-50 transition-colors">
                                <Switch
                                    id="subject-grouping"
                                    checked={config.advanced.subjectGrouping}
                                    onCheckedChange={(c) => setConfig({ ...config, advanced: { ...config.advanced, subjectGrouping: c } })}
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="subject-grouping" className="cursor-pointer">Agrupamento Didático</Label>
                                    <p className="text-xs text-slate-500">Agrupar disciplinas similares no mesmo dia.</p>
                                </div>
                            </div>

                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default GenerationParameters;
