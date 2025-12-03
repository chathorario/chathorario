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
import { Users, Trash2, PlusCircle, Save, AlertTriangle, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useModal } from "@/hooks/useModal";
import { ModalCenter } from "@/components/ModalCenter";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SeriesScheduleConfig } from "@/components/classes/SeriesScheduleConfig";

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
  bell_schedule: z.array(z.any()).optional(),
});

// Schema for the form
const formSchema = z.object({
  turmas: z.array(classSchema),
});

type FormSchema = z.infer<typeof formSchema>;

export default function ClassesManagement() {
  const { schoolConfig, classes, saveClasses, deleteClasses, deleteAllClasses, setHasUnsavedChanges } = useData();
  const navigate = useNavigate();
  const { isOpen, open, close, content, setModal } = useModal();
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  // Estado para modal de configuração de horários
  const [scheduleConfigOpen, setScheduleConfigOpen] = useState(false);
  const [selectedSerie, setSelectedSerie] = useState<string | null>(null);
  const [selectedSerieSchedule, setSelectedSerieSchedule] = useState<any[]>([]);
  const [selectedSerieStartTime, setSelectedSerieStartTime] = useState<string>("07:00");

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
          bell_schedule: c.bell_schedule
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
        console.log('[ClassesManagement] Syncing form with context classes:', formattedClasses.length);
        if (formattedClasses.length > 0) {
          console.log('[ClassesManagement] Sample ID being set in form:', formattedClasses[0].id);
        }
        // Use reset to ensure isDirty is cleared
        form.reset({ turmas: formattedClasses });
      }
    } else if (classes && classes.length === 0) {
      // Explicitly clear form if classes list is empty (e.g. new scenario)
      const currentValues = form.getValues().turmas;
      if (currentValues.length > 0) {
        console.log('[ClassesManagement] Clearing form - no classes in context');
        form.reset({ turmas: [] });
      }
    }
  }, [classes, form]);

  // Track form changes for unsaved changes warning
  const { isDirty } = form.formState;
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty, setHasUnsavedChanges]);

  // Handlers para configuração de horários
  const handleOpenScheduleConfig = (serie: string) => {
    setSelectedSerie(serie);
    // Buscar configuração existente da primeira turma desta série
    const serieClass = classes.find(c => c.name.startsWith(serie));
    setSelectedSerieSchedule(serieClass?.bell_schedule || []);
    setSelectedSerieStartTime(serieClass?.horario_inicio || "07:00"); // Carregar horário de início
    setScheduleConfigOpen(true);
  };

  const handleSaveScheduleConfig = async (schedule: any[], startTime: string) => {
    if (!selectedSerie) return;

    // Atualizar todas as turmas desta série com a nova configuração
    const updatedClasses = classes.map(c => {
      if (c.name.startsWith(selectedSerie)) {
        return { ...c, bell_schedule: schedule, horario_inicio: startTime };
      }
      return c;
    });

    await saveClasses(updatedClasses);
    toast.success(`Horários configurados para ${selectedSerie} `);
  };

  const handleCopyScheduleToAll = async (schedule: any[], startTime: string) => {
    if (!selectedSerie || !schedule || schedule.length === 0) return;

    // Copiar configuração para todas as turmas
    const updatedClasses = classes.map(c => ({
      ...c,
      bell_schedule: schedule,
      horario_inicio: startTime
    }));

    await saveClasses(updatedClasses);
    toast.success("Configuração copiada para todas as séries!");
  };

  const handleAddTurma = (serie: string) => {
    if (!serie) {
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
      id: `new- ${Date.now()} `,
      serie: serie,
      identificacao: "",
      shift: defaultShift,
      aulasDiarias: 5,
    });
  };

  const handleRemoveSelected = async () => {
    if (isDeleting) return;

    const indicesToRemove: number[] = [];
    const classNamesToRemove: string[] = [];
    const classIdsToDelete: string[] = [];

    const formValues = form.getValues().turmas;

    fields.forEach((field, index) => {
      if (selectedRows.has(field.id)) {
        indicesToRemove.push(index);
        classNamesToRemove.push(`${field.serie} - ${field.identificacao} `);

        // Use the real ID from form values, not field.id (which is react-hook-form's internal ID)
        const realId = formValues[index]?.id;
        if (realId && !realId.startsWith('new-')) {
          classIdsToDelete.push(realId);
        }
      }
    });

    console.log('[handleRemoveSelected] Total fields:', fields.length);
    console.log('[handleRemoveSelected] Selected for deletion:', classIdsToDelete.length);
    if (formValues.length > 0) {
      console.log('[handleRemoveSelected] Sample real ID from form:', formValues[0].id);
    }
    if (classIdsToDelete.length > 0) {
      console.log('[handleRemoveSelected] Sample delete ID:', classIdsToDelete[0]);
    }

    if (indicesToRemove.length === 0) return;

    setModal({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir ${indicesToRemove.length} turma(s) ?\n\n${classNamesToRemove.join('\n')} \n\nEsta ação não pode ser desfeita.`,
      type: 'confirm',
      confirmLabel: 'Sim, Excluir',
      cancelLabel: 'Cancelar',
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          if (classIdsToDelete.length > 0) {
            await deleteClasses(classIdsToDelete);
          }

          // Remove from form
          remove(indicesToRemove.sort((a, b) => b - a));
          setSelectedRows(new Set());
          close();

          setModal({
            title: 'Sucesso',
            message: `${indicesToRemove.length} turma(s) excluída(s) com sucesso!`,
            type: 'success',
          });
          open();
        } catch (error) {
          console.error('Erro ao excluir turmas:', error);
          setModal({
            title: 'Erro',
            message: 'Não foi possível excluir as turmas. Tente novamente.',
            type: 'error',
          });
          open();
        } finally {
          setIsDeleting(false);
        }
      },
    });
    open();
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

  const handleGroupSelect = (groupFields: any[], checked: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      groupFields.forEach(field => {
        if (checked) {
          newSet.add(field.id);
        } else {
          newSet.delete(field.id);
        }
      });
      return newSet;
    });
  };

  const onSubmit = async (data: FormSchema) => {
    console.log('[ClassesManagement] onSubmit called', { isSaving, dataLength: data.turmas.length });

    if (isSaving) {
      console.log('[ClassesManagement] Already saving, skipping');
      return;
    }

    setIsSaving(true);
    console.log('[ClassesManagement] Starting save process');

    try {
      const newClasses = data.turmas.map(turma => {
        // Tentar encontrar a turma original para preservar o bell_schedule
        const originalClass = classes.find(c => c.id === turma.id);

        return {
          id: turma.id.startsWith('new-') ? `${turma.serie} - ${turma.identificacao} - ${Math.random().toString(36).substr(2, 9)}` : turma.id,
          name: `${turma.serie} - ${turma.identificacao}`,
          shift: turma.shift,
          aulasDiarias: turma.aulasDiarias,
          bell_schedule: turma.bell_schedule || originalClass?.bell_schedule || []
        };
      });

      console.log('[ClassesManagement] Classes to save:', newClasses.length);
      await saveClasses(newClasses);
      console.log('[ClassesManagement] saveClasses completed successfully');

      // The useEffect will automatically sync the form when context updates
      // No need to manually reset here

      setModal({
        title: 'Sucesso',
        message: 'Turmas salvas com sucesso!',
        type: 'success',
      });
      console.log('[ClassesManagement] Opening success modal');
      open();
    } catch (error) {
      console.error("[ClassesManagement] Error saving classes:", error);
      setModal({
        title: 'Erro',
        message: 'Ocorreu um erro ao salvar as turmas. Tente novamente.',
        type: 'error',
      });
      open();
    } finally {
      console.log('[ClassesManagement] Setting isSaving to false');
      setIsSaving(false);
    }
  };

  const handleClearAllClasses = () => {
    setModal({
      title: '⚠️ ATENÇÃO: Limpar Todas as Turmas',
      message: `Esta ação irá DELETAR TODAS as ${classes.length} turmas do cenário atual, incluindo: \n\n• Todas as alocações de professores\n• Todos os horários fixos\n• Todos os dados relacionados\n\n⚠️ ESTA AÇÃO NÃO PODE SER DESFEITA!\n\nDeseja realmente continuar ? `,
      type: 'error',
      confirmLabel: 'Sim, Limpar Tudo',
      cancelLabel: 'Cancelar',
      onConfirm: () => {
        close();
        // Segunda confirmação
        setModal({
          title: '🚨 CONFIRMAÇÃO FINAL',
          message: `Você está prestes a deletar ${classes.length} turmas permanentemente.\n\nDigite "CONFIRMAR" para prosseguir ou clique em Cancelar.`,
          type: 'error',
          confirmLabel: 'DELETAR TUDO',
          cancelLabel: 'Cancelar',
          onConfirm: async () => {
            setIsClearingAll(true);
            try {
              await deleteAllClasses();
              close();
              setModal({
                title: 'Sucesso',
                message: 'Todas as turmas foram deletadas com sucesso!',
                type: 'success',
              });
              open();
            } catch (error) {
              console.error('Erro ao limpar turmas:', error);
              setModal({
                title: 'Erro',
                message: 'Não foi possível limpar as turmas. Tente novamente.',
                type: 'error',
              });
              open();
            } finally {
              setIsClearingAll(false);
            }
          },
        });
        open();
      },
    });
    open();
  };

  // Group fields by serie
  const groupedFields = useMemo(() => {
    const groups: Record<string, any[]> = {};
    seriesOptions.forEach(serie => {
      groups[serie] = [];
    });

    fields.forEach((field, index) => {
      if (!groups[field.serie]) {
        groups[field.serie] = [];
      }
      groups[field.serie].push({ ...field, originalIndex: index });
    });
    return groups;
  }, [fields, seriesOptions]);

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
      <div className="container max-w-[1600px] mx-auto py-8 px-4">
        {schoolConfig?.modalidade ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              {/* Toolbar Superior */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-900/30 rounded-lg">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-100">Gerenciamento de Turmas</h1>
                    <p className="text-slate-400 text-sm">Organize a estrutura escolar por séries</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleRemoveSelected}
                    disabled={selectedRows.size === 0 || isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir ({selectedRows.size})
                  </Button>

                  {classes.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearAllClasses}
                      disabled={isClearingAll}
                      className="border-red-700 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      {isClearingAll ? "Limpando..." : "Limpar Tudo"}
                    </Button>
                  )}

                  <Button type="submit" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </div>

              {/* Grid de Cards (Kanban Style) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {seriesOptions.map((serie) => {
                  const groupFields = groupedFields[serie] || [];
                  const allSelected = groupFields.length > 0 && groupFields.every(f => selectedRows.has(f.id));
                  const someSelected = groupFields.some(f => selectedRows.has(f.id));
                  const isIndeterminate = someSelected && !allSelected;

                  return (
                    <div key={serie} className="flex flex-col bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden h-full">
                      {/* Card Header */}
                      <div className="bg-slate-900/80 p-3 border-b border-slate-700 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={allSelected ? true : (isIndeterminate ? "indeterminate" : false)}
                            onCheckedChange={(checked) => handleGroupSelect(groupFields, !!checked)}
                            className="border-slate-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                            disabled={groupFields.length === 0}
                          />
                          <span className="font-bold text-slate-200">{serie}</span>
                        </div>
                        <span className="bg-slate-800 text-slate-400 text-xs font-medium px-2 py-1 rounded-full border border-slate-700">
                          {groupFields.length} turmas
                        </span>
                      </div>

                      {/* Sub-header Legend */}
                      <div className="flex items-center gap-2 px-5 py-2 bg-slate-900/30 border-b border-slate-800/50">
                        <div className="w-4" />
                        <div className="flex-1 grid grid-cols-[1fr_100px_60px] gap-2">
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">IDENTIFICAÇÃO</span>
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">TURNO</span>
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider text-center">AULAS</span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="flex-1 p-3 space-y-2 max-h-[400px] overflow-y-auto pb-6">
                        {groupFields.length > 0 ? (
                          groupFields.map((field) => {
                            return (
                              <div
                                key={field.id}
                                className={cn(
                                  "flex items-center gap-2 p-2 rounded-lg border transition-colors",
                                  selectedRows.has(field.id)
                                    ? "bg-blue-900/20 border-blue-800"
                                    : "bg-slate-900/50 border-slate-700 hover:border-slate-600"
                                )}
                              >
                                <Checkbox
                                  checked={selectedRows.has(field.id)}
                                  onCheckedChange={() => handleToggleRow(field.id)}
                                  className="border-slate-600"
                                />

                                <div className="flex-1 grid grid-cols-[1fr_100px_60px] gap-2 items-center">
                                  {/* Identificação */}
                                  <div>
                                    <FormField
                                      control={form.control}
                                      name={`turmas.${field.originalIndex}.identificacao`}
                                      render={({ field: formField }) => (
                                        <FormItem className="space-y-0">
                                          <FormControl>
                                            <Input
                                              {...formField}
                                              placeholder="Ex: 01, A"
                                              className="h-8 text-sm bg-slate-950 border-slate-800 focus:border-blue-500 px-2"
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  {/* Turno */}
                                  <div>
                                    <FormField
                                      control={form.control}
                                      name={`turmas.${field.originalIndex}.shift`}
                                      render={({ field: formField }) => {
                                        const shiftOption = SHIFT_OPTIONS.find(s => s.value === formField.value);

                                        return (
                                          <FormItem className="space-y-0">
                                            <Select
                                              onValueChange={formField.onChange}
                                              value={formField.value}
                                            >
                                              <FormControl>
                                                <SelectTrigger className="h-8 text-xs bg-slate-950 border-slate-800 focus:border-blue-500 px-2">
                                                  <SelectValue>
                                                    {shiftOption && (
                                                      <span className={cn("flex items-center gap-1 font-medium", shiftOption.color)}>
                                                        <span className="text-sm">{shiftOption.icon}</span>
                                                        <span className="hidden sm:inline">{shiftOption.label.substring(0, 3)}</span>
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
                                          </FormItem>
                                        );
                                      }}
                                    />
                                  </div>

                                  {/* Aulas */}
                                  <div>
                                    <FormField
                                      control={form.control}
                                      name={`turmas.${field.originalIndex}.aulasDiarias`}
                                      render={({ field: formField }) => (
                                        <FormItem className="space-y-0">
                                          <FormControl>
                                            <Input
                                              type="number"
                                              min="1"
                                              {...formField}
                                              className="h-8 text-sm bg-slate-950 border-slate-800 focus:border-blue-500 px-2 text-center"
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-8 text-slate-500 text-sm">
                            Nenhuma turma cadastrada
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="p-3 border-t border-slate-700 bg-slate-900/50 space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddTurma(serie)}
                          className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Adicionar Turma
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenScheduleConfig(serie)}
                          className="w-full border-indigo-700 text-indigo-300 hover:bg-indigo-900/30 hover:text-indigo-200"
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Configurar Horários do Sino
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </form>
          </Form>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Configuração Necessária</CardTitle>
              <CardDescription className="text-red-500">
                Modalidade de ensino não configurada. Por favor, vá para as <a href="/config" className="underline">configurações</a>.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Modal de Configuração de Horários do Sino */}
      {selectedSerie && (
        <SeriesScheduleConfig
          isOpen={scheduleConfigOpen}
          onClose={() => setScheduleConfigOpen(false)}
          seriesName={selectedSerie}
          aulasDiarias={classes.find(c => c.name.startsWith(selectedSerie))?.aulasDiarias || 5}
          currentSchedule={selectedSerieSchedule}
          currentStartTime={selectedSerieStartTime}
          onSave={handleSaveScheduleConfig}
          onCopyToAll={handleCopyScheduleToAll}
        />
      )}
    </>
  );
}
