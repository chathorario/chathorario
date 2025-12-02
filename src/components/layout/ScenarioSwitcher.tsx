import { useData } from "@/context/DataContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, Plus, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function ScenarioSwitcher() {
    const { schedules, currentScheduleId, setCurrentScheduleId, createSchedule } = useData();
    const navigate = useNavigate();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // State for create modal
    const [newScenarioName, setNewScenarioName] = useState("");
    const [newScenarioDescription, setNewScenarioDescription] = useState("");
    const [cloneFromId, setCloneFromId] = useState<string>("none");

    const currentSchedule = schedules.find(s => s.id === currentScheduleId);

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
        navigate("/escola"); // Go to dashboard to see the new scenario
    };

    const openCreateModal = () => {
        setCloneFromId(currentScheduleId || "none");
        setIsCreateOpen(true);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="h-11 gap-3 px-4 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 min-w-[280px] justify-between"
                    >
                        <div className="flex items-center gap-2.5 truncate">
                            <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
                            <span className="font-medium truncate max-w-[220px] text-base">
                                {currentSchedule ? currentSchedule.name : "Selecione um Cenário"}
                            </span>
                        </div>
                        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[280px]">
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                        Cenário Ativo
                    </DropdownMenuLabel>

                    {schedules.slice(0, 5).map(schedule => (
                        <DropdownMenuItem
                            key={schedule.id}
                            onClick={() => setCurrentScheduleId(schedule.id)}
                            className="flex items-center justify-between gap-2 cursor-pointer"
                        >
                            <span className={schedule.id === currentScheduleId ? "font-semibold text-primary" : ""}>
                                {schedule.name}
                            </span>
                            {schedule.id === currentScheduleId && (
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            )}
                        </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={openCreateModal} className="gap-2 cursor-pointer text-primary focus:text-primary">
                        <Plus className="h-4 w-4" />
                        Novo Cenário
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigate("/escola")} className="gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" />
                        Gerenciar Todos
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Reusing the Create Modal Logic */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px] bg-slate-950 border-slate-800 p-6 gap-6">
                    <DialogHeader className="space-y-3">
                        <DialogTitle className="text-lg font-semibold text-white">Criar Novo Cenário</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Configure os detalhes da nova versão da grade horária.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="header-name" className="text-slate-300 font-medium">Nome do Cenário</Label>
                            <Input
                                id="header-name"
                                value={newScenarioName}
                                onChange={(e) => setNewScenarioName(e.target.value)}
                                className="h-11 w-full bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-600 focus-visible:border-blue-600"
                                placeholder="Ex: Versão Final 2025"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="header-clone-from" className="text-slate-300 font-medium">Copiar dados de:</Label>
                            <Select value={cloneFromId} onValueChange={setCloneFromId}>
                                <SelectTrigger id="header-clone-from" className="h-11 w-full bg-slate-900 border-slate-700 text-slate-100 focus:ring-blue-600">
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

                        <div className="space-y-2">
                            <Label htmlFor="header-description" className="text-slate-300 font-medium">Descrição (Opcional)</Label>
                            <Textarea
                                id="header-description"
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
        </>
    );
}
