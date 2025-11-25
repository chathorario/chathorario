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
import { BookOpen, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const subjectSchema = z.object({
  subject: z.string().min(2, "Nome da disciplina deve ter pelo menos 2 caracteres"),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

import { Header } from "@/components/layout/Header";

export default function SubjectsManagement() {
  const { subjects, addSubject, deleteSubject } = useData();
  const navigate = useNavigate();

  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      subject: "",
    },
  });

  const onSubmit = (data: SubjectFormData) => {
    if (subjects.includes(data.subject)) {
      toast.error("Esta disciplina já foi adicionada!");
      return;
    }
    
    addSubject(data.subject);
    toast.success("Disciplina adicionada com sucesso!");
    form.reset();
  };

  const handleDelete = (subject: string) => {
    deleteSubject(subject);
    toast.success("Disciplina removida com sucesso!");
  };

  return (
    <>
      <Header />
      <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <CardTitle>Gerenciar Disciplinas</CardTitle>
          </div>
          <CardDescription>
            Defina as disciplinas oferecidas pela escola
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Disciplina</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Matemática" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Adicionar Disciplina
              </Button>
            </form>
          </Form>

          {subjects.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Disciplinas Cadastradas</h3>
              <div className="flex flex-wrap gap-3">
                {subjects.map((subject, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-card"
                  >
                    <span>{subject}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleDelete(subject)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={() => navigate("/teachers")} className="flex-1">
              Voltar
            </Button>
            <Button onClick={() => navigate("/classes")} className="flex-1">
              Próximo: Turmas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
