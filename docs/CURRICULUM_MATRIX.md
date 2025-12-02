# 📚 Módulo de Matrizes Curriculares

## Visão Geral

Este módulo permite o cadastro e gerenciamento completo de **Matrizes Curriculares** no sistema ChatHorário. Foi desenvolvido com base na estrutura curricular da Escola Tocantins (Ensino Médio em Regime de Tempo Integral).

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `curriculum_matrices`

Armazena as informações principais da matriz curricular.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `school_id` | UUID | Referência à escola |
| `name` | VARCHAR(255) | Nome da matriz |
| `education_level` | VARCHAR(100) | Nível de ensino (fundamental, medio, superior) |
| `regime` | VARCHAR(50) | Regime (anual, semestral, modular) |
| `total_workload` | INTEGER | Carga horária total (ex: 5400) |
| `school_days` | INTEGER | Dias letivos anuais (ex: 200) |
| `weekly_hours` | INTEGER | Semanas letivas anuais (ex: 40) |
| `daily_hours` | INTEGER | Duração da hora-aula em minutos (ex: 50) |
| `total_daily_hours` | INTEGER | Total de horas-aula diárias (ex: 6) |
| `shift` | VARCHAR(50) | Turno (diurno, noturno, integral) |
| `entry_time` | TIME | Horário de entrada |
| `validity_year` | INTEGER | Ano de vigência |
| `observations` | TEXT | Observações adicionais |

### Tabela: `curriculum_components`

Armazena os componentes curriculares (disciplinas) de cada matriz.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `matrix_id` | UUID | Referência à matriz curricular |
| `knowledge_area` | VARCHAR(100) | Área de conhecimento |
| `component_name` | VARCHAR(255) | Nome do componente |
| `weekly_hours_1st` | INTEGER | Aulas semanais - 1ª série |
| `weekly_hours_2nd` | INTEGER | Aulas semanais - 2ª série |
| `weekly_hours_3rd` | INTEGER | Aulas semanais - 3ª série |
| `annual_hours_1st` | INTEGER | Carga horária anual - 1ª série |
| `annual_hours_2nd` | INTEGER | Carga horária anual - 2ª série |
| `annual_hours_3rd` | INTEGER | Carga horária anual - 3ª série |
| `display_order` | INTEGER | Ordem de exibição |
| `is_elective` | BOOLEAN | É disciplina eletiva? |
| `is_diversified` | BOOLEAN | Faz parte da parte diversificada? |

---

## 📋 Áreas de Conhecimento

O sistema suporta as seguintes áreas de conhecimento:

1. **Linguagens**
   - Língua Portuguesa
   - Arte
   - Educação Física

2. **Matemática**
   - Matemática

3. **Ciências Humanas**
   - História
   - Geografia
   - Filosofia
   - Sociologia

4. **Ciências da Natureza**
   - Biologia
   - Física
   - Química

5. **Parte Diversificada**
   - Redação
   - L.E.M - Inglês
   - Disciplinas Eletivas
   - Práticas Experimentais (Matemática, Biologia, Física, Química)
   - Estudo Orientado
   - Preparação Pós-Médio
   - Avaliação Semanal
   - Projeto de Vida

---

## 🎯 Funcionalidades

### 1. Cadastro de Matriz Curricular

- **Informações Básicas:**
  - Nome da matriz
  - Nível de ensino
  - Regime (anual/semestral/modular)
  - Carga horária total
  - Dias letivos anuais
  - Semanas letivas anuais
  - Duração da hora-aula
  - Número de aulas diárias
  - Turno
  - Horário de entrada
  - Ano de vigência
  - Observações

### 2. Gerenciamento de Componentes Curriculares

- Adicionar componentes por área de conhecimento
- Definir carga horária semanal por série (1ª, 2ª, 3ª)
- Cálculo automático da carga horária anual
- Visualização de totais por série
- Remoção de componentes
- Reordenação de componentes

### 3. Visualização

- Lista de matrizes cadastradas
- Visualização detalhada de cada matriz
- Tabela completa com todos os componentes
- Totais de carga horária semanal e anual

---

## 🚀 Como Usar

### 1. Executar as Migrações

```bash
# Execute a migração para criar as tabelas
supabase db push
```

### 2. Popular com Dados de Exemplo

```bash
# Execute o seed para popular com a matriz da Escola Tocantins
psql -h <host> -U <user> -d <database> -f supabase/migrations/20250125_seed_curriculum_tocantins.sql
```

### 3. Acessar o Módulo

Navegue para: `http://localhost:8080/curriculum-matrix`

### 4. Criar Nova Matriz

1. Clique em **"Nova Matriz"**
2. Preencha as informações básicas
3. Adicione os componentes curriculares
4. Clique em **"Salvar Matriz"**

---

## 📊 Exemplo: Matriz Tocantins

A matriz da Escola Tocantins foi pré-cadastrada com os seguintes dados:

### Informações Gerais
- **Nome**: Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral
- **Nível**: Ensino Médio
- **Regime**: Anual
- **Carga Horária Total**: 5.400 h/a
- **Dias Letivos**: 200
- **Semanas Letivas**: 40
- **Duração da Hora-Aula**: 50 minutos
- **Aulas Diárias**: 6
- **Turno**: Diurno
- **Entrada**: 07:00
- **Vigência**: 2018

### Totais por Série
| Série | Aulas Semanais | Carga Horária Anual |
|-------|----------------|---------------------|
| 1ª Série | 45 | 1.800 h/a |
| 2ª Série | 45 | 1.800 h/a |
| 3ª Série | 45 | 1.800 h/a |
| **TOTAL** | **135** | **5.400 h/a** |

---

## 🔐 Permissões

### Visualização
- Todos os usuários da escola podem visualizar as matrizes

### Criação/Edição/Exclusão
- Apenas usuários com perfil **Staff** ou **Admin**

---

## 🎨 Interface

### Componentes Utilizados
- **shadcn/ui**: Card, Button, Input, Select, Table, Label
- **lucide-react**: Ícones (BookOpen, Plus, Trash2, Save, Eye)
- **ModalCenter**: Modal moderno para feedback

### Características
- ✅ Design responsivo
- ✅ Suporte a dark mode
- ✅ Cálculo automático de cargas horárias
- ✅ Validação de campos
- ✅ Feedback visual com modais modernos
- ✅ Tabela com totais automáticos

---

## 📁 Arquivos Criados

```
CHATHORARIO/
├── supabase/
│   └── migrations/
│       ├── 20250125_curriculum_matrices.sql      # Migração das tabelas
│       └── 20250125_seed_curriculum_tocantins.sql # Seed com dados da imagem
├── src/
│   ├── pages/
│   │   └── Escola/
│   │       └── CurriculumMatrixManagement.tsx    # Interface de gerenciamento
│   └── App.tsx                                    # Rota adicionada
└── docs/
    └── CURRICULUM_MATRIX.md                       # Esta documentação
```

---

## 🔄 Próximos Passos

1. **Integração com API**
   - Implementar funções no DataContext
   - Conectar com Supabase via MCP

2. **Funcionalidades Adicionais**
   - Importação de matrizes via Excel/CSV
   - Exportação de matrizes em PDF
   - Duplicação de matrizes
   - Histórico de alterações
   - Comparação entre matrizes

3. **Validações**
   - Validar totais de carga horária
   - Alertas para matrizes incompletas
   - Verificação de conflitos

4. **Relatórios**
   - Relatório completo da matriz
   - Comparativo entre anos
   - Estatísticas de carga horária por área

---

## 📞 Suporte

Para dúvidas ou sugestões sobre o módulo de Matrizes Curriculares, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.
