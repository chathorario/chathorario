# 🗺️ ChatHorário - Roadmap de Implementação

**Versão do PRD:** 1.3  
**Última atualização:** 06/11/2025  
**Status do Projeto:** 75% Completo

---

## ⚠️ ATENÇÃO: SISTEMA CONVERSACIONAL VIA CHAT

**CRÍTICO:** Este é um sistema **100% conversacional**. O usuário interage via **chat interativo**, NÃO via formulários tradicionais.

Todo o fluxo de criação de horários acontece através de uma **conversa natural** onde o sistema guia o usuário passo a passo.

---

## 📊 Resumo Geral

| Categoria | Total | Concluído | Em Progresso | Pendente | % Completo |
|-----------|-------|-----------|--------------|----------|------------|
| **Infraestrutura** | 5 | 3 | 0 | 2 | 60% |
| **Frontend Base** | 4 | 4 | 0 | 0 | 100% |
| **Telas de Cadastro** | 6 | 6 | 0 | 0 | 100% |
| **Chat Conversacional** | 8 | 5 | 0 | 3 | 63% |
| **Autenticação** | 3 | 3 | 0 | 0 | 100% |
| **Banco de Dados** | 6 | 0 | 0 | 6 | 0% |
| **Sistema de Estados** | 5 | 5 | 0 | 0 | 100% |
| **Processamento IA** | 5 | 0 | 0 | 5 | 0% |
| **Algoritmo Genético** | 6 | 6 | 0 | 0 | 100% |
| **Logs e Auditoria** | 3 | 0 | 0 | 3 | 0% |
| **Recuperação de Fluxo** | 3 | 0 | 0 | 3 | 0% |
| **Visualização** | 4 | 4 | 0 | 0 | 100% |
| **Validações e Conflitos** | 5 | 5 | 0 | 0 | 100% |
| **TOTAL** | **63** | **43** | **0** | **20** | **75%** |

---

## ✅ 1. IMPLEMENTADO (13 itens)

### 1.1 Infraestrutura Base
- ✅ **Estrutura do projeto React + TypeScript + Vite**
- ✅ **Configuração Tailwind CSS + Shadcn/UI**

### 1.2 Frontend Base
- ✅ **Landing Page (Index.tsx)**
  - Seção hero com CTA
  - Seção de features
  - Como funciona
  - Call to action final
  - SEO otimizado

- ✅ **Dashboard básico (Dashboard.tsx)**
  - Stepper visual com 7 etapas
  - Layout responsivo
  - Cards de estatísticas placeholder
  - Seção de atividades recentes

- ✅ **Sistema de Design (index.css)**
  - Tema educacional com cores azul e verde
  - Tokens semânticos (primary, secondary, accent)
  - Gradientes e sombras
  - Suporte a dark mode

- ✅ **Sistema de Rotas (App.tsx)**
  - Rota principal (/)
  - Rota do dashboard (/dashboard)
  - Rota 404
  - React Router configurado

- ✅ **SEO e Meta Tags (index.html)**
  - Título otimizado
  - Meta description
  - Viewport configurado

---

## ✅ 1.3 Telas de Cadastro (6/6 itens - NOVO)

- ✅ **DataContext Global** (`src/context/DataContext.tsx`)
  - Gerenciamento centralizado de todos os dados
  - Funções CRUD para: escola, professores, disciplinas, turmas, carga horária
  - Estado persistente durante sessão
  - Interface TypeScript completa

- ✅ **Tela: Configuração da Escola** (`src/pages/SchoolSetup.tsx`)
  - Formulário com validação (react-hook-form + zod)
  - Campo para nome da escola
  - Navegação para próxima etapa
  - Integração com DataContext

- ✅ **Tela: Gerenciamento de Professores** (`src/pages/TeachersManagement.tsx`)
  - Lista de professores cadastrados
  - Formulário de adicionar/editar professores
  - Campo de nome e disciplinas
  - Funcionalidades: Adicionar, Editar, Excluir
  - Badges para disciplinas
  - Navegação entre etapas

- ✅ **Tela: Gerenciamento de Disciplinas** (`src/pages/SubjectsManagement.tsx`)
  - Lista de disciplinas cadastradas
  - Formulário de adicionar disciplina
  - Validação de duplicatas
  - Funcionalidade de excluir
  - Navegação entre etapas

- ✅ **Tela: Gerenciamento de Turmas** (`src/pages/ClassesManagement.tsx`)
  - Lista de turmas cadastradas
  - Formulário com nome e turno (select)
  - Opções: Matutino, Vespertino, Noturno
  - Funcionalidades: Adicionar, Editar, Excluir
  - Badges para turnos
  - Navegação entre etapas

- ✅ **Tela: Definição de Carga Horária** (`src/pages/WorkloadManagement.tsx`)
  - Formulário dinâmico baseado em turmas cadastradas
  - Input numérico para cada turma
  - Validação (1-40 horas)
  - Finalização do fluxo de cadastro
  - Redirecionamento para Dashboard

- ✅ **Rotas Atualizadas** (`src/App.tsx`)
  - /school-setup
  - /teachers
  - /subjects
  - /classes
  - /workload
  - Integração com DataProvider global

---

## ✅ 2. CHAT CONVERSACIONAL (Parcialmente Implementado - 5/8 itens)

### 2.1 Componente de Chat (ESSENCIAL - Seção 4 do PRD)
- ✅ **Componente `ChatInterface`** (`src/components/chat/ChatInterface.tsx`)
  - Interface de mensagens (user/assistant)
  - Input de texto para mensagens do usuário
  - Área de exibição de mensagens
  - Scroll automático
  - Loading states durante processamento
  - Integrado ao Dashboard

- ✅ **Componente `MessageBubble`** (`src/components/chat/MessageBubble.tsx`)
  - Estilos diferenciados para user/assistant
  - Timestamps formatados
  - Animações de entrada
  - Design responsivo
  
- ✅ **Hook `useChatMessages`** (`src/hooks/useChatMessages.ts`)
  - Gerenciamento de histórico de mensagens (local)
  - Estado local otimista
  - Funções para adicionar mensagens user/assistant
  - Estado de loading
  - ⬜ Persistência no Supabase (pendente)
  - ⬜ Sincronização em tempo real (pendente)

- ✅ **Componente `ChatInput`** (`src/components/chat/ChatInput.tsx`)
  - Textarea com auto-resize
  - Botão de envio
  - Suporte a Enter (enviar) e Shift+Enter (nova linha)
  - Validação de input
  - Estado de loading/disabled

- ✅ **Sistema de Quick Replies** (`src/components/chat/QuickReplies.tsx`)
  - Botões de sugestão de resposta
  - Ações contextuais
  - Navegação por etapas
  - Animações de entrada

### 2.2 Processamento de Mensagens com IA (Lovable AI)
- ⬜ **Edge Function `process-chat-message`**
  - Recebe mensagem do usuário
  - Processa via Lovable AI (Gemini 2.5 Flash)
  - Determina intenção e entidade extraída
  - Retorna resposta + ações do sistema

- ⬜ **Sistema de Prompts por Etapa**
  - Prompt para INICIO
  - Prompt para CONFIG_ESCOLA
  - Prompt para CADASTRO_PROFESSORES
  - Prompt para CADASTRO_DISCIPLINAS
  - Prompt para CRIACAO_TURMAS
  - Prompt para VALIDACAO_CARGAS
  - Prompt para GERACAO_HORARIO

- ⬜ **Extração de Entidades**
  - Parser de dados estruturados das respostas do usuário
  - Validação de dados extraídos
  - Confirmação com usuário antes de salvar

- ⬜ **Gerenciamento de Contexto**
  - Histórico das últimas 10 mensagens
  - Estado atual do fluxo
  - Dados já coletados
  - Próximos passos sugeridos

- ⬜ **Hook `useChatProcessor`**
  - Envio de mensagens
  - Streaming de respostas (SSE)
  - Tratamento de erros
  - Rate limiting handling

### 2.3 Fluxo Conversacional Guiado
- ✅ **Serviço de Fluxo** (`src/services/conversationFlow.ts`)
  - Função `getStepPrompt()` - Mensagens do bot por etapa
  - Função `processUserMessage()` - Processamento de entrada do usuário
  - Quick replies contextuais
  - Lógica de transição entre etapas

- ✅ **Etapa 1: START (INICIO)**
  - Mensagem de boas-vindas
  - Quick replies: "Sim, vamos começar!", "Preciso de ajuda"

- ✅ **Etapa 2: SCHOOL_SETUP (CONFIG_ESCOLA)**
  - Coleta nome da escola via conversa
  - Extração básica de dados
  - ⬜ Validação avançada com IA (pendente)

- ✅ **Etapa 3: TEACHERS (CADASTRO_PROFESSORES)**
  - Mensagem guiada para cadastro
  - Parser de formato "Nome - Disciplinas"
  - Cadastro múltiplo incremental
  - Quick replies: "Já cadastrei todos", "Pular esta etapa"
  - ⬜ Validação com IA (pendente)

- ✅ **Etapa 4: SUBJECTS (CADASTRO_DISCIPLINAS)**
  - Coleta disciplinas separadas por vírgula
  - Parser básico implementado
  - ⬜ Validação com IA (pendente)

- ✅ **Etapa 5: CLASSES (CRIACAO_TURMAS)**
  - Parser de formato "Nome - Turno"
  - Cadastro incremental
  - Quick replies contextuais
  - ⬜ Validação com IA (pendente)

- ✅ **Etapa 6: WORKLOAD (VALIDACAO_CARGAS)**
  - Coleta de carga horária
  - ⬜ Parser completo (pendente)
  - ⬜ Validações automáticas (pendente)

- ✅ **Etapa 7: GENERATE (GERACAO_HORARIO)**
  - Resumo de dados coletados
  - Confirmação para gerar
  - ⬜ Integração com algoritmo genético (pendente)

- ✅ **Etapa 8: COMPLETED**
  - Mensagem de sucesso
  - Quick replies para próximas ações

---

## 🚧 4. PENDENTE - PRIORIDADE ALTA (Backend e Autenticação)

### 4.1 Lovable Cloud (Supabase)
- ✅ **Ativar Lovable Cloud**
  - Backend provisionado
  - PostgreSQL configurado
  - Edge Functions prontas para uso

### 4.2 Autenticação (RF-AUTH)
- ✅ **Sistema de Login**
  - Componente de login/registro (`src/pages/Auth.tsx`)
  - Integração com backend
  - Email + senha com validação
  - Auto-confirmação de email ativada

- ✅ **Proteção de Rotas**
  - AuthProvider context (`src/context/AuthContext.tsx`)
  - ProtectedRoute component
  - Redirecionamento automático para /auth

- ✅ **Gerenciamento de Sessão**
  - Persistência de sessão automática
  - Logout funcional
  - Tratamento de erros de autenticação

### 4.3 Banco de Dados - Estrutura (Seção 7 do PRD)
- ⬜ **Tabela `escolas`**
  ```sql
  - id (UUID, PK)
  - user_id (UUID, FK)
  - nome (VARCHAR)
  - endereco (TEXT)
  - tipo (ENUM: publica, privada)
  - created_at (TIMESTAMP)
  ```

- ⬜ **Tabela `professores`**
  ```sql
  - id (UUID, PK)
  - escola_id (UUID, FK)
  - nome (VARCHAR)
  - email (VARCHAR)
  - disciplinas (JSONB)
  - carga_horaria_max (INTEGER)
  - disponibilidade (JSONB)
  - created_at (TIMESTAMP)
  ```

- ⬜ **Tabela `disciplinas`**
  ```sql
  - id (UUID, PK)
  - escola_id (UUID, FK)
  - nome (VARCHAR)
  - carga_horaria_semanal (INTEGER)
  - cor (VARCHAR)
  - created_at (TIMESTAMP)
  ```

- ⬜ **Tabela `turmas`**
  ```sql
  - id (UUID, PK)
  - escola_id (UUID, FK)
  - nome (VARCHAR)
  - serie (VARCHAR)
  - turno (ENUM: matutino, vespertino, noturno)
  - numero_alunos (INTEGER)
  - created_at (TIMESTAMP)
  ```

- ⬜ **Tabela `chat_messages`**
  ```sql
  - id (UUID, PK)
  - user_id (UUID, FK)
  - escola_id (UUID, FK)
  - role (ENUM: user, assistant)
  - content (TEXT)
  - metadata (JSONB)
  - created_at (TIMESTAMP)
  ```

- ⬜ **Tabela `workflow_state`**
  ```sql
  - id (UUID, PK)
  - user_id (UUID, FK)
  - escola_id (UUID, FK)
  - etapa_atual (VARCHAR)
  - dados_contexto (JSONB)
  - updated_at (TIMESTAMP)
  ```

- ⬜ **Tabela `workflow_logs`**
  ```sql
  - id (UUID, PK)
  - user_id (UUID, FK)
  - escola_id (UUID, FK)
  - estado_antigo (VARCHAR)
  - estado_novo (VARCHAR)
  - timestamp (TIMESTAMP)
  - metadata (JSONB)
  ```

### 4.4 RLS (Row Level Security)
- ⬜ **Políticas de segurança para todas as tabelas**
  - Usuários só acessam seus próprios dados
  - Isolamento por escola

---

## ✅ 3. SISTEMA DE ESTADOS (Implementado - 5/5 itens)

### 3.1 Gerenciamento de Estados (conversationState)
- ✅ **Hook `useConversationState`** (`src/hooks/useConversationState.ts`)
  - Gerenciamento centralizado do estado
  - Transições entre etapas com `nextStep()`
  - Atualização de dados com `updateData()`
  - Reset de fluxo com `reset()`
  - Tipo `ConversationStep` definido
  - Interface `ConversationData` para dados do fluxo
  - ⬜ Persistência no Supabase (pendente backend)

- ✅ **Estados do Fluxo (Seção 4.1 do PRD)**
  ```typescript
  - start (INICIO)
  - school_setup (CONFIG_ESCOLA)
  - teachers (CADASTRO_PROFESSORES)
  - subjects (CADASTRO_DISCIPLINAS)
  - classes (CRIACAO_TURMAS)
  - workload (VALIDACAO_CARGAS)
  - generate (GERACAO_HORARIO)
  - completed (CONCLUÍDO)
  ```

- ✅ **Validações de Transição**
  - Lógica de `shouldAdvance` no `processUserMessage()`
  - Transições controladas por resposta do usuário
  - ⬜ Validações de dados obrigatórios (pendente backend)

- ✅ **Integração com Dashboard**
  - Stepper visual atualizado conforme conversa
  - Estatísticas atualizadas em tempo real
  - Indicador da etapa atual
  - Navegação apenas via chat (não manual)

- ✅ **DataContext para Estado Global**
  - Context API para compartilhar dados entre componentes
  - Sincronização entre telas de cadastro e chat
  - Estado persistente durante sessão
  - ⬜ Persistência no Supabase (pendente backend)

---

## ✅ 5. ALGORITMO GENÉTICO (Implementado - 6/6 itens)

### 5.1 Core do Algoritmo (Seção 4.3 do PRD)
- ✅ **Serviço de Geração** (`src/services/scheduleGenerator.ts`)
  - Função principal `generateScheduleFromData()`
  - Orquestração do algoritmo genético
  - Integração com dados do sistema

- ✅ **Algoritmo Genético** (`src/services/geneticAlgorithm.ts`)
  - Função `runGeneticAlgorithm()`
  - Geração de população inicial via `createRandomSchedule()`
  - Função de crossover entre indivíduos
  - Mutação com taxa configurável
  - Elitismo (melhores indivíduos preservados)
  - 100 gerações com população de 50

- ✅ **Tipos TypeScript** (`src/types/schedule.ts`)
  ```typescript
  - Schedule (horário completo)
  - TimeSlot (slot de horário)
  - ScheduleEntry (entrada individual)
  - ScheduleConflict (conflito detectado)
  - ViewMode (visualização)
  ```

- ✅ **Detecção de Conflitos** (`src/services/conflictDetection.ts`)
  - Função `detectConflicts()` para validação completa
  - Detecta professor em múltiplas turmas simultâneas
  - Detecta turma com múltiplas disciplinas no mesmo horário
  - Valida extrapolação de carga horária
  - Calcula `getFitnessScore()` - quanto menor, melhor

- ✅ **Integração com Fluxo Conversacional**
  - Algoritmo executado na etapa "generate"
  - Geração automática após coleta de dados
  - Resultado exibido no Dashboard

- ✅ **Parâmetros Implementados**
  - População: 50 indivíduos
  - Gerações: 100 iterações
  - Taxa de mutação: 10%
  - Elitismo: top 2 indivíduos
  - Horários: 5 dias x 5 slots

---

## ✅ 6. VISUALIZAÇÃO (Implementado - 4/4 itens)

### 6.1 Componentes de Visualização
- ✅ **Componente `DataSummary`** (`src/components/visualization/DataSummary.tsx`)
  - Resumo de todos os dados coletados
  - Exibição de: escola, professores, disciplinas, turmas, carga horária
  - Cards organizados por seção
  - Design responsivo

- ✅ **Componente `ScheduleGrid`** (`src/components/visualization/ScheduleGrid.tsx`)
  - Grid visual de horários gerados
  - Visualização por turma ou por professor
  - Toggle entre modos de visualização
  - Exibição de disciplinas por slot
  - Detecção e exibição de conflitos
  - Design responsivo em tabela

- ✅ **Sistema de Busca e Filtros**
  - Busca por nome de turma ou professor
  - Filtros em tempo real
  - Feedback visual quando não há resultados
  - Reset automático ao trocar modo de visualização

- ✅ **Exportação PDF** (`src/services/exportService.ts`)
  - Horários por turma com jsPDF
  - Horários por professor
  - Layout profissional com tabelas
  - Informações de qualidade e data de geração

- ✅ **Exportação CSV** (`src/services/exportService.ts`)
  - Dados em formato CSV
  - Compatível com Excel e Google Sheets
  - Encoding UTF-8 com BOM para acentos
  - Download automático

---

## ✅ 7. VALIDAÇÕES E CONFLITOS (Implementado - 5/5 itens)

### 7.1 Sistema Avançado de Detecção de Conflitos
- ✅ **Detecção de Conflitos Críticos** (`src/services/conflictDetection.ts`)
  - Professores em múltiplas turmas no mesmo horário
  - Turmas com múltiplas disciplinas no mesmo slot
  - Validação de overlaps (alta severidade)

- ✅ **Detecção de Avisos Importantes**
  - Mais de 3 aulas consecutivas na mesma turma
  - Validação de carga horária por turma/disciplina
  - Excesso ou falta de horas em relação ao planejado
  - Validação contra workload esperado

- ✅ **Sugestões de Melhoria**
  - Professores com mais de 4h/dia de aula
  - Distribuição inadequada de carga diária
  - Alertas de recomendação (baixa severidade)

- ✅ **Componente Visual de Conflitos** (`src/components/visualization/ConflictsList.tsx`)
  - Lista categorizada por severidade (crítico, aviso, sugestão)
  - Badges com contadores visuais
  - Descrições detalhadas de cada conflito
  - ScrollArea para listas grandes
  - Feedback visual positivo quando não há conflitos

- ✅ **Integração com Dashboard**
  - Exibição automática de conflitos após geração
  - Posicionamento acima da grade de horários
  - Design responsivo e acessível

---

## 🚧 6. PENDENTE - PRIORIDADE MÉDIA (Persistência e Recuperação)

### 6.1 Persistência de Estado (RF-07)
- ⬜ **Hook `useWorkflowPersistence`**
  - Salvar estado no Supabase
  - Recuperar último estado
  - Sincronização automática com chat

- ⬜ **LocalStorage Fallback**
  - Backup local do estado
  - Sincronização offline
  - Merge ao reconectar

- ⬜ **Checkpoints Automáticos**
  - Salvar a cada transição de estado
  - Salvar a cada 2 minutos
  - Indicador visual de "Salvando..." no chat

### 6.2 Recuperação de Fluxo (Seção 4.8 do PRD)
- ⬜ **Mensagem de Retomada no Chat**
  - Detectar fluxo anterior ao carregar app
  - Bot pergunta: "Vi que você começou um horário. Quer continuar?"
  - Opções: "Continuar" ou "Começar Novo"

- ⬜ **Restauração de Contexto**
  - Carregar dados do Supabase
  - Reconstruir histórico do chat
  - Validar integridade dos dados

- ⬜ **Tratamento de Erros**
  - Dados corrompidos → Notificar via chat
  - Fluxos incompletos → Sugerir recomeçar
  - Fallback para início

### 6.3 Correção Segura (Seção 4.9 do PRD)
- ⬜ **Comando `CORRIGIR_ESCOLA` via Chat**
  - Usuário pode digitar para corrigir dados da escola
  - Bot confirma: "Isso vai limpar todos os dados. Tem certeza?"
  - Opção: Correção Leve (só atualiza escola)
  - Opção: Correção Profunda (limpa tudo)

- ⬜ **Backup Antes de Correção**
  - Snapshot dos dados atuais
  - Possibilidade de rollback via chat

---

## 🚧 7. PENDENTE - PRIORIDADE MÉDIA (Logs e Auditoria)

### 7.1 Sistema de Logs (RF-09, Seção 4.7 do PRD)
- ⬜ **Hook `useWorkflowLogs`**
  - Registrar transições de estado
  - Registrar mensagens do chat
  - Metadados de contexto
  - Timestamp preciso

- ⬜ **Painel de Histórico (Sidebar)**
  - Timeline visual de ações
  - Filtros por data/tipo
  - Ver conversas antigas

- ⬜ **Componente `ActivityFeed`**
  - Lista de atividades recentes no dashboard
  - Ícones por tipo de ação
  - Link para retomar conversa

---

## 🚧 8. PENDENTE - PRIORIDADE MÉDIA (Validações Automáticas)

### 8.1 Hook `useValidation`
- ⬜ **Validações Reativas**
  - Cálculos automáticos
  - Executar após cada adição via chat

- ⬜ **Validações Implementadas**
  - Soma de cargas horárias por professor ≤ máximo
  - Todas as disciplinas cobertas
  - Disponibilidade suficiente
  - Conflitos de horário
  - Distribuição equilibrada

- ⬜ **Feedback via Chat**
  - Bot reporta problemas: "Encontrei 3 inconsistências..."
  - Listagem de problemas
  - Sugestões de correção
  - Usuário corrige conversacionalmente

---

## 🚧 9. PENDENTE - PRIORIDADE BAIXA (Features Avançadas)

### 9.1 Visualização Interativa de Horários
- ⬜ **Componente `ScheduleGrid`**
  - Grid visual dos horários gerados
  - Visualização por turma
  - Visualização por professor
  - Exibido após geração bem-sucedida

### 9.2 Exportação
- ⬜ **Exportação PDF**
  - Horários por turma
  - Horários por professor
  - Layout personalizável
  - Botão "Exportar PDF" no chat

- ⬜ **Exportação CSV**
  - Dados brutos para Excel
  - Botão "Exportar CSV" no chat

### 9.3 Portal do Professor (v1.3)
- ⬜ **Painel individual do professor**
- ⬜ **Visualização do próprio horário**
- ⬜ **Gestão de disponibilidade via chat**
- ⬜ **Notificações de mudanças**

### 9.4 Melhorias de UX
- ⬜ **Tour guiado (onboarding) no chat**
  - Primeira mensagem explica como funciona
  - Dicas contextuais durante o fluxo
- ⬜ **Atalhos de teclado**
- ⬜ **Modo offline**
- ⬜ **Markdown rico no chat** (negrito, listas, etc)

### 9.5 Testes e Qualidade
- ⬜ **Testes E2E (Playwright/Cypress)**
- ⬜ **Testes de Integração**
- ⬜ **Cobertura de Testes > 80%**

---

## 📅 Cronograma Sugerido

### Sprint 1 (Semana 1-2) - **Backend e Autenticação**
1. Ativar Lovable Cloud
2. Criar todas as tabelas do banco (incluindo `chat_messages`)
3. Configurar RLS
4. Implementar autenticação
5. Criar componentes de login/registro

### Sprint 2 (Semana 3-4) - **Interface de Chat Conversacional**
1. Componente ChatInterface
2. Sistema de mensagens (ChatInput, MessageBubble)
3. Hook useChatMessages
4. Edge Function process-chat-message
5. Integração com Lovable AI

### Sprint 3 (Semana 5-6) - **Sistema de Estados e Fluxo**
1. Hook useConversationState
2. Estados do fluxo (INICIO, CONFIG_ESCOLA, etc)
3. Validações de transição
4. Stepper visual (indicador de progresso)
5. Persistência de estado

### Sprint 4 (Semana 7-8) - **Fluxo Conversacional Completo**
1. Implementar todas as 7 etapas via chat
2. Extração de entidades estruturadas
3. Validações em tempo real via chat
4. Sistema de confirmações
5. Cards interativos de resumo

### Sprint 5 (Semana 9-10) - **Algoritmo Genético**
1. Implementar algoritmo genético (src/lib/geneticAlgorithm.ts)
2. Web Worker para execução assíncrona
3. Testes do algoritmo
4. Otimizações de performance
5. Progress reporting no chat

### Sprint 6 (Semana 11-12) - **Visualização e Exportação**
1. Componente ScheduleGrid (visualização de horários)
2. Visualização por turma e por professor
3. Exportação PDF/CSV
4. Logs e auditoria
5. Recuperação de fluxo via chat

### Sprint 7+ - **Features Avançadas**
1. Melhorias na IA (prompts mais precisos)
2. Portal do Professor (chat para professores)
3. Relatórios avançados
4. Modo offline
5. Testes E2E

---

## ⚠️ LEMBRETE CRÍTICO: ARQUITETURA CONVERSACIONAL

**Este NÃO é um sistema tradicional de formulários.**

Todo o fluxo acontece via **chat interativo** onde:
- O bot guia o usuário passo a passo
- O usuário responde em linguagem natural
- A IA extrai informações estruturadas das respostas
- O sistema valida e confirma antes de salvar
- Não há formulários tradicionais visíveis

**Componentes visuais são apenas para exibição/resumo, não para input de dados.**

Os dados são coletados conversacionalmente e exibidos em cards/listas para visualização apenas.

---

## 🎯 Métricas de Sucesso (KPIs - Seção 8 do PRD)

| Indicador | Meta | Status Atual | Como Medir |
|-----------|------|--------------|------------|
| **Tempo médio para geração** | ≤ 10 minutos | N/A | Analytics no workflow_logs |
| **Taxa de Consistência** | > 99% | N/A | Validações bem-sucedidas / total |
| **Recuperação de Fluxo** | > 95% | N/A | Retomadas OK / tentativas |
| **Integridade de Estado** | > 99% | N/A | Transições OK / total |
| **Satisfação do Usuário** | ≥ 4.5 / 5 | N/A | Pesquisa NPS in-app |

---

## 📝 Notas Importantes

1. **Stack Tecnológica Confirmada:**
   - ✅ React 18.3.1
   - ✅ TypeScript
   - ✅ Tailwind CSS
   - ✅ Shadcn/UI (Radix Primitives)
   - ⬜ Supabase (a ativar)

2. **Componentes Shadcn já Disponíveis:**
   - Accordion, Alert, Avatar, Badge, Button, Calendar, Card
   - Carousel, Chart, Checkbox, Collapsible, Command
   - Dialog, Drawer, Dropdown, Form, Input, Label
   - Menubar, Navigation, Pagination, Popover, Progress
   - Select, Separator, Sheet, Sidebar, Skeleton, Slider
   - Switch, Table, Tabs, Textarea, Toast, Toggle, Tooltip

3. **Próximos Passos Recomendados:**
   1. ✅ Ativar Lovable Cloud
   2. ✅ Criar estrutura do banco de dados (incluindo `chat_messages`)
   3. ✅ Implementar autenticação
   4. 🎯 **PRIORIDADE:** Implementar interface de chat conversacional
   5. 🎯 Integrar Lovable AI para processamento de mensagens
   6. ✅ Desenvolver sistema de estados do fluxo

4. **Referências:**
   - PRD completo: `PRD-ChatHorario_V3.md`
   - Documentação Supabase: https://supabase.com/docs
   - Documentação Shadcn: https://ui.shadcn.com

---

**Última atualização:** 04/11/2025
**Mantido por:** Equipe de Desenvolvimento ChatHorário
