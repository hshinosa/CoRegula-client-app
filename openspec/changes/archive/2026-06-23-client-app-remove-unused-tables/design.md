# Design: Remove 9 Unused Tables + Dead Code

## Context

9 tables exist in PostgreSQL `public` schema with 0 rows and no active usage. They represent features that were scaffolded but never adopted.

## Decision: Full deletion (tables + code + frontend)

### Why not just drop tables?

Dropping tables without removing code → orphaned references, TypeScript/PHP errors, broken routes. Must remove the full stack: DB table → Prisma model → controller → route → frontend page → nav item.

### Why not keep code "for future use"?

Dead code is liability:
- Confuses developers ("is this feature active?")
- Adds compile time
- Breaks when dependencies change
- 0 data = never used = no business value lost

## Deletion Map

### Core-api

| File | Action | Detail |
|---|---|---|
| `prisma/schema.prisma` | EDIT | Remove 4 models + enum + 5 back-relations |
| `src/controllers/lecturer-ai.controller.ts` | EDIT | Remove 7 AB test methods (lines 152-376), keep preview/courseContext/history/archiveHistory |
| `src/controllers/admin-ai.controller.ts` | EDIT | Remove `compareModels` method, keep getUsageStats/getUsageReport |
| `src/services/ai.service.ts` | EDIT | Remove `compareModels` method + `defaultComparisonStore` + `ComparisonStore` type |
| `src/routes/lecturer-ai.routes.ts` | EDIT | Remove 7 AB test routes (lines 28-34) |
| `src/routes/admin-ai.routes.ts` | EDIT | Remove `POST /ai-compare` (line 17) |
| `src/validators/lecturer-ai.validator.ts` | EDIT | Remove AB test schemas + types (lines 38-84) |
| `src/validators/admin-ai.validator.ts` | EDIT | Remove `aiCompareSchema` + `AiCompareInput` (lines 16-19, 23) |
| `src/controllers/admin-ai.controller.test.ts` | EDIT | Remove compareModels test block |
| `prisma/migrations/` | CREATE | New migration `remove_unused_ai_tables` |

### Client-app

| File | Action | Detail |
|---|---|---|
| `resources/js/pages/lecturer/ai-settings.tsx` | DELETE | Entire file (996 lines) |
| `resources/js/pages/admin/ai-comparison.tsx` | DELETE | Entire file (205 lines) |
| `app/Http/Controllers/LecturerAISettingsController.php` | DELETE | Entire file |
| `app/Http/Controllers/Lecturer/LearningSessionController.php` | DELETE | Entire file |
| `app/Http/Controllers/SessionTemplateController.php` | DELETE | Entire file |
| `app/Http/Controllers/AISettingsController.php` | EDIT | Remove `comparisonPage` + `compare` methods |
| `app/Models/AiPreset.php` | DELETE | Entire file |
| `database/migrations/2026_05_23_000014_create_saved_reports_table.php` | DELETE | |
| `database/migrations/2026_05_23_000015_create_shared_reports_table.php` | DELETE | |
| `database/migrations/2026_05_23_000013_create_sessions_table.php` | DELETE | learning_sessions (NOT Laravel sessions) |
| `database/migrations/2026_05_23_000012_create_session_templates_table.php` | DELETE | |
| `database/migrations/2026_05_23_000014_create_ai_presets_table.php` | DELETE | |
| `routes/web.php` | EDIT | Remove 4 route groups |
| `components/navigation/admin-nav.tsx` | EDIT | Remove "AI Comparison" menu item |
| `components/navigation/lecturer-nav.tsx` | EDIT | Remove ai-settings icon (if referenced) |
| `config/shortcuts/admin.ts` | EDIT | Remove ctrl+5 AI Comparison |
| `config/shortcuts/lecturer.ts` | EDIT | Remove ctrl+5 AI Settings |
| `hooks/useAdminKeyboardShortcuts.ts` | EDIT | Remove `/admin/ai-comparison` |
| `components/admin/GlobalSearch.tsx` | EDIT | Remove AI Comparison + lecturer AI Settings entries |

### Migration naming conflict

Migration `2026_05_23_000014` is used by BOTH `create_saved_reports_table.php` AND `create_ai_presets_table.php`. Need to check — they may share the same timestamp prefix but have different filenames. Both will be deleted.

## Execution Order

```
1. Core-api: Edit schema.prisma (remove models + relations)
2. Core-api: Edit controllers/services/routes/validators/tests
3. Core-api: npx prisma migrate dev --name remove_unused_ai_tables
4. Core-api: npx tsc --noEmit (verify)
5. Client-app: Delete files (pages, controllers, models, migrations)
6. Client-app: Edit files (routes, nav, controllers, shortcuts)
7. Client-app: npx tsc --noEmit (verify)
8. Client-app: php artisan route:list (verify no broken routes)
9. VPS: Deploy core-api + client-app
10. VPS: Drop 9 tables via SQL (if not already dropped by migration)
11. VPS: Remove migration entries from Laravel migrations table
12. Verify: web 200, API 200, containers healthy
```

### Prisma migration behavior

`prisma migrate dev` will:
1. Detect schema changes (4 models + 1 enum removed)
2. Generate `DROP TABLE` + `DROP TYPE` SQL
3. Apply to DB
4. Mark migration as applied in `_prisma_migrations`

### Laravel migration handling

After deleting migration files, the `migrations` table in PostgreSQL still has entries for them. Need to:
```sql
DELETE FROM public.migrations WHERE migration IN (
  '2026_05_23_000012_create_session_templates_table',
  '2026_05_23_000013_create_sessions_table',
  '2026_05_23_000014_create_saved_reports_table',
  '2026_05_23_000014_create_ai_presets_table',
  '2026_05_23_000015_create_shared_reports_table'
);
```

And drop the tables:
```sql
DROP TABLE IF EXISTS "saved_reports" CASCADE;
DROP TABLE IF EXISTS "shared_reports" CASCADE;
DROP TABLE IF EXISTS "learning_sessions" CASCADE;
DROP TABLE IF EXISTS "session_templates" CASCADE;
DROP TABLE IF EXISTS "ai_presets" CASCADE;
```

## Fallback

If migration fails:
1. Restore schema.prisma from git
2. Restore deleted files from git
3. `prisma migrate reset` to restore DB state
