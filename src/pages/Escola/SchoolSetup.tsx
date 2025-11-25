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
import { School } from "lucide-react";

const schoolSchema = z.object({
  schoolName: z.string().min(3, "Nome da escola deve ter pelo menos 3 caracteres"),
});

type SchoolFormData = z.infer<typeof schoolSchema>;


export default function SchoolSetup() {
  const { schoolName, setSchoolName } = useData();
  const navigate = useNavigate();

  const form = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      schoolName: schoolName || "",
    },
  });

  const onSubmit = (data: SchoolFormData) => {
    setSchoolName(data.schoolName);
    toast.success("Escola configurada com sucesso!");
    navigate("/teachers");
  };

  return (
    <>
  <div className="container max-w-7xl mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <School className="h-6 w-6 text-primary" />
            <CardTitle>Configurar Escola</CardTitle>
          </div>
          <CardDescription>
            Informe o nome da sua escola para começar
          </CardDescription>
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
                <Button type="submit" className="flex-1">
                  Salvar e Continuar
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
