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
import { toast } from "sonner";
import { Users, Trash2, PlusCircle, Save } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Schema for a single class
const classSchema = z.object({
  id: z.string(), // Using a unique ID for each class
  serie: z.string().min(1, "Série/Ano é obrigatório"),
  identificacao: z.string().min(1, "Identificação é obrigatória"),
  aulasDiarias: z.coerce.number().min(1, "Mínimo 1 aula diária"),
});

// Schema for the form
const formSchema = z.object({
  turmas: z.array(classSchema),
});

type FormSchema = z.infer<typeof formSchema>;

export default function ClassesManagement() {
  const { schoolConfig, classes, saveClasses } = useData();
  const navigate = useNavigate();
  const [selectedSerie, setSelectedSerie] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

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

        return {
          id: c.id,
          serie: serie,
          identificacao: identificacao,
          aulasDiarias: c.aulasDiarias || 5, // Use existing value or default to 5
        };
      });
      form.reset({ turmas: formattedClasses });
    }
  }, [classes, form]);

  useEffect(() => {
    if (seriesOptions.length > 0 && !selectedSerie) {
      setSelectedSerie(seriesOptions[0]);
    }
  }, [seriesOptions, selectedSerie]);

  const handleAddTurma = () => {
    if (!selectedSerie) {
      toast.error("Selecione uma série/ano para adicionar a turma.");
      return;
    }
    append({
      id: `new-${Date.now()}`, // Temporary unique ID
      serie: selectedSerie,
      identificacao: "",
      aulasDiarias: 5, // Default value
    });
  };

  const handleRemoveSelected = () => {
    const indicesToRemove: number[] = [];
    fields.forEach((field, index) => {
      if (selectedRows.has(field.id)) {
        indicesToRemove.push(index);
      }
    });

    remove(indicesToRemove.sort((a, b) => b - a)); // Remove from largest index to smallest
    setSelectedRows(new Set());
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

  const handleToggleAll = () => {
    if (selectedRows.size === fields.length && fields.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(fields.map(f => f.id)));
    }
  };

  const onSubmit = async (data: FormSchema) => {
    if (typeof saveClasses !== 'function') {
      toast.error("Funcionalidade para salvar turmas não implementada. (saveClasses não encontrado)");
      console.error("`saveClasses` function is not available in DataContext.");
      return;
    }

    const newClasses = data.turmas.map(turma => ({
      id: turma.id.startsWith('new-') ? `${turma.serie}-${turma.identificacao}-${Math.random().toString(36).substr(2, 9)}` : turma.id,
      name: `${turma.serie} - ${turma.identificacao}`,
      shift: schoolConfig?.turno || 'Não definido',
      aulasDiarias: turma.aulasDiarias,
    }));

    await saveClasses(newClasses);
    setShowSuccessDialog(true);
  };

  return (
    <>
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sucesso!</AlertDialogTitle>
            <AlertDialogDescription>
              As alterações foram realizadas com sucesso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => navigate("/allocation")}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="container max-w-5xl mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <CardTitle>Gerenciamento de Turmas</CardTitle>
            </div>
            <CardDescription>
              Edite os dados abaixo, adicione ou remova turmas conforme necessário.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {schoolConfig?.modalidade ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedRows.size === fields.length && fields.length > 0}
                              onCheckedChange={handleToggleAll}
                              aria-label="Selecionar todas as linhas"
                            />
                          </TableHead>
                          <TableHead className="min-w-[150px]">Série/Ano</TableHead>
                          <TableHead>Identificação da Turma</TableHead>
                          <TableHead className="w-32">Aulas Diárias</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.length > 0 ? fields.map((field, index) => (
                          <TableRow key={field.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedRows.has(field.id)}
                                onCheckedChange={() => handleToggleRow(field.id)}
                                aria-label={`Selecionar linha ${index + 1}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{field.serie}</TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`turmas.${index}.identificacao`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input {...field} placeholder="Ex: A, B, 101, 102..." />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`turmas.${index}.aulasDiarias`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input type="number" min="1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">
                              Nenhuma turma cadastrada.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Select value={selectedSerie} onValueChange={setSelectedSerie}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Selecione a Série/Ano" />
                        </SelectTrigger>
                        <SelectContent>
                          {seriesOptions.map(serie => (
                            <SelectItem key={serie} value={serie}>{serie}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="outline" onClick={handleAddTurma}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Turma
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleRemoveSelected}
                        disabled={selectedRows.size === 0}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir ({selectedRows.size})
                      </Button>
                      <Button type="submit">
                        <Save className="mr-2 h-4 w-4" /> Salvar Alterações e Prosseguir
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            ) : (
              <CardDescription className="text-red-500">
                Modalidade de ensino não configurada. Por favor, vá para as <a href="/config" className="underline">configurações</a>.
              </CardDescription>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
