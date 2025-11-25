# PRD — ChatHorário
**Versão:** 1.1 (Revisado com fluxos colaborativos e regras de negócio expandidas)

---

## 1. Visão Geral

**ChatHorário** é um SaaS colaborativo projetado para otimizar e automatizar a criação de horários escolares complexos.  
A plataforma utiliza um **algoritmo genético (GA)** para gerar horários válidos, respeitando um conjunto robusto de restrições que incluem disponibilidade de professores, gestão de recursos (salas) e regras pedagógicas avançadas.

O produto é destinado a **secretarias escolares, coordenadores e gestores acadêmicos**, oferecendo:

- Uma **interface guiada** (wizard e assistente)
- Um **portal dedicado para professores** submeterem suas disponibilidades
- **Ferramentas de edição manual pós-geração**
- **Dashboards analíticos** para avaliar a "saúde" do horário gerado

---

## 2. Perfis de Usuário (Personas)

### 🧭 Administrador (Gestor)
**Função:**  
Configura a instância da escola pela primeira vez (via Onboarding Wizard), cadastra os parâmetros centrais (períodos, salas, turmas), gerencia usuários e "abre" os períodos de coleta de disponibilidade.

---

### 🎓 Coordenador Pedagógico
**Função:**  
Usuário principal do dia-a-dia. Define a matriz curricular, gerencia restrições pedagógicas (geminação, precedência), revisa/aprova a disponibilidade dos professores, gera os horários, analisa dashboards de qualidade e realiza ajustes manuais.  
Também utiliza o módulo de **"Substituição Rápida"**.

---

### 👩‍🏫 Professor
**Função:**  
Acessa um portal simplificado (**"Portal do Professor"**) para submeter sua grade de disponibilidade (D/P/ND) e preferências (ex: “prefiro aulas pela manhã”) dentro do período definido pelo Administrador.

---

## 3. Objetivos do Produto

- **Primário:** Gerar horários escolares válidos e otimizados que respeitem todas as *hard constraints* (choques, disponibilidade, salas, regras) e minimizem *soft constraints* (janelas, distribuição).  
- **Secundário:** Facilitar a colaboração entre gestão e corpo docente, descentralizando a coleta de disponibilidade.  
- **Terciário:** Fornecer análises de dados (dashboards) sobre a qualidade do horário gerado.  
- **Operacional:** Agilizar a resolução de problemas do dia-a-dia através do módulo **"Substituição Rápida"**.

---

## 4. Funcionalidades Principais

### 4.0 Wizard de Onboarding (Configuração Inicial)

Fluxo passo-a-passo para novos administradores configurarem a escola:

- Dados da Escola (nome, ano letivo, dias, períodos/dia)  
- Cadastro de Recursos/Salas (ex: “Lab. Química”, “Ginásio”, “Sala 101”)  
- Cadastro de Professores (nome, email para convite ao portal)  
- Cadastro de Turmas  
- Montagem da Matriz Curricular (disciplinas por turma, carga horária, professor padrão)

---

### 4.1 Portal do Professor (Coleta de Disponibilidade)

- Interface dedicada para professores preencherem disponibilidade (D/P/ND) e preferências (soft constraints)  
- Admin/Coordenador define janelas de coleta (data início/fim)  
- Dashboard para Coordenador visualizar status de preenchimento

---

### 4.2 Gestão de Recursos (Salas)

- Cadastro de salas/recursos com tipos (Padrão, Laboratório, Ginásio) e capacidade  
- Vincular disciplinas a requisitos de recursos (ex: “Química” requer “Laboratório”)

---

### 4.3 Configuração de Parâmetros de Geração

Parâmetros configuráveis pelo Coordenador antes de rodar o GA:

- **Flags:** considerar disponibilidade, evitar janelas, etc.  
- **Restrições Pedagógicas:**
  - **Co-alocação (Geminação):** turmas que devem ter aulas juntas  
  - **Precedência:** disciplina que deve ocorrer antes de outra  
  - **Incompatibilidade:** disciplinas que não devem ocorrer no mesmo dia

---

### 4.4 Fixar Aulas e Modelos de Escola

- Interface para marcar aulas fixas (bloqueadas para o GA)  
- Salvar/carregar modelos completos de escola (templates)

---

### 4.5 Geração Automática (Algoritmo Genético)

- Configuração do GA (população, gerações, etc.)  
- Função de *fitness* penaliza hard constraints severamente e soft constraints suavemente

---

### 4.6 Pós-processamento e Edição Manual

- Modo “Troca Manual” para trocar células com validação de disponibilidade e recursos  
- Possibilidade de forçar troca com aviso

---

### 4.7 Módulo de Substituição Rápida

- Coordenador clica em uma aula com professor ausente  
- Sistema sugere substitutos válidos (mesma disciplina, janela livre, etc.)

---

### 4.8 Dashboard de Análise e Qualidade

Após a geração, exibe:

- **Índice de Qualidade (Score 0–100)**  
- **Métricas de Professores:** janelas, distribuição de carga  
- **Métricas de Turmas:** distribuição de disciplinas na semana  
- **Métricas de Recursos:** taxa de ocupação de laboratórios

---

### 4.9 Histórico, Exportação e Importação

- Salvar versões e histórico de horários gerados  
- Exportar para PDF (jsPDF + AutoTable)  
- Importação Avançada (.json) para migração ou bypass do wizard

---

### 4.10 UX / Progresso / Feedback

- Barra de progresso durante execução do GA  
- Mensagens do assistente e *loading overlays* para manter UI responsiva

---

## 5. Regras de Negócio e Restrições

### Hard Constraints (Não negociáveis)

- Professor não pode lecionar em duas turmas/locais ao mesmo tempo  
- Sala/Recurso não pode ser usada por duas turmas simultaneamente  
- Respeitar disponibilidade (ND) enviada pelo professor  
- Não sobrescrever aulas fixas  
- Respeitar co-alocação (geminação)  
- Respeitar requisitos de sala (ex: Química → Laboratório)

---

### Soft Constraints (Heurísticas)

- Evitar janelas do professor  
- Evitar professor com apenas 1 aula no dia  
- Penalizar muitas aulas da mesma disciplina no mesmo dia  
- Respeitar preferências do professor  
- Respeitar precedência e incompatibilidade

---

## 6. Modelo de Dados (Entidades-Chave)

| Entidade | Atributos Principais |
|-----------|----------------------|
| **Usuário** | id, email, nome, perfil (Admin, Coordenador, Professor) |
| **Escola** | configurações gerais, dias, períodos |
| **Recurso (Sala)** | id, nome, tipo (Padrão, Lab, Ginásio), capacidade |
| **Professor** | id, nome, UsuarioId, gradeDisponibilidade, preferencias |
| **Disciplina** | id, nome, weeklyHours, recursoRequeridoId (opcional) |
| **Turma** | id, nome, matrizCurricular (DisciplinaId → ProfessorId) |
| **HorarioGerado** | mapa de Turma/Professor/Recurso → Dia/Slot |

---

## 7. UI / Fluxos (Alto Nível)

1. **Onboarding (Wizard):** Admin cadastra Escola, Salas, Professores, Turmas, Matriz  
2. **Período de Disponibilidade:** Admin abre o período de coleta  
3. **Portal do Professor:** Professores enviam disponibilidade e preferências  
4. **Config. Geração:** Coordenador revisa e define restrições  
5. **Gerar Horário:** Coordenador inicia GA  
6. **Analisar (Dashboard):** Avaliar Score e métricas  
7. **Ajustar (Edição Manual):** Fazer trocas finas  
8. **Publicar / Exportar:** Salvar versão final e exportar PDF  
9. **Operação:** Usar “Substituição Rápida” no dia-a-dia

---

## 8. Requisitos Não-Funcionais

- **Performance:** GA executado no cliente (JS); UI responsiva. (>50 turmas → backend)  
- **Portabilidade:** Export/Import JSON, Export PDF  
- **Segurança:** Controle de acesso baseado em perfil; validação de uploads  

---

## 9. Métricas de Sucesso (KPIs)

- % de horários sem hard constraints violadas (Meta: 100%)  
- Índice de Qualidade médio (Score > 90)  
- Taxa de adesão do Portal do Professor  
- Tempo médio de geração de solução aceitável  
- Redução no uso da Edição Manual

---

## 10. Roadmap Sugerido

### MVP (v1.1)
- Onboarding Wizard  
- Portal do Professor  
- Gestão de Recursos  
- GA com Hard + Soft Constraints  
- Edição Manual  
- Dashboard e Exportação PDF  

### Escalabilidade / Backend
- Mover geração pesada para backend  
- Histórico granular e logs de auditoria  

### IA / Otimizações Avançadas
- Otimizações multi-objetivo (peso por prioridade)  
- Sugestões automáticas de parâmetros  

---
