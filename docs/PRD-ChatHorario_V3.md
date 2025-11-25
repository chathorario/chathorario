# 🧭 Product Requirements Document (PRD)

## Produto: **ChatHorário – Sistema Inteligente de Geração de Horários Escolares com IA**
**Versão:** 1.2  
**Status:** Em Desenvolvimento  
**Data:** 03/11/2025  
**Stack Tecnológica:**  
- **Frontend:** React + TypeScript + Tailwind CSS  
- **UI Library:** Shadcn/UI (baseada em Radix Primitives)  
- **Backend & Auth:** Supabase (PostgreSQL + Edge Functions)  
- **IA / Otimização:** Algoritmo Genético (executado client-side em TypeScript)  

---

## 1. Visão Geral

O **ChatHorário** é um sistema SaaS que automatiza a **geração de horários escolares** usando **IA e algoritmos genéticos**.  
A plataforma guia o usuário por um **fluxo conversacional**, permitindo configurar escolas, professores e disciplinas de forma natural e validada em tempo real.

---

## 2. Objetivos do Produto

1. Reduzir o tempo e a complexidade na criação de horários escolares.  
2. Automatizar validações pedagógicas e de disponibilidade.  
3. Oferecer uma experiência interativa, responsiva e intuitiva (UX conversacional).  
4. Garantir consistência de dados e integridade de estados.  
5. Utilizar IA para otimização e autoajuste de grades.  

---

## 3. Público-Alvo

- Secretarias e gestores escolares  
- Coordenadores pedagógicos  
- Redes de ensino públicas e privadas  

---

## 4. Funcionalidades Principais

### 4.1 Fluxo Conversacional (UI Dinâmica)
- O usuário interage via interface orientada a etapas (controlada por `conversationState`).  
- Etapas principais:
  1. **Início** — Escolher: “Começar do Zero” ou “Usar Dados Existentes”.  
  2. **Configuração da Escola**  
  3. **Cadastro de Professores**  
  4. **Cadastro de Disciplinas**  
  5. **Criação de Turmas**  
  6. **Distribuição e Validação de Cargas Horárias**  
  7. **Geração Automática de Horário**  

---

### 4.2 Controle de Estados Internos (`conversationState`)
- Responsável por controlar o fluxo linear e impedir saltos indevidos.  
- Cada estado dispara ações específicas, com persistência no **Supabase** (tabela `workflow_state`).  
- O estado atual é refletido visualmente no cabeçalho usando componentes **Stepper** do **Shadcn/UI**.  

---

### 4.3 Algoritmo Genético (GA)
- Implementado em **TypeScript puro**, executado no navegador.  
- Recebe dados de professores, disciplinas e turmas e retorna a combinação ótima de horários.  
- Respeita regras como:
  - Nenhum professor em duas turmas simultâneas.  
  - Carga horária compatível.  
  - Distribuição equilibrada de disciplinas.  

---

### 4.4 Validações Automáticas
- Implementadas via **hooks reativos** (`useValidation`), garantindo consistência antes de avançar etapas.  
- Validações:
  - Soma de cargas horárias por professor.  
  - Conflito de disciplinas e horários.  
  - Disponibilidade e limites semanais.  

---

### 4.5 Interface Visual (React + Tailwind + Shadcn)
- Layout responsivo baseado em **Grid e Flexbox**.  
- Utiliza **Cards**, **Tabs** e **Stepper Radix** para progressão do fluxo.  
- Tema personalizável (modo claro/escuro).  
- Componentes principais:
  - `ProfessorTable` – CRUD de professores com botões contextuais.  
  - `DisciplinaModal` – seleção e vínculo com professores.  
  - `HorarioPreview` – visualização do resultado final.  

---

### 4.6 Persistência e Sincronização
- **Supabase** é responsável por:
  - Armazenar usuários, escolas, professores, turmas e disciplinas.  
  - Persistir estados de conversa e checkpoints.  
- Autenticação via **Supabase Auth** (com e-mail + provedores sociais).  
- Recuperação de sessão automática em caso de refresh.  

---

### 4.7 Auditoria e Logs de Fluxo
- Cada transição de estado é registrada em `workflow_logs` no Supabase.  
- Logs contêm: ID do usuário, timestamp, estado anterior e novo estado.  
- O painel “Histórico de Ações” exibe o progresso visual.  

---

### 4.8 Recuperação de Fluxo (Checkpoints)
- Ao recarregar a página, o sistema busca o último `conversationState` ativo.  
- Permite retomar etapas anteriores sem reiniciar o processo.  
- Implementado com `localStorage` (fallback) + Supabase Sync.  

---

### 4.9 Correção Segura
- Função `CORRIGIR_ESCOLA_GLOBAL` reconfigura dados de forma controlada:  
  - **Correção leve:** apenas atualiza dados básicos.  
  - **Correção profunda:** limpa registros e reinicia fluxo.  
- Confirmação dupla em modal antes de qualquer ação destrutiva.  

---

### 4.10 Gestão de Código Órfão
- Funções antigas e botões inativos identificados e marcados como `@deprecated`.  
- Centralização de cadastros de professores e disciplinas no painel principal.  
- Planejamento de refatoração para módulo “Portal do Professor”.  

---

### 4.11 Integração com IA
- A IA atua como **assistente de validação contextual**.  
- Exibe sugestões como:
  - “A carga horária do professor X excede o limite semanal.”  
  - “Turma 2A possui duas disciplinas simultâneas.”  
- Planejada futura integração com modelo hospedado no Supabase Edge Function (`/api/ai-scheduler`).  

---

## 5. Requisitos Funcionais

| Código | Requisito | Descrição |
|--------|------------|-----------|
| RF-01 | Cadastro de Escola | Inserir e editar dados da escola. |
| RF-02 | Cadastro de Professores | CRUD completo com tabela interativa. |
| RF-03 | Cadastro de Disciplinas | Associação direta a professores. |
| RF-04 | Criação de Turmas | Definir séries, horários e alunos. |
| RF-05 | Validação Automática | Impedir inconsistências antes do GA. |
| RF-06 | Geração de Horário | Executar algoritmo genético client-side. |
| RF-07 | Recuperação de Fluxo | Retomar automaticamente fluxos salvos. |
| RF-08 | Correção Segura | Resetar dados com confirmação dupla. |
| RF-09 | Logs de Fluxo | Registrar histórico de estados. |

---

## 6. Requisitos Não-Funcionais

| Categoria | Requisito |
|------------|------------|
| **Performance** | Transição de estado < 200ms. |
| **Segurança** | Autenticação Supabase + RLS (Row Level Security). |
| **Integridade** | Estados sincronizados e logs auditáveis. |
| **Escalabilidade** | Algoritmo executado client-side (sem carga no backend). |
| **UX/UI** | Design consistente (Shadcn + Tailwind). |
| **Resiliência** | Recuperação de contexto após refresh. |
| **Acessibilidade** | Conformidade com WCAG 2.1. |

---

## 7. Estrutura de Banco de Dados (Supabase)

### Tabelas Principais

| Tabela | Campos Principais | Descrição |
|--------|--------------------|-----------|
| `escolas` | id, nome, endereco, tipo | Dados básicos da escola. |
| `professores` | id, nome, disciplina_id, carga_horaria, disponibilidade | Professores e regras. |
| `disciplinas` | id, nome, carga_horaria | Disciplinas oferecidas. |
| `turmas` | id, nome, turno, serie | Turmas e turnos. |
| `workflow_state` | user_id, etapa_atual, timestamp | Controle do fluxo. |
| `workflow_logs` | id, user_id, estado_antigo, estado_novo, timestamp | Auditoria completa. |

---

## 8. Métricas de Sucesso (KPIs)

| Indicador | Descrição | Meta |
|------------|------------|------|
| **Tempo médio para geração** | Tempo entre início e horário final | ≤ 10 minutos |
| **Taxa de Consistência** | % de fluxos sem erro de validação | > 99% |
| **Recuperação de Fluxo** | % de retomadas bem-sucedidas | > 95% |
| **Integridade de Estado** | % de transições sem falhas | > 99% |
| **Satisfação do Usuário (UX)** | Nota média de feedback | ≥ 4.5 / 5 |

---

## 9. Roadmap de Versões

| Versão | Foco | Entregas Principais |
|---------|------|---------------------|
| **v1.0** | Fluxo Conversacional + GA | Geração básica de horários |
| **v1.1** | IA de Validação | Sugestões automáticas e correções |
| **v1.2** | Consistência e Recuperação | Logs, checkpoints, correção segura |
| **v1.3** | Portal do Professor | Gestão individual e exportações |
| **v1.4** | Relatórios Avançados | PDF, CSV, APIs externas |

---

## 10. Considerações Finais

O **ChatHorário** é um SaaS educacional voltado para **eficiência, clareza e inteligência aplicada à gestão pedagógica**.  
A stack moderna baseada em **React + TypeScript + Tailwind + Shadcn + Supabase** garante alta performance, segurança e extensibilidade.  
A versão **1.2** estabelece um núcleo sólido, com fluxo conversacional auditável e pronto para expansão modular.

---
