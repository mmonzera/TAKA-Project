-- Add related_docs table for project documentation

create table if not exists public.related_docs (
  id          text primary key,
  project_id  text not null references public.projects(id) on delete cascade,
  title       text not null,
  url         text not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_related_docs_project on public.related_docs(project_id);

alter table public.related_docs enable row level security;

create policy "Allow all for related_docs" on public.related_docs for all using (true) with check (true);