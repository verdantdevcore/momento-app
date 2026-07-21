-- Guest Photo Requests: a host nudges guests toward a specific shot ("Need
-- more dance floor photos") without needing guest accounts or push
-- notifications — guests are always anonymous browsers, so delivery is the
-- same "public status read the guest feed already polls" mechanism the
-- event recap and face search features use.

create table if not exists public.event_photo_requests (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references public.events(id) on delete cascade,
  prompt       text not null,
  created_at   timestamptz not null default now(),
  -- Null while the request is live. Set (never cleared) once the host marks
  -- it done — a request is a point-in-time nudge, not something reopened.
  dismissed_at timestamptz
);

create index if not exists event_photo_requests_event_id_idx
  on public.event_photo_requests (event_id);

-- RLS on with no policies: same posture as event_recap_items and
-- media_faces. Reads/writes go through /api/photo-requests (service-role
-- key) only, never queried directly by the anon or authenticated client.
alter table public.event_photo_requests enable row level security;
