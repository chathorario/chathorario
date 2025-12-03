import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, FileDown, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScheduleViewer } from "@/components/dashboard/ScheduleViewer";
import { useData } from "@/context/DataContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ScenarioVersionsListProps {
    scheduleId: string;
    highlightedVersionId?: string | null;
}

interface ScheduleVersion {
    id: string;
    name: string;
    created_at: string;
    fitness_score: number;
    description: string;
    is_active: boolean;
    schedule_data: any;
}

export function ScenarioVersionsList({ scheduleId, highlightedVersionId }: ScenarioVersionsListProps) {
    const { teachers, subjects, classes } = useData();
    const [versions, setVersions] = useState<ScheduleVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVersion, setSelectedVersion] = useState<ScheduleVersion | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    const fetchVersions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('schedule_scenarios')
            .select('*')
            .eq('schedule_id', scheduleId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching versions:", error);
            toast.error("Erro ao carregar versões.");
        } else {
            setVersions(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchVersions();
    }, [scheduleId]);

    const handleSetOfficial = async (version: ScheduleVersion) => {
        await supabase
            .from('schedule_scenarios')
            .update({ is_active: false })
            .eq('schedule_id', scheduleId);

        const { error } = await supabase
            .from('schedule_scenarios')
            .update({ is_active: true })
            .eq('id', version.id);

        if (error) {
            toast.error("Erro ao definir como oficial.");
        } else {
            toast.success("Versão definida como oficial!");
            fetchVersions();
        }
    };

    const handleDownloadPDF = (version: ScheduleVersion) => {
        try {
            const doc = new jsPDF();
            const schedule = version.schedule_data?.schedule || [];

            const classIds = [...new Set(schedule.map((l: any) => l.classId))];

            classIds.sort((a: any, b: any) => {
                const nameA = classes.find(c => c.id === a)?.name || '';
                const nameB = classes.find(c => c.id === b)?.name || '';
                return nameA.localeCompare(nameB);
            });

            classIds.forEach((classId, index) => {
                const currentClass = classes.find(c => c.id === classId);
                const className = currentClass?.name || 'Turma Desconhecida';
                const classLessons = schedule.filter((l: any) => l.classId === classId);

                // Calcular o número máximo de períodos
                const maxPeriod = classLessons.length > 0
                    ? Math.max(...classLessons.map((l: any) => l.period))
                    : 4;

                // Criar grid com as aulas
                const grid: string[][] = Array(maxPeriod + 1).fill(null).map(() => Array(5).fill('-'));

                classLessons.forEach((lesson: any) => {
                    if (lesson.day >= 0 && lesson.day < 5 && lesson.period >= 0 && lesson.period <= maxPeriod) {
                        const subject = subjects.find(s => s.id === lesson.subjectId)?.name || 'N/A';
                        const teacher = teachers.find(t => t.id === lesson.teacherId)?.name || 'N/A';
                        grid[lesson.period][lesson.day] = `${subject}\n${teacher}`;
                    }
                });

                const bellSchedule = currentClass?.bell_schedule || [];
                const horarioInicio = currentClass?.horario_inicio;

                let tableBody: any[] = [];

                // Se tiver bell_schedule, usar ele para criar as linhas
                if (bellSchedule.length > 0 && horarioInicio) {
                    // Helper para adicionar minutos
                    const addMinutes = (time: string, minutes: number) => {
                        const [h, m] = time.split(':').map(Number);
                        const date = new Date();
                        date.setHours(h, m);
                        date.setMinutes(date.getMinutes() + minutes);
                        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    };

                    // Normalizar horarioInicio (remover segundos se tiver)
                    let currentTime = horarioInicio.length > 5 ? horarioInicio.substring(0, 5) : horarioInicio;
                    let lessonCounter = 0;

                    bellSchedule.forEach((slot: any) => {
                        const start = currentTime;
                        const end = addMinutes(start, slot.duration);
                        currentTime = end;

                        if (slot.type === 'break') {
                            // Linha de intervalo
                            tableBody.push([
                                `${start} - ${end}`,
                                { content: `Intervalo (${slot.duration} min)`, colSpan: 5, styles: { halign: 'center', fontStyle: 'italic', fillColor: [255, 248, 220] } }
                            ]);
                        } else {
                            // Linha de aula
                            const periodIndex = lessonCounter;
                            const row = [`${lessonCounter + 1}º Aula\n${start} - ${end}`];

                            // Adicionar células para cada dia
                            for (let day = 0; day < 5; day++) {
                                if (grid[periodIndex] && grid[periodIndex][day]) {
                                    row.push(grid[periodIndex][day]);
                                } else {
                                    row.push('-');
                                }
                            }

                            tableBody.push(row);
                            lessonCounter++;
                        }
                    });
                } else {
                    // Fallback: usar lógica antiga sem horários
                    tableBody = grid.map((row, idx) => [`${idx + 1}º Aula`, ...row]);
                }

                // Adicionar nova página para cada turma
                if (index > 0) {
                    doc.addPage();
                }

                // Para a primeira turma, incluir cabeçalho geral
                if (index === 0) {
                    doc.setFontSize(16);
                    doc.text(`Horário: ${version.name}`, 14, 15);
                    doc.setFontSize(10);
                    doc.text(`Gerado em: ${new Date(version.created_at).toLocaleString()}`, 14, 22);
                    doc.text(`Score: ${version.fitness_score?.toFixed(2) || 'N/A'}`, 14, 28);

                    doc.setFontSize(12);
                    doc.setTextColor(0);
                    doc.text(`Turma: ${className}`, 14, 38);

                    autoTable(doc, {
                        startY: 43,
                        head: [['Horário', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']],
                        body: tableBody,
                        theme: 'grid',
                        styles: {
                            fontSize: 8,
                            cellPadding: 2,
                            valign: 'middle',
                            halign: 'center',
                            lineWidth: 0.1,
                            lineColor: [200, 200, 200],
                            overflow: 'linebreak'
                        },
                        headStyles: {
                            fillColor: [41, 128, 185],
                            textColor: 255,
                            fontStyle: 'bold',
                            halign: 'center'
                        },
                        columnStyles: {
                            0: { cellWidth: 20, fontStyle: 'bold', fillColor: [245, 245, 245] }
                        }
                    });
                } else {
                    // Para as demais turmas, apenas o título da turma
                    doc.setFontSize(12);
                    doc.setTextColor(0);
                    doc.text(`Turma: ${className}`, 14, 20);

                    autoTable(doc, {
                        startY: 25,
                        head: [['Horário', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']],
                        body: tableBody,
                        theme: 'grid',
                        styles: {
                            fontSize: 8,
                            cellPadding: 2,
                            valign: 'middle',
                            halign: 'center',
                            lineWidth: 0.1,
                            lineColor: [200, 200, 200],
                            overflow: 'linebreak'
                        },
                        headStyles: {
                            fillColor: [41, 128, 185],
                            textColor: 255,
                            fontStyle: 'bold',
                            halign: 'center'
                        },
                        columnStyles: {
                            0: { cellWidth: 20, fontStyle: 'bold', fillColor: [245, 245, 245] }
                        }
                    });
                }
            });

            doc.save(`horario_${version.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
            toast.success("PDF gerado com sucesso!");
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            toast.error("Erro ao gerar PDF.");
        }
    };

    const handleView = (version: ScheduleVersion) => {
        setSelectedVersion(version);
        setIsViewerOpen(true);
    };

    if (loading) return <div className="p-4 text-center text-sm text-muted-foreground">Carregando versões...</div>;
    if (versions.length === 0) return <div className="p-4 text-center text-sm text-muted-foreground">Nenhuma versão gerada para este cenário.</div>;

    return (
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 mx-4 mb-4">
            <h4 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Histórico de Gerações</h4>
            <Table>
                <TableHeader>
                    <TableRow className="h-8 border-slate-200 dark:border-slate-700">
                        <TableHead className="h-8 text-xs">Versão</TableHead>
                        <TableHead className="h-8 text-xs">Data/Hora</TableHead>
                        <TableHead className="h-8 text-xs">Score</TableHead>
                        <TableHead className="h-8 text-xs text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {versions.map((v) => {
                        const isHighlighted = highlightedVersionId === v.id;
                        return (
                            <TableRow
                                key={v.id}
                                className={`h-10 border-slate-200 dark:border-slate-700 transition-colors duration-300 ${isHighlighted
                                    ? 'bg-yellow-50 dark:bg-yellow-900/20'
                                    : ''
                                    }`}
                            >
                                <TableCell className="py-1 text-xs font-medium">
                                    <div className="flex items-center gap-2">
                                        {v.name}
                                        {v.is_active && <Badge variant="default" className="h-4 px-1 text-[10px] bg-emerald-500 hover:bg-emerald-600">Oficial</Badge>}
                                    </div>
                                </TableCell>
                                <TableCell className="py-1 text-xs text-muted-foreground">
                                    {new Date(v.created_at).toLocaleString()}
                                </TableCell>
                                <TableCell className="py-1 text-xs">
                                    <Badge variant="outline" className="font-mono text-[10px]">
                                        {v.fitness_score?.toFixed(2) || v.schedule_data?.fitness?.toFixed(2) || 'N/A'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-1 text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleView(v)} title="Visualizar">
                                            <Eye className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-6 w-6 ${v.is_active ? 'text-yellow-500' : 'text-slate-400 hover:text-yellow-500'}`}
                                            onClick={() => handleSetOfficial(v)}
                                            title="Definir como Oficial"
                                        >
                                            <Star className={`h-3 w-3 ${v.is_active ? 'fill-current' : ''}`} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" title="Baixar PDF" onClick={() => handleDownloadPDF(v)}>
                                            <FileDown className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Visualização da Versão: {selectedVersion?.name}</DialogTitle>
                    </DialogHeader>
                    {selectedVersion?.schedule_data?.schedule && (
                        <ScheduleViewer schedule={selectedVersion.schedule_data.schedule} />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
