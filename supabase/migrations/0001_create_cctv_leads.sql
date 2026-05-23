create extension if not exists pgcrypto;

create table if not exists public.cctv_leads (
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

create index if not exists cctv_leads_created_at_idx on public.cctv_leads (created_at desc);

alter table public.cctv_leads enable row level security;

grant insert on table public.cctv_leads to anon, authenticated;

create policy "cctv_leads_insert_anon"
on public.cctv_leads
for insert
to anon, authenticated
with check (true);

