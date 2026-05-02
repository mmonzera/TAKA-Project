# TAKA - Deploy Guide

## 1. Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** → run `supabase/migrations/00001_init.sql`
3. Go to **Project Settings** → **API** → copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Environment Variables

Create `.env.local` (for local) or set in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

## 3. Deploy to Vercel

```bash
npx vercel
```

Or connect your GitHub repo to [vercel.com](https://vercel.com).

Make sure to set the env vars in Vercel dashboard.

## 4. Database Tables

- `projects` — project container
- `columns` — kanban columns (linked to project)
- `tasks` — cards in columns
- `activity_logs` — timeline per task
- `notifications` — push-style notifications

All tables have RLS open (guest mode). Add auth later if needed.
