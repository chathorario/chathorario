-- =====================================================
-- CHATHORÁRIO - SCHEMA COMPLETO DO BANCO DE DADOS
-- =====================================================
-- Este script cria todas as tabelas, índices, triggers e políticas RLS
-- necessárias para o funcionamento completo do sistema ChatHorário
-- =====================================================

-- =====================================================
-- 1. TABELA: schools (Escolas)
-- =====================================================
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    address TEXT,
    phone TEXT,
    email TEXT,
    principal TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_schools_code ON schools(code);

-- =====================================================
-- 2. TABELA: profiles (Perfis de Usuários)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'teacher', 'student')),
    full_name TEXT,
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    school_name TEXT,
    responsible TEXT,
    academic_year TEXT DEFAULT '2025',
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- =====================================================
-- 3. TABELA: teachers (Professores)
-- =====================================================
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    email TEXT,
    phone TEXT,
    workload_total INTEGER DEFAULT 0,
    planning_hours INTEGER DEFAULT 0,
    activity_hours INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_name ON teachers(name);

-- =====================================================
-- 4. TABELA: subjects (Disciplinas)
-- =====================================================
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT,
    aulas_por_turma JSONB DEFAULT '{}',
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_subjects_school_id ON subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_name ON subjects(name);

-- =====================================================
-- 5. TABELA: classes (Turmas)
-- =====================================================
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    grade TEXT,
    shift TEXT,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    aulas_diarias INTEGER DEFAULT 5,
    total_students INTEGER DEFAULT 0,
    classroom TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_grade ON classes(grade);
CREATE INDEX IF NOT EXISTS idx_classes_shift ON classes(shift);

-- =====================================================
-- 6. TABELA: workloads (Cargas Horárias)
-- =====================================================
CREATE TABLE IF NOT EXISTS workloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hours INTEGER NOT NULL,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(teacher_id, subject_id, class_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_workloads_school_id ON workloads(school_id);
CREATE INDEX IF NOT EXISTS idx_workloads_teacher_id ON workloads(teacher_id);
CREATE INDEX IF NOT EXISTS idx_workloads_subject_id ON workloads(subject_id);
CREATE INDEX IF NOT EXISTS idx_workloads_class_id ON workloads(class_id);

-- =====================================================
-- 7. TABELA: teacher_availability (Disponibilidade)
-- =====================================================
CREATE TABLE IF NOT EXISTS teacher_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    time_slot_index INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('P', 'HA', 'ND')),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(teacher_id, day_of_week, time_slot_index)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_teacher_availability_school_id ON teacher_availability(school_id);
CREATE INDEX IF NOT EXISTS idx_teacher_availability_teacher_id ON teacher_availability(teacher_id);

-- =====================================================
-- 8. TABELA: allocations (Alocações)
-- =====================================================
CREATE TABLE IF NOT EXISTS allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_allocations_school_id ON allocations(school_id);
CREATE INDEX IF NOT EXISTS idx_allocations_teacher_id ON allocations(teacher_id);

-- =====================================================
-- 9. TABELA: schedule_scenarios (Cenários de Horários)
-- =====================================================
CREATE TABLE IF NOT EXISTS schedule_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Concluído',
    is_validated BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT false,
    schedule_data JSONB,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    fitness_score DECIMAL(5,2),
    conflicts_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_schedule_scenarios_school_id ON schedule_scenarios(school_id);
CREATE INDEX IF NOT EXISTS idx_schedule_scenarios_is_active ON schedule_scenarios(is_active);
CREATE INDEX IF NOT EXISTS idx_schedule_scenarios_created_by ON schedule_scenarios(created_by);

-- =====================================================
-- 10. TABELA: generation_parameters (Parâmetros)
-- =====================================================
CREATE TABLE IF NOT EXISTS generation_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID UNIQUE REFERENCES schools(id) ON DELETE CASCADE,
    max_daily_lessons INTEGER DEFAULT 5,
    min_daily_lessons INTEGER DEFAULT 1,
    allow_gaps BOOLEAN DEFAULT false,
    max_consecutive_lessons INTEGER DEFAULT 3,
    prefer_morning BOOLEAN DEFAULT true,
    hard_constraints JSONB DEFAULT '{}',
    pedagogical_settings JSONB DEFAULT '{}',
    advanced_settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_generation_parameters_school_id ON generation_parameters(school_id);

-- =====================================================
-- 11. TABELA: school_configs (Configurações da Escola)
-- =====================================================
CREATE TABLE IF NOT EXISTS school_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID UNIQUE REFERENCES schools(id) ON DELETE CASCADE,
    modalidade TEXT,
    turno TEXT,
    horario_inicio TEXT,
    duracao_aula TEXT,
    intervalos JSONB,
    dias_letivos JSONB,
    horarios_aula JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_school_configs_school_id ON school_configs(school_id);

-- =====================================================
-- 12. TABELA: fixed_lessons (Aulas Fixas)
-- =====================================================
CREATE TABLE IF NOT EXISTS fixed_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    slot_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, teacher_id, day_of_week, slot_number)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_fixed_lessons_school_id ON fixed_lessons(school_id);
CREATE INDEX IF NOT EXISTS idx_fixed_lessons_teacher_id ON fixed_lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_fixed_lessons_class_id ON fixed_lessons(class_id);

-- =====================================================
-- 13. TABELA: schedule_conflicts (Conflitos)
-- =====================================================
CREATE TABLE IF NOT EXISTS schedule_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID REFERENCES schedule_scenarios(id) ON DELETE CASCADE,
    conflict_type TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    affected_entities JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_schedule_conflicts_scenario_id ON schedule_conflicts(scenario_id);
CREATE INDEX IF NOT EXISTS idx_schedule_conflicts_severity ON schedule_conflicts(severity);

-- =====================================================
-- 14. TABELA: audit_logs (Logs de Auditoria)
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_school_id ON audit_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas relevantes
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at
                BEFORE UPDATE ON %I
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END;
$$;

-- =====================================================
-- TRIGGER PARA CRIAÇÃO AUTOMÁTICA DE PERFIS
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  school_id_val UUID;
BEGIN
  -- Check for Admin
  IF new.email = 'admin@chathorario.com' THEN
    INSERT INTO public.profiles (id, role, full_name)
    VALUES (new.id, 'admin', 'Administrador Geral')
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
  END IF;

  -- Check for School User
  IF new.email = 'escola@teste.com' THEN
    SELECT id INTO school_id_val FROM public.schools WHERE code = 'ESCOLA_TESTE';
    
    INSERT INTO public.profiles (id, role, full_name, school_id, school_name)
    VALUES (new.id, 'staff', 'Usuário Escola Teste', school_id_val, 'Escola Teste')
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
  END IF;

  -- Default: Teacher (only if profile doesn't exist)
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (new.id, 'teacher', COALESCE(new.raw_user_meta_data->>'full_name', 'Novo Usuário'))
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS - PROFILES
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can manage all profiles" ON profiles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- =====================================================
-- POLÍTICAS RLS - SCHOOLS
-- =====================================================

DROP POLICY IF EXISTS "Users can view their school" ON schools;
DROP POLICY IF EXISTS "Admins can view all schools" ON schools;
DROP POLICY IF EXISTS "Admins can manage schools" ON schools;

CREATE POLICY "Users can view their school" ON schools
    FOR SELECT USING (
        id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Admins can view all schools" ON schools
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can manage schools" ON schools
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- =====================================================
-- POLÍTICAS RLS - TEACHERS, SUBJECTS, CLASSES
-- =====================================================

-- Macro para criar políticas similares
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['teachers', 'subjects', 'classes', 'workloads', 
                                    'teacher_availability', 'allocations', 'fixed_lessons',
                                    'school_configs', 'generation_parameters']) 
    LOOP
        EXECUTE format('
            DROP POLICY IF EXISTS "Users can view their school data" ON %I;
            DROP POLICY IF EXISTS "Users can manage their school data" ON %I;
            
            CREATE POLICY "Users can view their school data" ON %I
                FOR SELECT USING (
                    school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()) OR
                    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')
                );
            
            CREATE POLICY "Users can manage their school data" ON %I
                FOR ALL USING (
                    school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()) OR
                    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')
                );
        ', tbl, tbl, tbl, tbl);
    END LOOP;
END;
$$;

-- =====================================================
-- POLÍTICAS RLS - SCHEDULE_SCENARIOS
-- =====================================================

DROP POLICY IF EXISTS "Users can view their school schedules" ON schedule_scenarios;
DROP POLICY IF EXISTS "Users can manage their school schedules" ON schedule_scenarios;

CREATE POLICY "Users can view their school schedules" ON schedule_scenarios
    FOR SELECT USING (
        school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users can manage their school schedules" ON schedule_scenarios
    FOR ALL USING (
        school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- =====================================================
-- POLÍTICAS RLS - SCHEDULE_CONFLICTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view conflicts" ON schedule_conflicts;

CREATE POLICY "Users can view conflicts" ON schedule_conflicts
    FOR SELECT USING (
        scenario_id IN (
            SELECT id FROM schedule_scenarios 
            WHERE school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
        ) OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- =====================================================
-- POLÍTICAS RLS - AUDIT_LOGS
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can view all logs" ON audit_logs;

CREATE POLICY "Users can view their own logs" ON audit_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- =====================================================
-- INSERIR ESCOLA DE TESTE
-- =====================================================

INSERT INTO schools (id, name, code)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Escola Teste',
    'ESCOLA_TESTE'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code;

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para obter estatísticas da escola
CREATE OR REPLACE FUNCTION get_school_stats(p_school_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'teachers_count', (SELECT COUNT(*) FROM teachers WHERE school_id = p_school_id),
        'subjects_count', (SELECT COUNT(*) FROM subjects WHERE school_id = p_school_id),
        'classes_count', (SELECT COUNT(*) FROM classes WHERE school_id = p_school_id),
        'workloads_count', (SELECT COUNT(*) FROM workloads WHERE school_id = p_school_id),
        'scenarios_count', (SELECT COUNT(*) FROM schedule_scenarios WHERE school_id = p_school_id),
        'active_scenario', (SELECT name FROM schedule_scenarios WHERE school_id = p_school_id AND is_active = true LIMIT 1)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View para workload completo
CREATE OR REPLACE VIEW workload_details AS
SELECT 
    w.id,
    w.hours,
    w.school_id,
    t.name as teacher_name,
    s.name as subject_name,
    c.name as class_name,
    c.grade,
    c.shift,
    w.created_at,
    w.updated_at
FROM workloads w
LEFT JOIN teachers t ON w.teacher_id = t.id
LEFT JOIN subjects s ON w.subject_id = s.id
LEFT JOIN classes c ON w.class_id = c.id;

-- View para cenários com detalhes
CREATE OR REPLACE VIEW scenario_summary AS
SELECT 
    ss.id,
    ss.name,
    ss.description,
    ss.status,
    ss.is_validated,
    ss.is_active,
    ss.fitness_score,
    ss.conflicts_count,
    s.name as school_name,
    p.full_name as created_by_name,
    ss.created_at,
    ss.updated_at
FROM schedule_scenarios ss
LEFT JOIN schools s ON ss.school_id = s.id
LEFT JOIN profiles p ON ss.created_by = p.id;

-- =====================================================
-- COMENTÁRIOS NAS TABELAS
-- =====================================================

COMMENT ON TABLE schools IS 'Cadastro de escolas do sistema';
COMMENT ON TABLE profiles IS 'Perfis de usuários vinculados ao auth.users';
COMMENT ON TABLE teachers IS 'Cadastro de professores';
COMMENT ON TABLE subjects IS 'Cadastro de disciplinas';
COMMENT ON TABLE classes IS 'Cadastro de turmas';
COMMENT ON TABLE workloads IS 'Alocação de carga horária professor-disciplina-turma';
COMMENT ON TABLE teacher_availability IS 'Disponibilidade dos professores por dia/horário';
COMMENT ON TABLE schedule_scenarios IS 'Cenários de horários gerados';
COMMENT ON TABLE generation_parameters IS 'Parâmetros para geração de horários';
COMMENT ON TABLE fixed_lessons IS 'Aulas fixas pré-definidas';
COMMENT ON TABLE schedule_conflicts IS 'Conflitos detectados nos horários';
COMMENT ON TABLE audit_logs IS 'Logs de auditoria do sistema';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
