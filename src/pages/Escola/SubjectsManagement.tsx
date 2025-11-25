import { useState, useMemo, useEffect } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useData, type Subject } from "@/context/DataContext";
import { toast } from "sonner";
import { BookOpen, Trash2, PlusCircle, Save, AlertTriangle } from "lucide-react";
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

const subjectSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Nome da disciplina é obrigatório"),
  aulas_por_turma: z.record(z.coerce.number().min(0).optional()),
});

const formSchema = z.object({
  subjects: z.array(subjectSchema),
});

type FormSchema = z.infer<typeof formSchema>;

export default function SubjectsManagement() {
  const { subjects, classes, saveSubjects, deleteSubject: deleteSubjectFromContext } = useData();
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjects: [],
    },
    mode: "onChange", // Ensure validation and watching happens on change
  });

  // Reset form when subjects data loads
  useEffect(() => {
    if (subjects && subjects.length > 0) {
      // Only reset if the form is empty or we want to sync (be careful not to overwrite user edits if we want real-time sync)
      // For now, we assume we load once.
      // To avoid infinite loops or overwriting edits, we can check if form is dirty.
      // But here we want to load initial state.
      if (!form.formState.isDirty) {
         form.reset({ subjects });
      }
    }
  }, [subjects, form.reset]); // Removed form.formState.isDirty from deps to avoid loop, handled inside

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subjects",
    keyName: "formId",
  });

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
    });
    setNewSubjectName("");
  };

  const handleDeleteSubject = async (subjectId: string, index: number) => {
    if (!subjectId.startsWith('new-')) {
      await deleteSubjectFromContext(subjectId);
    }
    remove(index);
    toast.success("Disciplina removida com sucesso!");
  };

  const onSubmit = async (data: FormSchema) => {
    setIsSaving(true);
    try {
      const validSubjects = data.subjects
        .filter(subject => subject.name && subject.name.trim() !== "")
        .map(subject => {
          const newAulas: Record<string, number> = {};
          for (const classId in subject.aulas_por_turma) {
            const value = subject.aulas_por_turma[classId];
            // Ensure we save 0 if explicitly set to 0, but maybe skip undefined
            if (value !== undefined && value !== null && !isNaN(value)) {
              newAulas[classId] = value;
            }
          }
          return { ...subject, aulas_por_turma: newAulas };
        });

      await saveSubjects(validSubjects as Subject[]);
      toast.success("Disciplinas salvas com sucesso!");
      // Optionally reset dirty state
      form.reset({ subjects: validSubjects });
    } catch (error) {
      toast.error("Erro ao salvar as disciplinas.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Use useWatch for better performance and accurate updates
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

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <CardTitle>Gerenciamento de Disciplinas</CardTitle>
            </div>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
          <CardDescription>
            Adicione, remova e configure a quantidade de aulas semanais para cada disciplina em cada turma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form>
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px] min-w-[200px]">Disciplina</TableHead>
                      {classColumns.map(c => (
                        <TableHead key={c.id} className="text-center min-w-[100px]">
                          {c.name}
                          <div className={`text-xs font-normal ${
                            totalAulasPorTurma[c.id] > (c.aulasDiarias || 0) * 5 
                            ? 'text-red-500' 
                            : 'text-muted-foreground'
                          }`}>
                            ({totalAulasPorTurma[c.id]} / {(c.aulasDiarias || 0) * 5})
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="w-[80px] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.formId}>
                        <TableCell>
                          <Controller
                            control={form.control}
                            name={`subjects.${index}.name`}
                            render={({ field: controllerField }) => (
                              <Input {...controllerField} className="font-medium" />
                            )}
                          />
                        </TableCell>
                        {classColumns.map(c => (
                          <TableCell key={c.id}>
                            <Controller
                              control={form.control}
                              name={`subjects.${index}.aulas_por_turma.${c.id}`}
                              render={({ field: controllerField }) => (
                                <Input
                                  type="number"
                                  min="0"
                                  {...controllerField}
                                  value={controllerField.value ?? ''}
                                  onChange={e => {
                                    const val = e.target.value;
                                    const num = val === '' ? undefined : parseInt(val, 10);
                                    controllerField.onChange(num);
                                  }}
                                  className="text-center"
                                />
                              )}
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a disciplina "{field.name}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteSubject(field.id, index)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </form>
          </Form>
          <div className="flex items-center gap-2 mt-4 p-4 border rounded-md">
            <Input
              placeholder="Nova disciplina"
              value={newSubjectName}
              onChange={e => setNewSubjectName(e.target.value)}
              className="flex-grow"
            />
            <Button type="button" variant="outline" onClick={handleAddSubject}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Disciplina
            </Button>
          </div>
          <div className="mt-4 p-4 border rounded-md bg-muted/50">
            <h4 className="font-semibold mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
              Resumo de Aulas Semanais por Turma
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 text-sm">
              {classColumns.map(c => {
                const total = totalAulasPorTurma[c.id];
                const max = (c.aulasDiarias || 0) * 5;
                const isOver = total > max;
                return (
                  <div key={c.id} className={`p-2 rounded ${isOver ? 'bg-red-100 dark:bg-red-900/30' : ''}`}>
                    <p className="font-semibold">{c.name}</p>
                    <p className={isOver ? 'text-red-600 dark:text-red-400 font-bold' : 'text-muted-foreground'}>
                      {total} / {max} aulas
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
