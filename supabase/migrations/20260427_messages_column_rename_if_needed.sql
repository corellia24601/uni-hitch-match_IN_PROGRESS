-- If you ran an older 20260421 script that created messages with a column named "text",
-- run this once to match the current schema (column "body").
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'messages' and column_name = 'text'
  ) then
    alter table public.messages rename column "text" to body;
  end if;
end $$;
