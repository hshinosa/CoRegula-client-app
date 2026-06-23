# Tasks: Unify PostgreSQL Schema

## 1. Pre-migration

- [x] 1.1 Backup `app` schema: `pg_dump -n app -f /tmp/app_schema_backup.sql`
- [x] 1.2 Verify backup file is non-empty (213K, 30 tables)
- [x] 1.3 Update `.env.example`: `DB_SCHEMA=app` → `DB_SCHEMA=public`

## 2. Drop app schema

- [x] 2.1 `DROP SCHEMA app CASCADE` on VPS PostgreSQL
- [x] 2.2 Verify `app` schema no longer exists (0 rows)
- [x] 2.3 Verify `public` schema still has all Prisma tables (32 tables intact)

## 3. Re-run Laravel migrations in public

- [x] 3.1 `php artisan migrate --force` inside client-app container
- [x] 3.2 Verify 25 Laravel-only tables created in `public` (57 total)
- [x] 3.3 Verify 3 overlapping tables NOT recreated (skipped by `if(!hasTable)`)
- [x] 3.4 `course_materials` retained Prisma version (all Laravel columns already present)
- [x] 3.5 Verify `migrations` table exists in `public` with 23 entries

## 4. Re-seed Laravel data

- [x] 4.1 `php artisan db:seed --class=MaterialsDemoSeeder` — 48 weeks, 48 modules, 96 materials, 96 links, 12 PDFs
- [x] 4.2 `php artisan db:seed --class=AttendanceDemoSeeder` — 42 sessions, 378 records
- [x] 4.3 Verify material count (96, no duplicates)
- [x] 4.4 Verify attendance sessions + records exist (42 + 378)

## 5. Prisma schema sync

- [x] 5.1 Not needed — Prisma `CourseMaterial` model already matches DB columns
- [x] 5.2 Not needed — no schema changes required
- [x] 5.3 Core-api TypeScript compiles (no changes)
- [x] 5.4 Core-api `$queryRaw` queries on course_materials work (verified via API)

## 6. Verify all flows

- [x] 6.1 Group API returns chatSpace with weekId — week_id verification works (no error)
- [x] 6.2 weekId exists in course_weeks table (verified `6162c798...` → week 1 "Fundamental Web & React")
- [x] 6.3 Attendance tracking — 42 sessions + 378 records in DB
- [x] 6.4 Material views table exists (0 views — expected, fresh seed)
- [x] 6.5 Web 200, API health 200, 8 containers healthy

## 7. Commit + archive

- [ ] 7.1 Commit `.env.example` change + OpenSpec files to client-app
- [ ] 7.2 Archive OpenSpec change

## Additional fix discovered during execution

- `docker-compose.yml` had `DB_SCHEMA: app` hardcoded as container env var → changed to `public`
- Container config cache needed clearing (`php artisan config:clear`)
- Used `php artisan migrate` (not `migrate:fresh`) to avoid dropping Prisma tables
