-- Run this in the Supabase SQL Editor for the frontend to read the portal data.
-- Without these grants/policies, the browser will receive 403 responses on the tables below.

grant usage on schema public to anon, authenticated;
grant select on public.empresas to anon, authenticated;
grant select on public.links to anon, authenticated;
grant select on public.chamados to anon, authenticated;
grant select on public.agenda_eventos to anon, authenticated;
grant select on public.senhas to anon, authenticated;

alter table public.empresas enable row level security;
alter table public.links enable row level security;
alter table public.chamados enable row level security;
alter table public.agenda_eventos enable row level security;
alter table public.senhas enable row level security;

drop policy if exists "empresas_select_auth" on public.empresas;
create policy "empresas_select_auth" on public.empresas
  for select
  using (auth.uid() is not null);

drop policy if exists "links_select_auth" on public.links;
create policy "links_select_auth" on public.links
  for select
  using (auth.uid() is not null);

drop policy if exists "links_insert_auth" on public.links;
create policy "links_insert_auth" on public.links
  for insert
  with check (auth.uid() is not null);

drop policy if exists "links_delete_auth" on public.links;
create policy "links_delete_auth" on public.links
  for delete
  using (auth.uid() is not null);

drop policy if exists "chamados_select_chefe_all_comum_own" on public.chamados;
create policy "chamados_select_chefe_all_comum_own" on public.chamados
  for select
  using (
    auth.uid() is not null
  );

-- Allow authenticated users to INSERT chamados but require created_by to match auth.uid()
drop policy if exists "auth_insert_chamados" on public.chamados;
create policy "auth_insert_chamados" on public.chamados
  for insert
  with check (auth.uid() is not null and created_by = auth.uid());

drop policy if exists "agenda_eventos_select_auth" on public.agenda_eventos;
create policy "agenda_eventos_select_auth" on public.agenda_eventos
  for select
  using (auth.uid() is not null);

drop policy if exists "chefe_full_access_to_senhas" on public.senhas;
create policy "chefe_full_access_to_senhas" on public.senhas
  for all
  using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'chefe'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'chefe'
    )
  );