import { supabase } from "@/integrations/supabase/client";
import type { Schedule } from "@/types/schedule";

export interface TeacherInput {
  name: string;
  subjects: string[];
}

export interface ClassInput {
  name: string;
  shift: string;
}

export const ensureSchool = async (
  userId: string,
  schoolName: string
): Promise<{ school_id: string; name: string }> => {
  if (!userId) throw new Error("Usuário não autenticado");

  // Recuperar perfil atual
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("id, school_id")
    .eq("id", userId)
    .maybeSingle();

  if (profileErr) throw profileErr;

  // Se já possui escola vinculada, tentar atualizar apenas o nome (opcional)
  if (profile?.school_id) {
    const { error: updErr } = await supabase
      .from("schools")
      .update({ name: schoolName })
      .eq("id", profile.school_id);
    if (updErr) {
      // se falhar atualização do nome, não bloquear fluxo
      console.warn("Falha ao atualizar nome da escola:", updErr.message);
    }
    return { school_id: profile.school_id, name: schoolName };
  }

  // Criar nova escola
  const { data: newSchool, error: schoolErr } = await supabase
    .from("schools")
    .insert({ name: schoolName })
    .select("id, name")
    .single();

  if (schoolErr) throw schoolErr;

  // Vincular perfil à escola criada
  const { error: linkErr } = await supabase
    .from("profiles")
    .update({ school_id: newSchool.id })
    .eq("id", userId);

  if (linkErr) throw linkErr;

  return { school_id: newSchool.id, name: newSchool.name };
};

export const upsertTeachers = async (
  school_id: string,
  teachers: TeacherInput[]
) => {
  if (!school_id || teachers.length === 0) return;

  for (const t of teachers) {
    // Verificar existência por nome dentro da escola
    const { data: existing, error: selErr } = await supabase
      .from("teachers")
      .select("id")
      .eq("school_id", school_id)
      .eq("name", t.name)
      .maybeSingle();

    if (selErr) throw selErr;

    if (existing?.id) {
      // Atualiza nome se necessário (mantém email nulo)
      const { error: updErr } = await supabase
        .from("teachers")
        .update({ name: t.name })
        .eq("id", existing.id);
      if (updErr) throw updErr;
    } else {
      const { error: insErr } = await supabase
        .from("teachers")
        .insert({ school_id, name: t.name });
      if (insErr) throw insErr;
    }
  }
};

export const upsertSubjects = async (
  school_id: string,
  subjects: string[],
  workload: Record<string, number> = {}
) => {
  if (!school_id || subjects.length === 0) return;

  for (const name of subjects) {
    const weeklyHours = Number.isFinite(workload[name]) ? Math.max(0, workload[name]) : 0;

    const { data: existing, error: selErr } = await supabase
      .from("subjects")
      .select("id")
      .eq("school_id", school_id)
      .eq("name", name)
      .maybeSingle();

    if (selErr) throw selErr;

    if (existing?.id) {
      const { error: updErr } = await supabase
        .from("subjects")
        .update({ name, weekly_hours: weeklyHours })
        .eq("id", existing.id);
      if (updErr) throw updErr;
    } else {
      const { error: insErr } = await supabase
        .from("subjects")
        .insert({ school_id, name, weekly_hours: weeklyHours });
      if (insErr) throw insErr;
    }
  }
};

export const upsertClasses = async (
  school_id: string,
  classes: ClassInput[]
) => {
  if (!school_id || classes.length === 0) return;

  for (const c of classes) {
    const { data: existing, error: selErr } = await supabase
      .from("classes")
      .select("id")
      .eq("school_id", school_id)
      .eq("name", c.name)
      .maybeSingle();

    if (selErr) throw selErr;

    // Usamos o campo grade para armazenar o turno quando não há coluna específica
    if (existing?.id) {
      const { error: updErr } = await supabase
        .from("classes")
        .update({ name: c.name, grade: c.shift })
        .eq("id", existing.id);
      if (updErr) throw updErr;
    } else {
      const { error: insErr } = await supabase
        .from("classes")
        .insert({ school_id, name: c.name, grade: c.shift });
      if (insErr) throw insErr;
    }
  }
};

export const persistGeneratedScheduleAsWorkloads = async (
  school_id: string,
  schedule: Schedule
) => {
  if (!school_id || !schedule?.entries?.length) return;

  // Carregar mapas de nome -> id
  const [teachersRes, classesRes, subjectsRes] = await Promise.all([
    supabase.from("teachers").select("id, name").eq("school_id", school_id),
    supabase.from("classes").select("id, name").eq("school_id", school_id),
    supabase.from("subjects").select("id, name").eq("school_id", school_id),
  ]);

  if (teachersRes.error) throw teachersRes.error;
  if (classesRes.error) throw classesRes.error;
  if (subjectsRes.error) throw subjectsRes.error;

  const teacherMap = new Map<string, string>();
  (teachersRes.data || []).forEach((t: any) => teacherMap.set(t.name as string, t.id as string));

  const classMap = new Map<string, string>();
  (classesRes.data || []).forEach((c: any) => classMap.set(c.name as string, c.id as string));

  const subjectMap = new Map<string, string>();
  (subjectsRes.data || []).forEach((s: any) => subjectMap.set(s.name as string, s.id as string));

  // Agregar horas por (teacher, class, subject)
  const aggregate: Record<string, number> = {};
  for (const e of schedule.entries) {
    const key = `${e.teacherName}||${e.className}||${e.subjectName}`;
    aggregate[key] = (aggregate[key] || 0) + 1;
  }

  // Persistir cada carga
  for (const [key, hours] of Object.entries(aggregate)) {
    const [tName, cName, sName] = key.split("||");
    const teacher_id = teacherMap.get(tName);
    const class_id = classMap.get(cName);
    const subject_id = subjectMap.get(sName);

    // Ignorar entradas sem IDs resolvidos
    if (!teacher_id || !class_id || !subject_id) continue;

    // Tentar localizar workload existente para atualizar
    const { data: existing, error: selErr } = await supabase
      .from("workloads")
      .select("id")
      .eq("school_id", school_id)
      .eq("teacher_id", teacher_id)
      .eq("class_id", class_id)
      .eq("subject_id", subject_id)
      .maybeSingle();

    if (selErr) throw selErr;

    if (existing?.id) {
      const { error: updErr } = await supabase
        .from("workloads")
        .update({ hours })
        .eq("id", existing.id);
      if (updErr) throw updErr;
    } else {
      const { error: insErr } = await supabase
        .from("workloads")
        .insert({ school_id, teacher_id, class_id, subject_id, hours });
      if (insErr) throw insErr;
    }
  }
};