# Tasks: Unify PostgreSQL Schema

## 1. Pre-migration

- [ ] 1.1 Backup `app` schema: `pg_dump -n app -f /tmp/app_schema_backup.sql`
- [ ] 1.2 Verify backup file is non-empty and contains all 32 tables
- [ ] 1.3 Update `.env.example`: `DB_SCHEMA=app` → `DB_SCHEMA=public`

## 2. Drop app schema

- [ ] 2.1 `DROP SCHEMA app CASCADE` on VPS PostgreSQL
- [ ] 2.2 Verify `app` schema no longer exists
- [ ] 2.3 Verify `public` schema still has all Prisma tables (62 tables intact)

## 3. Re-run Laravel migrations in public

- [ ] 3.1 `php artisan migrate:fresh --force` inside client-app container
- [ ] 3.2 Verify 25 Laravel-only tables created in `public`
- [ ] 3.3 Verify 3 overlapping tables NOT recreated (skipped by `if(!hasTable)`)
- [ ] 3.4 Verify `course_materials` created with full Laravel columns (or Prisma version retained — check design.md for decision)
- [ ] 3.5 Verify `migrations` table exists in `public` with 23 entries

## 4. Re-seed Laravel data

- [ ] 4.1 `php artisan db:seed --class=MaterialsDemoSeeder` — regenerate materials + PDFs
- [ ] 4.2 Re-seed attendance data (if separate seeder)
- [ ] 4.3 Verify material count matches expected (84+)
- [ ] 4.4 Verify attendance sessions + records exist

## 5. Prisma schema sync (if course_materials recreated by Laravel)

- [ ] 5.1 `prisma db pull` or manually update `schema.prisma` CourseMaterial model with Laravel columns
- [ ] 5.2 `prisma generate` to update client
- [ ] 5.3 Verify core-api TypeScript compiles
- [ ] 5.4 Verify core-api `$queryRaw` queries on course_materials still work

## 6. Verify all flows

- [ ] 6.1 Create discussion session (week_id verification) — no "unable to verify" error
- [ ] 6.2 Pre-read flow — materials load, completion works
- [ ] 6.3 Attendance tracking — sessions show, records create
- [ ] 6.4 Material views — view count increments
- [ ] 6.5 AI chat — citations link to materials
- [ ] 6.6 Web 200, API health 200, all containers healthy

## 7. Commit + archive

- [ ] 7.1 Commit `.env.example` change + OpenSpec files to client-app
- [ ] 7.2 Commit any `schema.prisma` changes to core-api
- [ ] 7.3 Archive OpenSpec change
