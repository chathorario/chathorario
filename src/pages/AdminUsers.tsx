import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function AdminUsers() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePromote = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("promote_to_admin", {
        target_email: email.trim().toLowerCase(),
      });
      if (error) {
        toast({
          variant: "destructive",
          title: "Falha ao promover",
          description: error.message,
        });
        return;
      }
      toast({
        title: "Usuário promovido",
        description: `ID: ${data}`,
      });
      setEmail("");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: err?.message || String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  const disabled = !profile || profile.role !== "admin" || loading;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Gerenciar Usuários</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Promover um usuário a administrador informando o email.
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@dominio.com"
          className="flex-1 border rounded px-3 py-2"
        />
        <Button onClick={handlePromote} disabled={disabled}>
          {loading ? "Promovendo..." : "Promover"}
        </Button>
      </div>
      {!profile && (
        <p className="mt-4 text-sm text-red-600">Perfil não carregado.</p>
      )}
      {profile && profile.role !== "admin" && (
        <p className="mt-4 text-sm text-red-600">Acesso restrito a administradores.</p>
      )}
    </div>
  );
}