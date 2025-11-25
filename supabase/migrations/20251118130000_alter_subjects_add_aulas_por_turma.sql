alter table public.subjects
add column if not exists aulas_por_turma jsonb not null default '{}'::jsonb;

-- Opcional: Remover a coluna antiga se não for mais necessária
-- alter table public.subjects
-- drop column if exists weekly_hours;
