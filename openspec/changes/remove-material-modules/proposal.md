## Why

The `material_modules` system is dead code. A Prisma migration (`20260612101423_remove_module_id_from_materials`) already dropped the `module_id` FK column from `course_materials`, but Laravel code (model, controller, routes, frontend, tests) still references it. The replacement system — `course_weeks` + `course_week_materials` pivot — is fully operational: 84/84 materials are linked to weeks, `UnifiedMaterialsTab.tsx` is the active UI, and `MaterialsTab.tsx` is not imported anywhere. This is a latent crash bug (any call to `MaterialModule::with('materials')` hits a missing column) and dead-code debt.

## What Changes

- **BREAKING**: Drop `material_modules` table from PostgreSQL (42 rows, all orphaned — 0 materials linked since `module_id` column was dropped).
- Delete `MaterialModule.php` Eloquent model.
- Delete `module()` BelongsTo relationship from `CourseMaterial.php`.
- Delete 5 module methods from `LecturerMaterialsController.php` (`index`, `storeModule`, `updateModule`, `destroyModule`, `reorderModules`). Keep `store`, `update`, `destroy`, `recordView`, `viewStats`, `reindex`.
- Delete `MaterialsTab.tsx` (dead code — not imported anywhere).
- Delete 4 module routes from `routes/web.php` (lines 322-329).
- Remove `module_id` from TypeScript `CourseMaterial` interface in `index.d.ts`.
- Remove `module_id` column from 4 test file table setups.
- Remove `module_id` from Laravel migration `2026_05_23_000013_create_course_materials_table.php` (column + FK + index).
- Remove `MaterialModule` import from `LecturerMaterialsController.php`.

## Capabilities

### New Capabilities

_None — this is a removal-only change._

### Modified Capabilities

- `course-materials`: Materials are grouped exclusively by `course_weeks` via `course_week_materials` pivot. The legacy `material_modules` grouping is removed entirely. All material CRUD (upload, update, delete, view tracking, reindex) remains unchanged.
