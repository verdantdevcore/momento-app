# Migrations

There is no Supabase CLI wired up to this project, so migrations are applied by
hand in the Supabase SQL editor. Files are numbered and each one is idempotent,
so re-running is safe.

## 001_admin_moderation.sql

Adds account restriction + soft deletion, and takes a restricted host's event
feeds dark.

### Apply this before deploying the matching app code

The migration is additive (new columns and new restrictive policies), so it is
safe to run against the live database while the current code is still deployed —
nothing reads the new columns until the new code ships.

Deploying the code first is the order that hurts: `/api/admin/data` selects the
new columns, so the admin panel's host list would come back empty until the
migration lands. (Uploads are unaffected either way — the host-status check in
`lib/upload-security.ts` deliberately fails open.)

### What it does

- Adds `restricted_at`, `restricted_reason`, `deleted_at`, `deletion_reason` and
  `purge_after` to `hosts`.
- Adds `host_is_inactive(uuid)`, a `security definer` helper.
- Adds **restrictive** RLS policies on `events` and `media`. Postgres ANDs
  restrictive policies with the existing permissive ones, so these subtract
  access without needing to know or edit the current policy set. They apply to
  `anon` + `authenticated` only — the service-role key used by `/api/admin/*`
  bypasses RLS, so admins keep full visibility into restricted accounts.

These policies are what actually take feeds dark. The checks in the app code are
defence in depth for the routes that hold the service-role key and therefore
bypass RLS.

## Scheduling the account purge

Deleting an account is a soft delete: the host is locked out and their feeds go
dark immediately, but their events and media survive for 30 days so an erroneous
delete can be undone from the admin panel.

`/api/cron/purge-accounts` does the irreversible teardown once `purge_after`
passes. It is a sweep, not a targeted job, so it needs a recurring **QStash
schedule** rather than the delayed-message pattern used by
`lib/qstash.ts` → `/api/cron/onboarding-check`.

Create it once (daily at 03:00 UTC):

```bash
curl -X POST https://qstash.upstash.io/v2/schedules/https://sharemomento.app/api/cron/purge-accounts \
  -H "Authorization: Bearer $QSTASH_TOKEN" \
  -H "Upstash-Cron: 0 3 * * *"
```

It verifies the QStash signature via `verifySignatureAppRouter`, using the
`QSTASH_CURRENT_SIGNING_KEY` / `QSTASH_NEXT_SIGNING_KEY` env vars that are
already set.

**Until this schedule exists, nothing is ever purged** — accounts stay soft
deleted indefinitely. That fails safe (no data is destroyed), but storage costs
keep accruing, so verify the schedule is live:

```bash
curl https://qstash.upstash.io/v2/schedules -H "Authorization: Bearer $QSTASH_TOKEN"
```
