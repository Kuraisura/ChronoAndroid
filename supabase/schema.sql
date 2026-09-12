-- Chrono complete, rerunnable Supabase migration.
-- Safe to run over the earlier Chrono schema: missing columns are added and
-- nullable legacy rows are backfilled before constraints are enforced.
create extension if not exists pgcrypto;

create table if not exists public.tasks (id text primary key);
alter table public.tasks add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.tasks add column if not exists time text;
alter table public.tasks add column if not exists task text;
alter table public.tasks add column if not exists tip text default '';
alter table public.tasks add column if not exists date text default '';
alter table public.tasks add column if not exists duration_hours numeric default 1;
alter table public.tasks add column if not exists status text default 'QUEUED';
alter table public.tasks add column if not exists created_at timestamptz default now();
alter table public.tasks add column if not exists updated_at timestamptz default now();
update public.tasks set time = coalesce(nullif(time, ''), '00:00'), task = coalesce(nullif(task, ''), 'Untitled Task'), tip = coalesce(tip, ''), date = coalesce(date, ''), duration_hours = coalesce(duration_hours, 1), status = coalesce(status, 'QUEUED'), created_at = coalesce(created_at, now()), updated_at = coalesce(updated_at, now());
alter table public.tasks alter column time set not null;
alter table public.tasks alter column task set not null;
alter table public.tasks alter column tip set not null;
alter table public.tasks alter column date set not null;
alter table public.tasks alter column duration_hours set not null;
alter table public.tasks alter column status set not null;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.categories add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.categories add column if not exists name text;
alter table public.categories add column if not exists created_at timestamptz default now();
alter table public.categories add column if not exists updated_at timestamptz default now();
update public.categories set name = coalesce(nullif(trim(name), ''), 'Uncategorized'), created_at = coalesce(created_at, now()), updated_at = coalesce(updated_at, now());
alter table public.categories alter column name set not null;

create table if not exists public.journal_entries (id text primary key);
alter table public.journal_entries add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.journal_entries add column if not exists date text;
alter table public.journal_entries add column if not exists time text;
alter table public.journal_entries add column if not exists task text default '';
alter table public.journal_entries add column if not exists note text default '';
alter table public.journal_entries add column if not exists category text default '';
alter table public.journal_entries add column if not exists photos jsonb default '[]'::jsonb;
alter table public.journal_entries add column if not exists photo_urls jsonb default '[]'::jsonb;
alter table public.journal_entries add column if not exists photo_layout jsonb default '{}'::jsonb;
alter table public.journal_entries add column if not exists bookmarked boolean default false;
alter table public.journal_entries add column if not exists created_at timestamptz default now();
alter table public.journal_entries add column if not exists updated_at timestamptz default now();
update public.journal_entries set date = coalesce(nullif(date, ''), to_char(current_date, 'YYYY-MM-DD')), time = coalesce(nullif(time, ''), '00:00'), task = coalesce(task, ''), note = coalesce(note, ''), category = coalesce(category, ''), photos = coalesce(photos, '[]'::jsonb), photo_urls = coalesce(photo_urls, '[]'::jsonb), photo_layout = coalesce(photo_layout, '{}'::jsonb), bookmarked = coalesce(bookmarked, false), created_at = coalesce(created_at, now()), updated_at = coalesce(updated_at, now());
alter table public.journal_entries alter column date set not null;
alter table public.journal_entries alter column time set not null;
alter table public.journal_entries alter column task set not null;
alter table public.journal_entries alter column note set not null;
alter table public.journal_entries alter column category set not null;

create unique index if not exists categories_user_name_unique on public.categories(user_id, lower(name));
create index if not exists tasks_user_date_time_idx on public.tasks(user_id, date, time);
create index if not exists journal_user_date_time_idx on public.journal_entries(user_id, date, time);

create or replace function public.set_chrono_updated_at() returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at before update on public.tasks for each row execute function public.set_chrono_updated_at();
drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories for each row execute function public.set_chrono_updated_at();
drop trigger if exists journal_set_updated_at on public.journal_entries;
create trigger journal_set_updated_at before update on public.journal_entries for each row execute function public.set_chrono_updated_at();

alter table public.tasks enable row level security;
alter table public.categories enable row level security;
alter table public.journal_entries enable row level security;
drop policy if exists "owners manage tasks" on public.tasks;
create policy "owners manage tasks" on public.tasks for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "owners manage categories" on public.categories;
create policy "owners manage categories" on public.categories for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "owners manage journal entries" on public.journal_entries;
create policy "owners manage journal entries" on public.journal_entries for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public) values ('journal-photos', 'journal-photos', true)
on conflict (id) do update set public = excluded.public;
drop policy if exists "public reads journal photos" on storage.objects;
create policy "public reads journal photos" on storage.objects for select to public using (bucket_id = 'journal-photos');
drop policy if exists "owners upload journal photos" on storage.objects;
create policy "owners upload journal photos" on storage.objects for insert to authenticated with check (bucket_id = 'journal-photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "owners update journal photos" on storage.objects;
create policy "owners update journal photos" on storage.objects for update to authenticated using (bucket_id = 'journal-photos' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'journal-photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "owners delete journal photos" on storage.objects;
create policy "owners delete journal photos" on storage.objects for delete to authenticated using (bucket_id = 'journal-photos' and (storage.foldername(name))[1] = auth.uid()::text);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.tasks, public.categories, public.journal_entries to authenticated;
