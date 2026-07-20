-- Switches face-based discovery from AWS Rekognition to Azure AI Face
-- (see src/lib/faces.ts). The two providers don't share an id space, so a
-- face id recorded under Rekognition is meaningless to Azure and vice versa.

alter table public.media_faces
  rename column rekognition_face_id to persisted_face_id;

comment on column public.media_faces.persisted_face_id is
  'Opaque id of this face within the event''s Azure LargeFaceList (persistedFaceId). Unique within a list, and a list maps 1:1 to an event.';

-- Every existing row points at a face template that no longer exists — it
-- lived in Rekognition, which nothing here talks to anymore. Clearing them
-- out (rather than leaving them to silently never match again) and resetting
-- face_indexed_at means any event with face_search_enabled already on will
-- pick its photos back up as soon as it's re-indexed.
--
-- This does not re-trigger indexing by itself: an event that already had
-- face search on needs its host to toggle it off and back on (or an
-- operator to re-run the backfill) before search works again for it.
delete from public.media_faces;
update public.media set face_indexed_at = null where face_indexed_at is not null;
