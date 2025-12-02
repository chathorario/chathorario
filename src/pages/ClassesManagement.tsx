import { useState, useMemo, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { useNavigate } from "react-router-dom";
import { Users, Trash2, PlusCircle, Save } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useModal } from "@/hooks/useModal";
import { ModalCenter } from "@/components/ModalCenter";
import { cn } from "@/lib/utils";

// Shift options with icons and colors
const SHIFT_OPTIONS = [
  { value: 'morning', label: 'Matutino', icon: '☀', color: 'text-amber-400' },
  { value: 'afternoon', label: 'Vespertino', icon: '🌤', color: 'text-orange-500' },
  { value: 'night', label: 'Noturno', icon: '🌙', color: 'text-indigo-400' },
  { value: 'fulltime', label: 'Integral', icon: '🔁', color: 'text-emerald-400' },
] as const;

const SHIFT_ORDER = { morning: 0, afternoon: 1, night: 2, fulltime: 3 };

// Schema for a single class
const classSchema = z.object({
  id: z.string(),
  serie: z.string().min(1, "Série/Ano é obrigatório"),
  identificacao: z.string().min(1, "Identificação é obrigatória"),
  shift: z.enum(['morning', 'afternoon', 'night', 'fulltime']),
  aulasDiarias: z.coerce.number().min(1, "Mínimo 1 aula diária"),
});

// Schema for the form
const formSchema = z.object({
  turmas: z.array(classSchema),
});

type FormSchema = z.infer<typeof formSchema>;

export default function ClassesManagement() {
  const { schoolConfig, classes, saveClasses, setHasUnsavedChanges } = useData();
  const navigate = useNavigate();
  const { isOpen, open, close, content, setModal } = useModal();
  const [selectedSerie, setSelectedSerie] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const seriesOptions = useMemo(() => {
    if (schoolConfig?.modalidade === 'medio') {
      return ["1ª Série", "2ª Série", "3ª Série"];
    }
    if (schoolConfig?.modalidade === 'fundamental') {
      return Array.from({ length: 9 }, (_, i) => `${i + 1}º Ano`);
    }
    return [];
  }, [schoolConfig]);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      turmas: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "turmas",
  });

  // Populate form with existing classes from context
  useEffect(() => {
    if (classes && classes.length > 0) {
      console.log(`🔄 Classes changed, updating form. Classes count: ${classes.length}`);
      const formattedClasses = classes.map(c => {
        const nameParts = c.name.split(' - ');
        const serie = nameParts.length > 1 ? nameParts.slice(0, -1).join(' - ') : c.name;
        const identificacao = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

        // Map shift string to enum value
        let shiftValue: 'morning' | 'afternoon' | 'night' | 'fulltime' = 'morning';
        if (c.shift === 'afternoon' || c.shift === 'Vespertino') shiftValue = 'afternoon';
        else if (c.shift === 'night' || c.shift === 'Noturno') shiftValue = 'night';
        else if (c.shift === 'fulltime' || c.shift === 'Integral') shiftValue = 'fulltime';

        return {
          id: c.id,
          serie: serie,
          identificacao: identificacao,
          shift: shiftValue,
          aulasDiarias: c.aulasDiarias || 5,
        };
      });

      // Sort by shift (morning -> afternoon -> night -> fulltime)
      formattedClasses.sort((a, b) => {
        if (a.serie !== b.serie) return 0;
        return SHIFT_ORDER[a.shift] - SHIFT_ORDER[b.shift];
      });

      // Avoid infinite loops by checking if data actually changed
      const currentValues = form.getValues().turmas;
      if (JSON.stringify(currentValues) !== JSON.stringify(formattedClasses)) {
        console.log("🔄 Syncing form data (preserving order).");
        form.reset({ turmas: formattedClasses });
      }
    } else if (classes && classes.length === 0) {
      // Explicitly clear form if classes list is empty (e.g. new scenario)
      console.log("🧹 Clearing form because classes list is empty");
      const currentValues = form.getValues().turmas;
      if (currentValues.length > 0) {
        form.reset({ turmas: [] });
      }
    }
  }, [classes, form]);

  // Track form changes for unsaved changes warning
  const { isDirty } = form.formState;
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty, setHasUnsavedChanges]);

  useEffect(() => {
    if (seriesOptions.length > 0 && !selectedSerie) {
      setSelectedSerie(seriesOptions[0]);
    }
  }, [seriesOptions, selectedSerie]);

  const handleAddTurma = () => {
    if (!selectedSerie) {
      setModal({
        title: 'Erro',
        message: 'Selecione uma série/ano para adicionar a turma.',
        type: 'error',
      });
      open();
      return;
    }

    // Default shift based on school config
    let defaultShift: 'morning' | 'afternoon' | 'night' | 'fulltime' = 'morning';
    if (schoolConfig?.turno === 'Vespertino') defaultShift = 'afternoon';
    else if (schoolConfig?.turno === 'Noturno') defaultShift = 'night';
    else if (schoolConfig?.turno === 'Integral') defaultShift = 'fulltime';

    append({
      id: `new-${Date.now()}`,
      serie: selectedSerie,
      identificacao: "",
      shift: defaultShift,
      aulasDiarias: 5,
    });
  };

  const handleRemoveSelected = () => {
    const indicesToRemove: number[] = [];
    fields.forEach((field, index) => {
      if (selectedRows.has(field.id)) {
        indicesToRemove.push(index);
      }
    });

    remove(indicesToRemove.sort((a, b) => b - a));
    setSelectedRows(new Set());
  };

  const handleToggleRow = (id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleToggleAll = () => {
    if (selectedRows.size === fields.length && fields.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(fields.map(f => f.id)));
    }
  };

  const onSubmit = async (data: FormSchema) => {
    if (isSaving) return; // Prevent double submission
    setIsSaving(true);
    try {
      const newClasses = data.turmas.map(turma => ({
        id: turma.id.startsWith('new-') ? `${turma.serie}-${turma.identificacao}-${Math.random().toString(36).substr(2, 9)}` : turma.id,
        name: `${turma.serie} - ${turma.identificacao}`,
        shift: turma.shift,
        aulasDiarias: turma.aulasDiarias,
      }));

      await saveClasses(newClasses);

      setModal({
        title: 'Sucesso',
        message: 'Turmas salvas com sucesso!',
        type: 'success',
      });
      open();
    } catch (error) {
      console.error("Erro ao salvar turmas:", error);
      setModal({
        title: 'Erro',
        message: 'Ocorreu um erro ao salvar as turmas. Tente novamente.',
        type: 'error',
      });
      open();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <ModalCenter
        isOpen={isOpen}
        onClose={close}
        title={content.title}
        type={content.type}
        onConfirm={content.onConfirm}
        confirmLabel={content.confirmLabel}
        cancelLabel={content.cancelLabel}
      >
        {content.message}
      </ModalCenter>
      <Header />
      <div className="w-full px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <CardTitle>Gerenciamento de Turmas</CardTitle>
            </div>
            <CardDescription>
              Organize a estrutura escolar por séries. Defina o turno de cada turma individualmente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {schoolConfig?.modalidade ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedRows.size === fields.length && fields.length > 0}
                              onCheckedChange={handleToggleAll}
                              aria-label="Selecionar todas as linhas"
                            />
                          </TableHead>
                          <TableHead className="min-w-[150px]">SÉRIE/ANO</TableHead>
                          <TableHead>IDENTIFICAÇÃO</TableHead>
                          <TableHead className="w-40">TURNO</TableHead>
                          <TableHead className="w-32">AULAS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.length > 0 ? fields.map((field, index) => {
                          const shiftOption = SHIFT_OPTIONS.find(s => s.value === field.shift);

                          return (
                            <TableRow key={field.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedRows.has(field.id)}
                                  onCheckedChange={() => handleToggleRow(field.id)}
                                  aria-label={`Selecionar linha ${index + 1}`}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{field.serie}</TableCell>
                              <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`turmas.${index}.identificacao`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input {...field} placeholder="Ex: 01, 02, A, B..." />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`turmas.${index}.shift`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="w-full">
                                            <SelectValue>
                                              {shiftOption && (
                                                <span className={cn("flex items-center gap-1.5 font-medium", shiftOption.color)}>
                                                  <span>{shiftOption.icon}</span>
                                                  <span>{shiftOption.label}</span>
                                                </span>
                                              )}
                                            </SelectValue>
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {SHIFT_OPTIONS.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                              <span className={cn("flex items-center gap-2 font-medium", option.color)}>
                                                <span>{option.icon}</span>
                                                <span>{option.label}</span>
                                              </span>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`turmas.${index}.aulasDiarias`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input type="number" min="1" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        }) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">
                              Nenhuma turma cadastrada.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Select value={selectedSerie} onValueChange={setSelectedSerie}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Selecione a Série/Ano" />
                        </SelectTrigger>
                        <SelectContent>
                          {seriesOptions.map(serie => (
                            <SelectItem key={serie} value={serie}>{serie}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="outline" onClick={handleAddTurma}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Turma
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleRemoveSelected}
                        disabled={selectedRows.size === 0}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir ({selectedRows.size})
                      </Button>
                      <Button type="submit" disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Alterações"}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            ) : (
              <CardDescription className="text-red-500">
                Modalidade de ensino não configurada. Por favor, vá para as <a href="/config" className="underline">configurações</a>.
              </CardDescription>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
