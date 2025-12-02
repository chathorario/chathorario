import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Plus, Trash2, Save, Eye, Download, ChevronDown, ChevronUp, LayoutGrid, Clock, Calendar, X, Edit, Check, Copy } from 'lucide-react';
import { useModal } from '@/hooks/useModal';
import { ModalCenter } from '@/components/ModalCenter';
import { useData, CurriculumMatrix, CurriculumComponent } from '@/context/DataContext';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const DEFAULT_KNOWLEDGE_AREAS = [
    'Linguagens',
    'Matemática',
    'Ciências Humanas',
    'Ciências da Natureza',
    'Parte Diversificada',
];

export default function CurriculumMatrixManagement() {
    const { isOpen, open, close, content, setModal } = useModal();
    const { curriculumMatrices, saveCurriculumMatrix, deleteCurriculumMatrix } = useData();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
    const [knowledgeAreas, setKnowledgeAreas] = useState<string[]>(DEFAULT_KNOWLEDGE_AREAS);
    const [editingArea, setEditingArea] = useState<string | null>(null);
    const [tempAreaName, setTempAreaName] = useState('');

    const [formData, setFormData] = useState<CurriculumMatrix>({
        name: '',
        education_level: 'medio',
        modality: 'regular',
        network: 'publica',
        network_type: 'estadual',
        regime: 'anual',
        total_workload: 5400,
        school_days: 200,
        weekly_hours: 40,
        daily_hours: 50,
        total_daily_hours: 6,
        shift: 'diurno',
        entry_time: '07:00',
        validity_year: new Date().getFullYear(),
        observations: '',
        components: [],
    });

    // Sync knowledge areas when formData changes (if loading a matrix)
    React.useEffect(() => {
        if (formData.components.length > 0) {
            const areas = Array.from(new Set(formData.components.map(c => c.knowledge_area)));
            // Merge with defaults to ensure standard areas exist, or just use what's there?
            // Let's ensure defaults are there if it's a new matrix, but for existing ones, we might want to respect what's saved.
            // For now, let's just ensure we have all areas from the components + any that were already in state (if we want to keep empty ones).
            // Actually, a simpler approach: When loading a matrix, set areas from it.
            // But we need to handle the case where we switch from one matrix to another.
        }
    }, [formData.id]); // Only run when ID changes (new matrix loaded)

    const handleAddArea = () => {
        setModal({
            title: 'Nova Área de Conhecimento',
            message: (
                <div className="space-y-4">
                    <p>Digite o nome da nova área de conhecimento:</p>
                    <Input
                        id="new-area-input"
                        placeholder="Ex: Ensino Religioso"
                        autoFocus
                    />
                </div>
            ),
            type: 'confirm',
            confirmLabel: 'Adicionar',
            onConfirm: () => {
                const input = document.getElementById('new-area-input') as HTMLInputElement;
                if (input && input.value.trim()) {
                    const newArea = input.value.trim();
                    if (!knowledgeAreas.includes(newArea)) {
                        setKnowledgeAreas([...knowledgeAreas, newArea]);
                        close(); // Close the modal after adding
                    }
                }
            }
        });
        open();
    };

    const handleRenameArea = (oldName: string) => {
        if (!tempAreaName.trim() || tempAreaName === oldName) {
            setEditingArea(null);
            return;
        }

        if (knowledgeAreas.includes(tempAreaName)) {
            setModal({ title: 'Erro', message: 'Já existe uma área com este nome.', type: 'error' });
            open();
            return;
        }

        // Update state
        const newAreas = knowledgeAreas.map(a => a === oldName ? tempAreaName : a);
        setKnowledgeAreas(newAreas);

        // Update components
        const newComponents = formData.components.map(comp =>
            comp.knowledge_area === oldName
                ? { ...comp, knowledge_area: tempAreaName }
                : comp
        );

        setFormData({ ...formData, components: newComponents });
        setEditingArea(null);
    };

    const handleDeleteArea = (area: string) => {
        const hasComponents = formData.components.some(c => c.knowledge_area === area);

        setModal({
            title: 'Excluir Área de Conhecimento',
            message: hasComponents
                ? `A área "${area}" possui disciplinas cadastradas. Deseja excluir a área e TODAS as suas disciplinas?`
                : `Deseja excluir a área de conhecimento "${area}"?`,
            type: 'confirm',
            confirmLabel: 'Excluir',
            onConfirm: () => {
                if (hasComponents) {
                    const newComponents = formData.components.filter(c => c.knowledge_area !== area);
                    const newTotalWorkload = newComponents.reduce((sum, comp) => sum + (comp.total_hours || 0), 0);

                    setFormData({
                        ...formData,
                        components: newComponents,
                        total_workload: newTotalWorkload
                    });
                }
                setKnowledgeAreas(knowledgeAreas.filter(a => a !== area));
                close();
            }
        });
        open();
    };

    const handleAddRow = (area: string) => {
        const newComp: CurriculumComponent = {
            knowledge_area: area,
            component_name: '',
            weekly_hours_1st: 0,
            weekly_hours_2nd: 0,
            weekly_hours_3rd: 0,
            annual_hours_1st: 0,
            annual_hours_2nd: 0,
            annual_hours_3rd: 0,
            total_hours: 0,
            is_diversified: area === 'Parte Diversificada',
            display_order: formData.components.length,
        };
        setFormData({
            ...formData,
            components: [...formData.components, newComp]
        });
    };

    const handleRemoveComponent = (index: number) => {
        const componentName = formData.components[index].component_name || 'esta disciplina';
        setModal({
            title: 'Excluir Disciplina',
            message: `Tem certeza que deseja remover a disciplina "${componentName}"?`,
            type: 'confirm',
            confirmLabel: 'Excluir',
            onConfirm: () => {
                const newComponents = formData.components.filter((_, i) => i !== index);
                const newTotalWorkload = newComponents.reduce((sum, comp) => sum + (comp.total_hours || 0), 0);

                setFormData({
                    ...formData,
                    components: newComponents,
                    total_workload: newTotalWorkload
                });
                close();
            }
        });
        open();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateComponent = (index: number, field: keyof CurriculumComponent, value: any) => {
        const newComponents = [...formData.components];
        const currentComp = { ...newComponents[index], [field]: value };

        // Recalculate hours if needed
        if (field.startsWith('weekly_hours')) {
            const w1 = field === 'weekly_hours_1st' ? value : currentComp.weekly_hours_1st;
            const w2 = field === 'weekly_hours_2nd' ? value : currentComp.weekly_hours_2nd;
            const w3 = field === 'weekly_hours_3rd' ? value : currentComp.weekly_hours_3rd;

            currentComp.weekly_hours_1st = w1;
            currentComp.weekly_hours_2nd = w2;
            currentComp.weekly_hours_3rd = w3;

            currentComp.annual_hours_1st = w1 * formData.weekly_hours;
            currentComp.annual_hours_2nd = w2 * formData.weekly_hours;
            currentComp.annual_hours_3rd = w3 * formData.weekly_hours;
            currentComp.total_hours = currentComp.annual_hours_1st + currentComp.annual_hours_2nd + currentComp.annual_hours_3rd;
        }

        newComponents[index] = currentComp;

        // Recalculate Matrix Total Workload
        const totalWorkload = newComponents.reduce((sum, comp) => sum + (comp.total_hours || 0), 0);

        setFormData({
            ...formData,
            components: newComponents,
            total_workload: totalWorkload
        });
    };

    const handleNewMatrix = () => {
        setFormData({
            name: '',
            education_level: 'medio',
            modality: 'regular',
            network: 'publica',
            network_type: 'estadual',
            regime: 'anual',
            total_workload: 5400,
            school_days: 200,
            weekly_hours: 40,
            daily_hours: 50,
            total_daily_hours: 6,
            shift: 'diurno',
            entry_time: '07:00',
            validity_year: new Date().getFullYear(),
            observations: '',
            components: [],
        });
        setKnowledgeAreas(DEFAULT_KNOWLEDGE_AREAS);
        setIsEditing(true);
    };


    const getTotalWeeklyHours = (series: '1st' | '2nd' | '3rd') => {
        return formData.components.reduce((sum, comp) => {
            return sum + comp[`weekly_hours_${series}`];
        }, 0);
    };

    const getTotalAnnualHours = (series: '1st' | '2nd' | '3rd') => {
        return formData.components.reduce((sum, comp) => {
            return sum + comp[`annual_hours_${series}`];
        }, 0);
    };

    const getTotalGeneralHours = () => {
        return formData.components.reduce((sum, comp) => sum + (comp.total_hours || 0), 0);
    };

    const handleSaveMatrix = async () => {
        setIsLoading(true);
        try {
            await saveCurriculumMatrix(formData);
            setModal({
                title: 'Sucesso',
                message: 'Matriz Curricular salva com sucesso!',
                type: 'success',
            });
            open();
            setIsEditing(false);
            setIsHeaderExpanded(false);
        } catch (error) {
            setModal({
                title: 'Erro',
                message: 'Erro ao salvar matriz curricular. Tente novamente.',
                type: 'error',
            });
            open();
        } finally {
            setIsLoading(false);
        }
    };



    const handleDuplicateMatrix = (matrix: CurriculumMatrix, e: React.MouseEvent) => {
        e.stopPropagation();

        const recalculatedMatrix = recalculateMatrix(matrix);

        // Create a deep copy and remove ID/timestamps to treat as new
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, created_at, updated_at, ...matrixData } = recalculatedMatrix;

        const newMatrixData = {
            ...matrixData,
            name: `${matrixData.name} (Cópia)`,
        };

        setFormData(newMatrixData);

        // Extract areas from the matrix
        const uniqueAreas = Array.from(new Set(newMatrixData.components.map(c => c.knowledge_area)));
        if (uniqueAreas.length > 0) {
            setKnowledgeAreas(uniqueAreas);
        } else {
            setKnowledgeAreas(DEFAULT_KNOWLEDGE_AREAS);
        }

        setIsEditing(true);
        setModal({
            title: 'Cópia Criada',
            message: 'Uma cópia da matriz foi criada. Revise os dados e clique em Salvar para confirmar.',
            type: 'success',
        });
        open();
    };

    const componentsByArea = useMemo(() => {
        const grouped: Record<string, { component: CurriculumComponent, index: number }[]> = {};
        knowledgeAreas.forEach(area => grouped[area] = []);
        formData.components.forEach((comp, index) => {
            // If component has an area not in our list, add it dynamically (safety net)
            if (!grouped[comp.knowledge_area]) {
                grouped[comp.knowledge_area] = [];
            }
            grouped[comp.knowledge_area].push({ component: comp, index });
        });
        return grouped;
    }, [formData.components, knowledgeAreas]);

    const recalculateMatrix = (matrix: CurriculumMatrix): CurriculumMatrix => {
        const weeks = matrix.weekly_hours || 0; // "Semanas Letivas"

        const newComponents = matrix.components.map(comp => {
            const annual1 = comp.weekly_hours_1st * weeks;
            const annual2 = comp.weekly_hours_2nd * weeks;
            const annual3 = comp.weekly_hours_3rd * weeks;
            const total = annual1 + annual2 + annual3;

            return {
                ...comp,
                annual_hours_1st: annual1,
                annual_hours_2nd: annual2,
                annual_hours_3rd: annual3,
                total_hours: total
            };
        });

        const totalWorkload = newComponents.reduce((sum, comp) => sum + comp.total_hours, 0);

        return {
            ...matrix,
            components: newComponents,
            total_workload: totalWorkload
        };
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

            <div className="container mx-auto p-4 space-y-6 pb-24">
                {/* Header / List View */}
                {!isEditing ? (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-6 w-6 text-primary" />
                                    <div>
                                        <CardTitle>Matrizes Curriculares</CardTitle>
                                        <CardDescription>
                                            Gerencie as matrizes curriculares da escola
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleNewMatrix}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Nova Matriz
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {curriculumMatrices.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Nenhuma matriz curricular cadastrada.</p>
                                    <p className="text-sm mt-2">Clique em "Nova Matriz" para começar.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {curriculumMatrices.map((matrix) => (
                                        <Card key={matrix.id} className="hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-primary" onClick={() => {
                                            const recalculatedMatrix = recalculateMatrix(matrix);
                                            setFormData(recalculatedMatrix);

                                            // Extract areas from the matrix
                                            const uniqueAreas = Array.from(new Set(recalculatedMatrix.components.map(c => c.knowledge_area)));
                                            // If matrix has no components or missing standard areas, we might want to merge with defaults.
                                            // But for now, let's trust the matrix + defaults if it's empty.
                                            if (uniqueAreas.length > 0) {
                                                setKnowledgeAreas(uniqueAreas);
                                            } else {
                                                setKnowledgeAreas(DEFAULT_KNOWLEDGE_AREAS);
                                            }

                                            setIsEditing(true);
                                        }}>
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <CardTitle className="text-base line-clamp-2">{matrix.name}</CardTitle>
                                                    <div className="flex gap-1 -mt-1 -mr-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-muted-foreground hover:text-primary"
                                                            title="Duplicar Matriz"
                                                            onClick={(e) => handleDuplicateMatrix(matrix, e)}
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-muted-foreground hover:text-red-500"
                                                            title="Excluir Matriz"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setModal({
                                                                    title: 'Excluir Matriz',
                                                                    message: `Tem certeza que deseja excluir a matriz "${matrix.name}"?`,
                                                                    type: 'confirm',
                                                                    onConfirm: async () => {
                                                                        if (matrix.id) {
                                                                            await deleteCurriculumMatrix(matrix.id);
                                                                            close();
                                                                        }
                                                                    }
                                                                });
                                                                open();
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <CardDescription className="flex items-center gap-2 text-xs">
                                                    <Calendar className="h-3 w-3" /> {matrix.validity_year}
                                                    <span className="mx-1">•</span>
                                                    <Clock className="h-3 w-3" /> {matrix.total_workload}h
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-sm text-muted-foreground">
                                                    {matrix.education_level === 'medio' ? 'Ensino Médio' : 'Ensino Fundamental'} • {matrix.modality}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    // Edit Mode
                    <div className="space-y-6">
                        {/* Metadata Accordion */}
                        <Card>
                            <Collapsible open={isHeaderExpanded} onOpenChange={setIsHeaderExpanded}>
                                <div className="flex items-center justify-between p-6">
                                    <div className="flex items-center gap-4">
                                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                                            <X className="h-5 w-5" />
                                        </Button>
                                        <div>
                                            <h2 className="text-2xl font-bold tracking-tight">{formData.name || 'Nova Matriz'}</h2>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Vigência: {formData.validity_year}</span>
                                                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Carga Total: {getTotalGeneralHours()}h</span>
                                                <span className="flex items-center gap-1"><LayoutGrid className="h-4 w-4" /> {formData.components.length} Disciplinas</span>
                                            </div>
                                        </div>
                                    </div>
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            {isHeaderExpanded ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                                            {isHeaderExpanded ? 'Ocultar Detalhes' : 'Editar Detalhes'}
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>
                                <CollapsibleContent>
                                    <CardContent className="border-t pt-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nome da Matriz</Label>
                                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Nível de Ensino</Label>
                                                <Select value={formData.education_level} onValueChange={(v) => setFormData({ ...formData, education_level: v })}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="fundamental">Ensino Fundamental</SelectItem>
                                                        <SelectItem value="medio">Ensino Médio</SelectItem>
                                                        <SelectItem value="superior">Ensino Superior</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Modalidade</Label>
                                                <Select value={formData.modality} onValueChange={(v) => setFormData({ ...formData, modality: v })}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="regular">Regular</SelectItem>
                                                        <SelectItem value="integral">Integral</SelectItem>
                                                        <SelectItem value="eja">EJA</SelectItem>
                                                        <SelectItem value="especial">Educação Especial</SelectItem>
                                                        <SelectItem value="profissional">Profissional/Técnico</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Rede de Ensino</Label>
                                                <Select
                                                    value={formData.network}
                                                    onValueChange={(v) => setFormData({
                                                        ...formData,
                                                        network: v,
                                                        network_type: v === 'publica' ? 'estadual' : undefined
                                                    })}
                                                >
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="publica">Pública</SelectItem>
                                                        <SelectItem value="privada">Privada</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {formData.network === 'publica' && (
                                                <div className="space-y-2">
                                                    <Label>Tipo de Rede</Label>
                                                    <Select value={formData.network_type} onValueChange={(v) => setFormData({ ...formData, network_type: v })}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="estadual">Estadual</SelectItem>
                                                            <SelectItem value="distrital">Distrital</SelectItem>
                                                            <SelectItem value="municipal">Municipal</SelectItem>
                                                            <SelectItem value="federal">Federal</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <Label>Ano de Vigência</Label>
                                                <Input type="number" value={formData.validity_year} onChange={(e) => setFormData({ ...formData, validity_year: parseInt(e.target.value) })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Carga Horária Total (Calculada)</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.total_workload}
                                                    readOnly
                                                    className="bg-muted text-muted-foreground font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Semanas Letivas</Label>
                                                <Input type="number" value={formData.weekly_hours} onChange={(e) => setFormData({ ...formData, weekly_hours: parseInt(e.target.value) })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Duração Aula (min)</Label>
                                                <Input type="number" value={formData.daily_hours} onChange={(e) => setFormData({ ...formData, daily_hours: parseInt(e.target.value) })} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </CollapsibleContent>
                            </Collapsible>
                        </Card>

                        {/* Smart Spreadsheet Table */}
                        <div className="border rounded-md shadow-sm bg-background overflow-hidden">
                            <Table>
                                <TableHeader className="sticky top-0 z-20 bg-slate-900 shadow-md">
                                    <TableRow className="hover:bg-slate-900 border-b-slate-700">
                                        <TableHead rowSpan={2} className="min-w-[300px] align-middle text-slate-100 font-bold border-r border-slate-700">Componente Curricular</TableHead>
                                        <TableHead colSpan={3} className="text-center border-b border-r border-slate-700 text-slate-100 font-bold bg-slate-800/50">Carga Horária Semanal</TableHead>
                                        <TableHead colSpan={3} className="text-center border-b border-r border-slate-700 text-slate-100 font-bold bg-slate-800/50">Carga Horária Anual</TableHead>
                                        <TableHead rowSpan={2} className="text-center w-[100px] align-middle text-slate-100 font-bold bg-slate-800">Total</TableHead>
                                        <TableHead rowSpan={2} className="w-[50px] align-middle bg-slate-900"></TableHead>
                                    </TableRow>
                                    <TableRow className="hover:bg-slate-900 border-b-slate-700">
                                        <TableHead className="text-center w-[80px] border-r border-slate-700 text-slate-300 bg-slate-900">1ª Série</TableHead>
                                        <TableHead className="text-center w-[80px] border-r border-slate-700 text-slate-300 bg-slate-900">2ª Série</TableHead>
                                        <TableHead className="text-center w-[80px] border-r border-slate-700 text-slate-300 bg-slate-900">3ª Série</TableHead>
                                        <TableHead className="text-center w-[80px] border-r border-slate-700 text-slate-400 bg-slate-900/50">1ª Série</TableHead>
                                        <TableHead className="text-center w-[80px] border-r border-slate-700 text-slate-400 bg-slate-900/50">2ª Série</TableHead>
                                        <TableHead className="text-center w-[80px] border-r border-slate-700 text-slate-400 bg-slate-900/50">3ª Série</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {knowledgeAreas.map((area) => (
                                        <React.Fragment key={area}>
                                            {/* Section Header */}
                                            <TableRow className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 group">
                                                <TableCell colSpan={9} className="py-2 px-4 border-y border-slate-200 dark:border-slate-700">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                                                            <span>📂</span>
                                                            {editingArea === area ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        value={tempAreaName}
                                                                        onChange={(e) => setTempAreaName(e.target.value)}
                                                                        className="h-7 w-64 bg-white dark:bg-slate-900"
                                                                        autoFocus
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') handleRenameArea(area);
                                                                            if (e.key === 'Escape') setEditingArea(null);
                                                                        }}
                                                                    />
                                                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-green-500" onClick={() => handleRenameArea(area)}>
                                                                        <Check className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => setEditingArea(null)}>
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <span className="flex items-center gap-2">
                                                                    Área de Conhecimento: {area}
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-primary"
                                                                        onClick={() => {
                                                                            setTempAreaName(area);
                                                                            setEditingArea(area);
                                                                        }}
                                                                    >
                                                                        <Edit className="h-3 w-3" />
                                                                    </Button>
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                                                            onClick={() => handleDeleteArea(area)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>

                                            {/* Components Rows */}
                                            {componentsByArea[area]?.map(({ component: comp, index }) => (
                                                <TableRow key={index} className="hover:bg-muted/30">
                                                    <TableCell className="p-0 border-r">
                                                        <Input
                                                            value={comp.component_name}
                                                            onChange={(e) => updateComponent(index, 'component_name', e.target.value)}
                                                            className="h-10 border-0 rounded-none focus-visible:ring-1 focus-visible:ring-inset bg-transparent px-4"
                                                            placeholder="Nome da Disciplina"
                                                        />
                                                    </TableCell>

                                                    {/* Weekly Hours Inputs */}
                                                    <TableCell className="p-0 border-r">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={comp.weekly_hours_1st}
                                                            onChange={(e) => updateComponent(index, 'weekly_hours_1st', parseInt(e.target.value) || 0)}
                                                            className="h-10 text-center border-0 rounded-none focus-visible:ring-1 focus-visible:ring-inset bg-transparent focus:bg-muted/50"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="p-0 border-r">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={comp.weekly_hours_2nd}
                                                            onChange={(e) => updateComponent(index, 'weekly_hours_2nd', parseInt(e.target.value) || 0)}
                                                            className="h-10 text-center border-0 rounded-none focus-visible:ring-1 focus-visible:ring-inset bg-transparent focus:bg-muted/50"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="p-0 border-r">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={comp.weekly_hours_3rd}
                                                            onChange={(e) => updateComponent(index, 'weekly_hours_3rd', parseInt(e.target.value) || 0)}
                                                            className="h-10 text-center border-0 rounded-none focus-visible:ring-1 focus-visible:ring-inset bg-transparent focus:bg-muted/50"
                                                        />
                                                    </TableCell>

                                                    {/* Annual Hours (Read-only) */}
                                                    <TableCell className="text-center text-muted-foreground bg-muted/5 font-mono text-sm border-r">
                                                        {comp.annual_hours_1st}
                                                    </TableCell>
                                                    <TableCell className="text-center text-muted-foreground bg-muted/5 font-mono text-sm border-r">
                                                        {comp.annual_hours_2nd}
                                                    </TableCell>
                                                    <TableCell className="text-center text-muted-foreground bg-muted/5 font-mono text-sm border-r">
                                                        {comp.annual_hours_3rd}
                                                    </TableCell>

                                                    {/* Total */}
                                                    <TableCell className="text-center font-bold bg-muted/10 font-mono text-sm border-r">
                                                        {comp.total_hours}
                                                    </TableCell>

                                                    {/* Actions */}
                                                    <TableCell className="p-0 text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                                            onClick={() => handleRemoveComponent(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}

                                            {/* Add Row Button */}
                                            <TableRow>
                                                <TableCell colSpan={9} className="p-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-full h-8 text-muted-foreground hover:text-primary text-xs uppercase tracking-wider border-dashed border border-transparent hover:border-primary/20"
                                                        onClick={() => handleAddRow(area)}
                                                    >
                                                        <Plus className="h-3 w-3 mr-2" />
                                                        Adicionar Disciplina em {area}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    ))}

                                    {/* Add Area Button */}
                                    <TableRow>
                                        <TableCell colSpan={9} className="p-4 text-center border-t">
                                            <Button
                                                variant="outline"
                                                className="border-dashed border-2 w-full hover:bg-slate-50 dark:hover:bg-slate-800"
                                                onClick={handleAddArea}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Adicionar Nova Área de Conhecimento
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>

                        {/* Fixed Footer Action Bar */}
                        <div className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-md border-t border-slate-700 p-4 z-50 shadow-lg text-slate-100">
                            <div className="container mx-auto flex items-center justify-between">
                                <div className="flex items-center gap-8">
                                    <div>
                                        <span className="text-xs uppercase tracking-wider text-slate-400 block">Total Semanal (1ª/2ª/3ª)</span>
                                        <span className="font-mono font-bold text-lg">
                                            {getTotalWeeklyHours('1st')}h / {getTotalWeeklyHours('2nd')}h / {getTotalWeeklyHours('3rd')}h
                                        </span>
                                    </div>
                                    <div className="h-8 w-px bg-slate-600"></div>
                                    <div>
                                        <span className="text-xs uppercase tracking-wider text-slate-400 block">Carga Horária Total</span>
                                        <span className="font-mono font-bold text-lg text-emerald-400">
                                            {getTotalGeneralHours()}h
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white" onClick={() => setIsEditing(false)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleSaveMatrix} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        <Save className="mr-2 h-4 w-4" />
                                        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
