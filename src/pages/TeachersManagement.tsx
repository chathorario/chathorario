import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/DataContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UserPlus, Trash2, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const teacherSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  subjects: z.string().min(1, "Informe pelo menos uma disciplina"),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

import { Header } from "@/components/layout/Header";

export default function TeachersManagement() {
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useData();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: "",
      subjects: "",
    },
  });

  const onSubmit = (data: TeacherFormData) => {
    const subjectsArray = data.subjects.split(",").map((s) => s.trim());
    
    if (editingId) {
      updateTeacher(editingId, {
        id: editingId,
        name: data.name,
        subjects: subjectsArray,
      });
      toast.success("Professor atualizado com sucesso!");
      setEditingId(null);
    } else {
      addTeacher({
        id: Date.now().toString(),
        name: data.name,
        subjects: subjectsArray,
      });
      toast.success("Professor adicionado com sucesso!");
    }
    
    form.reset();
  };

  const handleEdit = (id: string) => {
    const teacher = teachers.find((t) => t.id === id);
    if (teacher) {
      form.setValue("name", teacher.name);
      form.setValue("subjects", teacher.subjects.join(", "));
      setEditingId(id);
    }
  };

  const handleDelete = (id: string) => {
    deleteTeacher(id);
    toast.success("Professor removido com sucesso!");
    if (editingId === id) {
      setEditingId(null);
      form.reset();
    }
  };

  return (
    <>
      <Header />
      <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" />
            <CardTitle>Gerenciar Professores</CardTitle>
          </div>
          <CardDescription>
            Adicione professores e suas disciplinas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Professor</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Maria Santos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subjects"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disciplinas (separadas por vírgula)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Matemática, Física" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {editingId ? "Atualizar Professor" : "Adicionar Professor"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEditingId(null);
                    form.reset();
                  }}
                >
                  Cancelar Edição
                </Button>
              )}
            </form>
          </Form>

          {teachers.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Professores Cadastrados</h3>
              <div className="space-y-3">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-start justify-between p-4 border rounded-lg bg-card"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{teacher.name}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {teacher.subjects.map((subject, idx) => (
                          <Badge key={idx} variant="secondary">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(teacher.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(teacher.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            {/* Voltar para o Dashboard atual da escola, removendo rota legada */}
            <Button variant="outline" onClick={() => navigate("/escola")} className="flex-1">
              Voltar
            </Button>
            <Button onClick={() => navigate("/subjects")} className="flex-1">
              Próximo: Disciplinas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
