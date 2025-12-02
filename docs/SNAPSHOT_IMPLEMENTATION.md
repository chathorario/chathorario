# Implementação do Snapshot de Cenário

Foi implementada a funcionalidade de congelamento de dados (Snapshot) para cenários de horários.

## Alterações Realizadas

1.  **Banco de Dados (Supabase)**:
    *   Adicionada coluna `snapshot_data` (JSONB) na tabela `schedule_scenarios`.
    *   Criada função `generate_schedule_snapshot(uuid)` que gera o JSON com dados históricos.
    *   Criada função `freeze_schedule_snapshot(uuid)` que salva o snapshot e registra auditoria.

2.  **Frontend (React)**:
    *   Atualizado `ScheduleGeneration.tsx` para chamar automaticamente o congelamento após salvar um novo horário.

## Estrutura do Snapshot

O JSON gerado segue o formato:
```json
{
  "frozen_at": "2025-12-01T20:30:00.000Z",
  "stats": {
    "total_classes": 10,
    "total_teachers": 15
  },
  "allocations_dump": [
    { 
      "teacher_name": "João Silva", 
      "subject": "Matemática", 
      "class": "9º Ano A", 
      "aulas": 4 
    },
    ...
  ]
}
```

Isso garante que, mesmo que os nomes de professores ou turmas mudem no futuro, o histórico deste horário permanecerá intacto.
