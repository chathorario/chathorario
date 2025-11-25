-- Schema for schools, teachers, subjects, classes, workloads with RLS policies
-- Generated on 2025-11-09

begin;

-- Ensure UUID generation function is available
create extension if not exists pgcrypto;

-- Schools
create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists schools_id_idx on public.schools (id);

alter table public.schools enable row level security;

-- Profiles: link auth users to a school and role
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  school_id uuid references public.schools (id) on delete set null,
  role text not null default 'teacher' check (role in ('admin','staff','teacher')),
  full_name text,
  created_at timestamptz default now()
);

create index if not exists profiles_school_id_idx on public.profiles (school_id);

alter table public.profiles enable row level security;

-- Teachers
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  name text not null,
  email text,
  created_at timestamptz default now()
);

create unique index if not exists teachers_email_unique on public.teachers (email) where email is not null;
create index if not exists teachers_school_id_idx on public.teachers (school_id);

alter table public.teachers enable row level security;

-- Subjects
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  name text not null,
  code text,
  weekly_hours integer not null default 0,
  created_at timestamptz default now()
);

create index if not exists subjects_school_id_idx on public.subjects (school_id);

alter table public.subjects enable row level security;

-- Classes
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  name text not null,
  grade text,
  size integer,
  created_at timestamptz default now()
);

create index if not exists classes_school_id_idx on public.classes (school_id);

alter table public.classes enable row level security;

-- Workloads (teacher assignments)
create table if not exists public.workloads (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  teacher_id uuid not null references public.teachers (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  subject_id uuid not null references public.subjects (id) on delete cascade,
  hours integer not null check (hours > 0),
  created_at timestamptz default now(),
  unique (teacher_id, class_id, subject_id)
);

create index if not exists workloads_school_id_idx on public.workloads (school_id);
create index if not exists workloads_teacher_idx on public.workloads (teacher_id);
create index if not exists workloads_class_idx on public.workloads (class_id);
create index if not exists workloads_subject_idx on public.workloads (subject_id);

alter table public.workloads enable row level security;

-- =========================================================
-- RLS Policies
-- =========================================================

-- Profiles: users can view, insert, update their own row
create policy if not exists "Profiles are selectable by owner"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy if not exists "Profiles can be inserted by owner"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy if not exists "Profiles can be updated by owner"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Schools: only members of the school can select; admins/staff can modify
create policy if not exists "Members can select schools"
on public.schools
for select
to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.schools.id
));

create policy if not exists "Admins and staff update schools"
on public.schools
for update
to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.schools.id
    and p.role in ('admin','staff')
))
with check (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.schools.id
    and p.role in ('admin','staff')
));

-- Teachers
create policy if not exists "Members can select teachers"
on public.teachers
for select
to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.teachers.school_id
));

create policy if not exists "Admins and staff insert teachers"
on public.teachers
for insert
to authenticated
with check (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.teachers.school_id
    and p.role in ('admin','staff')
));

create policy if not exists "Admins and staff update teachers"
on public.teachers
for update
to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.teachers.school_id
    and p.role in ('admin','staff')
))
with check (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.teachers.school_id
    and p.role in ('admin','staff')
));

create policy if not exists "Admins and staff delete teachers"
on public.teachers
for delete
to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.teachers.school_id
    and p.role in ('admin','staff')
));

-- Subjects
create policy if not exists "Members can select subjects"
on public.subjects
for select
to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.subjects.school_id
));

create policy if not exists "Admins and staff insert subjects"
on public.subjects
for insert
to authenticated
with check (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.subjects.school_id
    and p.role in ('admin','staff')
));

create policy if not exists "Admins and staff update subjects"
on public.subjects
for update
to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.subjects.school_id
    and p.role in ('admin','staff')
))
with check (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.subjects.school_id
    and p.role in ('admin','staff')
));

create policy if not exists "Admins and staff delete subjects"
on public.subjects
for delete
to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.subjects.school_id
    and p.role in ('admin','staff')
));

-- Classes
create policy if not exists "Members can select classes"
on public.classes
for select
to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.classes.school_id
));

create policy if not exists "Admins and staff insert classes"
on public.classes
for insert
to authenticated
with check (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.classes.school_id
    and p.role in ('admin','staff')
));

create policy if not exists "Admins and staff update classes"
on public.classes
for update
to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.classes.school_id
    and p.role in ('admin','staff')
))
with check (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.classes.school_id
    and p.role in ('admin','staff')
));

create policy if not exists "Admins and staff delete classes"
on public.classes
for delete
to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.classes.school_id
    and p.role in ('admin','staff')
));

-- Workloads
create policy if not exists "Members can select workloads"
on public.workloads
for select
to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.workloads.school_id
));

create policy if not exists "Admins and staff insert workloads"
on public.workloads
for insert
to authenticated
with check (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.workloads.school_id
    and p.role in ('admin','staff')
));

create policy if not exists "Admins and staff update workloads"
on public.workloads
for update
to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.workloads.school_id
    and p.role in ('admin','staff')
))
with check (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.workloads.school_id
    and p.role in ('admin','staff')
));

create policy if not exists "Admins and staff delete workloads"
on public.workloads
for delete
to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.school_id = public.workloads.school_id
    and p.role in ('admin','staff')
));

commit;