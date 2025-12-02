import { useEffect, useState, useMemo } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, Plus, Trash2, Save, User, Clock, BookOpen, AlertCircle, ArrowRight } from "lucide-react";
import { useModal } from "@/hooks/useModal";
import { ModalCenter } from "@/components/ModalCenter";

const teacherSchema = z.object({
  teachers: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, "Nome é obrigatório"),
      knowledge_area: z.string().optional(),
      workload_total: z.coerce.number().min(0).optional(),
      planning_hours: z.coerce.number().min(0).optional(),
      activity_hours: z.coerce.number().min(0).optional(),
    })
  ),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

export default function TeachersManagement() {
  const { teachers: contextTeachers, saveTeachers, deleteTeacher, setHasUnsavedChanges, subjects, knowledgeAreas: contextKnowledgeAreas } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { isOpen, content, open, close, setModal } = useModal();
  const [draggedTeacherIndex, setDraggedTeacherIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Determine active Knowledge Areas based on Context and Teachers
  const activeKnowledgeAreas = useMemo(() => {
    // Start with all available knowledge areas from context
    const areas = contextKnowledgeAreas.map(a => ({ name: a.name, color: a.color }));

    // Add any areas that are currently assigned to teachers but missing from context (e.g. "Geral")
    const teacherAreas = new Set(contextTeachers.map(t => t.knowledge_area).filter(Boolean));

    teacherAreas.forEach(areaName => {
      if (!areas.find(a => a.name === areaName)) {
        areas.push({ name: areaName!, color: '#64748b' }); // Slate-500 for undefined areas
      }
    });

    // Ensure we have at least one area if everything is empty
    if (areas.length === 0) {
      areas.push({ name: "Geral", color: '#64748b' });
    }

    // Sort alphabetically
    return areas.sort((a, b) => a.name.localeCompare(b.name));
  }, [contextKnowledgeAreas, contextTeachers]);

  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      teachers: [],
    },
    mode: "onChange",
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "teachers",
  });

  // Watch teachers array for real-time sorting
  const teachersValues = useWatch({
    control: form.control,
    name: "teachers",
  });

  // Sync with context changes (e.g. scenario switch)
  useEffect(() => {
    const currentForm = form.getValues().teachers || [];

    // Create a signature of current persistent IDs in form
    const formIds = currentForm
      .filter(t => !t.id.startsWith('new-'))
      .map(t => t.id)
      .sort()
      .join(',');

    // Create signature of context IDs
    const contextIds = contextTeachers
      .map(t => t.id)
      .sort()
      .join(',');

    // If signatures differ, context has changed (scenario switch or external update)
    if (formIds !== contextIds) {
      console.log("🔄 Syncing teachers form with context");

      // Only keep temp items that are truly new (not being saved right now)
      // We filter out temp items to prevent duplication after save
      const newItems = currentForm.filter(t => {
        if (!t.id.startsWith('new-')) return false;

        // Check if this temp item's name already exists in context
        // If yes, it was just saved and we should not keep it
        const existsInContext = contextTeachers.some(ct =>
          ct.name.trim().toLowerCase() === t.name.trim().toLowerCase()
        );

        return !existsInContext;
      });

      const updatedItems = contextTeachers.map((t) => ({
        id: t.id,
        name: t.name,
        knowledge_area: t.knowledge_area || (activeKnowledgeAreas.length > 0 ? activeKnowledgeAreas[0].name : "Geral"),
        workload_total: t.workload_total || 0,
        planning_hours: t.planning_hours || 0,
        activity_hours: t.activity_hours || 0,
      }));

      console.log(`[TeachersManagement] Syncing: ${updatedItems.length} from context + ${newItems.length} new items`);

      form.reset({
        teachers: [...updatedItems, ...newItems]
      });
      setHasUnsavedChanges(false); // Reset unsaved changes flag after a full sync
    }
  }, [contextTeachers, activeKnowledgeAreas, form, setHasUnsavedChanges]);

  const handleAddTeacher = (areaName: string) => {
    append({
      id: `new-${Date.now()}`,
      name: "",
      knowledge_area: areaName,
      workload_total: 0,
      planning_hours: 0,
      activity_hours: 0,
    });
    setHasUnsavedChanges(true);
  };

  const handleDelete = async (index: number, id: string) => {
    setModal({
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir este professor? Esta ação não pode ser desfeita.',
      type: 'confirm',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      onConfirm: async () => {
        if (!id.startsWith('new-')) {
          await deleteTeacher(id);
        }
        remove(index);
        setHasUnsavedChanges(true); // Mark as unsaved after deletion
        close();
        setModal({
          title: 'Sucesso',
          message: 'Professor removido com sucesso.',
          type: 'success'
        });
        open();
      }
    });
    open();
  };

  const onSubmit = async (data: TeacherFormData) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const validTeachers = data.teachers.filter(t => t.name.trim() !== "");

      console.log('[TeachersManagement] Saving teachers:', validTeachers.map(t => ({ id: t.id, name: t.name })));

      const teachersToSave = validTeachers.map(t => ({
        id: t.id,
        name: t.name,
        subjects: [],
        workload_total: t.workload_total,
        planning_hours: t.planning_hours,
        activity_hours: t.activity_hours,
        knowledge_area: t.knowledge_area
      }));

      await saveTeachers(teachersToSave);

      console.log('[TeachersManagement] Teachers saved successfully');

      setModal({
        title: 'Sucesso',
        message: 'Alterações salvas com sucesso!',
        type: 'success',
      });
      open();
    } catch (error) {
      console.error('[TeachersManagement] Error saving teachers:', error);
      setModal({
        title: 'Erro',
        message: 'Erro ao salvar professores.',
        type: 'error',
      });
      open();
    } finally {
      setIsSaving(false);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedTeacherIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (targetAreaName: string) => {
    if (draggedTeacherIndex !== null) {
      const teacher = form.getValues(`teachers.${draggedTeacherIndex}`);
      if (teacher.knowledge_area !== targetAreaName) {
        // Update the area of the dragged teacher
        update(draggedTeacherIndex, { ...teacher, knowledge_area: targetAreaName });
      }
      setDraggedTeacherIndex(null);
    }
  };

  // Group fields by area for rendering
  const groupedFields = useMemo(() => {
    const groups: Record<string, { field: any; index: number, name: string }[]> = {};
    activeKnowledgeAreas.forEach(area => groups[area.name] = []);

    // Also handle "Geral" or undefined areas if needed, though we try to stick to active areas
    // If a teacher has an area not in active list, we might want to show it or group it under "Outros"
    // For now, let's just add keys dynamically if missing
    fields.forEach((field, index) => {
      // Use watched value for real-time updates, fallback to field value
      const watchedTeacher = teachersValues?.[index];
      const name = watchedTeacher?.name || field.name;
      const areaName = watchedTeacher?.knowledge_area || field.knowledge_area || (activeKnowledgeAreas.length > 0 ? activeKnowledgeAreas[0].name : "Geral");

      // Filter by search term
      if (searchTerm && !name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return;
      }

      if (!groups[areaName]) {
        groups[areaName] = [];
      }
      groups[areaName].push({ field, index, name });
    });

    // Sort each group alphabetically by name
    Object.keys(groups).forEach(area => {
      groups[area].sort((a, b) => a.name.localeCompare(b.name));
    });

    return groups;
  }, [fields, teachersValues, activeKnowledgeAreas, searchTerm]);

  // Hero Warning if no subjects/areas
  if (!subjects || subjects.length === 0) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950 p-4">
        <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-2xl">
          <div className="w-20 h-20 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-100 mb-4">Nenhuma Disciplina Cadastrada</h2>
          <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
            Para gerenciar os professores, você precisa primeiro cadastrar as disciplinas e suas respectivas áreas de conhecimento.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/subjects")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-blue-900/20 transition-all hover:scale-105"
          >
            Ir para Disciplinas
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

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

      <div className="container max-w-[1600px] mx-auto py-8 px-4 pb-24">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            {/* Toolbar Superior Refatorada */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-4 w-full md:w-auto flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Buscar professor..."
                    className="pl-9 bg-slate-950 border-slate-800 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/availability")}
                  className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Gerenciar Indisponibilidades
                </Button>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>

            {/* Kanban Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
              {activeKnowledgeAreas.map((area) => (
                <div
                  key={area.name}
                  className="flex flex-col bg-slate-900/30 rounded-xl border border-slate-800/60 overflow-hidden h-full min-h-[200px] transition-colors hover:bg-slate-900/40"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(area.name)}
                >
                  {/* Column Header */}
                  <div className="bg-slate-900/80 p-3 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: area.color }} />
                      <h3 className="font-bold text-slate-200 text-sm truncate max-w-[150px]" title={area.name}>{area.name}</h3>
                      <span className="bg-slate-800 text-slate-400 text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-slate-700">
                        {groupedFields[area.name]?.length || 0}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAddTeacher(area.name)}
                      className="h-6 w-6 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Adicionar Professor nesta Área"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Column Labels Header (High Density) */}
                  <div className="grid grid-cols-[1fr_40px_40px_40px_24px] gap-1 px-2 py-1.5 bg-slate-900/50 border-b border-slate-800 border-x border-t border-transparent text-[10px] font-bold text-slate-500 uppercase items-center">
                    <div className="pl-2">Nome</div>
                    <div className="text-center" title="Carga Horária Total">Total</div>
                    <div className="text-center" title="Planejamento">Plan.</div>
                    <div className="text-center" title="Hora Atividade">Ativ.</div>
                    <div></div> {/* Spacer for delete button */}
                  </div>

                  {/* Column Body */}
                  <div className="p-2 space-y-1 flex-1">
                    {groupedFields[area.name]?.map(({ field, index }) => (
                      <div
                        key={field.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        className="bg-slate-800 rounded border border-slate-700/50 p-1.5 shadow-sm hover:border-slate-600 transition-all group cursor-grab active:cursor-grabbing hover:shadow-md grid grid-cols-[1fr_40px_40px_40px_24px] gap-1 items-center px-2"
                      >
                        {/* Nome */}
                        <div className="min-w-0">
                          <FormField
                            control={form.control}
                            name={`teachers.${index}.name`}
                            render={({ field: formField }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Input
                                    {...formField}
                                    placeholder="Nome"
                                    className="h-7 w-full bg-transparent border-transparent hover:bg-slate-900/50 hover:border-slate-700 focus:bg-slate-950 focus:border-blue-500 px-2 font-medium text-slate-200 placeholder:text-slate-600 text-xs truncate"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Inputs Numéricos Compactos (Sem Labels) */}
                        <FormField
                          control={form.control}
                          name={`teachers.${index}.workload_total`}
                          render={({ field: formField }) => (
                            <FormItem className="space-y-0">
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...formField}
                                  className="no-spinner h-7 w-full bg-slate-800/50 border-slate-600/50 rounded text-center text-xs focus:border-blue-500 focus:bg-slate-800 transition-all duration-200 placeholder-slate-500 px-0"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`teachers.${index}.planning_hours`}
                          render={({ field: formField }) => (
                            <FormItem className="space-y-0">
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...formField}
                                  className="no-spinner h-7 w-full bg-slate-800/50 border-slate-600/50 rounded text-center text-xs focus:border-blue-500 focus:bg-slate-800 transition-all duration-200 placeholder-slate-500 px-0"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`teachers.${index}.activity_hours`}
                          render={({ field: formField }) => (
                            <FormItem className="space-y-0">
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...formField}
                                  className="no-spinner h-7 w-full bg-slate-800/50 border-slate-600/50 rounded text-center text-xs focus:border-blue-500 focus:bg-slate-800 transition-all duration-200 placeholder-slate-500 px-0"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Botão Excluir */}
                        <div className="flex justify-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(index, field.id)}
                            className="h-6 w-6 text-slate-600 hover:text-red-400 hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {(!groupedFields[area.name] || groupedFields[area.name].length === 0) && (
                      <div className="py-6 text-center border border-dashed border-slate-800 rounded bg-slate-900/20">
                        <p className="text-xs text-slate-600">Vazio</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </form>
        </Form>
      </div>
    </>
  );
}
