import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  workload_total?: number;
  planning_hours?: number;
  activity_hours?: number;
}

export interface Class {
  id: string;
  name: string;
  shift: string;
  aulasDiarias?: number;
}

export interface Workload {
  id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  hours: number;
}

export interface Subject {
  id: string;
  name: string;
  aulas_por_turma: Record<string, number>;
}

export interface SchoolConfig {
  modalidade?: string;
  turno?: string;
  horario_inicio?: string;
  duracao_aula?: string;
  intervalos?: any;
}

export interface TeacherAvailability {
  id: string;
  teacher_id: string;
  day_of_week: number;
  time_slot_index: number;
  status: 'P' | 'HA' | 'ND';
}

export interface FixedLesson {
  id: string;
  school_id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  day_of_week: number; // 0-4 (Mon-Fri)
  slot_number: number; // 1-based
  created_at?: string;
  updated_at?: string;
}

export interface GenerationConfig {
  hardConstraints: {
    avoidTeacherClashes: boolean;
    respectAvailability: boolean;
    fulfillWorkload: boolean;
  };
  pedagogical: {
    teacherGaps: number;
    groupDoubleLessons: boolean;
    maxDailyLessonsPerClass: number;
  };
  advanced: {
    allocationPriority: boolean;
    classLocations: boolean;
    studentGaps: boolean;
    teacherMovement: boolean;
    subjectGrouping: boolean;
  };
}

export interface DataContextType {
  schoolName: string;
  setSchoolName: (name: string) => void;
  teachers: Teacher[];
  setTeachers: (teachers: Teacher[]) => void;
  addTeacher: (teacher: Teacher) => void;
  updateTeacher: (id: string, teacher: Teacher) => void;
  deleteTeacher: (id: string) => void;
  saveTeachers: (teachers: Teacher[]) => Promise<void>;
  subjects: Subject[];
  setSubjects: (subjects: Subject[]) => void;
  addSubject: (subject: Subject) => void;
  deleteSubject: (subjectId: string) => void;
  saveSubjects: (subjects: Subject[]) => Promise<void>;
  classes: Class[];
  saveClasses: (classes: Class[]) => Promise<void>;
  addClass: (classItem: Class) => void;
  updateClass: (id: string, classItem: Class) => void;
  deleteClass: (id: string) => void;
  workloads: Workload[];
  workload: Record<string, number>;
  setWorkload: (workload: Record<string, number>) => void;
  updateWorkload: (className: string, hours: number) => void;
  schoolConfig: SchoolConfig | null;
  saveSchoolConfig: (config: SchoolConfig) => Promise<void>;
  teacherAvailability: TeacherAvailability[];
  saveTeacherAvailability: (availability: TeacherAvailability[]) => Promise<void>;
  saveWorkload: (teacherId: string, subjectId: string, classId: string, hours: number) => Promise<void>;
  deleteWorkload: (teacherId: string, subjectId: string, classId: string) => Promise<void>;
  clearAllWorkloads: () => Promise<void>;
  fixedLessons: FixedLesson[];
  saveFixedLesson: (teacherId: string, subjectId: string, classId: string, dayOfWeek: number, slotNumber: number) => Promise<void>;
  deleteFixedLesson: (teacherId: string, dayOfWeek: number, slotNumber: number) => Promise<void>;
  getFixedLessonForSlot: (teacherId: string, dayOfWeek: number, slotNumber: number) => FixedLesson | undefined;
  generationConfig: GenerationConfig;
  saveGenerationConfig: (config: GenerationConfig) => void;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [schoolName, setSchoolName] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [workloads, setWorkloads] = useState<Workload[]>([]);
  const [workload, setWorkload] = useState<Record<string, number>>({});
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig | null>(null);
  const [teacherAvailability, setTeacherAvailability] = useState<TeacherAvailability[]>([]);
  const [fixedLessons, setFixedLessons] = useState<FixedLesson[]>([]);
  const { user } = useAuth();
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile(user?.id);

  // Helper to generate UUIDs in non-secure contexts
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  const addTeacher = (teacher: Teacher) => {
    setTeachers((prev) => [...prev, teacher]);
  };

  const updateTeacher = (id: string, teacher: Teacher) => {
    setTeachers((prev) => prev.map((t) => (t.id === id ? teacher : t)));
  };

  const deleteTeacher = async (id: string) => {
    // Optimistic update
    setTeachers((prev) => prev.filter((t) => t.id !== id));

    if (id.startsWith('new-')) return;

    if (!profile?.school_id) {
      console.error("School ID not found, cannot delete teacher.");
      return;
    }

    const { error } = await supabase.from('teachers').delete().eq('id', id);
    if (error) {
      console.error('Error deleting teacher:', error);
      // Revert if needed, but for now we just log
    }
  };

  const saveTeachers = async (newTeachers: Teacher[]) => {
    if (!profile?.school_id) {
      console.error("School ID not found, cannot save teachers.");
      throw new Error("School ID not found");
    }

    const teachersToUpsert = newTeachers.map((t) => ({
      id: t.id.startsWith('new-') ? generateUUID() : t.id,
      school_id: profile.school_id,
      name: t.name,
      workload_total: t.workload_total || 0,
      planning_hours: t.planning_hours || 0,
      activity_hours: t.activity_hours || 0,
    }));

    const { data, error } = await supabase
      .from('teachers')
      .upsert(teachersToUpsert)
      .select();

    if (error) {
      console.error('Error saving teachers:', error);
      throw error;
    }

    if (data) {
      // Merge with existing subjects data since we don't save subjects here anymore (subjects are derived or saved elsewhere?)
      // Actually, the previous implementation derived subjects from workloads. 
      // We should preserve the subjects if they are not being saved here.
      // But wait, the new UI doesn't show subjects input.
      // We will just update the fields we know about.

      setTeachers((prev) => {
        const savedMap = new Map(data.map((t: any) => [t.id, t]));
        return prev.map(p => {
          // If this teacher was just saved (it might have had a temp ID, but now we need to match by name or we reload all?)
          // Reloading all is safer but might be slow.
          // For now, let's just reload data from server or trust the response.
          // The response has the new IDs.
          // But mapping back to the 'new-...' IDs is hard without a correlation.
          // So we might just replace the whole list with what we sent + IDs.
          return p;
        });
      });

      // Simpler approach: just reload data or setTeachers from response + keep subjects?
      // The previous loadData logic derived subjects from workloads.
      // Let's just setTeachers from the response and assume subjects are empty until re-derived or we keep them?
      // We'll map response to Teacher objects.
      const savedTeachers: Teacher[] = data.map((t: any) => ({
        id: t.id,
        name: t.name,
        subjects: [], // We lose subjects here if we don't merge. 
        workload_total: t.workload_total,
        planning_hours: t.planning_hours,
        activity_hours: t.activity_hours,
      }));
      setTeachers(savedTeachers);
    }
  };

  const addSubject = (subject: Subject) => {
    setSubjects((prev) => [...prev, subject]);
  };

  const deleteSubject = async (subjectId: string) => {
    if (!profile?.school_id) {
      console.error("School ID not found, cannot delete subject.");
      return;
    }
    const { error } = await supabase.from('subjects').delete().eq('id', subjectId);
    if (error) {
      console.error('Error deleting subject:', error);
    } else {
      setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    }
  };

  const saveSubjects = async (newSubjects: Subject[]) => {
    if (!profile?.school_id) {
      console.error("School ID not found, cannot save subjects.");
      throw new Error("School ID not found");
    }

    const subjectsToUpsert = newSubjects.map(({ id, name, aulas_por_turma }) => ({
      id: id.startsWith('new-') ? generateUUID() : id,
      school_id: profile.school_id,
      name,
      aulas_por_turma,
    }));

    const { data, error } = await supabase
      .from('subjects')
      .upsert(subjectsToUpsert)
      .select();

    if (error) {
      console.error('Error saving subjects:', error);
      throw error;
    }

    if (data) {
      const savedSubjects = data.map((s: any) => ({
        id: s.id,
        name: s.name,
        aulas_por_turma: s.aulas_por_turma || {},
      }));
      setSubjects(savedSubjects);
    }
  };

  const saveClasses = async (newClasses: Class[]) => {
    if (!profile?.school_id) {
      console.error("School ID not found, cannot save classes.");
      return;
    }

    try {
      // 1. Buscar turmas existentes
      const { data: existingClasses, error: fetchError } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', profile.school_id);

      if (fetchError) {
        console.error('Error fetching existing classes:', fetchError);
        toast.error("Erro ao buscar turmas existentes.");
        return;
      }

      const existingClassesMap = new Map((existingClasses || []).map(c => [c.id, c]));

      // 2. Separar turmas em: novas, existentes (para atualizar), e removidas
      const classesToInsert: any[] = [];
      const classesToUpdate: any[] = [];
      const existingIds = new Set<string>();

      newClasses.forEach(c => {
        const classData = {
          name: c.name,
          grade: c.shift,
          aulas_diarias: c.aulasDiarias || 5,
          school_id: profile.school_id,
        };

        // Se o ID começa com 'new-', é uma turma nova
        if (c.id.startsWith('new-')) {
          classesToInsert.push(classData);
        } else if (existingClassesMap.has(c.id)) {
          // Turma existente - atualizar
          classesToUpdate.push({ ...classData, id: c.id });
          existingIds.add(c.id);
        } else {
          // ID não encontrado, tratar como nova
          classesToInsert.push(classData);
        }
      });

      // 3. Identificar turmas removidas (existem no banco mas não na lista nova)
      const removedClassIds = (existingClasses || [])
        .filter(c => !existingIds.has(c.id) && !newClasses.some(nc => nc.id === c.id))
        .map(c => c.id);

      console.log("📊 Análise de turmas:");
      console.log("  - Para inserir:", classesToInsert.length);
      console.log("  - Para atualizar:", classesToUpdate.length);
      console.log("  - Para remover:", removedClassIds.length);

      // 4. Deletar turmas removidas e seus relacionamentos
      if (removedClassIds.length > 0) {
        // Deletar workloads relacionados
        await supabase
          .from('workloads')
          .delete()
          .in('class_id', removedClassIds);

        // Deletar fixed_lessons relacionados
        await supabase
          .from('fixed_lessons')
          .delete()
          .in('class_id', removedClassIds);

        // Deletar as turmas
        const { error: deleteError } = await supabase
          .from('classes')
          .delete()
          .in('id', removedClassIds);

        if (deleteError) {
          console.error('Error deleting removed classes:', deleteError);
        }
      }

      // 5. Inserir novas turmas
      let insertedClasses: any[] = [];
      if (classesToInsert.length > 0) {
        const { data: inserted, error: insertError } = await supabase
          .from('classes')
          .insert(classesToInsert)
          .select();

        if (insertError) {
          console.error('Error inserting classes:', insertError);
          toast.error("Erro ao inserir novas turmas.");
          return;
        }
        insertedClasses = inserted || [];
      }

      // 6. Atualizar turmas existentes
      let updatedClasses: any[] = [];
      if (classesToUpdate.length > 0) {
        // Supabase não tem bulk update, fazer um por um
        for (const classData of classesToUpdate) {
          const { data: updated, error: updateError } = await supabase
            .from('classes')
            .update({
              name: classData.name,
              grade: classData.grade,
              aulas_diarias: classData.aulas_diarias,
            })
            .eq('id', classData.id)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating class:', updateError);
          } else if (updated) {
            updatedClasses.push(updated);
          }
        }
      }

      // 7. Atualizar estado local com todas as turmas (inseridas + atualizadas)
      const allClasses = [...insertedClasses, ...updatedClasses];
      const savedClasses = allClasses.map((c: any) => ({
        id: c.id,
        name: c.name,
        shift: c.grade,
        aulasDiarias: c.aulas_diarias,
      }));

      console.log("✅ Classes salvas:", savedClasses);
      setClasses(savedClasses);
      toast.success(`Turmas salvas! (${insertedClasses.length} novas, ${updatedClasses.length} atualizadas, ${removedClassIds.length} removidas)`);

    } catch (error) {
      console.error("Erro ao salvar turmas:", error);
      toast.error("Erro ao salvar turmas.");
    }
  };

  const addClass = (classItem: Class) => {
    setClasses((prev) => [...prev, classItem]);
  };

  const updateClass = (id: string, classItem: Class) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? classItem : c)));
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  const updateWorkload = (className: string, hours: number) => {
    setWorkload((prev) => ({ ...prev, [className]: hours }));
  };

  const saveSchoolConfig = async (config: SchoolConfig) => {
    if (!profile?.school_id) {
      console.error("School ID not found, cannot save config.");
      return;
    }

    const { data, error } = await supabase
      .from("school_configs")
      .upsert({ school_id: profile.school_id, ...config } as any, { onConflict: 'school_id' })
      .select();

    if (error) {
      console.error("Error saving school config:", error);
    } else if (data) {
      setSchoolConfig(data[0] as SchoolConfig);
    }
  };

  const saveTeacherAvailability = async (newAvailability: TeacherAvailability[]) => {
    if (!profile?.school_id) {
      console.error("School ID not found, cannot save availability.");
      return;
    }

    // 1. Prepare data for upsert
    const availabilityToUpsert = newAvailability.map(a => ({
      school_id: profile.school_id,
      teacher_id: a.teacher_id,
      day_of_week: a.day_of_week,
      time_slot_index: a.time_slot_index,
      status: a.status,
    }));

    // 2. Upsert (Insert or Update)
    const { data, error } = await supabase
      .from('teacher_availability')
      .upsert(availabilityToUpsert, { onConflict: 'teacher_id,day_of_week,time_slot_index' })
      .select();

    if (error) {
      console.error('Error saving teacher availability:', error);
      toast.error("Erro ao salvar disponibilidade.");
      return;
    }

    if (data) {
      // 3. Delete removed records
      // We delete any record for this school that is NOT in the returned data IDs
      const keptIds = data.map((d: any) => d.id);

      let deleteQuery = supabase
        .from('teacher_availability')
        .delete()
        .eq('school_id', profile.school_id);

      if (keptIds.length > 0) {
        deleteQuery = deleteQuery.not('id', 'in', `(${keptIds.join(',')})`);
      }

      const { error: deleteError } = await deleteQuery;

      if (deleteError) {
        console.error("Error deleting removed availability:", deleteError);
      }

      // 4. Update local state
      // We can just use the returned data which represents the full state of what we just saved
      // But we need to map it back to TeacherAvailability interface
      const savedAvailability: TeacherAvailability[] = data.map((d: any) => ({
        id: d.id,
        teacher_id: d.teacher_id,
        day_of_week: d.day_of_week,
        time_slot_index: d.time_slot_index,
        status: d.status,
      }));

      setTeacherAvailability(savedAvailability);
      toast.success("Disponibilidade salva com sucesso!");
    }
  };

  const saveWorkload = async (teacherId: string, subjectId: string, classId: string, hours: number) => {
    if (!profile?.school_id) {
      console.error("School ID not found, cannot save workload.");
      return;
    }

    // Upsert workload
    // We need to check if there is already a workload for this teacher/subject/class?
    // Or is it unique by class/subject? 
    // Usually a class has a subject taught by ONE teacher.
    // So we should upsert based on (class_id, subject_id) and update teacher_id and hours.
    // BUT, the table might not have that constraint.
    // Let's check the table definition again? 
    // Assuming unique(class_id, subject_id) or unique(class_id, subject_id, teacher_id)?
    // If we want to assign a teacher to a class/subject, we should probably ensure no other teacher has it?
    // Or maybe we just insert/update.

    // Let's try to find existing record for class_id + subject_id
    const { data: existing, error: fetchError } = await supabase
      .from('workloads')
      .select('id')
      .eq('school_id', profile.school_id)
      .eq('class_id', classId)
      .eq('subject_id', subjectId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking existing workload:", fetchError);
      return;
    }

    let error;
    let savedData;
    if (existing) {
      // Update
      const { data, error: updateError } = await supabase
        .from('workloads')
        .update({ teacher_id: teacherId, hours: hours })
        .eq('id', existing.id)
        .select();
      savedData = data;
      error = updateError;
    } else {
      // Insert
      const { data, error: insertError } = await supabase
        .from('workloads')
        .insert({
          school_id: profile.school_id,
          teacher_id: teacherId,
          subject_id: subjectId,
          class_id: classId,
          hours: hours
        })
        .select();
      savedData = data;
      error = insertError;
    }
    if (error) {
      console.error("Error saving workload:", error);
      toast.error("Erro ao salvar alocação.");
    } else if (savedData && savedData.length > 0) {
      const newWorkload: Workload = {
        id: savedData[0].id,
        teacher_id: teacherId,
        subject_id: subjectId,
        class_id: classId,
        hours: hours
      };

      toast.success("Alocação salva!");

      // Optimistic update or reload?
      // Reloading is safer.
      // But we can't easily call loadData.
      // Let's update workloads manually.
      setWorkloads(prev => {
        const filtered = prev.filter(w => !(w.class_id === classId && w.subject_id === subjectId));
        return [...filtered, newWorkload];
      });

      // Also update the 'workload' map (total hours per class)
      const className = classes.find(c => c.id === classId)?.name || "Unknown";
      setWorkload(prev => {
        // Recalculate total for this class
        const currentTotal = prev[className] || 0;
        return prev;
      });
    }
  };

  const deleteWorkload = async (teacherId: string, subjectId: string, classId: string) => {
    if (!profile?.school_id) return;

    const { error } = await supabase
      .from('workloads')
      .delete()
      .match({
        school_id: profile.school_id,
        teacher_id: teacherId,
        subject_id: subjectId,
        class_id: classId
      });

    if (error) {
      console.error("Error deleting workload:", error);
      toast.error("Erro ao remover alocação.");
    } else {
      setWorkloads(prev => prev.filter(w => !(w.teacher_id === teacherId && w.subject_id === subjectId && w.class_id === classId)));
      toast.success("Alocação removida.");
    }
  };

  const clearAllWorkloads = async () => {
    if (!profile?.school_id) {
      toast.error("Escola não identificada.");
      return;
    }

    const { error } = await supabase
      .from('workloads')
      .delete()
      .eq('school_id', profile.school_id);

    if (error) {
      console.error("Error clearing workloads:", error);
      toast.error("Erro ao limpar a grade.");
    } else {
      setWorkloads([]);
      setWorkload({});
      toast.success("Grade limpa com sucesso!");
    }
  };

  // Fixed Lessons Functions
  const saveFixedLesson = async (
    teacherId: string,
    subjectId: string,
    classId: string,
    dayOfWeek: number,
    slotNumber: number
  ) => {
    if (!profile?.school_id) {
      toast.error("Escola não identificada.");
      return;
    }

    // Check if there's already a fixed lesson for this teacher/slot
    const existing = fixedLessons.find(
      fl => fl.teacher_id === teacherId && fl.day_of_week === dayOfWeek && fl.slot_number === slotNumber
    );

    let savedData;
    let error;

    if (existing) {
      // Update
      const { data, error: updateError } = await supabase
        .from('fixed_lessons')
        .update({ subject_id: subjectId, class_id: classId })
        .eq('id', existing.id)
        .select();
      savedData = data;
      error = updateError;
    } else {
      // Insert
      const { data, error: insertError } = await supabase
        .from('fixed_lessons')
        .insert({
          school_id: profile.school_id,
          teacher_id: teacherId,
          subject_id: subjectId,
          class_id: classId,
          day_of_week: dayOfWeek,
          slot_number: slotNumber
        })
        .select();
      savedData = data;
      error = insertError;
    }

    if (error) {
      console.error("Error saving fixed lesson:", error);
      toast.error("Erro ao salvar aula fixa.");
    } else if (savedData && savedData.length > 0) {
      const newFixedLesson: FixedLesson = savedData[0];
      setFixedLessons(prev => {
        const filtered = prev.filter(
          fl => !(fl.teacher_id === teacherId && fl.day_of_week === dayOfWeek && fl.slot_number === slotNumber)
        );
        return [...filtered, newFixedLesson];
      });
      toast.success("Aula fixa salva!");
    }
  };

  const deleteFixedLesson = async (teacherId: string, dayOfWeek: number, slotNumber: number) => {
    if (!profile?.school_id) return;

    const { error } = await supabase
      .from('fixed_lessons')
      .delete()
      .match({
        school_id: profile.school_id,
        teacher_id: teacherId,
        day_of_week: dayOfWeek,
        slot_number: slotNumber
      });

    if (error) {
      console.error("Error deleting fixed lesson:", error);
      toast.error("Erro ao remover aula fixa.");
    } else {
      setFixedLessons(prev =>
        prev.filter(fl => !(fl.teacher_id === teacherId && fl.day_of_week === dayOfWeek && fl.slot_number === slotNumber))
      );
      toast.success("Aula fixa removida.");
    }
  };

  const getFixedLessonForSlot = (teacherId: string, dayOfWeek: number, slotNumber: number): FixedLesson | undefined => {
    return fixedLessons.find(
      fl => fl.teacher_id === teacherId && fl.day_of_week === dayOfWeek && fl.slot_number === slotNumber
    );
  };

  // Carregamento automático dos dados a partir do Supabase, filtrados por school_id
  useEffect(() => {
    const loadData = async () => {
      // Determinar escola efetiva para carregar dados
      let effectiveSchoolId: string | null = profile?.school_id ?? null;
      let effectiveSchoolName: string = profile?.school_name || "";

      // Se não houver school_id, tenta associar automaticamente à escola existente
      if (!effectiveSchoolId) {
        // Busca escolas disponíveis (limit 1 para evitar excesso)
        const { data: schoolsData, error: schoolsErr } = await supabase
          .from("schools")
          .select("id, name")
          .limit(1);

        if (!schoolsErr && schoolsData && schoolsData.length > 0) {
          const fallbackSchool = schoolsData[0];
          effectiveSchoolName = (fallbackSchool as any).name as string;

          // Para usuários não-admin, tentar vincular perfil à escola única
          if (profile && (profile.role === 'teacher' || profile.role === 'staff') && !profile.school_id) {
            try {
              const { error: updateErr } = await supabase
                .from('profiles')
                .update({ school_id: (fallbackSchool as any).id as string })
                .eq('id', profile.id);
              if (!updateErr) {
                effectiveSchoolId = (fallbackSchool as any).id as string;
                // Atualiza perfil em memória
                await refetchProfile();
              }
            } catch (e) {
              // Silencia erro de atualização; segue com fallback de leitura sem school_id
            }
          }
        }
      }

      setSchoolName(effectiveSchoolName || "");

      // Carregar professores
      let teachersQuery = supabase.from("teachers").select("id, name, school_id, workload_total, planning_hours, activity_hours");
      if (effectiveSchoolId) {
        teachersQuery = teachersQuery.eq("school_id", effectiveSchoolId);
      }
      const { data: teacherRows, error: teacherErr } = await teachersQuery;
      if (!teacherErr) {
        const baseTeachers: Teacher[] = (teacherRows || []).map((t) => ({
          id: (t as any).id as string,
          name: (t as any).name as string,
          subjects: [],
          workload_total: (t as any).workload_total || 0,
          planning_hours: (t as any).planning_hours || 0,
          activity_hours: (t as any).activity_hours || 0,
        }));
        setTeachers(baseTeachers);
      }

      // Carregar disciplinas
      let subjectsQuery = supabase.from("subjects").select("id, name, aulas_por_turma, school_id");
      if (effectiveSchoolId) {
        subjectsQuery = subjectsQuery.eq("school_id", effectiveSchoolId);
      }
      const { data: subjectRows, error: subjectErr } = await subjectsQuery;
      if (!subjectErr) {
        setSubjects((subjectRows || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          aulas_por_turma: s.aulas_por_turma || {},
        })));
      }

      // Carregar turmas
      let classesQuery = supabase.from("classes").select("id, name, grade, school_id, aulas_diarias");
      if (effectiveSchoolId) {
        classesQuery = classesQuery.eq("school_id", effectiveSchoolId);
      }
      const { data: classRows, error: classErr } = await classesQuery;
      if (!classErr) {
        setClasses(
          (classRows || []).map((c) => ({
            id: (c as any).id as string,
            name: (c as any).name as string,
            // Usa grade como substituto de turno quando não houver campo específico
            shift: ((c as any).grade as string | null) || "Não informado",
            aulasDiarias: (c as any).aulas_diarias as number | undefined,
          }))
        );
      }

      // Carregar cargas (workloads) com joins para obter nomes de turma/professor/disciplina
      let workloadsQuery = supabase
        .from("workloads")
        .select(
          `id, hours, teacher_id, subject_id, class_id,
           classes:class_id(name),
           teachers:teacher_id(name),
           subjects:subject_id(name),
           school_id`
        );
      if (effectiveSchoolId) {
        workloadsQuery = workloadsQuery.eq("school_id", effectiveSchoolId);
      }
      const { data: workloadRows, error: workloadErr } = await workloadsQuery;

      if (!workloadErr) {
        const workloadMap: Record<string, number> = {};
        const teacherSubjectMap: Record<string, Set<string>> = {};

        (workloadRows || []).forEach((w: any) => {
          const className = w.classes?.name || "Sem turma";
          const hours = (w.hours as number) || 0;
          workloadMap[className] = (workloadMap[className] || 0) + hours;

          const teacherId = w.teacher_id as string;
          const subjectName = w.subjects?.name as string | undefined;
          if (teacherId && subjectName) {
            if (!teacherSubjectMap[teacherId]) teacherSubjectMap[teacherId] = new Set();
            teacherSubjectMap[teacherId].add(subjectName);
          }
        });

        setWorkload(workloadMap);
        setWorkloads(workloadRows.map((w: any) => ({
          id: w.id,
          teacher_id: w.teacher_id,
          subject_id: w.subject_id,
          class_id: w.class_id || "",
          hours: w.hours
        })));

        // Atualiza lista de professores para incluir as disciplinas derivadas das workloads
        setTeachers((prev) =>
          prev.map((t) => ({
            ...t,
            subjects: Array.from(teacherSubjectMap[t.id] || new Set<string>()),
          }))
        );
      }

      // Carregar configurações da escola
      if (effectiveSchoolId) {
        const { data: configData, error: configErr } = await supabase
          .from("school_configs")
          .select("*")
          .eq("school_id", effectiveSchoolId)
          .single();
        if (!configErr && configData) {
          setSchoolConfig(configData as SchoolConfig);
        }
      }

      // Carregar disponibilidade dos professores
      if (effectiveSchoolId) {
        const { data: availabilityData, error: availabilityErr } = await supabase
          .from("teacher_availability")
          .select("*")
          .eq("school_id", effectiveSchoolId);

        if (!availabilityErr && availabilityData) {
          setTeacherAvailability(availabilityData as TeacherAvailability[]);
        }
      }

      // Carregar aulas fixas
      if (effectiveSchoolId) {
        const { data: fixedLessonsData, error: fixedLessonsErr } = await supabase
          .from("fixed_lessons")
          .select("*")
          .eq("school_id", effectiveSchoolId);

        if (!fixedLessonsErr && fixedLessonsData) {
          setFixedLessons(fixedLessonsData as FixedLesson[]);
        }
      }
    };

    if (!profileLoading) {
      loadData();
    }
  }, [profileLoading, profile?.school_id, profile?.role]);

  const [generationConfig, setGenerationConfig] = useState<GenerationConfig>({
    hardConstraints: {
      avoidTeacherClashes: true,
      respectAvailability: true,
      fulfillWorkload: true,
    },
    pedagogical: {
      teacherGaps: 50,
      groupDoubleLessons: true,
      maxDailyLessonsPerClass: 4,
    },
    advanced: {
      allocationPriority: true,
      classLocations: false,
      studentGaps: true,
      teacherMovement: false,
      subjectGrouping: true,
    },
  });

  const saveGenerationConfig = (config: GenerationConfig) => {
    setGenerationConfig(config);
    // Future: Save to Supabase if needed
  };

  return (
    <DataContext.Provider
      value={{
        schoolName,
        setSchoolName,
        teachers,
        setTeachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        saveTeachers,
        subjects,
        setSubjects,
        addSubject,
        deleteSubject,
        saveSubjects,
        classes,
        saveClasses,
        addClass,
        updateClass,
        deleteClass,
        workloads,
        workload,
        setWorkload,
        updateWorkload,
        schoolConfig,
        saveSchoolConfig,
        teacherAvailability,
        saveTeacherAvailability,
        saveWorkload,
        deleteWorkload,
        clearAllWorkloads,
        fixedLessons,
        saveFixedLesson,
        deleteFixedLesson,
        getFixedLessonForSlot,
        generationConfig,
        saveGenerationConfig,
        loading: profileLoading
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
