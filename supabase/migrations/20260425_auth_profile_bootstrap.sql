-- Auto-create a profiles row when a new auth user signs up (magic link / OTP).
-- Restricts signup to @illinois.edu to match app rules and profiles.school_email check.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  em text := lower(trim(new.email));
  hid text := replace(new.id::text, '-', '');
begin
  if em is null or em !~ '@illinois\.edu$' then
    raise exception 'Only @illinois.edu addresses are allowed';
  end if;

  insert into public.profiles (user_id, account_number, name, handle, school_email, phone, bio, is_admin)
  values (
    new.id,
    'A' || upper(substr(hid, 1, 6)),
    split_part(em, '@', 1),
    'u' || substr(hid, 1, 12),
    em,
    '0000000000',
    '',
    false
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
