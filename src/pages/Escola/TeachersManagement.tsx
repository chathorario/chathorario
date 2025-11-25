import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";


const teacherSchema = z.object({
  teachers: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, "Nome é obrigatório"),
      workload_total: z.number().min(0).optional(),
      planning_hours: z.number().min(0).optional(),
      activity_hours: z.number().min(0).optional(),
      selected: z.boolean().optional(),
    })
  ),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

export default function TeachersManagement() {
  const { teachers: contextTeachers, saveTeachers, deleteTeacher } = useData();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);


  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      teachers: [],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "teachers",
  });

  // Load initial data
  useEffect(() => {
    if (contextTeachers.length > 0 && fields.length === 0) {
      form.reset({
        teachers: contextTeachers.map((t) => ({
          id: t.id,
          name: t.name,
          workload_total: t.workload_total || 0,
          planning_hours: t.planning_hours || 0,
          activity_hours: t.activity_hours || 0,
          selected: false,
        })),
      });
    } else if (contextTeachers.length === 0 && fields.length === 0) {
      // Start with one empty row if no teachers exist
      // append({ id: `new-${Date.now()}`, name: "", workload_total: 0, planning_hours: 0, activity_hours: 0, selected: false });
    }
  }, [contextTeachers, form, fields.length]);

  const handleAddTeacher = () => {
    append({
      id: `new-${Date.now()}`,
      name: "",
      workload_total: 0,
      planning_hours: 0,
      activity_hours: 0,
      selected: false,
    });
  };

  const handleDeleteSelected = async () => {
    const currentTeachers = form.getValues("teachers");
    const selectedTeachers = currentTeachers.filter(t => t.selected);

    if (selectedTeachers.length === 0) {
      toast.warning("Selecione pelo menos um professor para excluir.");
      return;
    }

    if (confirm(`Tem certeza que deseja excluir ${selectedTeachers.length} professor(es)?`)) {
      // Delete existing teachers from DB
      for (const teacher of selectedTeachers) {
        if (!teacher.id.startsWith('new-')) {
          await deleteTeacher(teacher.id);
        }
      }

      // Remove from UI
      const indexesToRemove = currentTeachers
        .map((t, index) => (t.selected ? index : -1))
        .filter((index) => index !== -1)
        .sort((a, b) => b - a);

      remove(indexesToRemove);
      toast.success(`${selectedTeachers.length} professor(es) removido(s).`);
    }
  };

  const onSubmit = async (data: TeacherFormData) => {
    setIsSaving(true);
    try {
      // Filter out empty rows if needed, or validate
      const validTeachers = data.teachers.filter(t => t.name.trim() !== "");

      // Convert back to context Teacher type (excluding 'selected')
      const teachersToSave = validTeachers.map(t => ({
        id: t.id,
        name: t.name,
        subjects: [], // Subjects are not managed here anymore based on the new design
        workload_total: t.workload_total,
        planning_hours: t.planning_hours,
        activity_hours: t.activity_hours,
      }));

      await saveTeachers(teachersToSave);
      toast.success("Professores salvos com sucesso!");
      // Optionally navigate or stay
      // navigate("/next-step"); 
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar professores.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="container max-w-6xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Cadastro de Professores</h1>
          <p className="text-slate-500 dark:text-slate-400">Adicione os professores e suas horas de planejamento/atividade.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 border-b dark:border-slate-700">
                    <TableHead className="w-[50px] text-center text-slate-700 dark:text-slate-200">Excluir</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-200">Nome do Professor</TableHead>
                    <TableHead className="w-[150px] text-center text-slate-700 dark:text-slate-200">CH Total<br />(Semanal)</TableHead>
                    <TableHead className="w-[150px] text-center text-slate-700 dark:text-slate-200">Aulas Planej.<br />(Semanal)</TableHead>
                    <TableHead className="w-[150px] text-center text-slate-700 dark:text-slate-200">Hora Atividade<br />(Semanal)</TableHead>
                    <TableHead className="w-[120px] text-center text-slate-700 dark:text-slate-200">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id} className="border-b dark:border-slate-700">
                      <TableCell className="text-center">
                        <FormField
                          control={form.control}
                          name={`teachers.${index}.selected`}
                          render={({ field: checkboxField }) => (
                            <Checkbox
                              checked={checkboxField.value}
                              onCheckedChange={checkboxField.onChange}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`teachers.${index}.name`}
                          render={({ field: inputField }) => (
                            <Input
                              {...inputField}
                              placeholder="Nome do Professor"
                              className="uppercase bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-md"
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`teachers.${index}.workload_total`}
                          render={({ field: inputField }) => (
                            <Input
                              type="number"
                              {...inputField}
                              onChange={(e) => inputField.onChange(e.target.valueAsNumber || 0)}
                              className="text-center bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-md"
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`teachers.${index}.planning_hours`}
                          render={({ field: inputField }) => (
                            <Input
                              type="number"
                              {...inputField}
                              onChange={(e) => inputField.onChange(e.target.valueAsNumber || 0)}
                              className="text-center bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-md"
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`teachers.${index}.activity_hours`}
                          render={({ field: inputField }) => (
                            <Input
                              type="number"
                              {...inputField}
                              onChange={(e) => inputField.onChange(e.target.valueAsNumber || 0)}
                              className="text-center bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-md"
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-center">

                      </TableCell>
                    </TableRow>
                  ))}
                  {fields.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum professor cadastrado. Clique em "Adicionar Professor" para começar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleAddTeacher}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Adicionar Professor
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteSelected}
                >
                  Excluir Selecionados
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                  onClick={() => navigate("/subjects")}
                >
                  Voltar (Disciplinas)
                </Button>
                <Button
                  type="button"
                  className="bg-slate-700 hover:bg-slate-600 text-white dark:bg-slate-600 dark:hover:bg-slate-500"
                  onClick={() => navigate("/availability")}
                >
                  Indisponibilidade
                </Button>
              </div>

              <Button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                disabled={isSaving}
              >
                {isSaving ? "Salvando..." : "Salvar Professores e Prosseguir"}
              </Button>
            </div>
          </form>
        </Form>
      </div>


    </>
  );
}
