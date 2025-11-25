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
import { Clock } from "lucide-react";

const workloadSchema = z.object({
  workloads: z.record(z.string(), z.number().min(1, "Deve ter pelo menos 1 hora").max(40, "Máximo 40 horas")),
});

type WorkloadFormData = z.infer<typeof workloadSchema>;

import { Header } from "@/components/layout/Header";

export default function WorkloadManagement() {
  const { classes, workload, setWorkload } = useData();
  const navigate = useNavigate();

  const form = useForm<WorkloadFormData>({
    resolver: zodResolver(workloadSchema),
    defaultValues: {
      workloads: classes.reduce((acc, c) => {
        acc[c.name] = workload[c.name] || 25;
        return acc;
      }, {} as Record<string, number>),
    },
  });

  const onSubmit = (data: WorkloadFormData) => {
    setWorkload(data.workloads);
    toast.success("Carga horária configurada com sucesso!");
    // Redireciona para o dashboard da escola para evitar uso de rota legada
    navigate("/escola");
  };

  if (classes.length === 0) {
    return (
      <>
        <Header />
        <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Nenhuma turma cadastrada</CardTitle>
            <CardDescription>
              Você precisa cadastrar turmas antes de definir a carga horária
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/classes")}>
              Ir para Cadastro de Turmas
            </Button>
          </CardContent>
        </Card>
      </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            <CardTitle>Definir Carga Horária</CardTitle>
          </div>
          <CardDescription>
            Configure a carga horária semanal para cada turma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {classes.map((classItem) => (
                  <FormField
                    key={classItem.id}
                    control={form.control}
                    name={`workloads.${classItem.name}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{classItem.name} ({classItem.shift})</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="25"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              horas/semana
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate("/classes")} className="flex-1">
                  Voltar
                </Button>
                <Button type="submit" className="flex-1">
                  Finalizar e Ir para Dashboard
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
