-- Force apply seed for admin and test users with confirmed emails
-- and ensure default school & profiles exist (idempotent)
-- Project: ajytkkqvxoeewwabtdpt

begin;

-- Ensure pgcrypto (bcrypt via crypt/gen_salt) is available
create extension if not exists pgcrypto;

-- Ensure we can upsert schools by name
create unique index if not exists schools_name_unique on public.schools (name);

with inst as (
  select id as instance_id from auth.instances limit 1
),
admin_user as (
  insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at)
  values (
    gen_random_uuid(),
    (select instance_id from inst),
    'admin@chathorario.com.br',
    crypt('Admin@123', gen_salt('bf')),
    now()
  )
  on conflict (email) do update set
    encrypted_password = excluded.encrypted_password,
    email_confirmed_at = excluded.email_confirmed_at
  returning id
),
test_user as (
  insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at)
  values (
    gen_random_uuid(),
    (select instance_id from inst),
    'escola_teste@chathorario.com.br',
    crypt('EscolaTeste@123', gen_salt('bf')),
    now()
  )
  on conflict (email) do update set
    encrypted_password = excluded.encrypted_password,
    email_confirmed_at = excluded.email_confirmed_at
  returning id
),
school_row as (
  insert into public.schools (name)
  values ('Escola Teste')
  on conflict (name) do update set
    updated_at = now()
  returning id as school_id
)
insert into public.profiles (id, school_id, role, full_name)
select id, (select school_id from school_row), role, full_name
from (
  select (select id from admin_user) as id, 'admin' as role, 'Administrador' as full_name
  union all
  select (select id from test_user) as id, 'staff' as role, 'Escola Teste' as full_name
) as s
on conflict (id) do update set
  school_id = excluded.school_id,
  role = excluded.role,
  full_name = excluded.full_name;

commit;