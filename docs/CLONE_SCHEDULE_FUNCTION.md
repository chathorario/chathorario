# 🔄 Função de Clonagem de Cenários - Deep Clone

## 📋 Visão Geral

A função `clone_schedule_scenario` implementa uma **clonagem profunda (deep clone)** de cenários com **remapeamento completo de IDs**, garantindo isolamento total entre cenários.

---

## 🎯 Problema Resolvido

### **Antes (Problema):**
```
Cenário A:
├── Professor ID: abc-123
├── Turma ID: def-456
└── Workload: abc-123 → def-456

Cenário B (Clonado):
├── Professor ID: xyz-789  ❌ NOVO ID
├── Turma ID: uvw-101      ❌ NOVO ID
└── Workload: abc-123 → def-456  ❌ IDs ANTIGOS! (QUEBRADO)
```

### **Depois (Solução):**
```
Cenário A:
├── Professor ID: abc-123
├── Turma ID: def-456
└── Workload: abc-123 → def-456

Cenário B (Clonado):
├── Professor ID: xyz-789  ✅ NOVO ID
├── Turma ID: uvw-101      ✅ NOVO ID
└── Workload: xyz-789 → uvw-101  ✅ IDs REMAPEADOS! (CORRETO)
```

---

## 🔧 Como Funciona

### **Algoritmo de Clonagem:**

```
1. Criar novo cenário
   └─> Retorna new_schedule_id

2. Clonar Teachers
   ├─> Inserir com new_schedule_id
   └─> Armazenar mapa: {old_teacher_id: new_teacher_id}

3. Clonar Subjects
   ├─> Inserir com new_schedule_id
   └─> Armazenar mapa: {old_subject_id: new_subject_id}

4. Clonar Classes
   ├─> Inserir com new_schedule_id
   └─> Armazenar mapa: {old_class_id: new_class_id}

5. Remapear aulas_por_turma (JSONB)
   └─> Substituir old_class_ids por new_class_ids

6. Clonar Workloads
   └─> Usar mapas para substituir FKs:
       teacher_id: map[old] → new
       subject_id: map[old] → new
       class_id: map[old] → new

7. Clonar Teacher Availability
   └─> Usar mapa de teachers

8. Clonar Fixed Lessons
   └─> Usar mapas de teachers, subjects e classes
```

---

## 📝 Assinatura da Função

```sql
CREATE OR REPLACE FUNCTION clone_schedule_scenario(
    p_original_schedule_id UUID,      -- ID do cenário a clonar
    p_new_name TEXT,                  -- Nome do novo cenário
    p_new_description TEXT DEFAULT NULL,  -- Descrição (opcional)
    p_school_id UUID DEFAULT NULL,    -- School ID (opcional)
    p_created_by UUID DEFAULT NULL    -- User ID (opcional)
)
RETURNS TABLE (
    new_schedule_id UUID,
    teachers_cloned INTEGER,
    subjects_cloned INTEGER,
    classes_cloned INTEGER,
    workloads_cloned INTEGER,
    availability_cloned INTEGER,
    fixed_lessons_cloned INTEGER
)
```

---

## 🚀 Exemplos de Uso

### **1. Clonagem Simples**
```sql
SELECT * FROM clone_schedule_scenario(
    'original-uuid-here',
    'Cenário Clonado'
);
```

**Retorno:**
```
new_schedule_id          | teachers_cloned | subjects_cloned | classes_cloned | workloads_cloned
-------------------------|-----------------|-----------------|----------------|------------------
new-uuid-generated       | 42              | 22              | 24             | 156
```

### **2. Clonagem com Descrição**
```sql
SELECT * FROM clone_schedule_scenario(
    'abc-123',
    'Cenário Teste 2025',
    'Versão experimental com ajustes de carga horária'
);
```

### **3. Clonagem para Outra Escola (Admin)**
```sql
SELECT * FROM clone_schedule_scenario(
    'original-uuid',
    'Cenário Importado',
    'Importado da Escola A',
    'school-b-uuid',
    'admin-user-uuid'
);
```

---

## 🔍 Detalhes Técnicos

### **Mapeamento de IDs (JSONB)**

A função usa `JSONB` para armazenar mapas de IDs:

```json
{
  "old-teacher-uuid-1": "new-teacher-uuid-1",
  "old-teacher-uuid-2": "new-teacher-uuid-2",
  ...
}
```

**Vantagens:**
- ✅ Lookup O(1) por ID
- ✅ Suporta qualquer quantidade de entidades
- ✅ Não requer tabelas temporárias

### **Matching por Nome**

Para criar o mapa, a função faz JOIN por `name`:

```sql
SELECT jsonb_object_agg(ot.id::text, ct.id::text)
FROM original_teachers ot
JOIN cloned_teachers ct ON ot.name = ct.name;
```

**Importante:** Assume que nomes são únicos dentro de um cenário.

### **Remapeamento de aulas_por_turma**

O campo `aulas_por_turma` é um JSONB com estrutura:
```json
{
  "class-uuid-1": 6,
  "class-uuid-2": 4
}
```

A função remapeia as chaves:
```sql
UPDATE subjects
SET aulas_por_turma = (
    SELECT jsonb_object_agg(
        (v_class_map->>key)::text,
        value::integer
    )
    FROM jsonb_each_text(original.aulas_por_turma)
    WHERE v_class_map ? key
)
```

---

## ⚠️ Considerações Importantes

### **1. Transação Atômica**
- Toda a clonagem ocorre em uma **única transação**
- Se qualquer passo falhar, **tudo é revertido** (rollback)

### **2. Validações**
- ✅ Verifica se cenário original existe
- ✅ Valida que IDs existem nos mapas antes de inserir
- ✅ Loga cada etapa com `RAISE NOTICE`

### **3. Performance**
- Para cenários grandes (1000+ professores), pode levar alguns segundos
- Todos os INSERTs são em batch (não há loops)
- Índices garantem JOINs rápidos

### **4. Limitações**
- **Nomes devem ser únicos** dentro do cenário (para matching)
- Não clona `schedule_data` (horário gerado) - apenas estrutura
- Não clona `schedule_conflicts`

---

## 🧪 Testando a Função

### **Script de Teste Completo:**

```sql
-- 1. Criar cenário de teste
INSERT INTO schedule_scenarios (name, school_id, created_by)
VALUES ('Cenário Original', 'school-uuid', 'user-uuid')
RETURNING id;
-- Anote o ID retornado

-- 2. Popular com dados
INSERT INTO teachers (name, school_id, schedule_id)
VALUES 
    ('Professor A', 'school-uuid', 'scenario-uuid'),
    ('Professor B', 'school-uuid', 'scenario-uuid');

INSERT INTO classes (name, school_id, schedule_id)
VALUES ('1ª Série - A', 'school-uuid', 'scenario-uuid');

-- 3. Clonar
SELECT * FROM clone_schedule_scenario(
    'scenario-uuid',
    'Cenário Clonado'
);

-- 4. Verificar resultado
SELECT 
    s.name,
    (SELECT COUNT(*) FROM teachers WHERE schedule_id = s.id) as teachers,
    (SELECT COUNT(*) FROM classes WHERE schedule_id = s.id) as classes
FROM schedule_scenarios s
WHERE s.name IN ('Cenário Original', 'Cenário Clonado');
```

**Resultado Esperado:**
```
name              | teachers | classes
------------------|----------|--------
Cenário Original  | 2        | 1
Cenário Clonado   | 2        | 1
```

---

## 🔐 Permissões

```sql
GRANT EXECUTE ON FUNCTION clone_schedule_scenario TO authenticated;
```

Apenas usuários autenticados podem executar a função.

**RLS (Row Level Security):**
- A função respeita as políticas RLS existentes
- Usa `SECURITY DEFINER` se necessário elevar privilégios

---

## 📊 Logs de Debug

A função emite logs detalhados:

```
NOTICE:  Iniciando clonagem do cenário abc-123 para escola xyz-789
NOTICE:  Novo cenário criado: new-uuid
NOTICE:  Professores clonados: 42 (Mapa: {...})
NOTICE:  Disciplinas clonadas: 22 (Mapa: {...})
NOTICE:  Turmas clonadas: 24 (Mapa: {...})
NOTICE:  aulas_por_turma remapeado para novas turmas
NOTICE:  Workloads clonados: 156
NOTICE:  Disponibilidades clonadas: 84
NOTICE:  Aulas fixas clonadas: 12
NOTICE:  Clonagem concluída com sucesso!
```

Para ver os logs no Supabase:
1. Vá para **Database** → **Logs**
2. Filtre por `NOTICE`

---

## 🐛 Troubleshooting

### **Erro: "Cenário original não encontrado"**
```
EXCEPTION:  Cenário original não encontrado: abc-123
```
**Solução:** Verifique se o UUID está correto.

### **Erro: "Duplicate key violation"**
```
ERROR:  duplicate key value violates unique constraint
```
**Solução:** Pode haver conflito de nomes. Verifique se não há duplicatas.

### **Workloads não clonados (count = 0)**
```
workloads_cloned | 0
```
**Causa:** IDs não encontrados nos mapas.
**Debug:**
```sql
-- Ver mapas gerados
SELECT * FROM clone_schedule_scenario(...);
-- Verificar se nomes são únicos
SELECT name, COUNT(*) FROM teachers 
WHERE schedule_id = 'original-uuid'
GROUP BY name HAVING COUNT(*) > 1;
```

---

## 🔄 Integração com Frontend

### **TypeScript (DataContext.tsx):**

```typescript
const cloneScenario = async (originalId: string, newName: string) => {
  const { data, error } = await supabase.rpc('clone_schedule_scenario', {
    p_original_schedule_id: originalId,
    p_new_name: newName,
    p_new_description: `Clonado em ${new Date().toLocaleDateString()}`
  });

  if (error) throw error;

  const result = data[0];
  console.log(`Cenário clonado:`, result);
  console.log(`- Professores: ${result.teachers_cloned}`);
  console.log(`- Disciplinas: ${result.subjects_cloned}`);
  console.log(`- Turmas: ${result.classes_cloned}`);
  console.log(`- Alocações: ${result.workloads_cloned}`);

  return result.new_schedule_id;
};
```

---

## 📈 Melhorias Futuras

1. **Clonagem Parcial:**
   - Opção para clonar apenas professores
   - Opção para clonar apenas estrutura (sem workloads)

2. **Merge de Cenários:**
   - Combinar dados de dois cenários

3. **Diff de Cenários:**
   - Comparar diferenças entre cenários

4. **Histórico de Clonagem:**
   - Rastrear origem de cada cenário clonado

---

**Última atualização:** 2025-12-01  
**Versão:** 1.0  
**Autor:** Sistema ChatHorário
