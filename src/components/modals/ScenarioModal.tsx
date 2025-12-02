import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/context/DataContext";
import { toast } from "sonner";
import { UploadCloud, FileJson, Loader2 } from "lucide-react";

interface ScenarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    initialData?: {
        id: string;
        name: string;
        description: string;
    };
}

export function ScenarioModal({ isOpen, onClose, mode, initialData }: ScenarioModalProps) {
    const { schedules, currentScheduleId, createSchedule, updateSchedule, importScenario } = useData();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [cloneFromId, setCloneFromId] = useState<string>("none");
    const [loading, setLoading] = useState(false);

    // New States
    const [activeTab, setActiveTab] = useState<'create' | 'import'>('create');
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Reset states on open
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && initialData) {
                setName(initialData.name);
                setDescription(initialData.description || "");
                setActiveTab('create'); // Edit mode doesn't support import
            } else {
                setName("");
                setDescription("");
                setCloneFromId(currentScheduleId || "none");
                setActiveTab('create');
                setImportFile(null);
            }
        }
    }, [isOpen, mode, initialData, currentScheduleId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.name.endsWith('.json') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                setImportFile(file);
            } else {
                toast.error("Por favor, selecione um arquivo válido (.json, .xlsx, .xls).");
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.json') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
            setImportFile(file);
        } else {
            toast.error("Por favor, envie um arquivo válido (.json, .xlsx, .xls).");
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (mode === 'create' && activeTab === 'import') {
                if (!importFile) return;
                await importScenario(importFile);
            } else if (mode === 'create') {
                if (!name.trim()) {
                    toast.error("Nome do cenário é obrigatório");
                    setLoading(false);
                    return;
                }
                const cloneId = cloneFromId === "none" ? undefined : cloneFromId;
                // @ts-ignore
                await createSchedule(name, description, cloneId);
            } else if (mode === 'edit' && initialData) {
                if (!name.trim()) {
                    toast.error("Nome do cenário é obrigatório");
                    setLoading(false);
                    return;
                }
                await updateSchedule(initialData.id, { name, description });
            }
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] bg-slate-950 border-slate-800 p-6 gap-6">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-lg font-semibold text-white">
                        {mode === 'create' ? 'Novo Cenário' : 'Editar Cenário'}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        {mode === 'create'
                            ? 'Crie um novo cenário do zero, clone um existente ou importe um backup.'
                            : 'Atualize as informações deste cenário.'}
                    </DialogDescription>
                </DialogHeader>

                {mode === 'create' && (
                    <div className="flex p-1 bg-slate-900 rounded-lg mb-2">
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'create'
                                ? 'bg-slate-800 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            Criar / Clonar
                        </button>
                        <button
                            onClick={() => setActiveTab('import')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'import'
                                ? 'bg-slate-800 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            Importar Backup
                        </button>
                    </div>
                )}

                {activeTab === 'create' ? (
                    <div className="flex flex-col gap-5">
                        {/* Existing Form Fields */}
                        <div className="space-y-2">
                            <Label htmlFor="scenario-name" className="text-slate-300 font-medium">Nome do Cenário</Label>
                            <Input
                                id="scenario-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-11 w-full bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-600 focus-visible:border-blue-600"
                                placeholder="Ex: Versão Final 2025"
                            />
                        </div>

                        {mode === 'create' && (
                            <div className="space-y-2">
                                <Label htmlFor="scenario-clone" className="text-slate-300 font-medium">Copiar dados de:</Label>
                                <Select value={cloneFromId} onValueChange={setCloneFromId}>
                                    <SelectTrigger id="scenario-clone" className="h-11 w-full bg-slate-900 border-slate-700 text-slate-100 focus:ring-blue-600">
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
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="scenario-desc" className="text-slate-300 font-medium">Descrição (Opcional)</Label>
                            <Textarea
                                id="scenario-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="resize-none bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-600 focus-visible:border-blue-600 min-h-[80px]"
                                placeholder="Adicione observações sobre este cenário..."
                                rows={2}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${isDragging
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                                }`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept=".json,.xlsx,.xls"
                                onChange={handleFileChange}
                            />

                            {importFile ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <FileJson className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{importFile.name}</p>
                                        <p className="text-xs text-slate-500">{(importFile.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 px-3"
                                        onClick={(e) => { e.stopPropagation(); setImportFile(null); }}
                                    >
                                        Remover
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                                        <UploadCloud className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-300 mb-1">
                                        Clique para selecionar ou arraste um arquivo
                                    </p>
                                    <p className="text-xs text-slate-500 max-w-[200px]">
                                        Suporta arquivos .json e planilhas Excel (.xlsx)
                                    </p>
                                </>
                            )}
                        </div>

                        {loading && (
                            <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Processando arquivo e reconstruindo dados...</span>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="mt-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || (activeTab === 'create' ? !name.trim() : !importFile)}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                    >
                        {loading ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processando</>
                        ) : (
                            activeTab === 'create'
                                ? (mode === 'create' ? "Criar Cenário" : "Salvar Alterações")
                                : "Restaurar Cenário"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
