-- Contador de sesiones anónimas. Solo la función de servidor accede a la tabla.
create table public.defensas_visit_sessions (
  session_id uuid primary key,
  created_at timestamptz not null default now()
);
alter table public.defensas_visit_sessions enable row level security;
revoke all on public.defensas_visit_sessions from public, anon, authenticated;
grant select, insert on public.defensas_visit_sessions to service_role;

create function public.record_defensas_visit(p_session_id uuid)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if p_session_id is null then
    raise exception 'session_id requerido' using errcode = '22023';
  end if;
  insert into public.defensas_visit_sessions(session_id)
  values (p_session_id)
  on conflict (session_id) do nothing;
  return (select count(*) from public.defensas_visit_sessions);
end;
$$;

create function public.read_defensas_visit_total()
returns bigint
language sql stable
security invoker
set search_path = ''
as $$ select count(*) from public.defensas_visit_sessions; $$;

revoke all on function public.record_defensas_visit(uuid) from public, anon, authenticated;
revoke all on function public.read_defensas_visit_total() from public, anon, authenticated;
grant execute on function public.record_defensas_visit(uuid) to service_role;
grant execute on function public.read_defensas_visit_total() to service_role;
