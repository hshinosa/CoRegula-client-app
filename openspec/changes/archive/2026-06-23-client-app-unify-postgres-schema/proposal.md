# Unify PostgreSQL Schema (drop `app`, use `public` only)

## Problem Statement

PostgreSQL has two schemas with overlapping tables:

| Schema | Created by | `id` type | Tables |
|---|---|---|---|
| `public` | Prisma (core-api) | `TEXT` | 62 tables |
| `app` | Laravel (client-app) | `uuid` | 32 tables (7 overlap with `public`) |

7 tables are **duplicated** across both schemas with different column types:
- `course_weeks`, `course_materials`, `course_week_materials` (+ `material_modules`, `chat_messages`, `chat_message_audit`, `pinned_messages`)

This caused a production bug: Prisma queries `public.course_weeks` (TEXT) but used `::uuid` cast → PostgreSQL error "operator does not exist: text = uuid" → "Unable to verify week_id" when creating discussion sessions.

25 tables exist **only** in `app` (Laravel-only: attendance, material_views, sessions, jobs, cache, etc.).

`DB_SCHEMA=public` is already set in `.env` (both local and VPS), but the `app` schema persists from earlier migrations. Laravel's migration history table is in `app.migrations` (23 entries).

### Root Cause

Two independent migration systems (Prisma + Laravel) created the same tables in different schemas with different types. No cleanup was done when `DB_SCHEMA` was switched from `app` to `public`.

## Proposed Solution

**Drop schema `app` entirely. Re-run Laravel migrations in `public`.**

### Steps

1. **Backup** `app` schema via `pg_dump -n app`
2. **Drop schema `app`** (CASCADE) — removes all 32 tables + migration history
3. **Run `php artisan migrate:fresh --force`** in `public`:
   - Laravel migrations use `if (!Schema::hasTable(...))` for overlapping tables → will **skip** `course_weeks`, `course_materials`, `course_week_materials` (already exist via Prisma as TEXT)
   - Will **create** 25 Laravel-only tables (attendance_sessions, attendance_records, material_views, material_modules, sessions, jobs, cache, etc.) in `public`
   - Creates fresh `migrations` table in `public` tracking all 23 migrations as applied
4. **Re-seed Laravel data**:
   - `MaterialsDemoSeeder` — regenerates course materials metadata + PDFs
   - Attendance seeder — regenerates sessions + records
   - Any other Laravel-side seeders
5. **Update `.env.example`** — change `DB_SCHEMA=app` → `DB_SCHEMA=public`
6. **Verify** — all flows work: attendance, material views, discussion sessions, pre-read

### Type reconciliation

Overlapping tables stay as Prisma created them (`TEXT` columns). Laravel Eloquent models use UUID strings — compatible with `TEXT` columns. No type migration needed.

Laravel's `course_materials` table has extra columns (`file_name`, `file_path`, `view_count`, `module_id`, etc.) that Prisma's version doesn't have. After `migrate:fresh`, Laravel will **skip** creating `course_materials` (already exists) → these columns will be missing.

**Resolution**: Add a post-migration step that runs `ALTER TABLE course_materials ADD COLUMN IF NOT EXISTS ...` for Laravel-specific columns. Or: drop Prisma's `course_materials` first, let Laravel create it, then Prisma `db pull` to update schema.

**Chosen approach**: Let Laravel create ALL overlapping tables. Drop Prisma's versions of the 7 overlapping tables first, let Laravel recreate with proper columns (uuid + extra columns), then Prisma `db pull` / manual schema update to match. Prisma queries use `$queryRaw` for these tables anyway (not Prisma client models for most operations).

### What stays unchanged

- Prisma schema (`schema.prisma`) — models still use `String` for IDs
- Prisma migrations — already applied, marked in `_prisma_migrations`
- `::text` casts in core-api queries — already fixed and deployed
- All core-api code — no changes needed

## Scope

- **VPS PostgreSQL** — drop `app` schema, re-migrate Laravel in `public`, re-seed
- **`.env.example`** — update `DB_SCHEMA=public`
- **No code changes** in core-api or client-app (config already correct)

## Out of Scope

- Migrating client-app from dual-write to API-only (separate future work)
- Changing Prisma column types from TEXT to native uuid
- MySQL changes (client-app still uses MySQL for some tables locally)

## Risk

- **Medium**: Dropping `app` schema loses Laravel migration history. Mitigated by backup + `migrate:fresh` recreates everything.
- **Low**: 5 materials count discrepancy (84 Prisma vs 89 Laravel) — re-seed resolves.
- **Low**: Prisma/Laravel column mismatch on overlapping tables — resolved by letting Laravel own the table structure.
