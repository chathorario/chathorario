# 📊 Schema Completo do Banco de Dados - ChatHorário

## ✅ Tabelas Criadas com Sucesso

### 📋 Resumo Geral
- **Total de Tabelas**: 14
- **Total de Índices**: 35+
- **Total de Views**: 2
- **Total de Funções**: 2
- **Total de Triggers**: 15+
- **Políticas RLS**: 30+

---

## 🗂️ Estrutura das Tabelas

### 1. **schools** (Escolas)
Armazena informações das escolas cadastradas no sistema.

**Campos:**
- `id` (UUID, PK) - Identificador único
- `name` (TEXT) - Nome da escola
- `code` (TEXT, UNIQUE) - Código único da escola
- `address` (TEXT) - Endereço
- `phone` (TEXT) - Telefone
- `email` (TEXT) - Email
- `principal` (TEXT) - Nome do diretor
- `created_at` (TIMESTAMPTZ) - Data de criação
- `updated_at` (TIMESTAMPTZ) - Data de atualização

**Índices:**
- `idx_schools_code` - Índice no código

---

### 2. **profiles** (Perfis de Usuários)
Perfis dos usuários vinculados ao sistema de autenticação.

**Campos:**
- `id` (UUID, PK, FK → auth.users) - ID do usuário
- `role` (TEXT) - Papel: 'admin', 'staff', 'teacher', 'student'
- `full_name` (TEXT) - Nome completo
- `school_id` (UUID, FK → schools) - Escola vinculada
- `school_name` (TEXT) - Nome da escola (cache)
- `responsible` (TEXT) - Responsável
- `academic_year` (TEXT) - Ano letivo (padrão: '2025')
- `avatar_url` (TEXT) - URL do avatar
- `phone` (TEXT) - Telefone
- `created_at` (TIMESTAMPTZ) - Data de criação
- `updated_at` (TIMESTAMPTZ) - Data de atualização

**Índices:**
- `idx_profiles_school_id` - Índice na escola
- `idx_profiles_role` - Índice no papel

---

### 3. **teachers** (Professores)
Cadastro de professores da escola.

**Campos:**
- `id` (UUID, PK) - Identificador único
- `name` (TEXT) - Nome do professor
- `school_id` (UUID, FK → schools) - Escola
- `email` (TEXT) - Email
- `phone` (TEXT) - Telefone
- `workload_total` (INTEGER) - Carga horária total
- `planning_hours` (INTEGER) - Horas de planejamento
- `activity_hours` (INTEGER) - Horas de atividade
- `created_at` (TIMESTAMPTZ) - Data de criação
- `updated_at` (TIMESTAMPTZ) - Data de atualização

**Índices:**
- `idx_teachers_school_id` - Índice na escola
- `idx_teachers_name` - Índice no nome

---

### 4. **subjects** (Disciplinas)
Cadastro de disciplinas oferecidas.

**Campos:**
- `id` (UUID, PK) - Identificador único
- `name` (TEXT) - Nome da disciplina
- `code` (TEXT) - Código da disciplina
- `aulas_por_turma` (JSONB) - Aulas por turma (formato: `{"turma_id": quantidade}`)
- `school_id` (UUID, FK → schools) - Escola
- `description` (TEXT) - Descrição
- `created_at` (TIMESTAMPTZ) - Data de criação
- `updated_at` (TIMESTAMPTZ) - Data de atualização

**Índices:**
- `idx_subjects_school_id` - Índice na escola
- `idx_subjects_name` - Índice no nome

---

### 5. **classes** (Turmas)
Cadastro de turmas da escola.

**Campos:**
- `id` (UUID, PK) - Identificador único
- `name` (TEXT) - Nome da turma
- `grade` (TEXT) - Série/Ano
- `shift` (TEXT) - Turno (Matutino, Vespertino, Noturno)
- `school_id` (UUID, FK → schools) - Escola
- `aulas_diarias` (INTEGER) - Número de aulas por dia (padrão: 5)
- `total_students` (INTEGER) - Total de alunos
- `classroom` (TEXT) - Sala de aula
- `created_at` (TIMESTAMPTZ) - Data de criação
- `updated_at` (TIMESTAMPTZ) - Data de atualização

**Índices:**
- `idx_classes_school_id` - Índice na escola
- `idx_classes_grade` - Índice na série
- `idx_classes_shift` - Índice no turno

---

### 6. **workloads** (Cargas Horárias)
Alocação de carga horária entre professor, disciplina e turma.

**Campos:**
- `id` (UUID, PK) - Identificador único
- `hours` (INTEGER) - Número de horas/aulas
- `teacher_id` (UUID, FK → teachers) - Professor
- `subject_id` (UUID, FK → subjects) - Disciplina
- `class_id` (UUID, FK → classes) - Turma
- `school_id` (UUID, FK → schools) - Escola
- `created_at` (TIMESTAMPTZ) - Data de criação
- `updated_at` (TIMESTAMPTZ) - Data de atualização

**Constraints:**
- UNIQUE(teacher_id, subject_id, class_id)

**Índices:**
- `idx_workloads_school_id` - Índice na escola
- `idx_workloads_teacher_id` - Índice no professor
- `idx_workloads_subject_id` - Índice na disciplina
- `idx_workloads_class_id` - Índice na turma

---

### 7. **teacher_availability** (Disponibilidade)
Disponibilidade dos professores por dia da semana e horário.

**Campos:**
- `id` (UUID, PK) - Identificador único
- `teacher_id` (UUID, FK → teachers) - Professor
- `day_of_week` (INTEGER) - Dia da semana (0-6, 0=Domingo)
- `time_slot_index` (INTEGER) - Índice do horário
- `status` (TEXT) - Status: 'P' (Preferencial), 'HA' (Horário de Atividade), 'ND' (Não Disponível)
- `school_id` (UUID, FK → schools) - Escola
- `created_at` (TIMESTAMPTZ) - Data de criação
- `updated_at` (TIMESTAMPTZ) - Data de atualização

**Constraints:**
- UNIQUE(teacher_id, day_of_week, time_slot_index)

**Índices:**
- `idx_teacher_availability_school_id` - Índice na escola
- `idx_teacher_availability_teacher_id` - Índice no professor

---

### 8. **allocations** (Alocações)
Alocações de professores para disciplinas e turmas.

**Campos:**
- `id` (UUID, PK) - Identificador único
- `teacher_id` (UUID, FK → teachers) - Professor
- `subject_id` (UUID, FK → subjects) - Disciplina
- `class_id` (UUID, FK → classes) - Turma
- `school_id` (UUID, FK → schools) - Escola
- `priority` (INTEGER) - Prioridade (padrão: 0)
- `created_at` (TIMESTAMPTZ) - Data de criação
- `updated_at` (TIMESTAMPTZ) - Data de atualização

**Índices:**
- `idx_allocations_school_id` - Índice na escola
- `idx_allocations_teacher_id` - Índice no professor

---

### 9. **schedule_scenarios** (Cenários de Horários)
Cenários de horários gerados pelo sistema.

**Campos:**
- `id` (UUID, PK) - Identificador único
- `name` (TEXT) - Nome do cenário
- `description` (TEXT) - Descrição
- `status` (TEXT) - Status (padrão: 'Concluído')
- `is_validated` (BOOLEAN) - Se foi validado
- `is_active` (BOOLEAN) - Se está ativo
- `schedule_data` (JSONB) - Dados do horário em JSON
- `school_id` (UUID, FK → schools) - Escola
- `created_by` (UUID, FK → auth.users) - Criado por
- `fitness_score` (DECIMAL) - Pontuação de qualidade
- `conflicts_count` (INTEGER) - Número de conflitos
- `created_at` (TIMESTAMPTZ) - Data de criação
- `updated_at` (TIMESTAMPTZ) - Data de atualização

**Índices:**
- `idx_schedule_scenarios_school_id` - Índice na escola
- `idx_schedule_scenarios_is_active` - Índice no status ativo
- `idx_schedule_scenarios_created_by` - Índice no criador

---

### 10. **generation_parameters** (Parâmetros de Geração)
Parâmetros configuráveis para geração de horários.

**Campos:**
- `id` (UUID, PK) - Identificador único
- `school_id` (UUID, UNIQUE, FK → schools) - Escola
- `max_daily_lessons` (INTEGER) - Máximo de aulas por dia (padrão: 5)
- `min_daily_lessons` (INTEGER) - Mínimo de aulas por dia (padrão: 1)
- `allow_gaps` (BOOLEAN) - Permitir janelas (padrão: false)
- `max_consecutive_lessons` (INTEGER) - Máximo de aulas consecutivas (padrão: 3)
- `prefer_morning` (BOOLEAN) - Preferir manhã (padrão: true)
- `hard_constraints` (JSONB) - Restrições rígidas
- `pedagogical_settings` (JSONB) - Configurações pedagógicas
- `advanced_settings` (JSONB) - Configurações avançadas
- `created_at` (TIMESTAMPTZ) - Data de criação
- `updated_at` (TIMESTAMPTZ) - Data de atualização

**Índices:**
- `idx_generation_parameters_school_id` - Índice na escola

---

### 11. **school_configs** (Configurações da Escola)
Configurações específicas de cada escola.

**Campos:**
- `id` (UUID, PK) - Identificador único
- `school_id` (UUID, UNIQUE, FK → schools) - Escola
- `modalidade` (TEXT) - Modalidade de ensino
- `turno` (TEXT) - Turno principal
- `horario_inicio` (TEXT) - Horário de início
- `duracao_aula` (TEXT) - Duração da aula
- `intervalos` (JSONB) - Configuração de intervalos
- `dias_letivos` (JSONB) - Dias letivos
- `horarios_aula` (JSONB) - Horários das aulas
- `created_at` (TIMESTAMPTZ) - Data de criação
- `updated_at` (TIMESTAMPTZ) - Data de atualização

**Índices:**
- `idx_school_configs_school_id` - Índice na escola

---

### 12. **fixed_lessons** (Aulas Fixas)
Aulas fixas pré-definidas no horário.

**Campos:**
- `id` (UUID, PK) - Identificador único
- `school_id` (UUID, FK → schools) - Escola
- `teacher_id` (UUID, FK → teachers) - Professor
- `subject_id` (UUID, FK → subjects) - Disciplina
- `class_id` (UUID, FK → classes) - Turma
- `day_of_week` (INTEGER) - Dia da semana (0-6)
- `slot_number` (INTEGER) - Número do horário
- `created_at` (TIMESTAMPTZ) - Data de criação
- `updated_at` (TIMESTAMPTZ) - Data de atualização

**Constraints:**
- UNIQUE(school_id, teacher_id, day_of_week, slot_number)

**Índices:**
- `idx_fixed_lessons_school_id` - Índice na escola
- `idx_fixed_lessons_teacher_id` - Índice no professor
- `idx_fixed_lessons_class_id` - Índice na turma

---

### 13. **schedule_conflicts** (Conflitos de Horário)
Conflitos detectados nos horários gerados.

**Campos:**
- `id` (UUID, PK) - Identificador único
- `scenario_id` (UUID, FK → schedule_scenarios) - Cenário
- `conflict_type` (TEXT) - Tipo de conflito
- `severity` (TEXT) - Severidade: 'low', 'medium', 'high', 'critical'
- `description` (TEXT) - Descrição do conflito
- `affected_entities` (JSONB) - Entidades afetadas
- `created_at` (TIMESTAMPTZ) - Data de criação

**Índices:**
- `idx_schedule_conflicts_scenario_id` - Índice no cenário
- `idx_schedule_conflicts_severity` - Índice na severidade

---

### 14. **audit_logs** (Logs de Auditoria)
Registro de todas as ações realizadas no sistema.

**Campos:**
- `id` (UUID, PK) - Identificador único
- `user_id` (UUID, FK → auth.users) - Usuário que executou
- `school_id` (UUID, FK → schools) - Escola relacionada
- `action` (TEXT) - Ação executada
- `entity_type` (TEXT) - Tipo de entidade
- `entity_id` (UUID) - ID da entidade
- `old_values` (JSONB) - Valores antigos
- `new_values` (JSONB) - Valores novos
- `ip_address` (TEXT) - Endereço IP
- `user_agent` (TEXT) - User Agent
- `created_at` (TIMESTAMPTZ) - Data de criação

**Índices:**
- `idx_audit_logs_user_id` - Índice no usuário
- `idx_audit_logs_school_id` - Índice na escola
- `idx_audit_logs_created_at` - Índice na data
- `idx_audit_logs_action` - Índice na ação

---

## 🔐 Segurança (RLS - Row Level Security)

Todas as tabelas têm **Row Level Security (RLS)** habilitado com políticas que garantem:

### Regras Gerais:
1. **Usuários** podem ver e editar apenas dados de sua própria escola
2. **Admins** têm acesso total a todos os dados
3. **Perfis** são visíveis apenas para o próprio usuário ou admins
4. **Logs de auditoria** são visíveis apenas para o próprio usuário ou admins

### Políticas Principais:
- `Users can view their school data` - Usuários veem dados da sua escola
- `Users can manage their school data` - Usuários gerenciam dados da sua escola
- `Admins can view all data` - Admins veem todos os dados
- `Admins can manage all data` - Admins gerenciam todos os dados

---

## 🔧 Funções e Triggers

### Triggers:
1. **update_updated_at_column** - Atualiza automaticamente `updated_at` em todas as tabelas
2. **handle_new_user** - Cria perfil automaticamente quando um novo usuário é registrado

### Funções:
1. **get_school_stats(school_id)** - Retorna estatísticas da escola em JSON
2. **update_updated_at_column()** - Função do trigger de atualização

---

## 📊 Views

### 1. **workload_details**
Visão completa de workloads com nomes de professor, disciplina e turma.

```sql
SELECT * FROM workload_details WHERE school_id = 'uuid-da-escola';
```

### 2. **scenario_summary**
Resumo de cenários com informações da escola e criador.

```sql
SELECT * FROM scenario_summary WHERE school_id = 'uuid-da-escola';
```

---

## 🎯 Dados Iniciais

### Escola de Teste:
- **ID**: `00000000-0000-0000-0000-000000000001`
- **Nome**: "Escola Teste"
- **Código**: "ESCOLA_TESTE"

### Usuários Automáticos:
1. **admin@chathorario.com** → Perfil: Admin
2. **escola@teste.com** → Perfil: Staff (vinculado à Escola Teste)

---

## 📝 Como Usar

### Consultar Estatísticas da Escola:
```sql
SELECT get_school_stats('00000000-0000-0000-0000-000000000001');
```

### Ver Workloads Detalhados:
```sql
SELECT * FROM workload_details 
WHERE school_id = '00000000-0000-0000-0000-000000000001';
```

### Ver Cenários com Detalhes:
```sql
SELECT * FROM scenario_summary 
WHERE school_id = '00000000-0000-0000-0000-000000000001';
```

### Verificar Conflitos de um Cenário:
```sql
SELECT * FROM schedule_conflicts 
WHERE scenario_id = 'uuid-do-cenario'
ORDER BY severity DESC;
```

---

## ✅ Checklist de Verificação

- [x] Todas as tabelas criadas
- [x] Todos os índices criados
- [x] RLS habilitado em todas as tabelas
- [x] Políticas RLS configuradas
- [x] Triggers de updated_at configurados
- [x] Trigger de criação de perfil configurado
- [x] Funções auxiliares criadas
- [x] Views criadas
- [x] Escola de teste inserida
- [x] Comentários nas tabelas adicionados

---

## 🚀 Próximos Passos

1. ✅ Criar os usuários de teste (admin e escola)
2. ✅ Testar o sistema de autenticação
3. ✅ Cadastrar professores, disciplinas e turmas
4. ✅ Configurar disponibilidade dos professores
5. ✅ Definir alocações
6. ✅ Gerar horários
7. ✅ Validar e ativar cenários

---

**Schema completo criado com sucesso! 🎉**
