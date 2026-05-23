grant usage on schema public to anon, authenticated;
grant insert on table public.cctv_leads to anon, authenticated;

drop policy if exists "cctv_leads_insert_anon" on public.cctv_leads;

create policy "cctv_leads_insert_anon"
on public.cctv_leads
for insert
to anon
with check (true);

create policy "cctv_leads_insert_authenticated"
on public.cctv_leads
for insert
to authenticated
with check (true);

