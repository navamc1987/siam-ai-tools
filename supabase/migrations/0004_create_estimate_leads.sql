create table if not exists public.estimate_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null check (source in ('spec', 'quote')),
  customer_type text not null check (customer_type in ('personal', 'company')),
  customer jsonb not null,
  selection jsonb not null,
  totals jsonb not null,
  page_url text,
  user_agent text
);

alter table public.estimate_leads enable row level security;

