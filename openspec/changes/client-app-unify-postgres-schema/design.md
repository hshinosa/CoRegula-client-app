# Design: Unify PostgreSQL Schema

## Context

Two migration systems manage the same PostgreSQL database:

```
core-api (Prisma)     → public.*  (62 tables, id TEXT)
client-app (Laravel)  → app.*     (32 tables, id uuid)
```

7 tables overlap. `DB_SCHEMA=public` already set in `.env` but `app` schema never cleaned up.

## Decision: Drop `app`, consolidate into `public`

### Why not keep both?

- Type mismatch (`TEXT` vs `uuid`) already caused a production bug
- Dual-write means data must stay in sync manually — fragile
- AGENTS.md already flags this as tech debt
- Beta testing phase = acceptable risk for cleanup

### Why `public` and not `app`?

- Prisma owns 62 tables in `public` — moving those is harder than moving 32 Laravel tables
- `search_path` defaults to `public` — Prisma works without config changes
- `DB_SCHEMA=public` already configured in `.env` (both local + VPS)

### Overlapping tables — who owns them?

| Table | Prisma columns | Laravel extra columns | Decision |
|---|---|---|---|
| `course_weeks` | id, course_id, week_index, title, sort_order, timestamps | (same) | **Prisma owns** — Laravel `if(!hasTable)` skips |
| `course_materials` | id, course_id, title, file_name, file_path, timestamps | module_id, description, file_type, file_size, uploaded_by, view_count, sort_order | **Laravel owns** — drop Prisma version, Laravel creates full schema |
| `course_week_materials` | id, course_week_id, course_material_id, sort_order, timestamps | (same) | **Prisma owns** — Laravel skips |
| `material_modules` | (none in Prisma) | id, course_id, title, sort_order, timestamps | **Laravel owns** — creates new |
| `chat_messages` | id, content, user_id, group_id, chat_space_id, timestamps, reply_to, is_edited, is_deleted, is_pinned | (same + indexes) | **Prisma owns** — Laravel skips |
| `chat_message_audit` | (none in Prisma) | id, message_id, user_id, action, old_content, new_content, conversation_id, timestamps | **Laravel owns** — creates new |
| `pinned_messages` | (none in Prisma) | id, message_id, user_id, conversation_id, timestamps | **Laravel owns** — creates new |

### Migration execution order

```
1. pg_dump -n app → backup.sql
2. DROP SCHEMA app CASCADE
3. php artisan migrate:fresh --force
   → Creates 25 Laravel-only tables in public
   → Skips 3 tables that Prisma already created (course_weeks, course_week_materials, chat_messages)
   → Creates course_materials (Laravel version with full columns)
   → Creates material_modules, chat_message_audit, pinned_messages
   → Creates migrations table in public (23 entries marked applied)
4. php artisan db:seed --class=MaterialsDemoSeeder
5. Re-seed attendance if needed
6. Verify all flows
```

### Post-migration: Prisma schema sync

After Laravel creates `course_materials` with extra columns, Prisma schema needs update:
- Add `moduleId`, `description`, `fileType`, `fileSize`, `uploadedBy`, `viewCount`, `sortOrder` to `CourseMaterial` model
- Run `prisma db pull` or manually update `schema.prisma`
- Run `prisma generate`

This ensures Prisma client knows about all columns. Core-api's `$queryRaw` queries already select specific columns and won't break.

### Fallback

If migration fails:
1. Restore from backup: `psql -f backup.sql`
2. Revert `.env` to `DB_SCHEMA=app`
3. Rebuild containers
