import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Trash2, Plus, Save } from "lucide-react";
import { useData } from "@/context/DataContext";
import { toast } from "sonner";

const areaSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "Nome é obrigatório"),
    color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Cor inválida"),
});

const formSchema = z.object({
    areas: z.array(areaSchema),
});

type FormSchema = z.infer<typeof formSchema>;

interface ManageKnowledgeAreasModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ManageKnowledgeAreasModal({ isOpen, onClose }: ManageKnowledgeAreasModalProps) {
    const { knowledgeAreas, saveKnowledgeAreas, deleteKnowledgeArea } = useData();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            areas: [],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "areas",
    });

    useEffect(() => {
        if (isOpen && knowledgeAreas) {
            replace(knowledgeAreas);
        }
    }, [isOpen, knowledgeAreas, replace]);

    const onSubmit = async (data: FormSchema) => {
        setIsSaving(true);
        try {
            await saveKnowledgeAreas(data.areas);
            toast.success("Áreas de conhecimento salvas com sucesso!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar áreas.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (index: number, id: string) => {
        if (id.startsWith('new-')) {
            remove(index);
            return;
        }

        try {
            await deleteKnowledgeArea(id);
            remove(index);
            toast.success("Área removida!");
        } catch (error: any) {
            toast.error(error.message || "Erro ao remover área.");
        }
    };

    const handleAdd = () => {
        append({
            id: `new-${Date.now()}`,
            name: "",
            color: "#3b82f6", // Default blue
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-100">
                <DialogHeader>
                    <DialogTitle>Gerenciar Áreas de Conhecimento</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Defina as áreas de conhecimento para agrupar disciplinas e organizar o quadro de horários.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-3 bg-slate-950/50 p-2 rounded border border-slate-800">
                                    <FormField
                                        control={form.control}
                                        name={`areas.${index}.color`}
                                        render={({ field: colorField }) => (
                                            <div className="relative group">
                                                <Input
                                                    type="color"
                                                    {...colorField}
                                                    className="w-10 h-10 p-1 bg-transparent border-0 cursor-pointer"
                                                />
                                            </div>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`areas.${index}.name`}
                                        render={({ field: nameField }) => (
                                            <FormItem className="flex-1 mb-0">
                                                <FormControl>
                                                    <Input
                                                        {...nameField}
                                                        placeholder="Nome da área (ex: Linguagens)"
                                                        className="bg-slate-900 border-slate-700 text-slate-200"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(index, field.id)}
                                        className="text-slate-500 hover:text-red-400 hover:bg-red-900/20"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}

                            {fields.length === 0 && (
                                <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded">
                                    Nenhuma área cadastrada.
                                </div>
                            )}
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAdd}
                            className="w-full border-dashed border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Nova Área
                        </Button>

                        <DialogFooter className="pt-4 border-t border-slate-800">
                            <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-slate-200">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Save className="mr-2 h-4 w-4" />
                                {isSaving ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
