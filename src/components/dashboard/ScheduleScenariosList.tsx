import { useState, useEffect, useRef } from "react";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Grid,
    Clock,
    Eye,
    DownloadCloud,
    FileJson,
    FileSpreadsheet,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { useData } from "@/context/DataContext";
import { ScenarioModal } from "@/components/modals/ScenarioModal";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScenarioVersionsList } from "./ScenarioVersionsList";

export function ScheduleScenariosList() {
    const { schedules, currentScheduleId, setCurrentScheduleId, deleteSchedule, exportScenario, loading } = useData();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null);
    const [expandedScenarioId, setExpandedScenarioId] = useState<string | null>(null);
    const [highlightedVersionId, setHighlightedVersionId] = useState<string | null>(null);
    const scenarioRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});

    // Escutar evento de expansão automática
    useEffect(() => {
        const handleExpandScenario = (event: CustomEvent) => {
            const { scenarioId, newVersionId } = event.detail;

            // Expandir o accordion
            setExpandedScenarioId(scenarioId);

            // Definir versão para highlight
            if (newVersionId) {
                setHighlightedVersionId(newVersionId);
                // Remover highlight após 3 segundos
                setTimeout(() => setHighlightedVersionId(null), 3000);
            }

            // Scroll suave até o cenário
            setTimeout(() => {
                const element = scenarioRefs.current[scenarioId];
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        };

        window.addEventListener('expandScenario', handleExpandScenario as EventListener);
        return () => window.removeEventListener('expandScenario', handleExpandScenario as EventListener);
    }, []);

    const handleDeleteClick = (id: string) => {
        setScenarioToDelete(id);
        setIsDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (scenarioToDelete) {
            await deleteSchedule(scenarioToDelete);
            setIsDeleteOpen(false);
            setScenarioToDelete(null);
        }
    };

    const handleActivate = (id: string) => {
        setCurrentScheduleId(id);
        toast.success("Cenário ativado!");
    };

    const handleExport = async (id: string, format: 'json' | 'xlsx') => {
        await exportScenario(id, format);
    };

    const toggleExpand = (id: string) => {
        setExpandedScenarioId(expandedScenarioId === id ? null : id);
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
                    <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Novo Horário
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                            <TableRow className="hover:bg-transparent dark:border-slate-700">
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead className="w-[200px] font-semibold text-slate-600 dark:text-slate-300 py-4">Status</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 py-4">Instituição / Cenário</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 py-4">Data</TableHead>
                                <TableHead className="text-right font-semibold text-slate-600 dark:text-slate-300 py-4 pr-6">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">Carregando...</TableCell>
                                </TableRow>
                            ) : schedules.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-slate-500 dark:text-slate-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                                                <Grid className="h-6 w-6 text-slate-300 dark:text-slate-500" />
                                            </div>
                                            <p>Nenhum cenário encontrado.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                schedules.map((scenario) => {
                                    const isActive = scenario.id === currentScheduleId;
                                    const isExpanded = expandedScenarioId === scenario.id;

                                    return (
                                        <>
                                            <TableRow
                                                key={scenario.id}
                                                ref={(el) => scenarioRefs.current[scenario.id] = el}
                                                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors border-slate-100 dark:border-slate-700"
                                            >
                                                <TableCell className="align-top py-6 pl-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-slate-500 hover:text-indigo-600 gap-1 px-2"
                                                        onClick={() => toggleExpand(scenario.id)}
                                                    >
                                                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                        <span className="text-xs font-medium">Versões</span>
                                                    </Button>
                                                </TableCell>
                                                <TableCell className="align-top py-6">
                                                    <div className="flex items-start gap-3">
                                                        {isActive ? (
                                                            <div className="mt-1 h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                                                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                            </div>
                                                        ) : (
                                                            <div className="mt-1 h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                                                <Clock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                                    {scenario.name}
                                                                </span>
                                                                {isActive && (
                                                                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 text-[10px] px-2 py-0.5 font-medium">
                                                                        Ativo
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {scenario.description && (
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                                                                    {scenario.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-top py-6">
                                                    <span className="text-sm text-slate-600 dark:text-slate-300">
                                                        {new Date(scenario.created_at).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="align-top py-6 pr-6">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-all"
                                                                    title="Exportar"
                                                                >
                                                                    <DownloadCloud className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-40">
                                                                <DropdownMenuItem onClick={() => handleExport(scenario.id, 'json')} className="gap-2 cursor-pointer">
                                                                    <FileJson className="h-4 w-4" />
                                                                    <span>JSON</span>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleExport(scenario.id, 'xlsx')} className="gap-2 cursor-pointer">
                                                                    <FileSpreadsheet className="h-4 w-4" />
                                                                    <span>Excel</span>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                        {!isActive && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-all"
                                                                title="Ativar cenário"
                                                                onClick={() => handleActivate(scenario.id)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-all"
                                                            title="Excluir"
                                                            onClick={() => handleDeleteClick(scenario.id)}
                                                            disabled={schedules.length === 1}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            {isExpanded && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="p-0 border-b-0 bg-slate-50/30 dark:bg-slate-900/30">
                                                        <ScenarioVersionsList
                                                            scheduleId={scenario.id}
                                                            highlightedVersionId={highlightedVersionId}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <ScenarioModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                mode="create"
            />

            {/* Modal de Confirmação de Exclusão */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza que deseja excluir este cenário?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Todos os dados deste cenário (professores, disciplinas, turmas e alocações) serão permanentemente excluídos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
