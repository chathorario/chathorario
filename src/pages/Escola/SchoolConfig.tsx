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
import { School, Users, BookOpen, CalendarClock } from "lucide-react";

const schoolSchema = z.object({
  schoolName: z.string().min(3, "Nome da escola deve ter pelo menos 3 caracteres"),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

export default function SchoolConfig() {
  const { schoolName, setSchoolName, teachers, subjects, classes, workload } = useData();
  const navigate = useNavigate();

  const form = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      schoolName: schoolName || "",
    },
  });

  const onSubmit = (data: SchoolFormData) => {
    setSchoolName(data.schoolName);
    toast.success("Configurações da escola salvas!");
  };

  const totalTeachers = teachers.length;
  const totalSubjects = subjects.length;
  const totalClasses = classes.length;
  const configuredWorkloads = Object.keys(workload).length;

  return (
    <>
      <div className="w-full px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Escola</CardTitle>
              <CardDescription>Nome configurado</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2">
                <School className="h-5 w-5 text-primary" />
                <span className="font-medium truncate">{schoolName || "Não definido"}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Professores</CardTitle>
              <CardDescription>Total cadastrados</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-xl font-semibold">{totalTeachers}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Disciplinas</CardTitle>
              <CardDescription>Total cadastradas</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-xl font-semibold">{totalSubjects}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Turmas</CardTitle>
              <CardDescription>Com cargas definidas</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              <span className="text-xl font-semibold">{configuredWorkloads}/{totalClasses}</span>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <School className="h-6 w-6 text-primary" />
              <CardTitle>Configurações da Escola</CardTitle>
            </div>
            <CardDescription>Atualize informações gerais e acesse os cadastros</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Escola</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Escola Municipal João Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">Salvar</Button>
                </div>
              </form>
            </Form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Cadastros</CardTitle>
                  <CardDescription>Acesse os módulos de cadastro</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => navigate("/teachers")}>Professores</Button>
                  <Button variant="outline" onClick={() => navigate("/subjects")}>Disciplinas</Button>
                  <Button variant="outline" onClick={() => navigate("/classes")}>Turmas</Button>
                  <Button variant="outline" onClick={() => navigate("/workload")}>Carga Horária</Button>
                  <Button variant="outline" onClick={() => navigate("/curriculum-matrix")}>Matriz Curricular</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Resumo</CardTitle>
                  <CardDescription>Visão geral dos cadastros</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li>Professores cadastrados: <span className="font-medium">{totalTeachers}</span></li>
                    <li>Disciplinas cadastradas: <span className="font-medium">{totalSubjects}</span></li>
                    <li>Turmas cadastradas: <span className="font-medium">{totalClasses}</span></li>
                    <li>Turmas com carga definida: <span className="font-medium">{configuredWorkloads}</span></li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}