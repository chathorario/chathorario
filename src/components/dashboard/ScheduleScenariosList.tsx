import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Plus,
    Pencil,
    Copy,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Grid,
    Clock,
    Eye
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScheduleViewer } from "@/components/dashboard/ScheduleViewer";
import { ScheduleEntry } from "@/services/solver/types";

interface Scenario {
    id: string;
    name: string;
    description: string;
    status: string;
    isValidated: boolean;
    validationMessage: string;
    step: string;
    scheduleData?: {
        schedule: ScheduleEntry[];
    };
    createdAt: string;
}

export function ScheduleScenariosList() {
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    useEffect(() => {
        fetchScenarios();
    }, []);

    const fetchScenarios = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('school_id')
                .eq('id', user.id)
                .single();

            if (!profile?.school_id) return;

            const { data, error } = await supabase
                .from('schedule_scenarios')
                .select('*')
                .eq('school_id', profile.school_id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Erro ao buscar cenários:", error);
                toast.error("Erro ao carregar horários.");
            } else if (data) {
                const realScenarios: Scenario[] = data.map(s => ({
                    id: s.id,
                    name: s.name,
                    description: s.description || "Sem descrição",
                    status: s.status || "Em Elaboração",
                    isValidated: s.is_validated || false,
                    validationMessage: s.is_validated ? "Liberado." : "Pendente validação.",
                    step: "Salvo",
                    scheduleData: s.schedule_data,
                    createdAt: s.created_at
                }));
                setScenarios(realScenarios);
            }
        } catch (e) {
            console.error("Erro ao buscar cenários:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('schedule_scenarios')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setScenarios(prev => prev.filter(s => s.id !== id));
            toast.success("Cenário excluído com sucesso.");
        } catch (e) {
            console.error("Erro ao excluir:", e);
            toast.error("Erro ao excluir cenário.");
        }
    };

    const handleView = (scenario: Scenario) => {
        if (!scenario.scheduleData?.schedule) {
            toast.warning("Este cenário não possui dados de horário salvos.");
            return;
        }
        setSelectedScenario(scenario);
        setIsViewerOpen(true);
    };

    return (
        <>
            <Card className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-700">
                    <div>
                        <CardTitle className="text-xl font-bold text-slate-800 dark:text-white">
                            Meus Horários
                        </CardTitle>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie seus cenários de horários</p>
                    </div>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm">
                        <Plus className="h-4 w-4" />
                        Novo Horário
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                            <TableRow className="hover:bg-transparent dark:border-slate-700">
                                <TableHead className="w-[250px] font-semibold text-slate-600 dark:text-slate-300 py-4 pl-6">Status</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 py-4">Instituição / Cenário</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 py-4">Data</TableHead>
                                <TableHead className="text-right font-semibold text-slate-600 dark:text-slate-300 py-4 pr-6">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">Carregando...</TableCell>
                                </TableRow>
                            ) : scenarios.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-12 text-slate-500 dark:text-slate-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                                                <Grid className="h-6 w-6 text-slate-300 dark:text-slate-500" />
                                            </div>
                                            <p>Nenhum cenário encontrado.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                scenarios.map((scenario) => (
                                    <TableRow key={scenario.id} className="hover:bg-slate-50/50 transition-colors border-slate-100">
                                        <TableCell className="align-top py-6 pl-6">
                                            <div className="flex items-start gap-3">
                                                {scenario.isValidated ? (
                                                    <div className="mt-1 h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                                    </div>
                                                ) : (
                                                    <div className="mt-1 h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                                                        <AlertCircle className="h-5 w-5 text-amber-600" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col gap-1">
                                                    <Badge
                                                        variant="outline"
                                                        className={`w-fit border-0 px-0 font-medium ${scenario.isValidated ? "text-emerald-700" : "text-amber-700"
                                                            }`}
                                                    >
                                                        {scenario.isValidated ? "Validado" : "Pendente"}
                                                    </Badge>
                                                    <span className="text-xs text-slate-500 max-w-[180px] leading-relaxed">
                                                        {scenario.validationMessage}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top py-6">
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    className="text-left font-semibold text-slate-800 hover:text-indigo-600 hover:underline text-base transition-colors"
                                                    onClick={() => handleView(scenario)}
                                                >
                                                    {scenario.name}
                                                </button>
                                                <span className="text-sm text-slate-500">{scenario.description}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top py-6">
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Clock className="h-3 w-3" />
                                                {new Date(scenario.createdAt).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top py-6 pr-6">
                                            <div className="flex items-center justify-end gap-3">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                                                    title="Visualizar"
                                                    onClick={() => handleView(scenario)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                                    title="Excluir"
                                                    onClick={() => handleDelete(scenario.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Visualização: {selectedScenario?.name}</DialogTitle>
                    </DialogHeader>
                    {selectedScenario?.scheduleData?.schedule && (
                        <ScheduleViewer schedule={selectedScenario.scheduleData.schedule} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
