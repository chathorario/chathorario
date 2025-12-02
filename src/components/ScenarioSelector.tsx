import { useState } from "react";
import { useData } from "@/context/DataContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ScenarioSelector() {
    const { schedules, currentScheduleId, setCurrentScheduleId, createSchedule, deleteSchedule } = useData();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isManageOpen, setIsManageOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null);
    const [newScenarioName, setNewScenarioName] = useState("");
    const [newScenarioDescription, setNewScenarioDescription] = useState("");
    const [cloneFromId, setCloneFromId] = useState<string>("none");

    const handleCreate = async () => {
        if (!newScenarioName.trim()) {
            toast.error("Nome do cenário é obrigatório");
            return;
        }

        const cloneId = cloneFromId === "none" ? undefined : cloneFromId;
        // @ts-ignore
        await createSchedule(newScenarioName, newScenarioDescription, cloneId);
        setIsCreateOpen(false);
        setNewScenarioName("");
        setNewScenarioDescription("");
        setCloneFromId("none");
    };

    const handleDeleteClick = (id: string) => {
        setScenarioToDelete(id);
        setIsDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (scenarioToDelete) {
            await deleteSchedule(scenarioToDelete);
            setIsDeleteOpen(false);
            setScenarioToDelete(null);
            if (schedules.length <= 1) {
                setIsManageOpen(false);
            }
        }
    };

    const handleOpenCreate = () => {
        setCloneFromId(currentScheduleId || "none");
        setIsCreateOpen(true);
    };

    return (
        <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border border-border/50">
            <Select value={currentScheduleId || ""} onValueChange={setCurrentScheduleId}>
                <SelectTrigger className="w-[180px] h-8 text-xs border-0 bg-transparent focus:ring-0">
                    <SelectValue placeholder="Selecione um cenário" />
                </SelectTrigger>
                <SelectContent>
                    {schedules.map((schedule) => (
                        <SelectItem key={schedule.id} value={schedule.id} className="text-xs">
                            {schedule.name} {schedule.is_active && "(Ativo)"}
                        </SelectItem>
                    ))}
                    {schedules.length === 0 && (
                        <div className="p-2 text-xs text-muted-foreground text-center">Nenhum cenário</div>
                    )}
                </SelectContent>
            </Select>

            <div className="h-4 w-[1px] bg-border mx-1" />

            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleOpenCreate}
                title="Novo Cenário"
            >
                <Plus className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsManageOpen(true)}
                title="Gerenciar Cenários"
            >
                <Settings className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            </Button>

            {/* Modal de Criação */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px] bg-slate-950 border-slate-800 p-6 gap-6">
                    <DialogHeader className="space-y-3">
                        <DialogTitle className="text-lg font-semibold text-white">Criar Novo Cenário</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Configure os detalhes da nova versão da grade horária.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-5">
                        {/* Campo Nome */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-300 font-medium">Nome do Cenário</Label>
                            <Input
                                id="name"
                                value={newScenarioName}
                                onChange={(e) => setNewScenarioName(e.target.value)}
                                className="h-11 w-full bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-600 focus-visible:border-blue-600"
                                placeholder="Ex: Versão Final 2025"
                            />
                        </div>

                        {/* Campo Baseado em */}
                        <div className="space-y-2">
                            <Label htmlFor="clone-from" className="text-slate-300 font-medium">Copiar dados de:</Label>
                            <Select value={cloneFromId} onValueChange={setCloneFromId}>
                                <SelectTrigger id="clone-from" className="h-11 w-full bg-slate-900 border-slate-700 text-slate-100 focus:ring-blue-600">
                                    <SelectValue placeholder="Escolha um cenário" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-700">
                                    <SelectItem value="none" className="text-slate-300 focus:bg-slate-800 focus:text-white">
                                        Criar vazio (sem dados)
                                    </SelectItem>
                                    {schedules.map((schedule) => (
                                        <SelectItem key={schedule.id} value={schedule.id} className="text-slate-300 focus:bg-slate-800 focus:text-white">
                                            {schedule.name}
                                            {schedule.id === currentScheduleId && " (Atual)"}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {cloneFromId !== "none" && (
                                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1.5 px-1">
                                    <span>ℹ️</span>
                                    Copiará professores, turmas e alocações do cenário selecionado.
                                </p>
                            )}
                        </div>

                        {/* Campo Descrição */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-slate-300 font-medium">Descrição (Opcional)</Label>
                            <Textarea
                                id="description"
                                value={newScenarioDescription}
                                onChange={(e) => setNewScenarioDescription(e.target.value)}
                                className="resize-none bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-600 focus-visible:border-blue-600 min-h-[80px]"
                                placeholder="Adicione observações sobre este cenário..."
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setIsCreateOpen(false)}
                            className="text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={!newScenarioName.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Criar Cenário
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Gerenciamento */}
            <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Gerenciar Cenários</DialogTitle>
                        <DialogDescription>
                            Visualize e gerencie seus cenários de grade horária.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-4">
                            {schedules.map((schedule) => (
                                <div key={schedule.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium text-sm flex items-center gap-2">
                                            {schedule.name}
                                            {schedule.id === currentScheduleId && (
                                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Atual</span>
                                            )}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {schedule.description || "Sem descrição"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDeleteClick(schedule.id)}
                                            disabled={schedules.length === 1}
                                            title={schedules.length === 1 ? "Não é possível excluir o único cenário" : "Excluir"}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

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
        </div>
    );
}
