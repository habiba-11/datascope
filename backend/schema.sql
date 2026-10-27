-- DataScope database (Part 22). Paste ALL of this into Supabase:
-- SQL Editor -> New query -> paste -> Run. Running it twice is safe.
--
-- Three tables:
--   log_entries   one row per moment in a child's reasoning log (anonymous code only)
--   teacher_tags  misconceptions a teacher tagged on a child's code
--   teachers      which logged-in accounts are teachers (filled in by hand, guide step 6)
--
-- Who may do what (row-level security + grants):
--   the website without login ("anon", publishable key) -> may only ADD log entries
--   a logged-in teacher                                  -> may read and delete everything
--   nobody else                                          -> nothing


-- ---------- 1. The teachers list ----------
create table if not exists public.teachers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null
);
alter table public.teachers enable row level security;
-- No grants and no policies: the website can never read or change this list.

-- true when the person asking is logged in AND listed as a teacher.
-- "security definer" lets the check read the teachers list, which the asker cannot.
create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.teachers where user_id = auth.uid());
$$;
revoke execute on function public.is_teacher() from public;
grant execute on function public.is_teacher() to authenticated;


-- ---------- 2. The reasoning log ----------
create table if not exists public.log_entries (
  -- made by the child's browser, so sending the same entry twice never makes a copy
  id uuid primary key,
  -- the anonymous explorer code, same rule as the app: letters, digits and dashes,
  -- 3 to 10 characters, at least one letter AND one digit (so no names)
  code text not null
    check (code ~ '^[A-Z0-9-]{3,10}$' and code ~ '[A-Z]' and code ~ '[0-9]'),
  time timestamptz not null,                 -- when it happened (child's device clock)
  room text not null check (char_length(room) <= 40),
  type text not null check (char_length(type) <= 40),
  scenario_id text check (char_length(scenario_id) <= 60),
  details jsonb not null default '{}'::jsonb -- everything else about the moment
    check (pg_column_size(details) < 8000),  -- keeps one entry small
  received_at timestamptz not null default now() -- when the database got it
);
create index if not exists log_entries_code on public.log_entries (code);
alter table public.log_entries enable row level security;

-- Children (no login) may only ADD entries: never read, change or delete.
grant insert on public.log_entries to anon;
drop policy if exists "children add entries" on public.log_entries;
create policy "children add entries" on public.log_entries
  for insert to anon with check (true); -- the checks on the columns above still apply

-- Teachers may read everything, and delete a child's entries (privacy: delete by code).
grant select, delete on public.log_entries to authenticated;
drop policy if exists "teachers read entries" on public.log_entries;
create policy "teachers read entries" on public.log_entries
  for select to authenticated using (public.is_teacher());
drop policy if exists "teachers delete entries" on public.log_entries;
create policy "teachers delete entries" on public.log_entries
  for delete to authenticated using (public.is_teacher());


-- ---------- 3. The teacher's misconception tags ----------
create table if not exists public.teacher_tags (
  code text not null check (char_length(code) <= 10),
  tag text not null check (char_length(tag) <= 40),
  created_at timestamptz not null default now(),
  primary key (code, tag)
);
alter table public.teacher_tags enable row level security;

grant select, insert, delete on public.teacher_tags to authenticated;
drop policy if exists "teachers read tags" on public.teacher_tags;
create policy "teachers read tags" on public.teacher_tags
  for select to authenticated using (public.is_teacher());
drop policy if exists "teachers add tags" on public.teacher_tags;
create policy "teachers add tags" on public.teacher_tags
  for insert to authenticated with check (public.is_teacher());
drop policy if exists "teachers remove tags" on public.teacher_tags;
create policy "teachers remove tags" on public.teacher_tags
  for delete to authenticated using (public.is_teacher());
