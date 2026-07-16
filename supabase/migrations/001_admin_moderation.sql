-- Admin moderation: account restriction + soft deletion with a 30-day purge.
--
-- Run this in the Supabase SQL editor before deploying the matching app code.
-- Every statement is idempotent, so re-running it is safe.

-- ─── 1. Moderation columns on hosts ─────────────────────────────────────────

alter table public.hosts
  add column if not exists restricted_at     timestamptz,
  add column if not exists restricted_reason text,
  add column if not exists deleted_at        timestamptz,
  add column if not exists deletion_reason   text,
  add column if not exists purge_after       timestamptz;

-- The purge cron scans for due accounts on every run; only soft-deleted rows
-- carry a purge_after, so a partial index keeps that scan cheap.
create index if not exists hosts_purge_after_idx
  on public.hosts (purge_after)
  where purge_after is not null;

-- ─── 2. Inactive-host helper ────────────────────────────────────────────────

-- security definer so the function can read hosts regardless of the caller's
-- RLS. It only ever returns a boolean, so it leaks nothing about the row.
create or replace function public.host_is_inactive(host uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.hosts h
    where h.id = host
      and (h.restricted_at is not null or h.deleted_at is not null)
  );
$$;

revoke all on function public.host_is_inactive(uuid) from public;
grant execute on function public.host_is_inactive(uuid) to anon, authenticated;

-- ─── 3. Take feeds dark for restricted / deleted hosts ──────────────────────

-- These are RESTRICTIVE policies: Postgres ANDs them with whatever permissive
-- policies already exist, so they subtract access without needing to know or
-- touch the current policy set. They apply to anon + authenticated only —
-- the service-role key used by /api/admin/* bypasses RLS, so admins keep
-- full visibility into restricted accounts.

drop policy if exists events_hidden_when_host_inactive on public.events;
create policy events_hidden_when_host_inactive
  on public.events
  as restrictive
  for select
  to anon, authenticated
  using (not public.host_is_inactive(host_id));

drop policy if exists media_hidden_when_host_inactive on public.media;
create policy media_hidden_when_host_inactive
  on public.media
  as restrictive
  for select
  to anon, authenticated
  using (
    not exists (
      select 1
      from public.events e
      where e.id = media.event_id
        and public.host_is_inactive(e.host_id)
    )
  );

-- Guest uploads are written by /api/upload with the service-role key, which
-- bypasses RLS — this is defence in depth for any direct anon insert.
drop policy if exists media_insert_blocked_when_host_inactive on public.media;
create policy media_insert_blocked_when_host_inactive
  on public.media
  as restrictive
  for insert
  to anon, authenticated
  with check (
    not exists (
      select 1
      from public.events e
      where e.id = media.event_id
        and public.host_is_inactive(e.host_id)
    )
  );

-- A restricted host must not be able to spin up new events to route around
-- the restriction.
drop policy if exists events_insert_blocked_when_host_inactive on public.events;
create policy events_insert_blocked_when_host_inactive
  on public.events
  as restrictive
  for insert
  to authenticated
  with check (not public.host_is_inactive(host_id));
