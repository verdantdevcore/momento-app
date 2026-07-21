---
name: verify
description: How to boot momento-app and drive its API routes for runtime verification
---

# Verifying momento-app changes

## Boot

```bash
npm run dev > /tmp/momento-dev.log 2>&1 &
sleep 5
tail -n 40 /tmp/momento-dev.log   # confirm "✓ Ready" and no compile errors
```

Turbopack dev server on `http://localhost:3000`. `.env.local` supplies all
required env vars (Supabase, Cloudinary, QStash, Resend) — no extra setup.

## Drive it

- API routes: `curl` directly, e.g. `curl -s "http://localhost:3000/api/<route>?<query>"`.
- Pages under `src/app/**` are almost all `'use client'` with data fetched
  client-side after hydration (Supabase browser client or `fetch` to an API
  route in a `useEffect`) — **`curl` on a page only returns the pre-hydration
  shell, never the real content.** There is no server-rendered HTML to grep
  for copy/state. Observing actual rendered UI requires a real browser
  (Playwright or similar); this environment doesn't have one wired up as a
  tool, so page-level verification here is limited to "does it 200 and not
  throw," not "does it show the right thing."
- Server errors/exceptions show up in `/tmp/momento-dev.log` per-request
  (`GET <path> <status> in <ms>`) — tail it after each curl.

## Known gotcha: service-role Supabase calls may fail silently

The `SUPABASE_SERVICE_ROLE_KEY` in this sandbox's `.env.local` returned
`{"message":"Invalid API key"}` when hit directly via
`curl -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/..."`
(checked 2026-07-20) — network reachability to the Supabase host itself is
fine (a request with no key at all correctly gets a 401 "No API key found"
rather than a timeout), so this is a bad/stale key, not a network issue.
Every admin-client Supabase query in the app degrades a failed/errored query
to `data: null` and treats that the same as "not found" — which means routes
that should 404 for a missing row and routes that are silently failing on
every request look **identical** from the outside. Don't take a clean 404
from an admin-client-backed route as proof the DB round-trip actually
succeeded; corroborate with a direct `curl` to the Supabase REST endpoint
using the same key first.

## Migrations are not auto-applied

There's no Supabase CLI in this repo and no `supabase/config.toml` — this
project's schema changes are applied by hand against the hosted project
(dashboard SQL editor), not via an automated migration runner. A new
`supabase/migrations/NNN_*.sql` file being present in the repo does **not**
mean the live database has those columns/tables yet. Don't run DDL against
the configured Supabase project from an agent session without explicit
user sign-off — it's shared infrastructure, not a disposable local DB.
