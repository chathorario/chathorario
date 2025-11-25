-- Promote user to admin via RPC (security definer)
-- Project: ajytkkqvxoeewwabtdpt

begin;

create or replace function public.promote_to_admin(target_email text)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  caller_is_admin boolean;
  target_user_id uuid;
begin
  -- Ensure caller is an admin
  select exists(
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  ) into caller_is_admin;

  if not caller_is_admin then
    raise exception 'Only admins can promote users';
  end if;

  -- Find target user by email in auth.users (case-insensitive)
  select u.id into target_user_id
  from auth.users u
  where lower(u.email) = lower(target_email)
  limit 1;

  if target_user_id is null then
    raise exception 'User with email % not found', target_email;
  end if;

  -- Ensure profile exists and set role to admin
  insert into public.profiles (id, role)
  values (target_user_id, 'admin')
  on conflict (id) do update set role = 'admin';

  return target_user_id;
end;
$$;

commit;