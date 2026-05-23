drop policy if exists "cctv_leads_insert_anon" on public.cctv_leads;
drop policy if exists "cctv_leads_insert_authenticated" on public.cctv_leads;
drop policy if exists "cctv_leads_insert_public" on public.cctv_leads;

create policy "cctv_leads_insert_public"
on public.cctv_leads
for insert
to public
with check (true);

