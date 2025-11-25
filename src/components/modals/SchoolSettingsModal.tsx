import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface SchoolSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SchoolInfo {
    school_name: string;
    responsible: string;
    academic_year: string;
}

export const SchoolSettingsModal = ({ isOpen, onClose }: SchoolSettingsModalProps) => {
    const { user } = useAuth();
    const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
        school_name: "",
        responsible: "",
        academic_year: "2025",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadSchoolInfo();
        }
    }, [isOpen, user]);

    const loadSchoolInfo = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("school_name, responsible, academic_year")
                .eq("id", user.id)
                .single();

            if (error) throw error;

            if (data) {
                setSchoolInfo({
                    school_name: data.school_name || "",
                    responsible: data.responsible || "",
                    academic_year: data.academic_year || "2025",
                });
            }
        } catch (error) {
            console.error("Error loading school info:", error);
            toast.error("Erro ao carregar informações.");
        }
    };

    const handleSave = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    school_name: schoolInfo.school_name,
                    responsible: schoolInfo.responsible,
                    academic_year: schoolInfo.academic_year,
                })
                .eq("id", user.id);

            if (error) throw error;

            toast.success("Informações da escola atualizadas com sucesso!");
            onClose();
        } catch (error) {
            console.error("Error saving school info:", error);
            toast.error("Erro ao salvar informações da escola.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Informações da Escola</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="school_name">Nome da Unidade</Label>
                        <Input
                            id="school_name"
                            value={schoolInfo.school_name}
                            onChange={(e) => setSchoolInfo({ ...schoolInfo, school_name: e.target.value })}
                            placeholder="Ex: Escola Municipal..."
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="responsible">Responsável</Label>
                        <Input
                            id="responsible"
                            value={schoolInfo.responsible}
                            onChange={(e) => setSchoolInfo({ ...schoolInfo, responsible: e.target.value })}
                            placeholder="Nome do gestor/diretor"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="academic_year">Ano Letivo</Label>
                        <Select
                            value={schoolInfo.academic_year}
                            onValueChange={(value) => setSchoolInfo({ ...schoolInfo, academic_year: value })}
                        >
                            <SelectTrigger id="academic_year">
                                <SelectValue placeholder="Selecione o ano" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2024">2024</SelectItem>
                                <SelectItem value="2025">2025</SelectItem>
                                <SelectItem value="2026">2026</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
