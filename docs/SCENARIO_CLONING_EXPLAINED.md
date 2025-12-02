# Resumo: O que é clonado ao criar um novo cenário

## ✅ Dados que SÃO clonados (específicos do cenário):

### 1. **Professores** (Teachers)
- Nome, carga horária, horas de planejamento, área de conhecimento
- Cada cenário tem sua própria lista de professores

### 2. **Disciplinas** (Subjects)  
- Nome da disciplina
- **Aulas por turma** (quantas aulas cada disciplina tem em cada turma)
  - Os IDs das turmas são remapeados para os novos IDs

### 3. **Turmas** (Classes)
- Nome, série, aulas diárias
- Cada cenário tem suas próprias turmas

### 4. **Indisponibilidades** (Teacher Availability)
- Grade de disponibilidade de cada professor
- Marca quando o professor NÃO está disponível (planejamento, hora atividade, etc.)
- Os IDs dos professores são remapeados para os novos IDs

### 5. **Alocações** (Workloads)
- Quantas horas cada professor dá de cada disciplina em cada turma
- Todos os IDs (professor, disciplina, turma) são remapeados

### 6. **Aulas Fixas** (Fixed Lessons)
- Aulas fixadas em horários específicos
- Todos os IDs são remapeados

---

## ❌ Dados que NÃO são clonados (globais da escola):

### 1. **Configurações da Escola** (School Settings)
- Horários de início/fim das aulas
- Número de aulas por dia
- Dias da semana

### 2. **Usuários** (Profiles)
- Contas de usuário e permissões

---

## 🔄 Como funciona o remapeamento:

Quando você clona "Cenário A" para criar "Cenário B":

**Cenário A:**
- Professor: João (ID: abc-123)
- Turma: 1º Ano (ID: def-456)
- Indisponibilidade: João não disponível Segunda 1ª aula

**Cenário B (clonado):**
- Professor: João (ID: **xyz-789**) ← Novo ID
- Turma: 1º Ano (ID: **ghi-012**) ← Novo ID  
- Indisponibilidade: João (ID: **xyz-789**) não disponível Segunda 1ª aula ← ID remapeado

Isso garante que mudanças no Cenário B não afetem o Cenário A!
