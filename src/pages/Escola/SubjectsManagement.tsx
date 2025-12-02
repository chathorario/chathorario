import { useState, useMemo, useEffect, useRef } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useData, type Subject, type KnowledgeArea } from "@/context/DataContext";
import { toast } from "sonner";
import { BookOpen, Trash2, PlusCircle, Save, AlertTriangle, Download, Trash, LayoutGrid, ChevronsRight, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Settings } from "lucide-react";
import { useModal } from "@/hooks/useModal";
import { ModalCenter } from "@/components/ModalCenter";
import { ManageKnowledgeAreasModal } from "@/components/modals/ManageKnowledgeAreasModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const subjectSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Nome da disciplina é obrigatório"),
  aulas_por_turma: z.record(z.coerce.number().min(0).optional()),
  knowledge_area_id: z.string().min(1, "Área de conhecimento é obrigatória"),
});

const formSchema = z.object({
  subjects: z.array(subjectSchema),
});

type FormSchema = z.infer<typeof formSchema>;

export default function SubjectsManagement() {
  const { subjects, setSubjects, addSubject, classes, saveSubjects, deleteSubject: deleteSubjectFromContext, deleteSubjects, curriculumMatrices, setHasUnsavedChanges, knowledgeAreas, saveKnowledgeAreas } = useData();
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isKnowledgeAreasModalOpen, setIsKnowledgeAreasModalOpen] = useState(false);
  const [selectedMatrixId, setSelectedMatrixId] = useState<string>("");
  const [invalidCells, setInvalidCells] = useState<Set<string>>(new Set()); // Track invalid cells
  const { isOpen, content, open, close, setModal } = useModal();
  const navigate = useNavigate();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Warn if no classes are registered
  useEffect(() => {
    if (classes && classes.length === 0) {
      setModal({
        title: 'Atenção',
        message: 'Você ainda não possui turmas cadastradas. É necessário cadastrar as turmas antes de definir a carga horária das disciplinas.',
        type: 'info',
        confirmLabel: 'Ir para Turmas',
        cancelLabel: 'Continuar assim mesmo',
        onConfirm: () => navigate('/classes'),
        onCancel: close
      });
      open();
    }
  }, [classes.length]); // Only trigger when length changes to 0

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjects: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "subjects",
  });

  // Populate form with existing subjects
  useEffect(() => {
    if (subjects) {
      const formattedSubjects = subjects.map(s => ({
        id: s.id,
        name: s.name,
        aulas_por_turma: s.aulas_por_turma || {},
        knowledge_area_id: s.knowledge_area_id || "",
      }));
      // Use reset to set these as the new default values, making the form pristine
      form.reset({ subjects: formattedSubjects });
    }
  }, [subjects, form]);

  // Track form changes
  const { isDirty } = form.formState;
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty, setHasUnsavedChanges]);

  const classColumns = useMemo(() => classes.sort((a, b) => a.name.localeCompare(b.name)), [classes]);

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) {
      toast.error("O nome da disciplina não pode estar vazio.");
      return;
    }
    if (fields.some(field => field.name.toLowerCase() === newSubjectName.trim().toLowerCase())) {
      toast.error("Essa disciplina já existe.");
      return;
    }
    append({
      id: `new-${Date.now()}`,
      name: newSubjectName.trim(),
      aulas_por_turma: {},
      knowledge_area_id: "",
    });
    setNewSubjectName("");


    // Scroll to bottom to show new subject
    setTimeout(() => {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTo({
          top: tableContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleImportFromMatrix = async () => {
    if (!selectedMatrixId) return;

    const matrix = curriculumMatrices.find(m => m.id === selectedMatrixId);
    if (!matrix) return;

    setIsImportModalOpen(false); // Close modal immediately to show progress/loading if we had one, or just to clear UI

    try {
      // 1. Identify and Create Missing Knowledge Areas
      const matrixAreas = new Set(matrix.components.map(c => c.knowledge_area).filter(Boolean));
      const existingAreaNames = new Set(knowledgeAreas.map(k => k.name.toLowerCase()));
      const newAreasToCreate: KnowledgeArea[] = [];

      matrixAreas.forEach(areaName => {
        if (!existingAreaNames.has(areaName.toLowerCase())) {
          // Assign a random color or default
          const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#f97316', '#06b6d4'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];

          newAreasToCreate.push({
            id: `new-${Date.now()}-${Math.random()}`,
            name: areaName,
            color: randomColor
          });
        }
      });

      let currentKnowledgeAreas = [...knowledgeAreas];

      if (newAreasToCreate.length > 0) {
        toast.info(`Criando ${newAreasToCreate.length} novas áreas de conhecimento...`);

        // Save all areas (existing + new) to avoid overwriting
        const allAreasToSave = [...knowledgeAreas, ...newAreasToCreate];
        const result = await saveKnowledgeAreas(allAreasToSave);
        currentKnowledgeAreas = result;
      }

      // 2. Import Subjects
      const newSubjects = [...fields];
      let addedCount = 0;

      matrix.components.forEach(comp => {
        const exists = newSubjects.some(s => s.name.toLowerCase() === comp.component_name.toLowerCase());
        if (!exists) {
          const aulasPorTurma: Record<string, number> = {};

          classes.forEach(classItem => {
            const classNameParts = classItem.name.split(' - ');
            const seriesName = classNameParts[0]?.trim().toLowerCase();

            let weeklyHours = 0;
            if (seriesName?.includes('1ª') || seriesName?.includes('1')) {
              weeklyHours = comp.weekly_hours_1st;
            } else if (seriesName?.includes('2ª') || seriesName?.includes('2')) {
              weeklyHours = comp.weekly_hours_2nd;
            } else if (seriesName?.includes('3ª') || seriesName?.includes('3')) {
              weeklyHours = comp.weekly_hours_3rd;
            }

            if (weeklyHours > 0) {
              aulasPorTurma[classItem.id] = weeklyHours;
            }
          });

          // Find area ID in the (potentially updated) list
          const mappedArea = currentKnowledgeAreas.find(k => k.name.toLowerCase() === comp.knowledge_area.toLowerCase());

          newSubjects.push({
            id: `new-${Date.now()}-${Math.random()}`,
            name: comp.component_name,
            aulas_por_turma: aulasPorTurma,
            knowledge_area_id: mappedArea ? mappedArea.id : "",
          });
          addedCount++;
        }
      });

      if (addedCount > 0) {
        form.setValue("subjects", newSubjects, { shouldDirty: true });
        setModal({
          title: 'Importação Concluída',
          message: `${addedCount} disciplina${addedCount > 1 ? 's' : ''} importada${addedCount > 1 ? 's' : ''} com sucesso!`,
          type: 'success',
        });
        open();
      } else {
        toast.info('Todas as disciplinas desta matriz já estão cadastradas.');
      }

    } catch (error) {
      console.error("Erro na importação:", error);
      toast.error("Erro ao importar dados da matriz.");
    }

    setSelectedMatrixId("");
  };

  const handleDeleteSubject = async (subjectId: string, index: number) => {
    console.log('[SubjectsManagement] handleDeleteSubject called:', { subjectId, index });

    try {
      if (!subjectId.startsWith('new-')) {
        console.log('[SubjectsManagement] Calling deleteSubjectFromContext for:', subjectId);
        await deleteSubjectFromContext(subjectId);
        console.log('[SubjectsManagement] deleteSubjectFromContext completed');
      } else {
        console.log('[SubjectsManagement] Skipping DB delete for new subject:', subjectId);
      }

      console.log('[SubjectsManagement] Removing subject from form at index:', index);
      remove(index);
      console.log('[SubjectsManagement] Subject removed from form');

      // Don't show toast here as DataContext already shows it
    } catch (error) {
      console.error("[SubjectsManagement] Error in handleDeleteSubject:", error);
      toast.error("Erro ao excluir disciplina. Verifique o console para detalhes.");
    }
  };

  const handleClearAllSubjects = async () => {
    console.log('[SubjectsManagement] handleClearAllSubjects called');

    try {
      const idsToDelete = fields
        .filter(field => !field.id.startsWith('new-'))
        .map(field => field.id);

      if (idsToDelete.length > 0) {
        console.log(`[SubjectsManagement] Deleting ${idsToDelete.length} subjects from database`);
        await deleteSubjects(idsToDelete);
      }

      console.log('[SubjectsManagement] All subjects deleted from database');

      // Reset handled by useEffect reacting to subjects change
      // form.reset({ subjects: [] });

      setModal({
        title: 'Sucesso',
        message: 'Todas as disciplinas foram removidas!',
        type: 'success',
      });
      open();
    } catch (error) {
      console.error('[SubjectsManagement] Error in handleClearAllSubjects:', error);
      toast.error('Erro ao excluir disciplinas. Verifique o console.');
    }
  };

  const handleSmartFill = (subjectIndex: number) => {
    const subject = form.getValues(`subjects.${subjectIndex}`);
    const aulasPorTurma = subject.aulas_por_turma || {};
    const firstValue = Object.values(aulasPorTurma).find(v => v && v > 0);

    if (!firstValue) {
      setModal({
        title: 'Atenção',
        message: 'Preencha pelo menos uma célula antes de usar o preenchimento rápido.',
        type: 'info',
        confirmLabel: 'Ok',
      });
      open();
      return;
    }

    const newAulasPorTurma: Record<string, number> = {};
    classColumns.forEach(c => {
      newAulasPorTurma[c.id] = firstValue;
    });

    form.setValue(`subjects.${subjectIndex}.aulas_por_turma`, newAulasPorTurma, { shouldDirty: true });

    // Clear invalid cells for this row since we filled them
    setInvalidCells(prev => {
      const next = new Set(prev);
      classColumns.forEach(c => next.delete(`${subjectIndex}-${c.id}`));
      return next;
    });
  };

  const performSave = async (validSubjects: Subject[]) => {
    try {
      await saveSubjects(validSubjects);

      setModal({
        title: 'Sucesso',
        message: 'Disciplinas salvas com sucesso!',
        type: 'success',
      });
      open();
      form.reset({ subjects: validSubjects });

    } catch (error: any) {
      console.error("Erro ao salvar disciplinas:", error);
      let errorMessage = "Ocorreu um erro ao salvar as disciplinas.";
      let errorDetails = error?.message || "Erro desconhecido";

      setModal({
        title: errorMessage,
        message: errorDetails,
        type: 'error',
      });
      open();
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = async (data: FormSchema) => {
    console.log("onSubmit called", data);
    setIsSaving(true);
    setInvalidCells(new Set()); // Clear previous errors

    try {
      // Validation: Check for undefined lesson counts and missing knowledge areas
      const missingData: string[] = [];
      const newInvalidCells = new Set<string>();

      // First pass: Identify errors in ALL subjects (even if we filter them later for saving)
      data.subjects.forEach((subject, index) => {
        if (!subject.name || subject.name.trim() === "") return; // Skip empty rows

        const missingClassesForSubject: string[] = [];

        // Check Knowledge Area
        if (!subject.knowledge_area_id) {
          missingClassesForSubject.push("Área de Conhecimento");
          newInvalidCells.add(`${index}-knowledge_area`);
        }

        classes.forEach(classItem => {
          const val = subject.aulas_por_turma?.[classItem.id];
          // We consider undefined, null, NaN, or < 1 as invalid.
          if (val === undefined || val === null || isNaN(val) || val < 1) {
            missingClassesForSubject.push(classItem.name);
            newInvalidCells.add(`${index}-${classItem.id}`);
          }
        });

        if (missingClassesForSubject.length > 0) {
          missingData.push(`- **${subject.name}**: ${missingClassesForSubject.join(", ")}`);
        }
      });

      if (missingData.length > 0) {
        setInvalidCells(newInvalidCells);
        setModal({
          title: 'Dados Incompletos',
          message: (
            <div className="space-y-2">
              <p>As seguintes disciplinas possuem pendências:</p>
              <div className="max-h-[200px] overflow-y-auto bg-slate-900/50 p-3 rounded text-sm text-slate-300">
                {missingData.map((item, idx) => (
                  <div key={idx} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">Os campos inválidos foram destacados em vermelho. Por favor, preencha todos os campos obrigatórios.</p>
            </div>
          ),
          type: 'error',
          confirmLabel: 'Entendi',
        });
        open();
        setIsSaving(false);
        return;
      }

      const validSubjects = data.subjects
        .filter(subject => subject.name && subject.name.trim() !== "")
        .map(subject => {
          const newAulas: Record<string, number> = {};
          for (const classId in subject.aulas_por_turma) {
            const value = subject.aulas_por_turma[classId];
            if (value !== undefined && value !== null && !isNaN(value)) {
              newAulas[classId] = value;
            }
          }
          return { ...subject, aulas_por_turma: newAulas };
        });

      // Check for workload divergences
      const divergentClasses: string[] = [];
      classes.forEach(c => {
        const total = totalAulasPorTurma[c.id] || 0;
        const limit = (c.aulasDiarias || 0) * 5;
        if (total !== limit) {
          divergentClasses.push(`${c.name} (${total}/${limit})`);
        }
      });

      if (divergentClasses.length > 0) {
        setModal({
          title: 'Divergência de Carga Horária',
          message: (
            <div className="space-y-2">
              <p>As seguintes turmas não atingiram a carga horária total esperada:</p>
              <div className="max-h-[200px] overflow-y-auto bg-slate-900/50 p-3 rounded text-sm text-slate-300">
                <ul className="list-disc list-inside">
                  {divergentClasses.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-slate-400 mt-2">Deseja salvar mesmo com essas divergências?</p>
            </div>
          ),
          type: 'confirm',
          confirmLabel: 'Salvar mesmo assim',
          cancelLabel: 'Revisar',
          onConfirm: () => performSave(validSubjects),
          onCancel: () => {
            close();
            setIsSaving(false);
          }
        });
        open();
        return;
      }

      await performSave(validSubjects);

    } catch (error) {
      console.error("Unexpected error in onSubmit:", error);
      setIsSaving(false);
    }
  };

  const watchedSubjects = useWatch({
    control: form.control,
    name: "subjects",
  });

  const totalAulasPorTurma = useMemo(() => {
    const totals: Record<string, number> = {};
    classColumns.forEach(c => {
      totals[c.id] = 0;
    });

    if (watchedSubjects) {
      watchedSubjects.forEach(subject => {
        if (subject && subject.aulas_por_turma) {
          classColumns.forEach(c => {
            const val = subject.aulas_por_turma?.[c.id];
            totals[c.id] += val ? Number(val) : 0;
          });
        }
      });
    }
    return totals;
  }, [classColumns, watchedSubjects]);

  // Scroll functions
  const scroll = (x: number, y: number) => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: x, top: y, behavior: 'smooth' });
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

      <ManageKnowledgeAreasModal
        isOpen={isKnowledgeAreasModalOpen}
        onClose={() => setIsKnowledgeAreasModalOpen(false)}
      />

      {/* Main Container - Full Height */}
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-950 overflow-hidden">

        {/* 1. Fixed Toolbar */}
        <div className="flex-none p-4 bg-slate-900 border-b border-slate-800 shadow-md z-30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/30 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">Gerenciamento de Disciplinas</h1>
                <p className="text-slate-400 text-sm">Configure a grade curricular</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Quick Add Input */}
              <div className="flex items-center gap-2 flex-1 md:w-64">
                <Input
                  placeholder="Nova disciplina..."
                  value={newSubjectName}
                  onChange={e => setNewSubjectName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddSubject()}
                  className="bg-slate-950 border-slate-700 h-9"
                />
                <Button size="sm" variant="secondary" onClick={handleAddSubject}>
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>

              <div className="h-6 w-px bg-slate-700 mx-2 hidden md:block" />

              <Button size="sm" variant="outline" onClick={() => navigate("/curriculum-matrix")}>
                <LayoutGrid className="mr-2 h-4 w-4" />
                Matriz
              </Button>

              <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                    <Download className="mr-2 h-4 w-4" />
                    Importar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Importar Disciplinas</DialogTitle>
                    <DialogDescription>Selecione uma matriz curricular.</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Select value={selectedMatrixId} onValueChange={setSelectedMatrixId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma matriz" />
                      </SelectTrigger>
                      <SelectContent>
                        {curriculumMatrices.map(matrix => (
                          <SelectItem key={matrix.id} value={matrix.id}>{matrix.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleImportFromMatrix} disabled={!selectedMatrixId}>Importar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive" disabled={fields.length === 0}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Tudo?</AlertDialogTitle>
                    <AlertDialogDescription>Esta ação removerá todas as disciplinas.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAllSubjects} className="bg-destructive">Excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                size="sm"
                onClick={form.handleSubmit(onSubmit, (errors) => {
                  console.error("Form validation errors:", errors);
                  toast.error("Existem erros no formulário. Verifique os campos em vermelho.");
                })}
                disabled={isSaving}
                className="min-w-[100px]"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>

        {/* 2. Table Area with Custom Scroll Navigation */}
        <div className="flex-1 relative overflow-hidden group">

          {/* Scroll Buttons */}
          <Button
            variant="ghost"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-slate-800/80 backdrop-blur text-white p-2 rounded-full shadow-lg hover:bg-blue-600 border border-slate-700 h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll(-300, 0)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-slate-800/80 backdrop-blur text-white p-2 rounded-full shadow-lg hover:bg-blue-600 border border-slate-700 h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll(300, 0)}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-slate-800/80 backdrop-blur text-white p-2 rounded-full shadow-lg hover:bg-blue-600 border border-slate-700 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll(0, -200)}
          >
            <ChevronUp className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-800/80 backdrop-blur text-white p-2 rounded-full shadow-lg hover:bg-blue-600 border border-slate-700 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll(0, 200)}
          >
            <ChevronDown className="h-5 w-5" />
          </Button>

          {/* Scrollable Table Container */}
          <Form {...form}>
            <form className="h-full">
              <div
                ref={tableContainerRef}
                className="h-full w-full overflow-auto scrollbar-hide bg-slate-950"
              >
                <table className="w-full border-collapse min-w-max">
                  <thead className="sticky top-0 z-40 bg-slate-900 shadow-sm">
                    <tr>
                      <th className="sticky left-0 z-50 bg-slate-900 border border-slate-800 p-3 text-left font-semibold shadow-[2px_0_5px_rgba(0,0,0,0.3)] min-w-[250px] text-slate-200">
                        Disciplina
                      </th>
                      <th className="sticky left-[250px] z-50 bg-slate-900 border border-slate-800 p-3 text-left font-semibold shadow-[2px_0_5px_rgba(0,0,0,0.3)] min-w-[200px] text-slate-200">
                        <div className="flex items-center justify-between">
                          Área de Conhecimento
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-400 hover:text-white"
                            onClick={() => setIsKnowledgeAreasModalOpen(true)}
                            title="Gerenciar Áreas"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </th>
                      {classColumns.map(c => {
                        const total = totalAulasPorTurma[c.id] || 0;
                        const limit = (c.aulasDiarias || 0) * 5;
                        const isCorrect = total === limit;

                        return (
                          <th
                            key={c.id}
                            className={cn(
                              "border border-slate-800 p-3 text-center font-semibold min-w-[100px] transition-colors",
                              isCorrect ? 'bg-emerald-900/20 text-emerald-200' : 'bg-red-900/20 text-red-200'
                            )}
                          >
                            <div className="font-bold text-sm">{c.name}</div>
                            <div className={cn("text-xs font-normal mt-1", isCorrect ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold')}>
                              {total} / {limit}
                            </div>
                          </th>
                        );
                      })}
                      <th className="border border-slate-800 p-3 text-center font-semibold w-[80px] bg-slate-900 text-slate-300">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {fields.map((field, index) => (
                      <tr key={field.id} className="hover:bg-slate-900/50 transition-colors group/row">
                        <td className="sticky left-0 z-30 bg-slate-950 border border-slate-800 p-0 shadow-[2px_0_5px_rgba(0,0,0,0.1)] align-middle group-hover/row:bg-slate-900">
                          <div className="flex items-center justify-between h-full w-full">
                            <Controller
                              control={form.control}
                              name={`subjects.${index}.name`}
                              render={({ field: controllerField }) => (
                                <Input
                                  {...controllerField}
                                  className="flex-1 h-10 bg-transparent border-0 focus:bg-blue-900/20 outline-none ring-0 focus-visible:ring-0 font-medium px-3 rounded-none text-slate-200 placeholder:text-slate-600"
                                  placeholder="Nome da disciplina"
                                />
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-10 w-8 shrink-0 text-slate-500 hover:text-emerald-400 hover:bg-emerald-900/20 rounded-none"
                              onClick={() => handleSmartFill(index)}
                              title="Replicar valor para todas as turmas"
                            >
                              <ChevronsRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>

                        <td className="sticky left-[250px] z-30 bg-slate-950 border border-slate-800 p-0 shadow-[2px_0_5px_rgba(0,0,0,0.1)] align-middle group-hover/row:bg-slate-900">
                          <Controller
                            control={form.control}
                            name={`subjects.${index}.knowledge_area_id`}
                            render={({ field: controllerField }) => (
                              <div className={cn(
                                "h-full w-full",
                                invalidCells.has(`${index}-knowledge_area`) && "ring-2 ring-inset ring-red-500"
                              )}>
                                <Select
                                  value={controllerField.value}
                                  onValueChange={controllerField.onChange}
                                >
                                  <SelectTrigger className="w-full h-10 border-0 bg-transparent rounded-none focus:ring-0 focus:bg-blue-900/20">
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {knowledgeAreas.map(area => (
                                      <SelectItem key={area.id} value={area.id}>
                                        <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: area.color }} />
                                          {area.name}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          />
                        </td>

                        {classColumns.map(c => {
                          const isInvalid = invalidCells.has(`${index}-${c.id}`);
                          return (
                            <td
                              key={c.id}
                              className={cn(
                                "border border-slate-800 p-0 bg-slate-950/50 transition-colors",
                                isInvalid && "bg-red-900/20 border-red-500/50"
                              )}
                            >
                              <Controller
                                control={form.control}
                                name={`subjects.${index}.aulas_por_turma.${c.id}`}
                                render={({ field: controllerField }) => (
                                  <Input
                                    type="number"
                                    min="1"
                                    {...controllerField}
                                    value={controllerField.value ?? ''}
                                    onChange={e => {
                                      const val = e.target.value;
                                      const num = val === '' ? undefined : parseInt(val, 10);
                                      controllerField.onChange(num);

                                      // Clear invalid state for this cell on change
                                      if (invalidCells.has(`${index}-${c.id}`)) {
                                        setInvalidCells(prev => {
                                          const next = new Set(prev);
                                          next.delete(`${index}-${c.id}`);
                                          return next;
                                        });
                                      }
                                    }}
                                    className={cn(
                                      "w-full h-10 bg-transparent text-center focus:bg-blue-900/20 outline-none border-0 ring-0 focus-visible:ring-0 text-slate-300 no-spinner",
                                      isInvalid && "text-red-400 font-bold"
                                    )}
                                  />
                                )}
                              />
                            </td>
                          );
                        })}

                        <td className="border border-slate-800 p-0 text-center bg-slate-950/50">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-full hover:bg-red-900/20 text-slate-600 hover:text-red-400 rounded-none">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir disciplina?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  "{field.name}" será removida permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteSubject(field.id, index)} className="bg-destructive">
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))}

                    {/* Empty State */}
                    {fields.length === 0 && (
                      <tr>
                        <td colSpan={classColumns.length + 3} className="p-12 text-center text-slate-500">
                          <div className="flex flex-col items-center gap-3">
                            <BookOpen className="h-12 w-12 opacity-20" />
                            <p>Nenhuma disciplina cadastrada.</p>
                            <p className="text-sm">Use a barra superior para adicionar ou importar.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
