# 📊 Estrutura do Banco de Dados - ChatHorário

## 🎯 Visão Geral

O sistema ChatHorário utiliza **PostgreSQL** (via Supabase) com **14 tabelas principais** organizadas em módulos funcionais. Todas as tabelas implementam **Row Level Security (RLS)** para isolamento de dados por escola.

---

## 📐 Diagrama de Relacionamentos

```
┌─────────────────┐
│    auth.users   │ (Supabase Auth)
└────────┬────────┘
         │
         │ 1:1
         ▼
┌─────────────────┐         ┌─────────────────┐
│    profiles     │────────▶│     schools     │
│  (Perfis)       │  N:1    │   (Escolas)     │
└─────────────────┘         └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    │ 1:N            │ 1:N            │ 1:N
                    ▼                ▼                ▼
         ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
         │   teachers   │  │   subjects   │  │   classes    │
         │ (Professores)│  │ (Disciplinas)│  │   (Turmas)   │
         └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                │                 │                  │
                │                 │                  │
                └────────┬────────┴────────┬─────────┘
                         │                 │
                         │ N:N:N           │
                         ▼                 │
                ┌──────────────────┐       │
                │    workloads     │       │
                │ (Cargas Horárias)│       │
                └──────────────────┘       │
                                          │
                ┌─────────────────────────┼─────────────────────────┐
                │                         │                         │
                │ 1:N                     │ 1:N                     │ 1:N
                ▼                         ▼                         ▼
    ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
    │teacher_availability│   │  fixed_lessons    │   │   allocations     │
    │ (Disponibilidade) │   │  (Aulas Fixas)    │   │   (Alocações)     │
    └───────────────────┘   └───────────────────┘   └───────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    MÓDULO DE CENÁRIOS                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐         ┌──────────────────────┐     │
│  │ schedule_scenarios   │────────▶│ schedule_conflicts   │     │
│  │  (Cenários)          │  1:N    │    (Conflitos)       │     │
│  └──────────────────────┘         └──────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 MÓDULO DE CONFIGURAÇÕES                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐    ┌──────────────────────────┐      │
│  │  school_configs      │    │ generation_parameters    │      │
│  │ (Config. Escola)     │    │  (Parâmetros Geração)    │      │
│  └──────────────────────┘    └──────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    MÓDULO DE AUDITORIA                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐                                       │
│  │    audit_logs        │                                       │
│  │ (Logs Auditoria)     │                                       │
│  └──────────────────────┘                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Tabelas Principais

### 1️⃣ **schools** (Escolas)
**Propósito:** Cadastro de instituições de ensino

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK - Identificador único |
| `name` | TEXT | Nome da escola |
| `code` | TEXT | Código único (UNIQUE) |
| `address` | TEXT | Endereço |
| `phone` | TEXT | Telefone |
| `email` | TEXT | Email institucional |
| `principal` | TEXT | Nome do diretor |

**Relacionamentos:**
- 1:N com `profiles`, `teachers`, `subjects`, `classes`, etc.

---

### 2️⃣ **profiles** (Perfis de Usuários)
**Propósito:** Extensão dos usuários do Supabase Auth com dados adicionais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK/FK - Referência a `auth.users` |
| `role` | TEXT | Papel: 'admin', 'staff', 'teacher', 'student' |
| `full_name` | TEXT | Nome completo |
| `school_id` | UUID | FK - Escola vinculada |
| `school_name` | TEXT | Nome da escola (desnormalizado) |
| `responsible` | TEXT | Responsável |
| `academic_year` | TEXT | Ano letivo (default: '2025') |

**Relacionamentos:**
- 1:1 com `auth.users` (CASCADE DELETE)
- N:1 com `schools`

---

### 3️⃣ **teachers** (Professores)
**Propósito:** Cadastro de professores

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `name` | TEXT | Nome do professor |
| `school_id` | UUID | FK - Escola |
| `workload_total` | INTEGER | Carga horária total |
| `planning_hours` | INTEGER | Horas de planejamento |
| `activity_hours` | INTEGER | Horas de atividade |
| `knowledge_area` | TEXT | Área de conhecimento |
| `schedule_id` | UUID | FK - Cenário (multi-scenario) |

**Relacionamentos:**
- N:1 com `schools` (CASCADE DELETE)
- 1:N com `workloads`, `teacher_availability`, `fixed_lessons`

---

### 4️⃣ **subjects** (Disciplinas)
**Propósito:** Cadastro de disciplinas/componentes curriculares

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `name` | TEXT | Nome da disciplina |
| `code` | TEXT | Código |
| `aulas_por_turma` | JSONB | Mapa de turma → nº de aulas semanais |
| `knowledge_area_id` | UUID | FK - Área de conhecimento |
| `school_id` | UUID | FK - Escola |
| `schedule_id` | UUID | FK - Cenário |

**Exemplo de `aulas_por_turma`:**
```json
{
  "uuid-turma-1": 6,
  "uuid-turma-2": 4
}
```

**Relacionamentos:**
- N:1 com `schools` (CASCADE DELETE)
- N:1 com `knowledge_areas`
- 1:N com `workloads`, `fixed_lessons`

---

### 5️⃣ **classes** (Turmas)
**Propósito:** Cadastro de turmas

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `name` | TEXT | Nome (ex: "1ª Série - A") |
| `grade` | TEXT | Série/Ano |
| `shift` | TEXT | Turno: 'morning', 'afternoon', 'night', 'fulltime' |
| `school_id` | UUID | FK - Escola |
| `aulas_diarias` | INTEGER | Nº de aulas por dia (default: 5) |
| `schedule_id` | UUID | FK - Cenário |

**Relacionamentos:**
- N:1 com `schools` (CASCADE DELETE)
- 1:N com `workloads`, `fixed_lessons`

---

### 6️⃣ **workloads** (Cargas Horárias)
**Propósito:** Alocação de professor → disciplina → turma

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `hours` | INTEGER | Horas semanais |
| `teacher_id` | UUID | FK - Professor |
| `subject_id` | UUID | FK - Disciplina |
| `class_id` | UUID | FK - Turma |
| `school_id` | UUID | FK - Escola |
| `schedule_id` | UUID | FK - Cenário |

**Constraint:** `UNIQUE(teacher_id, subject_id, class_id)`

**Relacionamentos:**
- N:1 com `teachers`, `subjects`, `classes` (CASCADE DELETE)

---

### 7️⃣ **teacher_availability** (Disponibilidade)
**Propósito:** Marcar disponibilidade dos professores por dia/horário

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `teacher_id` | UUID | FK - Professor |
| `day_of_week` | INTEGER | Dia da semana (0-6) |
| `time_slot_index` | INTEGER | Índice do horário |
| `status` | TEXT | 'P' (Preferencial), 'HA' (Horário Atividade), 'ND' (Não Disponível) |
| `schedule_id` | UUID | FK - Cenário |

**Constraint:** `UNIQUE(teacher_id, day_of_week, time_slot_index)`

---

### 8️⃣ **fixed_lessons** (Aulas Fixas)
**Propósito:** Pré-fixar aulas em horários específicos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `teacher_id` | UUID | FK - Professor |
| `subject_id` | UUID | FK - Disciplina |
| `class_id` | UUID | FK - Turma |
| `day_of_week` | INTEGER | Dia da semana (0-6) |
| `slot_number` | INTEGER | Número do horário |
| `schedule_id` | UUID | FK - Cenário |

**Constraint:** `UNIQUE(school_id, teacher_id, day_of_week, slot_number)`

---

### 9️⃣ **schedule_scenarios** (Cenários de Horários)
**Propósito:** Armazenar diferentes versões de horários gerados

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `name` | TEXT | Nome do cenário |
| `description` | TEXT | Descrição |
| `status` | TEXT | Status (default: 'Concluído') |
| `is_validated` | BOOLEAN | Se foi validado |
| `is_active` | BOOLEAN | Se é o cenário ativo |
| `schedule_data` | JSONB | Dados do horário gerado |
| `school_id` | UUID | FK - Escola |
| `created_by` | UUID | FK - Usuário criador |
| `fitness_score` | DECIMAL | Score de qualidade |
| `conflicts_count` | INTEGER | Nº de conflitos |

**Relacionamentos:**
- N:1 com `schools` (CASCADE DELETE)
- 1:N com `schedule_conflicts`

---

### 🔟 **knowledge_areas** (Áreas de Conhecimento)
**Propósito:** Categorizar disciplinas por área

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `name` | TEXT | Nome da área |
| `color` | TEXT | Cor para visualização |
| `school_id` | UUID | FK - Escola |

**Relacionamentos:**
- N:1 com `schools`
- 1:N com `subjects`

---

### 1️⃣1️⃣ **curriculum_matrices** (Matrizes Curriculares)
**Propósito:** Templates de grade curricular

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `name` | TEXT | Nome da matriz |
| `network` | TEXT | Rede de ensino |
| `modality` | TEXT | Modalidade |
| `components` | JSONB | Array de componentes curriculares |
| `school_id` | UUID | FK - Escola |

**Exemplo de `components`:**
```json
[
  {
    "component_name": "Língua Portuguesa",
    "knowledge_area": "Linguagens",
    "weekly_hours_1st": 6,
    "weekly_hours_2nd": 6,
    "weekly_hours_3rd": 6
  }
]
```

---

### 1️⃣2️⃣ **school_configs** (Configurações da Escola)
**Propósito:** Configurações operacionais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `school_id` | UUID | FK - Escola (UNIQUE) |
| `modalidade` | TEXT | 'medio' ou 'fundamental' |
| `turno` | TEXT | Turno padrão |
| `horario_inicio` | TEXT | Horário de início |
| `duracao_aula` | TEXT | Duração da aula |
| `intervalos` | JSONB | Configuração de intervalos |
| `dias_letivos` | JSONB | Dias letivos |
| `horarios_aula` | JSONB | Grade de horários |

---

### 1️⃣3️⃣ **schedule_conflicts** (Conflitos)
**Propósito:** Registrar conflitos detectados nos horários

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `scenario_id` | UUID | FK - Cenário |
| `conflict_type` | TEXT | Tipo de conflito |
| `severity` | TEXT | 'low', 'medium', 'high', 'critical' |
| `description` | TEXT | Descrição |
| `affected_entities` | JSONB | Entidades afetadas |

---

### 1️⃣4️⃣ **audit_logs** (Logs de Auditoria)
**Propósito:** Rastreabilidade de ações

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `user_id` | UUID | FK - Usuário |
| `school_id` | UUID | FK - Escola |
| `action` | TEXT | Ação realizada |
| `entity_type` | TEXT | Tipo de entidade |
| `entity_id` | UUID | ID da entidade |
| `old_values` | JSONB | Valores antigos |
| `new_values` | JSONB | Valores novos |
| `ip_address` | TEXT | IP do usuário |

---

## 🔐 Segurança (RLS - Row Level Security)

### Políticas Principais:

1. **Isolamento por Escola:**
   - Usuários só veem dados da sua `school_id`
   - Admins veem tudo

2. **Políticas Comuns:**
   ```sql
   -- SELECT: Ver dados da própria escola ou ser admin
   FOR SELECT USING (
       school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()) OR
       EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
   );
   
   -- ALL: Gerenciar dados da própria escola ou ser admin
   FOR ALL USING (
       school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()) OR
       EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
   );
   ```

3. **Perfis:**
   - Usuários veem/editam apenas o próprio perfil
   - Admins veem/editam todos

---

## 🔄 Triggers Automáticos

### 1. **update_updated_at_column**
- Atualiza automaticamente `updated_at` em todas as tabelas

### 2. **handle_new_user**
- Cria perfil automaticamente quando usuário é criado no Auth
- Define role baseado no email:
  - `admin@chathorario.com` → role 'admin'
  - `escola@teste.com` → role 'staff' + vincula à escola teste
  - Outros → role 'teacher'

---

## 📊 Views Úteis

### **workload_details**
```sql
SELECT w.id, w.hours, t.name as teacher_name, 
       s.name as subject_name, c.name as class_name
FROM workloads w
JOIN teachers t ON w.teacher_id = t.id
JOIN subjects s ON w.subject_id = s.id
JOIN classes c ON w.class_id = c.id;
```

### **scenario_summary**
```sql
SELECT ss.id, ss.name, ss.status, ss.fitness_score,
       s.name as school_name, p.full_name as created_by_name
FROM schedule_scenarios ss
JOIN schools s ON ss.school_id = s.id
JOIN profiles p ON ss.created_by = p.id;
```

---

## 🎯 Funcionalidades Especiais

### **Multi-Scenario (Cenários Múltiplos)**
- Campo `schedule_id` em várias tabelas permite múltiplos cenários
- Tabelas afetadas: `teachers`, `subjects`, `classes`, `workloads`, `fixed_lessons`, `teacher_availability`
- Permite criar/comparar diferentes versões de horários

### **Cascade Delete**
- Ao deletar uma escola, todos os dados relacionados são removidos
- Ao deletar um professor, suas alocações e disponibilidades são removidas
- Ao deletar uma disciplina, suas alocações são removidas

---

## 📈 Índices para Performance

Todos os campos de FK têm índices:
- `idx_teachers_school_id`
- `idx_subjects_school_id`
- `idx_classes_school_id`
- `idx_workloads_teacher_id`
- `idx_workloads_subject_id`
- `idx_workloads_class_id`
- etc.

Índices adicionais em campos de busca frequente:
- `idx_teachers_name`
- `idx_subjects_name`
- `idx_audit_logs_created_at`
- `idx_audit_logs_action`

---

## 🔗 Conexões Principais

```
schools (1) ──────── (N) teachers
                  └── (N) subjects
                  └── (N) classes
                  └── (N) schedule_scenarios

teachers (1) ─────── (N) workloads
                  └── (N) teacher_availability
                  └── (N) fixed_lessons

subjects (1) ─────── (N) workloads
                  └── (N) fixed_lessons

classes (1) ──────── (N) workloads
                  └── (N) fixed_lessons

workloads (N:N:N) = teachers × subjects × classes
```

---

## 📝 Notas Importantes

1. **JSONB Usage:**
   - `aulas_por_turma` em `subjects`: Flexibilidade para diferentes cargas por turma
   - `schedule_data` em `schedule_scenarios`: Armazena horário completo gerado
   - `components` em `curriculum_matrices`: Array de componentes curriculares

2. **Constraints Únicos:**
   - `workloads`: Um professor não pode ter múltiplas alocações para mesma disciplina/turma
   - `teacher_availability`: Um professor não pode ter múltiplos status no mesmo dia/horário
   - `fixed_lessons`: Um professor não pode ter múltiplas aulas fixas no mesmo dia/horário

3. **Soft vs Hard Delete:**
   - Sistema usa **hard delete** (CASCADE)
   - Auditoria via `audit_logs` preserva histórico

---

**Última atualização:** 2025-12-01
**Versão do Schema:** 1.0
