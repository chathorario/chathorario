import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface SchoolInfo {
    school_name: string;
    responsible: string;
    academic_year: string;
}

export const SchoolInfoForm = () => {
    const { user } = useAuth();
    const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
        school_name: "",
        responsible: "",
        academic_year: "Ano Atual",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSchoolInfo();
    }, [user]);

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
                    academic_year: data.academic_year || "Ano Atual",
                });
            }
        } catch (error) {
            console.error("Error loading school info:", error);
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
        } catch (error) {
            console.error("Error saving school info:", error);
            toast.error("Erro ao salvar informações da escola.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 space-y-4 w-80">
            <div className="space-y-2">
                <h3 className="font-semibold text-sm">Informações da Escola</h3>
            </div>

            <div className="space-y-3">
                <div className="space-y-1.5">
                    <Label htmlFor="school_name" className="text-xs">Nome da Unidade Escolar</Label>
                    <Input
                        id="school_name"
                        value={schoolInfo.school_name}
                        onChange={(e) => setSchoolInfo({ ...schoolInfo, school_name: e.target.value })}
                        placeholder="Digite o nome da escola"
                        className="h-8 text-sm"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="responsible" className="text-xs">Responsável</Label>
                    <Input
                        id="responsible"
                        value={schoolInfo.responsible}
                        onChange={(e) => setSchoolInfo({ ...schoolInfo, responsible: e.target.value })}
                        placeholder="Digite o nome do responsável"
                        className="h-8 text-sm"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="academic_year" className="text-xs">Ano Letivo</Label>
                    <Select
                        value={schoolInfo.academic_year}
                        onValueChange={(value) => setSchoolInfo({ ...schoolInfo, academic_year: value })}
                    >
                        <SelectTrigger id="academic_year" className="h-8 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Ano Anterior">Ano Anterior</SelectItem>
                            <SelectItem value="Ano Atual">Ano Atual</SelectItem>
                            <SelectItem value="Ano Seguinte">Ano Seguinte</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={loading}
                    size="sm"
                    className="w-full"
                >
                    {loading ? "Salvando..." : "Salvar"}
                </Button>
            </div>
        </div>
    );
};
