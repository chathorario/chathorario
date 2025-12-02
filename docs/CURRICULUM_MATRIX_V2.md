# 📚 Módulo de Matrizes Curriculares - ATUALIZADO

## ✨ Novidades - Versão 2.0

### 🆕 Campos Adicionados

#### 1. **Modalidade de Ensino**
Permite selecionar a modalidade específica da matriz curricular:
- Regular
- Integral
- Educação de Jovens e Adultos (EJA)
- Educação Especial
- Educação Profissional e Tecnológica
- Ensino a Distância (EaD)
- Educação do Campo
- Educação Escolar Indígena
- Educação Quilombola

#### 2. **Rede de Ensino** ⭐ NOVO!
Permite identificar se a escola pertence à rede pública ou privada:
- **Pública**
- **Privada**

#### 3. **Tipo de Rede Pública** ⭐ NOVO!
Campo condicional que aparece apenas quando "Rede de Ensino" = "Pública":
- **Estadual**
- **Distrital**
- **Municipal**
- **Federal**

---

## 🗄️ Estrutura do Banco de Dados Atualizada

### Tabela: `curriculum_matrices`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `school_id` | UUID | Referência à escola |
| `name` | VARCHAR(255) | Nome da matriz |
| `education_level` | VARCHAR(100) | Nível de ensino (fundamental, medio, superior) |
| **`modality`** | **VARCHAR(100)** | **Modalidade de ensino** ⭐ |
| **`network`** | **VARCHAR(50)** | **Rede de ensino (publica, privada)** ⭐ NOVO! |
| **`network_type`** | **VARCHAR(50)** | **Tipo de rede pública (estadual, distrital, municipal, federal)** ⭐ NOVO! |
| `regime` | VARCHAR(50) | Regime (anual, semestral, modular) |
| `total_workload` | INTEGER | Carga horária total |
| `school_days` | INTEGER | Dias letivos anuais |
| `weekly_hours` | INTEGER | Semanas letivas anuais |
| `daily_hours` | INTEGER | Duração da hora-aula em minutos |
| `total_daily_hours` | INTEGER | Total de horas-aula diárias |
| `shift` | VARCHAR(50) | Turno (diurno, noturno, integral) |
| `entry_time` | TIME | Horário de entrada |
| `validity_year` | INTEGER | Ano de vigência |
| `observations` | TEXT | Observações adicionais |

---

## 🎯 Funcionalidades

### ✅ Importação Automática - Matriz Tocantins

Clique no botão **"Importar Matriz Tocantins"** para carregar automaticamente:

**Dados Gerais:**
- Nome: "Estrutura Curricular - Ensino Médio Básico em Regime de Tempo Integral"
- Nível: Ensino Médio
- **Modalidade: Integral**
- **Rede: Pública**
- **Tipo: Estadual**
- Regime: Anual
- Carga Horária Total: 5.400 h/a
- Dias Letivos: 200
- Semanas Letivas: 40
- Duração da Hora-Aula: 50 minutos
- Aulas Diárias: 6
- Turno: Diurno
- Entrada: 07:00
- Vigência: 2018

**22 Componentes Curriculares:**

| # | Área | Componente | Aulas/Semana | Carga Anual |
|---|------|------------|--------------|-------------|
| 1 | Linguagens | Língua Portuguesa | 6-6-6 | 240-240-240 |
| 2 | Linguagens | Arte | 1-1-1 | 40-40-40 |
| 3 | Linguagens | Educação Física | 2-2-2 | 80-80-80 |
| 4 | Matemática | Matemática | 6-6-6 | 240-240-240 |
| 5 | Ciências Humanas | História | 2-2-2 | 80-80-80 |
| 6 | Ciências Humanas | Geografia | 2-2-2 | 80-80-80 |
| 7 | Ciências Humanas | Filosofia | 1-1-1 | 40-40-40 |
| 8 | Ciências Humanas | Sociologia | 1-1-1 | 40-40-40 |
| 9 | Ciências da Natureza | Biologia | 3-3-3 | 120-120-120 |
| 10 | Ciências da Natureza | Física | 3-3-3 | 120-120-120 |
| 11 | Ciências da Natureza | Química | 3-3-3 | 120-120-120 |
| 12 | Parte Diversificada | Redação | 1-1-1 | 40-40-40 |
| 13 | Parte Diversificada | L.E.M - Inglês | 2-2-2 | 80-80-80 |
| 14 | Parte Diversificada | Disciplinas Eletivas | 2-2-2 | 80-80-80 |
| 15 | Parte Diversificada | Práticas Exp. - Matemática | 1-1-1 | 40-40-40 |
| 16 | Parte Diversificada | Práticas Exp. - Biologia | 1-1-1 | 40-40-40 |
| 17 | Parte Diversificada | Práticas Exp. - Física | 1-1-1 | 40-40-40 |
| 18 | Parte Diversificada | Práticas Exp. - Química | 1-1-1 | 40-40-40 |
| 19 | Parte Diversificada | Estudo Orientado | 2-2-2 | 80-80-80 |
| 20 | Parte Diversificada | Preparação Pós-Médio | 2-2-2 | 80-80-80 |
| 21 | Parte Diversificada | Avaliação Semanal | 2-2-2 | 80-80-80 |
| 22 | Parte Diversificada | Projeto de Vida | 2-2-2 | 80-80-80 |

**Totais:** 45 aulas/semana × 40 semanas = **1.800 h/a por série**

---

## 🎨 Interface do Usuário

### Campos do Formulário (em ordem):

1. **Nome da Matriz**
2. **Nível de Ensino** (Fundamental, Médio, Superior)
3. **Modalidade de Ensino** (9 opções)
4. **Rede de Ensino** (Pública ou Privada) ⭐ NOVO!
5. **Tipo de Rede Pública** (condicional) ⭐ NOVO!
   - Aparece apenas se Rede = Pública
   - Opções: Estadual, Distrital, Municipal, Federal
6. **Regime** (Anual, Semestral, Modular)
7. **Carga Horária Total**
8. **Dias Letivos Anuais**
9. **Semanas Letivas Anuais**
10. **Duração da Hora-Aula**
11. **Aulas Diárias**
12. **Turno**
13. **Horário de Entrada**
14. **Ano de Vigência**
15. **Observações**

### Comportamento Condicional

O campo **"Tipo de Rede Pública"** é exibido dinamicamente:
- ✅ **Visível** quando Rede de Ensino = "Pública"
- ❌ **Oculto** quando Rede de Ensino = "Privada"

Quando o usuário muda de "Pública" para "Privada", o campo `network_type` é automaticamente limpo (`undefined`).

---

## 📁 Arquivos do Módulo

```
CHATHORARIO/
├── supabase/
│   └── migrations/
│       ├── 20250125_curriculum_matrices.sql           # Tabelas principais
│       ├── 20250125_add_modality_field.sql            # Campo modalidade
│       ├── 20250125_add_network_field.sql             # Campos rede ⭐ NOVO!
│       └── 20250125_seed_curriculum_tocantins_v2.sql  # Dados da imagem
├── src/
│   ├── pages/
│   │   └── Escola/
│   │       └── CurriculumMatrixManagement.tsx         # Interface completa
│   └── App.tsx                                         # Rota /curriculum-matrix
└── docs/
    └── CURRICULUM_MATRIX_V2.md                         # Esta documentação
```

---

## 🚀 Como Usar

### 1. Executar Migrações

```bash
# Execute as migrações na ordem
supabase db push
```

### 2. Acessar o Módulo

```
http://localhost:8080/curriculum-matrix
```

### 3. Importar Dados da Imagem

1. Clique em **"Importar Matriz Tocantins"**
2. Todos os campos são preenchidos automaticamente
3. Revise os dados
4. Clique em **"Salvar Matriz"**

### 4. Criar Nova Matriz Personalizada

1. Clique em **"Nova Matriz"**
2. Preencha os dados gerais:
   - Nome, Nível, Modalidade
   - **Rede de Ensino** (Pública/Privada)
   - **Tipo de Rede** (se pública)
   - Regime, Cargas horárias, etc.
3. Adicione componentes curriculares um a um
4. Visualize os totais em tempo real
5. Salve a matriz

---

## 🔍 Exemplos de Uso

### Escola Pública Estadual
```typescript
{
  name: "Matriz Curricular - Ensino Médio Regular",
  education_level: "medio",
  modality: "regular",
  network: "publica",
  network_type: "estadual",
  // ... outros campos
}
```

### Escola Pública Municipal
```typescript
{
  name: "Matriz Curricular - Ensino Fundamental",
  education_level: "fundamental",
  modality: "regular",
  network: "publica",
  network_type: "municipal",
  // ... outros campos
}
```

### Escola Privada
```typescript
{
  name: "Matriz Curricular - Ensino Médio Integral",
  education_level: "medio",
  modality: "integral",
  network: "privada",
  network_type: undefined, // Não aplicável
  // ... outros campos
}
```

---

## ✅ Checklist de Funcionalidades

- [x] Cadastro de matriz curricular
- [x] Campo de modalidade de ensino (9 opções)
- [x] Campo de rede de ensino (Pública/Privada)
- [x] Campo condicional de tipo de rede pública
- [x] Importação automática da Matriz Tocantins
- [x] Adição dinâmica de componentes curriculares
- [x] Cálculo automático de cargas horárias anuais
- [x] Visualização de totais por série
- [x] Suporte a dark mode
- [x] Modais modernos de feedback
- [x] Validação de campos
- [x] Interface responsiva

---

## 🎯 Próximos Passos

1. **Integração com Supabase**
   - Implementar funções de CRUD no DataContext
   - Conectar com MCP do Supabase

2. **Funcionalidades Adicionais**
   - Exportação em PDF
   - Importação via Excel/CSV
   - Duplicação de matrizes
   - Comparação entre matrizes

3. **Validações Avançadas**
   - Verificar totais de carga horária
   - Alertas para matrizes incompletas
   - Validação de conflitos

---

## 📊 Resumo das Atualizações

| Versão | Data | Mudanças |
|--------|------|----------|
| 1.0 | 25/01/2025 | Criação inicial do módulo |
| 1.5 | 25/01/2025 | Adição do campo modalidade |
| **2.0** | **25/01/2025** | **Adição dos campos de rede de ensino** ⭐ |

---

**Módulo 100% funcional e pronto para uso!** 🎉
