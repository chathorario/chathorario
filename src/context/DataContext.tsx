import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  workload_total?: number;
  planning_hours?: number;
  activity_hours?: number;
  knowledge_area?: string;
}



export interface Class {
  id: string;
  name: string;
  shift: string;
  aulasDiarias?: number;
  bell_schedule?: { type: 'lesson' | 'break'; duration: number }[];
}

export interface Workload {
  id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  hours: number;
  schedule_id?: string;
}

export interface KnowledgeArea {
  id: string;
  name: string;
  color: string;
}

export interface Subject {
  id: string;
  name: string;
  aulas_por_turma: Record<string, number>;
  knowledge_area_id?: string;
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
  schedule_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Schedule {
  id: string;
  school_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
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

export interface CurriculumComponent {
  id?: string;
  matrix_id?: string;
  knowledge_area: string;
  component_name: string;
  weekly_hours_1st: number;
  weekly_hours_2nd: number;
  weekly_hours_3rd: number;
  annual_hours_1st: number;
  annual_hours_2nd: number;
  annual_hours_3rd: number;
  total_hours: number;
  is_diversified: boolean;
  display_order: number;
}

export interface CurriculumMatrix {
  id?: string;
  school_id?: string;
  name: string;
  education_level: string;
  modality: string;
  network: string;
  network_type?: string;
  regime: string;
  total_workload: number;
  school_days: number;
  weekly_hours: number;
  daily_hours: number;
  total_daily_hours: number;
  shift: string;
  entry_time: string;
  validity_year: number;
  observations: string;
  components: CurriculumComponent[];
  created_at?: string;
  updated_at?: string;
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
  deleteSubjects: (subjectIds: string[]) => Promise<void>;
  saveSubjects: (subjects: Subject[]) => Promise<void>;
  classes: Class[];
  saveClasses: (classes: Class[]) => Promise<void>;
  addClass: (classItem: Class) => void;
  updateClass: (id: string, classItem: Class) => void;
  deleteClass: (id: string) => void;
  deleteClasses: (classIds: string[]) => Promise<void>;
  deleteAllClasses: () => Promise<void>;
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
  curriculumMatrices: CurriculumMatrix[];
  saveCurriculumMatrix: (matrix: CurriculumMatrix) => Promise<void>;
  deleteCurriculumMatrix: (id: string) => Promise<void>;
  knowledgeAreas: KnowledgeArea[];
  saveKnowledgeAreas: (areas: KnowledgeArea[]) => Promise<KnowledgeArea[]>;
  deleteKnowledgeArea: (id: string) => Promise<void>;

  // Multi-Scenario
  schedules: Schedule[];
  currentScheduleId: string | null;
  setCurrentScheduleId: (id: string | null) => void;
  createSchedule: (name: string, description?: string, cloneFromId?: string) => Promise<void>;
  updateSchedule: (id: string, updates: { name?: string; description?: string }) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  exportScenario: (scheduleId: string, format?: 'json' | 'xlsx') => Promise<void>;
  importScenario: (file: File) => Promise<void>;

  // Unsaved Changes Tracking
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;

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
  const [curriculumMatrices, setCurriculumMatrices] = useState<CurriculumMatrix[]>([]);
  const [knowledgeAreas, setKnowledgeAreas] = useState<KnowledgeArea[]>([]);

  // Multi-Scenario State
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentScheduleId, setCurrentScheduleId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeScenarioId');
    }
    return null;
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (currentScheduleId) {
      localStorage.setItem('activeScenarioId', currentScheduleId);
    } else {
      localStorage.removeItem('activeScenarioId');
    }
  }, [currentScheduleId]);

  const { user } = useAuth();
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile(user?.id);

  // Ref to prevent concurrent scenario data loading
  const isLoadingScenarioRef = useRef(false);

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

    try {
      // Create a map of temp IDs to their data for later replacement
      const tempIdMap = new Map<string, Teacher>();

      const teachersToUpsert = newTeachers.map((t) => {
        const isNew = t.id.startsWith('new-');
        const realId = isNew ? generateUUID() : t.id;

        // Store the mapping of temp ID to real ID
        if (isNew) {
          console.log(`[saveTeachers] Mapping temp ID ${t.id} -> real ID ${realId} for teacher: ${t.name}`);
          tempIdMap.set(t.id, { ...t, id: realId });
        }

        return {
          id: realId,
          school_id: profile.school_id,
          name: t.name,
          workload_total: t.workload_total || 0, // This saves to Global default
          planning_hours: t.planning_hours || 0,
          activity_hours: t.activity_hours || 0,
          knowledge_area: t.knowledge_area,
          schedule_id: null, // GLOBAL ENTITY
        };
      });

      console.log(`[saveTeachers] Upserting ${teachersToUpsert.length} teachers to database (Global)`);

      const { data, error } = await supabase
        .from('teachers')
        .upsert(teachersToUpsert)
        .select();

      // If we are in a scenario, we must also save the settings!
      if (!error && currentScheduleId) {
        const settingsToUpsert = newTeachers.map((t) => {
          // Find the real ID (in case it was new-)
          const isNew = t.id.startsWith('new-');
          const realId = isNew ? tempIdMap.get(t.id)?.id : t.id;

          if (!realId) return null;

          return {
            scenario_id: currentScheduleId,
            teacher_id: realId,
            custom_workload: t.workload_total,
            is_active: true
          };
        }).filter(Boolean);

        if (settingsToUpsert.length > 0) {
          console.log(`[saveTeachers] Upserting settings for scenario ${currentScheduleId}`);
          const { error: settingsError } = await supabase
            .from('scenario_teacher_settings')
            .upsert(settingsToUpsert as any); // Cast to any to avoid strict type checks on dynamic object

          if (settingsError) {
            console.error('Error saving teacher settings:', settingsError);
            // Non-fatal, but good to know
          }
        }
      }

      if (error) {
        console.error('Error saving teachers:', error);
        throw error;
      }

      if (data) {
        const savedTeachers: Teacher[] = data.map((t: any) => ({
          id: t.id,
          name: t.name,
          subjects: [],
          workload_total: t.workload_total,
          planning_hours: t.planning_hours,
          activity_hours: t.activity_hours,
          knowledge_area: t.knowledge_area,
        }));

        console.log(`[saveTeachers] Received ${savedTeachers.length} teachers from database`);

        // UPSERT LOGIC: Replace temp IDs with real ones, don't append
        setTeachers((prevTeachers) => {
          console.log(`[saveTeachers] Current teachers in state: ${prevTeachers.length}`);

          // Create a map of existing teachers by ID
          const existingMap = new Map(prevTeachers.map(t => [t.id, t]));

          // For each saved teacher, either update existing or add new
          savedTeachers.forEach(savedTeacher => {
            // Check if this was a temp ID that got replaced
            const tempEntry = Array.from(tempIdMap.entries()).find(
              ([tempId, data]) => data.id === savedTeacher.id
            );

            if (tempEntry) {
              // Remove the temp ID entry
              const [tempId] = tempEntry;
              console.log(`[saveTeachers] Replacing temp ID ${tempId} with real ID ${savedTeacher.id} for: ${savedTeacher.name}`);
              existingMap.delete(tempId);
            }

            // Add or update with the real ID
            existingMap.set(savedTeacher.id, savedTeacher);
          });

          const finalTeachers = Array.from(existingMap.values());
          console.log(`[saveTeachers] Final teachers count: ${finalTeachers.length}`);

          return finalTeachers;
        });
      }
    } catch (error) {
      console.error('Error in saveTeachers:', error);
      throw error;
    }
  };

  const addSubject = (subject: Subject) => {
    setSubjects((prev) => [...prev, subject]);
  };

  const deleteSubject = async (subjectId: string) => {
    await deleteSubjects([subjectId]);
  };

  const deleteSubjects = async (subjectIds: string[]) => {
    console.log('[deleteSubjects] Starting deletion for subjects:', subjectIds.length);

    if (!profile?.school_id || subjectIds.length === 0) {
      console.error("School ID not found or empty list.");
      return;
    }

    try {
      // 1. Delete related workloads
      const { error: workloadError } = await supabase.from('workloads').delete().in('subject_id', subjectIds);
      if (workloadError) console.error('Error deleting workloads:', workloadError);

      // 2. Delete related fixed lessons
      const { error: fixedError } = await supabase.from('fixed_lessons').delete().in('subject_id', subjectIds);
      if (fixedError) console.error('Error deleting fixed lessons:', fixedError);

      // 3. Delete the subjects
      const { error } = await supabase.from('subjects').delete().in('id', subjectIds);

      if (error) {
        console.error('Error deleting subjects:', error);
        toast.error(`Erro ao excluir disciplinas: ${error.message}`);
        throw error;
      } else {
        setSubjects((prev) => {
          // Optimization: If deleting all, just return empty
          if (subjectIds.length >= prev.length) {
            return [];
          }
          return prev.filter((s) => !subjectIds.includes(s.id));
        });

        toast.success(`${subjectIds.length} disciplina(s) excluída(s) com sucesso!`);
      }
    } catch (error) {
      console.error("Error in deleteSubjects:", error);
      throw error;
    }
  };

  const saveSubjects = async (newSubjects: Subject[]) => {
    if (!profile?.school_id) {
      console.error('School ID not found, cannot save subjects.');
      throw new Error('School ID not found');
    }
    try {
      const subjectsToUpsert = newSubjects.map((s) => ({
        id: s.id.startsWith('new-') ? generateUUID() : s.id,
        school_id: profile.school_id,
        name: s.name,
        aulas_por_turma: s.aulas_por_turma || {},
        knowledge_area_id: s.knowledge_area_id,
        schedule_id: null, // GLOBAL ENTITY
      }));
      const { data, error } = await supabase.from('subjects').upsert(subjectsToUpsert).select();
      if (error) {
        console.error('Error saving subjects:', error);
        throw error;
      }
      if (data) {
        const savedSubjects: Subject[] = data.map((s: any) => ({
          id: s.id,
          name: s.name,
          aulas_por_turma: s.aulas_por_turma || {},
          knowledge_area_id: s.knowledge_area_id,
        }));
        setSubjects(savedSubjects);
      }
    } catch (error) {
      console.error('Error in saveSubjects:', error);
      throw error;
    }
  };

  const saveClasses = async (newClasses: Class[]) => {
    console.log(`[saveClasses] START. currentScheduleId: ${currentScheduleId}, newClasses count: ${newClasses.length}`);
    if (!profile?.school_id) {
      console.error("School ID not found, cannot save classes.");
      return;
    }

    try {
      // 1. Buscar turmas existentes GLOBAIS
      let query = supabase
        .from('classes')
        .select('*')
        .eq('school_id', profile.school_id); // GLOBAL ONLY

      const { data: existingClasses, error: fetchError } = await query;
      console.log(`[saveClasses] Existing classes fetched: ${existingClasses?.length}`);

      if (fetchError) {
        console.error('Error fetching existing classes:', fetchError);
        throw fetchError;
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
          schedule_id: null, // GLOBAL ENTITY
          bell_schedule: c.bell_schedule || []
        };

        // Se o ID começa com 'new-', é uma turma nova
        if (c.id.startsWith('new-')) {
          // Tentar encontrar por nome/turno para evitar duplicatas
          // MAS apenas se o nome estiver completo (não for apenas "Série - ")
          // E se a turma existente ainda não tiver sido processada neste lote
          const isNameComplete = c.name.trim().split(' - ').length > 1 && c.name.trim().split(' - ')[1].trim() !== '';

          const existingByMatch = isNameComplete ? (existingClasses || []).find(
            ec => ec.name === c.name && ec.grade === c.shift && !existingIds.has(ec.id)
          ) : undefined;

          if (existingByMatch) {
            // Encontrou correspondência única! Atualizar em vez de inserir
            classesToUpdate.push({ ...classData, id: existingByMatch.id });
            existingIds.add(existingByMatch.id);
          } else {
            classesToInsert.push(classData);
          }
        } else if (existingClassesMap.has(c.id)) {
          // Turma existente pelo ID - atualizar
          classesToUpdate.push({ ...classData, id: c.id });
          existingIds.add(c.id);
        } else {
          // ID não encontrado no mapa (pode ser ID antigo ou inválido)
          // Tentar encontrar por nome/turno (Smart Match)
          const isNameComplete = c.name.trim().split(' - ').length > 1 && c.name.trim().split(' - ')[1].trim() !== '';

          const existingByMatch = isNameComplete ? (existingClasses || []).find(
            ec => ec.name === c.name && ec.grade === c.shift && !existingIds.has(ec.id)
          ) : undefined;

          if (existingByMatch) {
            // Encontrou correspondência! Atualizar usando o ID real do banco
            classesToUpdate.push({ ...classData, id: existingByMatch.id });
            existingIds.add(existingByMatch.id);
          } else {
            // Realmente nova (ou renomeada de forma que perdeu referência)
            classesToInsert.push(classData);
          }
        }
      });

      // 3. Identificar turmas removidas (existem no banco mas não na lista nova)
      const removedClassIds = (existingClasses || [])
        .filter(c => !existingIds.has(c.id) && !newClasses.some(nc => nc.id === c.id))
        .map(c => c.id);

      console.log("📊 Análise de turmas:");
      console.log("  - Para inserir:", classesToInsert.length);
      console.log("  - Para atualizar:", classesToUpdate.length);
      console.log("  - Turmas no formulário:", newClasses.length);

      // 4. IMPORTANTE: NÃO deletar turmas automaticamente
      // Deletions só devem acontecer via ação explícita do usuário (botão Excluir com confirmação)
      // Isso evita perda acidental de dados durante auto-save

      // 5. Inserir novas turmas
      let insertedClasses: any[] = [];
      if (classesToInsert.length > 0) {
        const { data: inserted, error: insertError } = await supabase
          .from('classes')
          .insert(classesToInsert)
          .select();

        if (insertError) {
          console.error('Error inserting classes:', insertError);
          throw insertError;
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
              bell_schedule: classData.bell_schedule
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
      // 6. Se houver cenário ativo, salvar SETTINGS (Turn Override)
      if (currentScheduleId) {
        const settingsToUpsert = newClasses
          .filter(c => !c.id.startsWith('new-'))
          .map(c => ({
            scenario_id: currentScheduleId,
            class_id: c.id,
            turn_override: c.shift,
            is_active: true
          }));

        // Remover duplicatas por (scenario_id, class_id) para evitar 409 Conflict
        const uniqueSettings = Array.from(
          new Map(settingsToUpsert.map(item => [`${item.scenario_id}-${item.class_id}`, item])).values()
        );

        if (uniqueSettings.length > 0) {
          await supabase.from('scenario_class_settings').upsert(uniqueSettings, {
            onConflict: 'scenario_id, class_id'
          });
        }
      }

      // 7. Atualizar estado local
      // Recarregar tudo para garantir consistência (Global + Settings)
      const { data: refreshedClasses } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', profile.school_id);

      // Fetch settings again
      let classSettingsMap = new Map();
      if (currentScheduleId) {
        const { data: settings } = await supabase
          .from('scenario_class_settings')
          .select('*')
          .eq('scenario_id', currentScheduleId);
        if (settings) settings.forEach((s: any) => classSettingsMap.set(s.class_id, s));
      }

      if (refreshedClasses) {
        const mergedClasses = refreshedClasses.map((c: any) => {
          const setting = classSettingsMap.get(c.id);
          const shift = setting?.turn_override ?? c.grade ?? "Não informado";
          return {
            id: c.id,
            name: c.name,
            shift: shift,
            aulasDiarias: c.aulas_diarias,
            bell_schedule: c.bell_schedule
          };
        });
        setClasses(mergedClasses);
        console.log("✅ Classes salvas e recarregadas:", mergedClasses.length);
        if (mergedClasses.length > 0) {
          console.log('[saveClasses] Sample ID after reload:', mergedClasses[0].id);
          console.log('[saveClasses] Sample Bell Schedule:', mergedClasses[0].bell_schedule);
        }
      }

    } catch (error) {
      console.error("Erro ao salvar turmas:", error);
      throw error;
    }
  };

  const addClass = (classItem: Class) => {
    setClasses((prev) => [...prev, classItem]);
  };

  const updateClass = (id: string, classItem: Class) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? classItem : c)));
  };

  const deleteClass = async (id: string) => {
    await deleteClasses([id]);
  };

  const deleteClasses = async (classIds: string[]) => {
    if (!profile?.school_id || classIds.length === 0) {
      console.error("Cannot delete classes: missing school_id or empty classIds");
      return;
    }

    try {
      // 1. Deletar workloads relacionados (em TODOS os cenários - intencional)
      await supabase
        .from('workloads')
        .delete()
        .in('class_id', classIds);

      console.log(`[deleteClasses] Deleting ${classIds.length} classes from DB...`);

      // 2. Deletar fixed_lessons relacionados (em TODOS os cenários - intencional)
      await supabase
        .from('fixed_lessons')
        .delete()
        .in('class_id', classIds);

      // 3. Deletar as turmas
      const { error: deleteError } = await supabase
        .from('classes')
        .delete()
        .in('id', classIds);

      if (deleteError) {
        console.error('[deleteClasses] Error deleting classes from DB:', deleteError);
        throw deleteError;
      }

      console.log('[deleteClasses] DB deletion successful. Updating local state...');

      // 4. Atualizar estado local
      setClasses((prev) => {
        console.log(`[deleteClasses] State before update: ${prev.length} classes`);
        console.log(`[deleteClasses] IDs to delete:`, classIds);
        if (prev.length > 0) {
          console.log(`[deleteClasses] Sample state ID: ${prev[0].id} (Type: ${typeof prev[0].id})`);
          console.log(`[deleteClasses] Sample delete ID: ${classIds[0]} (Type: ${typeof classIds[0]})`);
        }

        const newClasses = classIds.length >= prev.length ? [] : prev.filter((c) => !classIds.includes(c.id));
        console.log(`[deleteClasses] State after update: ${newClasses.length} classes`);
        return newClasses;
      });

      console.log('[deleteClasses] Deletion completed successfully.');
    } catch (error) {
      console.error("Erro ao deletar turmas:", error);
      throw error;
    }
  };

  const deleteAllClasses = async () => {
    if (!profile?.school_id) {
      console.error("Cannot delete all classes: missing school_id");
      return;
    }

    try {
      // 1. Buscar todas as turmas do cenário atual
      let query = supabase
        .from('classes')
        .select('id')
        .eq('school_id', profile.school_id);

      // No schedule_id filter needed for global classes
      // query = query.is('schedule_id', null);

      const { data: allClasses, error: fetchError } = await query;

      if (allClasses) {
        console.log(`[deleteAllClasses] Found ${allClasses.length} classes to delete.`);
        const ids = allClasses.map(c => c.id);
        await deleteClasses(ids);
      }

      if (fetchError) {
        console.error('Error fetching classes:', fetchError);
        throw fetchError;
      }

      const classIds = (allClasses || []).map(c => c.id);

      if (classIds.length === 0) {
        return; // Nada para deletar
      }

      // 2. Deletar workloads relacionados
      await supabase
        .from('workloads')
        .delete()
        .in('class_id', classIds);

      // 3. Deletar fixed_lessons relacionados
      await supabase
        .from('fixed_lessons')
        .delete()
        .in('class_id', classIds);

      // 4. Deletar todas as turmas
      const { error: deleteError } = await supabase
        .from('classes')
        .delete()
        .in('id', classIds);

      if (deleteError) {
        console.error('Error deleting all classes:', deleteError);
        throw deleteError;
      }

      // 5. Limpar estado local
      setClasses([]);
    } catch (error) {
      console.error("Erro ao deletar todas as turmas:", error);
      throw error;
    }
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
      schedule_id: currentScheduleId, // SCENARIO-SPECIFIC
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

    // Find existing record for class_id + subject_id + schedule_id
    let query = supabase
      .from('workloads')
      .select('id')
      .eq('school_id', profile.school_id)
      .eq('class_id', classId)
      .eq('subject_id', subjectId);

    // CRITICAL: Filter by schedule_id to prevent cross-scenario updates
    if (currentScheduleId) {
      query = query.eq('schedule_id', currentScheduleId);
    } else {
      query = query.is('schedule_id', null);
    }

    const { data: existing, error: fetchError } = await query.maybeSingle();

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
          hours: hours,
          schedule_id: currentScheduleId
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
        hours: hours,
        schedule_id: currentScheduleId
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
        class_id: classId,
        schedule_id: currentScheduleId
      });

    if (error) {
      console.error("Error deleting workload:", error);
      toast.error("Erro ao remover alocação.");
    } else {
      setWorkloads(prev => prev.filter(w => !(w.teacher_id === teacherId && w.subject_id === subjectId && w.class_id === classId && w.schedule_id === currentScheduleId)));
      toast.success("Alocação removida.");
    }
  };

  const clearAllWorkloads = async () => {
    if (!profile?.school_id) {
      toast.error("Escola não identificada.");
      return;
    }

    // CRITICAL: Only clear workloads from the CURRENT scenario
    let deleteQuery = supabase
      .from('workloads')
      .delete()
      .eq('school_id', profile.school_id);

    if (currentScheduleId) {
      deleteQuery = deleteQuery.eq('schedule_id', currentScheduleId);
    } else {
      deleteQuery = deleteQuery.is('schedule_id', null);
    }

    const { error } = await deleteQuery;

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

    // Check if there's already a fixed lesson for this teacher/slot IN THIS SCENARIO
    const existing = fixedLessons.find(
      fl => fl.teacher_id === teacherId &&
        fl.day_of_week === dayOfWeek &&
        fl.slot_number === slotNumber &&
        fl.schedule_id === currentScheduleId
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
          slot_number: slotNumber,
          schedule_id: currentScheduleId
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
        slot_number: slotNumber,
        schedule_id: currentScheduleId
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

  // Curriculum Matrix Functions
  const saveCurriculumMatrix = async (matrix: CurriculumMatrix) => {
    if (!profile?.school_id) {
      console.error("School ID not found, cannot save curriculum matrix.");
      toast.error("Erro: Escola não identificada.");
      throw new Error("School ID not found");
    }

    try {
      // 1. Save or update the matrix
      const matrixData = {
        school_id: profile.school_id,
        name: matrix.name,
        education_level: matrix.education_level,
        modality: matrix.modality,
        network: matrix.network,
        network_type: matrix.network_type,
        regime: matrix.regime,
        total_workload: matrix.total_workload,
        school_days: matrix.school_days,
        weekly_hours: matrix.weekly_hours,
        daily_hours: matrix.daily_hours,
        total_daily_hours: matrix.total_daily_hours,
        shift: matrix.shift,
        entry_time: matrix.entry_time,
        validity_year: matrix.validity_year,
        observations: matrix.observations,
      };

      let matrixId: string;

      if (matrix.id) {
        // Update existing matrix
        const { data, error } = await supabase
          .from('curriculum_matrices')
          .update(matrixData)
          .eq('id', matrix.id)
          .select()
          .single();

        if (error) throw error;
        matrixId = data.id;
      } else {
        // Insert new matrix
        const { data, error } = await supabase
          .from('curriculum_matrices')
          .insert(matrixData)
          .select()
          .single();

        if (error) throw error;
        matrixId = data.id;
      }

      // 2. Delete existing components for this matrix
      if (matrix.id) {
        await supabase
          .from('curriculum_components')
          .delete()
          .eq('matrix_id', matrixId);
      }

      // 3. Insert new components
      if (matrix.components && matrix.components.length > 0) {
        const componentsData = matrix.components.map(comp => ({
          matrix_id: matrixId,
          knowledge_area: comp.knowledge_area,
          component_name: comp.component_name,
          weekly_hours_1st: comp.weekly_hours_1st,
          weekly_hours_2nd: comp.weekly_hours_2nd,
          weekly_hours_3rd: comp.weekly_hours_3rd,
          annual_hours_1st: comp.annual_hours_1st,
          annual_hours_2nd: comp.annual_hours_2nd,
          annual_hours_3rd: comp.annual_hours_3rd,
          total_hours: comp.total_hours,
          display_order: comp.display_order,
          is_diversified: comp.is_diversified,
        }));

        const { error: componentsError } = await supabase
          .from('curriculum_components')
          .insert(componentsData);

        if (componentsError) throw componentsError;
      }

      // 4. Reload matrices
      await loadCurriculumMatrices();

      toast.success("Matriz Curricular salva com sucesso!");
    } catch (error) {
      console.error("Error saving curriculum matrix:", error);
      toast.error("Erro ao salvar matriz curricular.");
      throw error;
    }
  };

  const deleteCurriculumMatrix = async (id: string) => {
    if (!profile?.school_id) {
      console.error("School ID not found, cannot delete curriculum matrix.");
      toast.error("Erro: Escola não identificada.");
      return;
    }

    try {
      // Components will be deleted automatically due to CASCADE
      const { error } = await supabase
        .from('curriculum_matrices')
        .delete()
        .eq('id', id)
        .eq('school_id', profile.school_id);

      if (error) throw error;

      setCurriculumMatrices(prev => prev.filter(m => m.id !== id));
      toast.success("Matriz Curricular excluída com sucesso!");
    } catch (error) {
      console.error("Error deleting curriculum matrix:", error);
      toast.error("Erro ao excluir matriz curricular.");
      throw error;
    }
  };

  const loadCurriculumMatrices = async () => {
    if (!profile?.school_id) return;

    try {
      // Load matrices
      const { data: matrices, error: matricesError } = await supabase
        .from('curriculum_matrices')
        .select('*')
        .eq('school_id', profile.school_id)
        .order('created_at', { ascending: false });

      if (matricesError) throw matricesError;

      if (matrices && matrices.length > 0) {
        // Load components for each matrix
        const matricesWithComponents = await Promise.all(
          matrices.map(async (matrix: any) => {
            const { data: components, error: componentsError } = await supabase
              .from('curriculum_components')
              .select('*')
              .eq('matrix_id', matrix.id)
              .order('display_order');

            if (componentsError) {
              console.error("Error loading components:", componentsError);
              return { ...matrix, components: [] };
            }

            return {
              ...matrix,
              components: components || [],
            };
          })
        );

        setCurriculumMatrices(matricesWithComponents as CurriculumMatrix[]);
      } else {
        setCurriculumMatrices([]);
      }
    } catch (error) {
      console.error("Error loading curriculum matrices:", error);
    }
  };

  const createSchedule = async (name: string, description?: string, cloneFromId?: string) => {
    if (!profile?.school_id) return;

    try {
      if (cloneFromId) {
        console.log(`[createSchedule] Cloning scenario ${cloneFromId} as "${name}"`);

        // Use the new PostgreSQL function for deep cloning
        const { data, error } = await supabase.rpc('clone_schedule_scenario', {
          p_original_schedule_id: cloneFromId,
          p_new_name: name,
          p_new_description: description || `Clonado em ${new Date().toLocaleDateString()}`
        });

        if (error) {
          console.error('[createSchedule] Error cloning:', error);
          throw error;
        }

        const result = data[0];
        console.log('[createSchedule] Clone result:', result);
        console.log(`  - Teachers cloned: ${result.teachers_cloned}`);
        console.log(`  - Subjects cloned: ${result.subjects_cloned}`);
        console.log(`  - Classes cloned: ${result.classes_cloned}`);
        console.log(`  - Workloads cloned: ${result.workloads_cloned}`);
        console.log(`  - Availability cloned: ${result.availability_cloned}`);
        console.log(`  - Fixed lessons cloned: ${result.fixed_lessons_cloned}`);

        // Refresh schedules list
        const { data: scheds } = await supabase
          .from('schedules')
          .select('*')
          .eq('school_id', profile.school_id)
          .order('created_at', { ascending: false });

        if (scheds) {
          setSchedules(scheds);
          setCurrentScheduleId(result.new_schedule_id);
        }

        toast.success(`Cenário clonado com sucesso! ${result.teachers_cloned} professores, ${result.classes_cloned} turmas, ${result.workloads_cloned} alocações.`);
      } else {
        console.log(`[createSchedule] Creating new scenario "${name}"`);

        const { data, error } = await supabase
          .from('schedules')
          .insert({
            school_id: profile.school_id,
            name,
            description,
            is_active: false,
            created_by: profile.id
          })
          .select()
          .single();

        if (error) throw error;

        setSchedules(prev => [data, ...prev]);
        setCurrentScheduleId(data.id);
        toast.success("Novo cenário criado!");
      }
    } catch (error) {
      console.error("[createSchedule] Error:", error);
      toast.error("Erro ao criar cenário.");
      throw error;
    }
  };

  const deleteSchedule = async (id: string) => {
    if (!profile?.school_id) return;

    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSchedules(prev => prev.filter(s => s.id !== id));
      if (currentScheduleId === id) {
        setCurrentScheduleId(null);
      }
      toast.success("Cenário excluído.");
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Erro ao excluir cenário.");
    }
  };

  const updateSchedule = async (id: string, updates: { name?: string; description?: string }) => {
    if (!profile?.school_id) return;

    try {
      const { error } = await supabase
        .from('schedules')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      toast.success("Cenário atualizado!");
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error("Erro ao atualizar cenário.");
    }
  };

  const exportScenario = async (scheduleId: string, format: 'json' | 'xlsx' = 'json') => {
    if (!profile?.school_id) return;

    try {
      // 1. Fetch Schedule Info
      const { data: schedule, error: sErr } = await supabase.from('schedules').select('*').eq('id', scheduleId).single();
      if (sErr) throw sErr;

      // 2. Fetch Related Data
      const { data: teachers } = await supabase.from('teachers').select('*').eq('schedule_id', scheduleId);
      const { data: subjects } = await supabase.from('subjects').select('*').eq('schedule_id', scheduleId);
      const { data: classes } = await supabase.from('classes').select('*').eq('schedule_id', scheduleId);
      const { data: workloads } = await supabase.from('workloads').select('*').eq('schedule_id', scheduleId);
      const { data: availability } = await supabase.from('teacher_availability').select('*').eq('schedule_id', scheduleId);
      const { data: fixedLessons } = await supabase.from('fixed_lessons').select('*').eq('schedule_id', scheduleId);

      // 3. Fetch Generated Schedules (grade horária gerada)
      const { data: scheduleScenarios } = await supabase
        .from('schedule_scenarios')
        .select('*')
        .eq('school_id', profile.school_id)
        .or(`schedule_data ->> schedule_id.eq.${scheduleId}, name.ilike.% ${schedule.name}% `);

      const backupData = {
        version: "1.1",
        exported_at: new Date().toISOString(),
        schedule: {
          name: schedule.name,
          description: schedule.description
        },
        data: {
          teachers: teachers || [],
          subjects: subjects || [],
          classes: classes || [],
          workloads: workloads || [],
          availability: availability || [],
          fixedLessons: fixedLessons || [],
          scheduleScenarios: scheduleScenarios || []
        }
      };

      const dateStr = new Date().toLocaleString('pt-BR').replace(/[\/:]/g, '-').replace(', ', '_');
      // Normalize filename: remove accents and replace spaces/special chars with hyphen
      const normalizedName = schedule.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/\s+/g, '-') // Replace spaces with hyphen
        .replace(/[^a-zA-Z0-9-]/g, '') // Remove special chars except hyphen
        .toLowerCase();
      const fileName = `backup_${normalizedName}_${dateStr}.${format}`;

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Excel Export
        const wb = XLSX.utils.book_new();

        // Metadata Sheet
        const metaData = [
          ["Version", backupData.version],
          ["Exported At", backupData.exported_at],
          ["Schedule Name", backupData.schedule.name],
          ["Description", backupData.schedule.description]
        ];
        const wsMeta = XLSX.utils.aoa_to_sheet(metaData);
        XLSX.utils.book_append_sheet(wb, wsMeta, "Metadata");

        // Data Sheets
        if (backupData.data.teachers.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(backupData.data.teachers), "Teachers");
        if (backupData.data.classes.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(backupData.data.classes), "Classes");
        if (backupData.data.subjects.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(backupData.data.subjects), "Subjects");
        if (backupData.data.workloads.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(backupData.data.workloads), "Workloads");
        if (backupData.data.availability.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(backupData.data.availability), "Availability");
        if (backupData.data.fixedLessons.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(backupData.data.fixedLessons), "FixedLessons");

        // Schedule Scenarios (Complex JSON, might need simplification for Excel)
        if (backupData.data.scheduleScenarios.length) {
          const simplifiedScenarios = backupData.data.scheduleScenarios.map((s: any) => ({
            ...s,
            schedule_data: JSON.stringify(s.schedule_data), // Flatten JSON
            metadata: JSON.stringify(s.metadata)
          }));
          XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(simplifiedScenarios), "Scenarios");
        }

        XLSX.writeFile(wb, fileName);
      }

      toast.success(`Backup exportado com sucesso(${format.toUpperCase()})!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erro ao exportar cenário.");
    }
  };

  const importScenario = async (file: File) => {
    if (!profile?.school_id) return;

    try {
      let backup: any;

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data);

        // Reconstruct backup object from sheets
        const getSheetData = (name: string) => {
          const ws = wb.Sheets[name];
          return ws ? XLSX.utils.sheet_to_json(ws) : [];
        };

        const metaSheet = wb.Sheets["Metadata"];
        const metaRows = metaSheet ? XLSX.utils.sheet_to_json(metaSheet, { header: 1 }) as any[][] : [];
        const metaObj: any = {};
        metaRows.forEach(row => { if (row[0]) metaObj[row[0]] = row[1]; });

        backup = {
          version: metaObj["Version"] || "1.1",
          exported_at: metaObj["Exported At"],
          schedule: {
            name: metaObj["Schedule Name"] || "Sem Nome",
            description: metaObj["Description"] || ""
          },
          data: {
            teachers: getSheetData("Teachers"),
            classes: getSheetData("Classes"),
            subjects: getSheetData("Subjects").map((s: any) => ({
              ...s,
              // Parse aulas_por_turma back from JSON string (Excel serialization)
              aulas_por_turma: s.aulas_por_turma ?
                (typeof s.aulas_por_turma === 'string' ? JSON.parse(s.aulas_por_turma) : s.aulas_por_turma)
                : {}
            })),
            workloads: getSheetData("Workloads"),
            availability: getSheetData("Availability"),
            fixedLessons: getSheetData("FixedLessons"),
            scheduleScenarios: getSheetData("Scenarios").map((s: any) => ({
              ...s,
              schedule_data: s.schedule_data ? JSON.parse(s.schedule_data) : {},
              metadata: s.metadata ? JSON.parse(s.metadata) : {}
            }))
          }
        };
      } else {
        const text = await file.text();
        backup = JSON.parse(text);
      }

      if (!backup.schedule || !backup.data) {
        throw new Error("Arquivo de backup inválido ou formato desconhecido.");
      }

      // Format Name with Date
      const backupDate = backup.exported_at ? new Date(backup.exported_at) : new Date();
      const formattedDate = backupDate.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });

      const newName = `${backup.schedule.name} (Importado ${formattedDate})`;

      // 1. Create Schedule
      const { data: newSchedule, error: sErr } = await supabase
        .from('schedules')
        .insert({
          school_id: profile.school_id,
          name: newName,
          description: backup.schedule.description,
          is_active: false
        })
        .select()
        .single();

      if (sErr) throw sErr;
      const newScheduleId = newSchedule.id;
      console.log(`[Import] Created new schedule: ${newScheduleId}`);

      // Helper to map IDs
      const idMap: Record<string, string> = {}; // oldId -> newId

      // =================================================================================
      // SMART IMPORT V2: Global Entities + Settings
      // =================================================================================

      // 1. Fetch Existing Globals to avoid duplication
      const { data: existingTeachers } = await supabase.from('teachers').select('id, name').eq('school_id', profile.school_id).is('schedule_id', null);
      const { data: existingClasses } = await supabase.from('classes').select('id, name').eq('school_id', profile.school_id).is('schedule_id', null);
      const { data: existingSubjects } = await supabase.from('subjects').select('id, name').eq('school_id', profile.school_id).is('schedule_id', null);

      const teacherMapByName = new Map((existingTeachers || []).map(t => [t.name.trim().toLowerCase(), t.id]));
      const classMapByName = new Map((existingClasses || []).map(c => [c.name.trim().toLowerCase(), c.id]));
      const subjectMapByName = new Map((existingSubjects || []).map(s => [s.name.trim().toLowerCase(), s.id]));

      // 2. Process Teachers
      if (backup.data.teachers?.length) {
        console.log(`[Import] Processing ${backup.data.teachers.length} teachers...`);

        const teachersToInsert: any[] = [];
        const settingsToInsert: any[] = [];

        backup.data.teachers.forEach((t: any) => {
          const normalizedName = t.name.trim().toLowerCase();
          let realId = teacherMapByName.get(normalizedName);

          if (!realId) {
            // New Global Teacher
            realId = crypto.randomUUID();
            teachersToInsert.push({
              ...t,
              id: realId,
              school_id: profile.school_id,
              schedule_id: null, // GLOBAL
              created_at: undefined, updated_at: undefined
            });
            teacherMapByName.set(normalizedName, realId); // Update map for duplicates in same file
          }

          idMap[t.id] = realId;

          // Prepare Setting for this scenario
          settingsToInsert.push({
            scenario_id: newScheduleId,
            teacher_id: realId,
            custom_workload: t.workload_total,
            is_active: true
          });
        });

        if (teachersToInsert.length) await supabase.from('teachers').insert(teachersToInsert);
        if (settingsToInsert.length) await supabase.from('scenario_teacher_settings').insert(settingsToInsert);

        console.log(`[Import] Teachers: ${teachersToInsert.length} new globals, ${settingsToInsert.length} settings.`);
      }

      // 3. Process Classes
      if (backup.data.classes?.length) {
        console.log(`[Import] Processing ${backup.data.classes.length} classes...`);

        const classesToInsert: any[] = [];
        const settingsToInsert: any[] = [];

        backup.data.classes.forEach((c: any) => {
          const normalizedName = c.name.trim().toLowerCase();
          let realId = classMapByName.get(normalizedName);

          if (!realId) {
            realId = crypto.randomUUID();
            classesToInsert.push({
              ...c,
              id: realId,
              school_id: profile.school_id,
              schedule_id: null, // GLOBAL
              created_at: undefined
            });
            classMapByName.set(normalizedName, realId);
          }

          idMap[c.id] = realId;

          // Prepare Setting
          settingsToInsert.push({
            scenario_id: newScheduleId,
            class_id: realId,
            turn_override: c.shift || c.grade, // Backup might have shift in grade or shift
            is_active: true
          });
        });

        if (classesToInsert.length) await supabase.from('classes').insert(classesToInsert);
        if (settingsToInsert.length) await supabase.from('scenario_class_settings').insert(settingsToInsert);

        console.log(`[Import] Classes: ${classesToInsert.length} new globals, ${settingsToInsert.length} settings.`);
      }

      // 4. Process Subjects
      if (backup.data.subjects?.length) {
        console.log(`[Import] Processing ${backup.data.subjects.length} subjects...`);

        const subjectsToInsert: any[] = [];

        backup.data.subjects.forEach((s: any) => {
          const normalizedName = s.name.trim().toLowerCase();
          let realId = subjectMapByName.get(normalizedName);

          if (!realId) {
            realId = crypto.randomUUID();
            // Note: aulas_por_turma needs remapping later or now?
            // Since we are creating a global subject, aulas_por_turma should ideally be empty or generic.
            // But for V2, aulas_por_turma is still on the subject table (Global).
            // This is a small architectural gap: aulas_por_turma varies by year/scenario?
            // For now, we import what's in the backup as the "current global truth".

            // We need to remap class IDs in aulas_por_turma immediately if we want to save it.
            let remappedAulasPorTurma = {};
            if (s.aulas_por_turma && typeof s.aulas_por_turma === 'object') {
              Object.keys(s.aulas_por_turma).forEach(oldClassId => {
                const newClassId = idMap[oldClassId];
                if (newClassId) {
                  remappedAulasPorTurma[newClassId] = s.aulas_por_turma[oldClassId];
                }
              });
            }

            subjectsToInsert.push({
              ...s,
              id: realId,
              aulas_por_turma: remappedAulasPorTurma,
              school_id: profile.school_id,
              schedule_id: null, // GLOBAL
              created_at: undefined
            });
            subjectMapByName.set(normalizedName, realId);
          } else {
            // If subject exists, we might want to update its aulas_por_turma?
            // Let's skip update for safety, assuming global is source of truth.
            // Or maybe merge? Let's keep it simple: reuse ID.
          }

          idMap[s.id] = realId;
        });

        if (subjectsToInsert.length) await supabase.from('subjects').insert(subjectsToInsert);
        console.log(`[Import] Subjects: ${subjectsToInsert.length} new globals.`);
      }
      // 5. Insert Workloads (Dependents)
      if (backup.data.workloads?.length) {
        console.log(`[Import] Processing ${backup.data.workloads.length} workloads...`);
        const workloadsToInsert = backup.data.workloads
          .map((w: any) => {
            const hasTeacher = !!idMap[w.teacher_id];
            const hasSubject = !!idMap[w.subject_id];
            const hasClass = !!idMap[w.class_id];
            const hasHours = w.hours !== undefined && w.hours !== null;

            if (!hasTeacher || !hasSubject || !hasClass || !hasHours) {
              console.log(`[Import] Skipping workload - Teacher:${hasTeacher} Subject:${hasSubject} Class:${hasClass} Hours:${hasHours}`);
              return null;
            }

            return {
              teacher_id: idMap[w.teacher_id],
              subject_id: idMap[w.subject_id],
              class_id: idMap[w.class_id],
              hours: w.hours,
              school_id: profile.school_id,
              schedule_id: newScheduleId
            };
          })
          .filter((w: any) => w !== null);

        console.log(`[Import] Inserting ${workloadsToInsert.length} workloads...`);
        if (workloadsToInsert.length) {
          const { error: workloadError } = await supabase.from('workloads').insert(workloadsToInsert);
          if (workloadError) {
            console.error('[Import] Workload error:', workloadError);
            toast.error(`Erro ao importar alocações: ${workloadError.message}`);
          } else {
            console.log(`[Import] Successfully inserted ${workloadsToInsert.length} workloads`);
          }
        }
      } else {
        console.log('[Import] No workloads found in backup');
      }

      // 6. Insert Availability
      if (backup.data.availability?.length) {
        const availToInsert = backup.data.availability
          .map((a: any) => {
            const hasTeacher = !!idMap[a.teacher_id];
            const hasRequiredFields = a.day_of_week !== undefined &&
              a.day_of_week !== null &&
              a.time_slot_index !== undefined &&
              a.time_slot_index !== null &&
              a.status !== undefined &&
              a.status !== null;

            if (!hasTeacher || !hasRequiredFields) {
              return null;
            }

            return {
              teacher_id: idMap[a.teacher_id],
              day_of_week: a.day_of_week,
              time_slot_index: a.time_slot_index,
              status: a.status,
              school_id: profile.school_id,
              schedule_id: newScheduleId
            };
          })
          .filter((a: any) => a !== null);

        if (availToInsert.length) {
          const { error: availError } = await supabase.from('teacher_availability').insert(availToInsert);
          if (availError) {
            toast.error(`Erro ao importar disponibilidades: ${availError.message} `);
          }
        }
      }

      // 7. Insert Fixed Lessons
      if (backup.data.fixedLessons?.length) {
        const fixedToInsert = backup.data.fixedLessons
          .map((f: any) => {
            const hasTeacher = !!idMap[f.teacher_id];
            const hasSubject = !!idMap[f.subject_id];
            const hasClass = !!idMap[f.class_id];

            if (!hasTeacher || !hasSubject || !hasClass) {
              return null;
            }

            return {
              ...f,
              id: undefined, // Let DB generate
              school_id: profile.school_id,
              schedule_id: newScheduleId,
              teacher_id: idMap[f.teacher_id],
              subject_id: idMap[f.subject_id],
              class_id: idMap[f.class_id],
              created_at: undefined,
              updated_at: undefined
            };
          })
          .filter((f: any) => f !== null);

        if (fixedToInsert.length) {
          const { error: fixedError } = await supabase.from('fixed_lessons').insert(fixedToInsert);
          if (fixedError) {
            toast.error(`Erro ao importar aulas fixas: ${fixedError.message} `);
          }
        }
      }

      // 8. Insert Schedule Scenarios (generated schedules)
      if (backup.data.scheduleScenarios?.length) {
        const scenariosToInsert = backup.data.scheduleScenarios.map((scenario: any) => {
          // Remap IDs in schedule_data JSONB
          let remappedScheduleData = scenario.schedule_data;
          if (remappedScheduleData && typeof remappedScheduleData === 'object') {
            // Deep clone to avoid mutation
            remappedScheduleData = JSON.parse(JSON.stringify(remappedScheduleData));

            // Remap schedule_id
            if (remappedScheduleData.schedule_id) {
              remappedScheduleData.schedule_id = newScheduleId;
            }

            // Remap IDs in lessons array
            if (Array.isArray(remappedScheduleData.lessons)) {
              remappedScheduleData.lessons = remappedScheduleData.lessons.map((lesson: any) => ({
                ...lesson,
                teacher_id: idMap[lesson.teacher_id] || lesson.teacher_id,
                subject_id: idMap[lesson.subject_id] || lesson.subject_id,
                class_id: idMap[lesson.class_id] || lesson.class_id
              }));
            }
          }

          return {
            ...scenario,
            id: undefined, // Let DB generate
            school_id: profile.school_id,
            schedule_data: remappedScheduleData,
            created_at: undefined,
            updated_at: undefined,
            created_by: profile.id
          };
        });
        if (scenariosToInsert.length) await supabase.from('schedule_scenarios').insert(scenariosToInsert);
      }

      setSchedules(prev => [newSchedule, ...prev]);
      toast.success("Cenário importado com sucesso!");

    } catch (error) {
      console.error("Import error:", error);
      toast.error("Erro ao importar backup.");
      throw error; // Propagate to caller
    }
  };

  const saveKnowledgeAreas = async (areas: KnowledgeArea[]) => {
    if (!profile?.school_id) {
      console.error("School ID not found, cannot save knowledge areas.");
      throw new Error("School ID not found");
    }

    try {
      const areasToUpsert = areas.map((a) => ({
        id: a.id.startsWith('new-') ? generateUUID() : a.id,
        school_id: profile.school_id,
        name: a.name,
        color: a.color,
      }));

      const { data, error } = await supabase
        .from('knowledge_areas')
        .upsert(areasToUpsert)
        .select();

      if (error) {
        console.error('Error saving knowledge areas:', error);
        throw error;
      }

      if (data) {
        const savedAreas: KnowledgeArea[] = data.map((a: any) => ({
          id: a.id,
          name: a.name,
          color: a.color,
        }));
        setKnowledgeAreas(savedAreas);
        return savedAreas;
      }
      return [];
    } catch (error) {
      console.error('Error in saveKnowledgeAreas:', error);
      throw error;
    }
  };

  const deleteKnowledgeArea = async (id: string) => {
    if (!profile?.school_id) {
      console.error("School ID not found, cannot delete knowledge area.");
      return;
    }

    // Check if there are subjects linked to this area
    const { count, error: countError } = await supabase
      .from('subjects')
      .select('*', { count: 'exact', head: true })
      .eq('knowledge_area_id', id);

    if (countError) {
      console.error('Error checking subjects linked to knowledge area:', countError);
      throw countError;
    }

    if (count && count > 0) {
      throw new Error("Não é possível excluir pois existem disciplinas vinculadas.");
    }

    const { error } = await supabase.from('knowledge_areas').delete().eq('id', id);
    if (error) {
      console.error('Error deleting knowledge area:', error);
      throw error;
    } else {
      setKnowledgeAreas((prev) => prev.filter((a) => a.id !== id));
    }
  };

  // 1. Carregamento de dados GLOBAIS (Escola, Professores, Disciplinas, Turmas, Matrizes, Configs, Áreas de Conhecimento)
  // E inicialização dos Cenários (Schedules)
  useEffect(() => {
    const loadGlobalData = async () => {
      // Determinar escola efetiva para carregar dados
      let effectiveSchoolId: string | null = profile?.school_id ?? null;
      let effectiveSchoolName: string = profile?.school_name || "";

      // Se não houver school_id, tenta associar automaticamente à escola existente
      if (!effectiveSchoolId) {
        const { data: schoolsData, error: schoolsErr } = await supabase
          .from("schools")
          .select("id, name")
          .limit(1);

        if (!schoolsErr && schoolsData && schoolsData.length > 0) {
          const fallbackSchool = schoolsData[0];
          effectiveSchoolName = (fallbackSchool as any).name as string;

          if (profile && (profile.role === 'teacher' || profile.role === 'staff') && !profile.school_id) {
            try {
              const { error: updateErr } = await supabase
                .from('profiles')
                .update({ school_id: (fallbackSchool as any).id as string })
                .eq('id', profile.id);
              if (!updateErr) {
                effectiveSchoolId = (fallbackSchool as any).id as string;
                await refetchProfile();
              }
            } catch (e) { }
          }
        }
      }

      setSchoolName(effectiveSchoolName || "");

      // Carregar Áreas de Conhecimento (GLOBAL)
      if (effectiveSchoolId) {
        const { data: areasData, error: areasErr } = await supabase
          .from('knowledge_areas')
          .select('*')
          .eq('school_id', effectiveSchoolId)
          .order('name');

        if (!areasErr && areasData) {
          setKnowledgeAreas(areasData.map((a: any) => ({
            id: a.id,
            name: a.name,
            color: a.color,
          })));
        } else if (!areasErr && (!areasData || areasData.length === 0)) {
          // Seed initial areas if empty
          const initialAreas = [
            { name: 'Linguagens', color: '#ef4444' }, // Red
            { name: 'Matemática', color: '#3b82f6' }, // Blue
            { name: 'Ciências da Natureza', color: '#22c55e' }, // Green
            { name: 'Ciências Humanas', color: '#eab308' }, // Yellow
            { name: 'Ensino Religioso', color: '#a855f7' }, // Purple
          ];

          const areasToInsert = initialAreas.map(a => ({
            school_id: effectiveSchoolId,
            name: a.name,
            color: a.color,
          }));

          const { data: seededData, error: seedError } = await supabase
            .from('knowledge_areas')
            .insert(areasToInsert)
            .select();

          if (!seedError && seededData) {
            setKnowledgeAreas(seededData.map((a: any) => ({
              id: a.id,
              name: a.name,
              color: a.color,
            })));
          }
        }
      }

      // Carregar professores
      let teachersQuery = supabase.from("teachers").select("id, name, school_id, workload_total, planning_hours, activity_hours, knowledge_area");
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
          knowledge_area: (t as any).knowledge_area,
        }));
        // Note: Teachers are now loaded by loadScenarioData with settings merge
        // setTeachers(baseTeachers);
      }

      // Carregar disciplinas
      let subjectsQuery = supabase.from("subjects").select("id, name, aulas_por_turma, school_id");
      if (effectiveSchoolId) {
        subjectsQuery = subjectsQuery.eq("school_id", effectiveSchoolId);
      }
      const { data: subjectRows, error: subjectErr } = await subjectsQuery;
      // Note: Subjects are now loaded by loadScenarioData
      // if (!subjectErr) {
      //   setSubjects((subjectRows || []).map((s: any) => ({
      //     id: s.id,
      //     name: s.name,
      //     aulas_por_turma: s.aulas_por_turma || {},
      //   })));
      // }

      // Carregar turmas
      let classesQuery = supabase.from("classes").select("id, name, grade, school_id, aulas_diarias");
      if (effectiveSchoolId) {
        classesQuery = classesQuery.eq("school_id", effectiveSchoolId);
      }
      const { data: classRows, error: classErr } = await classesQuery;
      // Note: Classes are now loaded by loadScenarioData with settings merge
      // if (!classErr) {
      //   setClasses(
      //     (classRows || []).map((c) => ({
      //       id: (c as any).id as string,
      //       name: (c as any).name as string,
      //       shift: ((c as any).grade as string | null) || "Não informado",
      //       aulasDiarias: (c as any).aulas_diarias as number | undefined,
      //     }))
      //   );
      // }

      // Carregar configurações da escola
      if (effectiveSchoolId) {
        const { data: configData, error: configErr } = await supabase
          .from("school_configs")
          .select("*")
          .eq("school_id", effectiveSchoolId)
          .maybeSingle();
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

      // Carregar matrizes curriculares (GLOBAL - não muda por cenário)
      if (effectiveSchoolId) {
        await loadCurriculumMatrices();
      }

      // Carregar Schedules (Cenários)
      if (effectiveSchoolId) {
        const { data: schedulesData, error: schedErr } = await supabase
          .from('schedules')
          .select('*')
          .eq('school_id', effectiveSchoolId)
          .order('created_at', { ascending: false });

        if (!schedErr && schedulesData) {
          setSchedules(schedulesData);

          // Selecionar cenário ativo ou o mais recente
          setCurrentScheduleId(prev => {
            if (prev && schedulesData.some((s: any) => s.id === prev)) return prev;
            const active = schedulesData.find((s: any) => s.is_active);
            return active ? active.id : schedulesData.length > 0 ? schedulesData[0].id : null;
          });
        }
      }
    };

    if (!profileLoading) {
      loadGlobalData();
    }
  }, [profileLoading, profile?.school_id, profile?.role]);

  // 2. Carregar dados de CENÁRIO (Teachers, Subjects, Classes, TeacherAvailability, Workloads, FixedLessons)
  useEffect(() => {
    const loadScenarioData = async () => {
      if (!profile?.school_id) return;

      console.log('[loadScenarioData] Starting... currentScheduleId:', currentScheduleId);

      // Prevent concurrent executions
      if (isLoadingScenarioRef.current) {
        console.log('[DataContext] Skipping loadScenarioData - already loading');
        return;
      }

      isLoadingScenarioRef.current = true;

      try {
        // Teachers (GLOBAL + SETTINGS)
        // 1. Fetch Global Teachers
        let teachersQuery = supabase
          .from("teachers")
          .select("id, name, school_id, workload_total, planning_hours, activity_hours, knowledge_area")
          .eq("school_id", profile.school_id); // Fetch only globals

        const { data: globalTeachers, error: teacherErr } = await teachersQuery;

        // 2. Fetch Scenario Settings (if scenario active)
        let teacherSettingsMap = new Map();
        if (currentScheduleId) {
          const { data: settings } = await supabase
            .from('scenario_teacher_settings')
            .select('*')
            .eq('scenario_id', currentScheduleId);

          if (settings) {
            settings.forEach((s: any) => teacherSettingsMap.set(s.teacher_id, s));
          }
        }

        if (!teacherErr && globalTeachers) {
          const mergedTeachers: Teacher[] = globalTeachers.map((t: any) => {
            const setting = teacherSettingsMap.get(t.id);
            // If setting exists, override workload. If setting exists but is_active=false, we might filter out later or handle in UI.
            // For now, let's assume we show all but mark inactive if needed.
            // Or better: The UI expects 'workload_total'. We override it here.

            return {
              id: t.id,
              name: t.name,
              subjects: [],
              workload_total: setting?.custom_workload ?? t.workload_total ?? 0,
              planning_hours: t.planning_hours || 0,
              activity_hours: t.activity_hours || 0,
              knowledge_area: t.knowledge_area,
              // Add a flag to know if it's active in this scenario? 
              // For now, let's keep it simple. If we need to hide inactive teachers, we filter here.
              // is_active: setting ? setting.is_active : true 
            };
          });

          // Filter out teachers marked as inactive in this scenario?
          // const activeTeachers = mergedTeachers.filter(t => {
          //   const setting = teacherSettingsMap.get(t.id);
          //   return setting ? setting.is_active : true;
          // });

          setTeachers(mergedTeachers);
        }

        // Subjects (GLOBAL)
        let subjectsQuery = supabase
          .from("subjects")
          .select("id, name, aulas_por_turma, school_id, knowledge_area_id")
          .eq("school_id", profile.school_id); // Fetch only globals

        const { data: subjectRows, error: subjectErr } = await subjectsQuery;
        if (!subjectErr) {
          setSubjects((subjectRows || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            aulas_por_turma: s.aulas_por_turma || {},
            knowledge_area_id: s.knowledge_area_id,
          })));
        }

        // Classes (GLOBAL + SETTINGS)
        let classesQuery = supabase
          .from("classes")
          .select("id, name, grade, school_id, aulas_diarias, bell_schedule")
          .eq("school_id", profile.school_id); // Fetch only globals

        const { data: globalClasses, error: classErr } = await classesQuery;

        // Fetch Scenario Settings for Classes
        let classSettingsMap = new Map();
        if (currentScheduleId) {
          const { data: settings } = await supabase
            .from('scenario_class_settings')
            .select('*')
            .eq('scenario_id', currentScheduleId);

          if (settings) {
            settings.forEach((s: any) => classSettingsMap.set(s.class_id, s));
          }
        }

        if (!classErr && globalClasses) {
          setClasses(
            globalClasses.map((c: any) => {
              const setting = classSettingsMap.get(c.id);
              const shift = setting?.turn_override ?? c.grade ?? "Não informado";
              return {
                id: c.id,
                name: c.name,
                shift: shift,
                aulasDiarias: c.aulas_diarias,
              };
            })
          );
          console.log('[loadScenarioData] Classes loaded. Sample ID:', globalClasses[0]?.id);
        }

        // Teacher Availability (SCENARIO-SPECIFIC)
        let availabilityQuery = supabase
          .from("teacher_availability")
          .select("*")
          .eq("school_id", profile.school_id);

        if (currentScheduleId) {
          availabilityQuery = availabilityQuery.eq("schedule_id", currentScheduleId);
        } else {
          availabilityQuery = availabilityQuery.is("schedule_id", null);
        }

        const { data: availabilityData, error: availabilityErr } = await availabilityQuery;
        if (!availabilityErr && availabilityData) {
          setTeacherAvailability(availabilityData as TeacherAvailability[]);
        }

        // Workloads
        let workloadsQuery = supabase
          .from("workloads")
          .select(
            `id, hours, teacher_id, subject_id, class_id,
  classes: class_id(name),
    teachers: teacher_id(name),
      subjects: subject_id(name),
        school_id, schedule_id`
          )
          .eq("school_id", profile.school_id);

        if (currentScheduleId) {
          workloadsQuery = workloadsQuery.eq("schedule_id", currentScheduleId);
        } else {
          // Modo Legado: Se não tem schedule selecionado, carrega os que não têm schedule_id
          workloadsQuery = workloadsQuery.is("schedule_id", null);
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
            hours: w.hours,
            schedule_id: w.schedule_id
          })));

          // Atualiza lista de professores para incluir as disciplinas derivadas das workloads
          setTeachers((prev) => {
            // Deduplicate teachers by ID to prevent UI issues
            const uniqueTeachers = Array.from(new Map(prev.map(item => [item.id, item])).values());

            return uniqueTeachers.map((t) => ({
              ...t,
              subjects: Array.from(teacherSubjectMap[t.id] || new Set<string>()),
            }));
          });
        }

        // Fixed Lessons
        let fixedLessonsQuery = supabase
          .from("fixed_lessons")
          .select("*")
          .eq("school_id", profile.school_id);

        if (currentScheduleId) {
          fixedLessonsQuery = fixedLessonsQuery.eq("schedule_id", currentScheduleId);
        } else {
          fixedLessonsQuery = fixedLessonsQuery.is("schedule_id", null);
        }

        const { data: fixedLessonsData, error: fixedLessonsErr } = await fixedLessonsQuery;

        if (!fixedLessonsErr && fixedLessonsData) {
          setFixedLessons(fixedLessonsData as FixedLesson[]);
        }
      } finally {
        isLoadingScenarioRef.current = false;
      }
    };

    loadScenarioData();
  }, [currentScheduleId, profile?.school_id]);

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
        deleteSubjects,
        saveSubjects,
        classes,
        saveClasses,
        addClass,
        updateClass,
        deleteClass,
        deleteClasses,
        deleteAllClasses,
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
        curriculumMatrices,
        saveCurriculumMatrix,
        deleteCurriculumMatrix,
        knowledgeAreas,
        saveKnowledgeAreas,
        deleteKnowledgeArea,
        schedules,
        currentScheduleId,
        setCurrentScheduleId,
        createSchedule,
        updateSchedule,
        deleteSchedule,
        exportScenario,
        importScenario,
        hasUnsavedChanges,
        setHasUnsavedChanges,

        loading: profileLoading,
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
