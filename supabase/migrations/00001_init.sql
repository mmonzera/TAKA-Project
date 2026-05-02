-- TAKA - Database Schema
-- Supabase SQL Migration

-- ==================== TABLES ====================

create table if not exists public.projects (
  id          text primary key,
  name        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.columns (
  id          text primary key,
  project_id  text not null references public.projects(id) on delete cascade,
  title       text not null,
  position    int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists idx_columns_project on public.columns(project_id);

create type public.priority as enum ('low', 'medium', 'high', 'urgent');

create table if not exists public.tasks (
  id          text primary key,
  project_id  text not null references public.projects(id) on delete cascade,
  column_id   text not null references public.columns(id) on delete cascade,
  title       text not null,
  description text,
  due_date    timestamptz,
  assigned_by text,
  priority    public.priority not null default 'medium',
  position    int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_tasks_project on public.tasks(project_id);
create index if not exists idx_tasks_column on public.tasks(column_id);

create type public.activity_type as enum ('normal', 'confirming', 'reminding');

create table if not exists public.activity_logs (
  id          text primary key,
  task_id     text not null references public.tasks(id) on delete cascade,
  type        public.activity_type not null default 'normal',
  content     text not null,
  target_date timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_activity_logs_task on public.activity_logs(task_id);

create table if not exists public.notifications (
  id          text primary key,
  message     text not null,
  created_at  timestamptz not null default now()
);

-- ==================== TRIGGERS ====================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ==================== RLS ====================

alter table public.projects enable row level security;
alter table public.columns enable row level security;
alter table public.tasks enable row level security;
alter table public.activity_logs enable row level security;
alter table public.notifications enable row level security;

create policy "Allow all for projects" on public.projects for all using (true) with check (true);
create policy "Allow all for columns" on public.columns for all using (true) with check (true);
create policy "Allow all for tasks" on public.tasks for all using (true) with check (true);
create policy "Allow all for activity_logs" on public.activity_logs for all using (true) with check (true);
create policy "Allow all for notifications" on public.notifications for all using (true) with check (true);
