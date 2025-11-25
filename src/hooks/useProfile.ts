import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  school_id: string | null;
  role: 'admin' | 'staff' | 'teacher' | null;
  full_name: string | null;
  school_name?: string | null;
  responsible?: string | null;
  academic_year?: string | null;
  created_at: string;
}

interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProfile(userId: string | undefined): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const attemptedBootstrapRef = useRef(false);

  const fetchProfile = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          schools:school_id(name)
        `)
        .eq('id', userId)
        .maybeSingle();

      // Quando não há linha, maybeSingle retorna data = null e não erro.
      // Só tratamos como erro se houver de fato um erro retornado.
      if (profileError) {
        throw profileError;
      }

      if (profileData) {
        setProfile({
          id: profileData.id,
          school_id: profileData.school_id,
          role: profileData.role,
          full_name: profileData.full_name,
          school_name: profileData.schools?.name || null,
          responsible: profileData.responsible,
          academic_year: profileData.academic_year,
          created_at: profileData.created_at,
        });
      } else {
        // Perfil ausente: tenta bootstrap automático (uma vez)
        setProfile(null);
        if (!attemptedBootstrapRef.current) {
          attemptedBootstrapRef.current = true;
          try {
            const { data: authUserData, error: authErr } = await supabase.auth.getUser();
            if (authErr) throw authErr;
            const authUser = authUserData?.user;
            if (authUser && authUser.id === userId) {
              const email = (authUser.email || '').toLowerCase();
              const allowedAdmins = (import.meta.env.VITE_ALLOWED_ADMIN_EMAILS || '')
                .split(',')
                .map((e) => e.trim().toLowerCase())
                .filter(Boolean);
              const desiredRole: 'admin' | 'staff' | 'teacher' = allowedAdmins.includes(email) ? 'admin' : 'teacher';

              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: userId,
                  role: desiredRole,
                  full_name: authUser.user_metadata?.full_name || authUser.email || null,
                  school_id: null,
                });
              if (insertError) throw insertError;

              // Refetch após criar
              const { data: createdProfile, error: refetchErr } = await supabase
                .from('profiles')
                .select(`
                  *,
                  schools:school_id(name)
                `)
                .eq('id', userId)
                .maybeSingle();
              if (refetchErr) throw refetchErr;
              if (createdProfile) {
                setProfile({
                  id: createdProfile.id,
                  school_id: createdProfile.school_id,
                  role: createdProfile.role,
                  full_name: createdProfile.full_name,
                  school_name: createdProfile.schools?.name || null,
                  responsible: createdProfile.responsible,
                  academic_year: createdProfile.academic_year,
                  created_at: createdProfile.created_at,
                });
              }
            }
          } catch (bootstrapErr) {
            console.error('Erro ao criar perfil automaticamente:', bootstrapErr);
            // Mantém erro para visibilidade, sem travar navegação indefinidamente
            setError(bootstrapErr instanceof Error ? bootstrapErr.message : 'Erro ao criar perfil');
          }
        }
      }
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  };
}