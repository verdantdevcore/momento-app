-- AI Event Recaps: a deterministic, curated highlight-reel slideshow built
-- from an event's own already-uploaded media.
--
-- No new AI vendor and no biometric processing — see lib/faces.ts for that.
-- Curation reads media_faces only as a "how many people are in this shot"
-- count; it never touches face identity, so no new consent/attestation
-- column is needed here (contrast with events.face_search_attested_at).

alter table public.events
  -- Doubles as the idempotency / retry guard for the recap QStash job, same
  -- spirit as media.face_indexed_at.
  add column if not exists recap_status        text not null default 'idle',
  add column if not exists recap_requested_at   timestamptz,
  add column if not exists recap_generated_at   timestamptz,
  -- Delivery URL of a server-composed video, when that rendering path exists.
  -- Null for the v1 client-rendered slideshow, where there is no such asset.
  add column if not exists recap_video_url      text,
  -- Which rendering strategy produced the current recap: 'client_slideshow'
  -- (v1) or 'cloudinary_video' (future). Lets the viewer and the purge/
  -- teardown path know whether there's a separate Cloudinary asset to clean up.
  add column if not exists recap_render_mode    text,
  add column if not exists recap_item_count     integer,
  add column if not exists recap_error          text;

alter table public.events
  drop constraint if exists events_recap_status_check;
alter table public.events
  add constraint events_recap_status_check
    check (recap_status in ('idle', 'processing', 'ready', 'failed'));

-- Snapshot of which media were selected for the current recap, in playback
-- order, with the score that earned each its place. Persisting this means
-- the guest viewer can render without re-running curation, and a future
-- "regenerate" can compare against the prior selection.
create table if not exists public.event_recap_items (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events(id) on delete cascade,
  media_id      uuid not null references public.media(id)  on delete cascade,
  position      integer not null,
  score         real not null,
  -- Seconds this item is allotted in the slideshow. Denormalised here so a
  -- future pacing-formula change doesn't retroactively alter a recap that's
  -- already marked ready without an explicit regenerate.
  duration_secs real not null,
  created_at    timestamptz not null default now(),

  unique (event_id, media_id)
);

create index if not exists event_recap_items_event_id_idx on public.event_recap_items (event_id);
create index if not exists event_recap_items_position_idx on public.event_recap_items (event_id, position);

-- RLS on with no policies: same posture as media_faces. Reads/writes go
-- through /api/recap/* (service-role key), never queried directly by the
-- anon or authenticated client.
alter table public.event_recap_items enable row level security;
