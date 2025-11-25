import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Email inicial que será promovido a admin (parametrizável por env, com fallback)
  const INITIAL_ADMIN_EMAIL = (
    (import.meta.env.VITE_INITIAL_ADMIN_EMAIL as string | undefined)?.toLowerCase()
  ) || "dornelesgpi@gmail.com";

  const ensureProfileForUser = async (u: User) => {
    try {
      const email = u.email?.toLowerCase() || "";
      const isInitialAdmin = email === INITIAL_ADMIN_EMAIL;

      // Verifica se já existe perfil
      const { data: existing, error: fetchError } = await supabase
        .from("profiles")
        .select("id, role, school_id, full_name")
        .eq("id", u.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Erro ao verificar perfil:", fetchError);
        return;
      }

      if (!existing) {
        // Cria perfil do usuário; promove para admin se for o email inicial
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: u.id,
            role: isInitialAdmin ? "admin" : "teacher",
            full_name: (u.user_metadata as any)?.full_name ?? null,
          });
        if (insertError) {
          console.error("Erro ao criar perfil:", insertError);
        }
      } else if (isInitialAdmin && existing.role !== "admin") {
        // Atualiza papel para admin se for o inicial
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ role: "admin" })
          .eq("id", u.id);
        if (updateError) {
          console.error("Erro ao promover perfil:", updateError);
        }
      }
    } catch (e) {
      console.error("Erro em ensureProfileForUser:", e);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Tentando login com:", { email, passwordLength: password.length });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      console.log("Resultado do login:", { data, error });

      if (error) {
        console.error("Erro no login:", error);
        const message =
          error?.status === 400 || /invalid login credentials/i.test(error?.message || "")
            ? "Credenciais inválidas. Verifique seu e-mail e senha."
            : error?.message || "Não foi possível fazer login. Tente novamente.";
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: message,
        });
      } else if (data?.user) {
        // Garante criação/atualização de perfil e promoção de admin inicial
        await ensureProfileForUser(data.user);
      }

      return { error };
    } catch (error: any) {
      console.error("Exceção no login:", error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao criar conta",
          description: error.message,
        });
      } else {
        toast({
          title: "Conta criada com sucesso!",
          description: "Você já pode fazer login.",
        });
      }

      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: error.message,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        signIn,
        signUp,
        signOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
