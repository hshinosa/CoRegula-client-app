## 1. Laravel backend — model + controller cleanup

- [ ] 1.1 Delete `app/Models/MaterialModule.php`
- [ ] 1.2 Remove `module()` BelongsTo relationship from `app/Models/CourseMaterial.php`
- [ ] 1.3 Remove 5 module methods from `app/Http/Controllers/Lecturer/LecturerMaterialsController.php` (`index`, `storeModule`, `updateModule`, `destroyModule`, `reorderModules`). Remove `MaterialModule` import. Keep `store`, `update`, `destroy`, `recordView`, `viewStats`, `reindex`.
- [ ] 1.4 Remove 4 module routes from `routes/web.php` (modules.store, modules.update, modules.destroy, modules.reorder)

## 2. Frontend — dead page + types cleanup

- [ ] 2.1 Delete `resources/js/components/lecturer/MaterialsTab.tsx`
- [ ] 2.2 Remove `module_id` field from `CourseMaterial` interface in `resources/js/types/index.d.ts`

## 3. Migration + tests cleanup

- [ ] 3.1 Edit `database/migrations/2026_05_23_000013_create_course_materials_table.php` — remove `module_id` column, FK, and composite index
- [ ] 3.2 Edit 4 test files to remove `module_id` from table setup: `LecturerCourseWeeksApiTest.php`, `LecturerMaterialKbHooksTest.php`, `LecturerMaterialsHubApiTest.php`, `WeekMaterialAccessServiceTest.php`
- [ ] 3.3 Remove `module_id` from test data in `LecturerMaterialsHubApiTest.php` (line ~95)

## 4. Verify

- [ ] 4.1 Run `npx tsc --noEmit` — 0 errors
- [ ] 4.2 Run `php -l` on all changed PHP files — no syntax errors
- [ ] 4.3 Run `php artisan test --filter=Materials` — tests pass

## 5. Deploy + DB cleanup

- [ ] 5.1 rsync changed files to VPS
- [ ] 5.2 Drop `material_modules` table from VPS PostgreSQL
- [ ] 5.3 Rebuild `client-app` container, verify web 200
- [ ] 5.4 Verify lecturer materials page loads without error

## 6. Commit + archive

- [ ] 6.1 Git commit all changes
- [ ] 6.2 Archive OpenSpec change
