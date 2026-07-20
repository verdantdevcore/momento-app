-- Face-based discovery: a guest uploads a selfie and gets back every photo
-- they appear in.
--
-- Face templates themselves never live in Postgres. They are held in a
-- per-event AWS Rekognition collection (see src/lib/faces.ts); what we store
-- here is only the pointer back from a detected face to the media row it was
-- found in, so a search result can be turned into a feed.

-- Off unless the host turns it on and attests they have their guests' consent.
-- Nothing is indexed for an event where face_search_enabled is false, so the
-- default means an existing event never starts collecting biometric data
-- because this migration ran.
alter table public.events
  add column if not exists face_search_enabled     boolean not null default false,
  add column if not exists face_search_attested_at timestamptz;

-- Null until the indexing job has run for this media. Doubles as the retry
-- guard: QStash redelivers on any non-2xx, and re-indexing an already-indexed
-- photo would put a second copy of every face in the collection.
alter table public.media
  add column if not exists face_indexed_at timestamptz;

create table if not exists public.media_faces (
  id                   uuid primary key default gen_random_uuid(),
  media_id             uuid not null references public.media(id)  on delete cascade,
  event_id             uuid not null references public.events(id) on delete cascade,
  -- Opaque id of this face within the event's Rekognition collection.
  rekognition_face_id  text not null,
  -- Normalised 0..1 box, kept for debugging and any future "who's in this
  -- photo" affordance. Not used by search.
  bounding_box         jsonb,
  confidence           real,
  created_at           timestamptz not null default now(),

  -- Rekognition face ids are unique within a collection, and a collection maps
  -- 1:1 to an event. Makes a double-index a conflict rather than a duplicate.
  unique (event_id, rekognition_face_id)
);

create index if not exists media_faces_media_id_idx on public.media_faces (media_id);
create index if not exists media_faces_event_id_idx on public.media_faces (event_id);

-- RLS on with no policies at all: this table is unreachable from the anon and
-- authenticated keys, and only the service-role key (which bypasses RLS) can
-- touch it. Deliberate — the search endpoint runs server-side under the service
-- role and returns media ids, never face rows. Hosts have no reason to read
-- this table and guests certainly don't.
alter table public.media_faces enable row level security;
