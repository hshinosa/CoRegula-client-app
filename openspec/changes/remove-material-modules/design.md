## Context

The `course_materials` table has two grouping systems:

1. **Legacy**: `material_modules` table + `course_materials.module_id` FK — Laravel-only, never in Prisma schema. Prisma migration `20260612101423` dropped the `module_id` column, breaking all Laravel code that references it.
2. **Current**: `course_weeks` + `course_week_materials` pivot — fully in Prisma + Laravel, used by `UnifiedMaterialsTab.tsx` (active UI), `LecturerMaterialsHubController`, and `LecturerCourseWeeksController`.

VPS DB state: 84 materials, 84 `course_week_materials` links (100% coverage), 42 `material_modules` rows (orphaned, 0 materials linkable).

## Goals / Non-Goals

**Goals:**
- Remove all `material_modules` code (model, controller methods, routes, frontend, types, tests, migration).
- Drop `material_modules` table from DB.
- Eliminate the latent crash from `module_id` column reference.

**Non-Goals:**
- Migrating `material_modules` data → already empty (0 linked materials).
- Changing `course_weeks` or `course_week_materials` — they work.
- Modifying `LecturerMaterialsHubController` or `UnifiedMaterialsTab.tsx` — they are the active system.
- Touching `course_materials` table structure beyond removing `module_id` references.

## Decisions

### D1: Clean deletion, no migration shim

**Decision**: Delete all `material_modules` code + drop table. No backward-compat layer.

**Rationale**: `module_id` column already doesn't exist in DB — any code path hitting it is already broken. No data loss risk (0 linked materials). Adding a shim would perpetuate a dual-system that confused the original developer.

**Alternative considered**: Re-add `module_id` column to preserve modules. Rejected — 0 materials use it, UI doesn't render it, and the weekly system is the intended grouping.

### D2: Keep `LecturerMaterialsController` file, remove module methods only

**Decision**: Remove 5 module methods (`index`, `storeModule`, `updateModule`, `destroyModule`, `reorderModules`) but keep the controller file with `store`, `update`, `destroy`, `recordView`, `viewStats`, `reindex`.

**Rationale**: `UnifiedMaterialsTab.tsx` calls `/lecturer/courses/{course}/materials` endpoints (store, destroy, reindex) which are served by this controller. Only the module-specific methods are dead.

### D3: Edit migration file in-place

**Decision**: Edit `2026_05_23_000013_create_course_materials_table.php` to remove `module_id` column, FK, and index from the schema definition.

**Rationale**: Migration already ran on all environments. Editing it keeps the migration file honest with the actual DB schema. Fresh installs won't try to create a column that Prisma will immediately drop.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Missed `module_id` reference causes runtime error | `grep` sweep after edits + `tsc --noEmit` + `php -l` on changed files |
| `material_modules` table referenced by other code we didn't find | `codegraph_explore` already mapped all references; 42 rows are orphaned |
| Test files break if they set up `module_id` column | Edit 4 test files to remove column from schema setup |
