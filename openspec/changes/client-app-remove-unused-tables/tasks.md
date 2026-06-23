# Tasks: Remove 9 Unused Tables + Dead Code

## 1. Core-api — Prisma schema

- [ ] 1.1 Remove `AiAbTest`, `AiAbTestResult`, `AiModelComparison`, `AiModelComparisonResult` models from `schema.prisma`
- [ ] 1.2 Remove `AbTestStatus` enum
- [ ] 1.3 Remove back-relations from `User` model (`aiComparisons`, `aiAbTests`, `aiAbTestResults`)
- [ ] 1.4 Remove back-relation from `Course` model (`aiAbTests`)
- [ ] 1.5 Remove back-relation from `AiProvider` model (`comparisonResults`)
- [ ] 1.6 Run `npx prisma migrate dev --name remove_unused_ai_tables`

## 2. Core-api — Controllers + services

- [ ] 2.1 `lecturer-ai.controller.ts`: remove 7 AB test methods, keep preview/courseContext/history/archiveHistory
- [ ] 2.2 `admin-ai.controller.ts`: remove `compareModels` method, keep getUsageStats/getUsageReport
- [ ] 2.3 `ai.service.ts`: remove `compareModels` method + `defaultComparisonStore` + `ComparisonStore` type

## 3. Core-api — Routes + validators + tests

- [ ] 3.1 `lecturer-ai.routes.ts`: remove 7 AB test routes
- [ ] 3.2 `admin-ai.routes.ts`: remove `POST /ai-compare`
- [ ] 3.3 `lecturer-ai.validator.ts`: remove AB test schemas + type exports
- [ ] 3.4 `admin-ai.validator.ts`: remove `aiCompareSchema` + `AiCompareInput`
- [ ] 3.5 `admin-ai.controller.test.ts`: remove compareModels tests
- [ ] 3.6 `npx tsc --noEmit` — verify 0 errors

## 4. Client-app — Delete files

- [ ] 4.1 Delete `resources/js/pages/lecturer/ai-settings.tsx`
- [ ] 4.2 Delete `resources/js/pages/admin/ai-comparison.tsx`
- [ ] 4.3 Delete `app/Http/Controllers/LecturerAISettingsController.php`
- [ ] 4.4 Delete `app/Http/Controllers/Lecturer/LearningSessionController.php`
- [ ] 4.5 Delete `app/Http/Controllers/SessionTemplateController.php`
- [ ] 4.6 Delete `app/Models/AiPreset.php`
- [ ] 4.7 Delete 5 migration files (saved_reports, shared_reports, learning_sessions, session_templates, ai_presets)

## 5. Client-app — Edit files

- [ ] 5.1 `routes/web.php`: remove 4 route groups (lecturer ai-settings, admin ai-comparison, session-templates, sessions)
- [ ] 5.2 `AISettingsController.php`: remove `comparisonPage` + `compare` methods
- [ ] 5.3 `admin-nav.tsx`: remove "AI Comparison" menu item
- [ ] 5.4 `config/shortcuts/admin.ts`: remove ctrl+5 AI Comparison
- [ ] 5.5 `config/shortcuts/lecturer.ts`: remove ctrl+5 AI Settings
- [ ] 5.6 `useAdminKeyboardShortcuts.ts`: remove `/admin/ai-comparison`
- [ ] 5.7 `GlobalSearch.tsx`: remove AI Comparison + lecturer AI Settings entries
- [ ] 5.8 `npx tsc --noEmit` — verify 0 errors

## 6. Deploy to VPS

- [ ] 6.1 rsync core-api + client-app to VPS
- [ ] 6.2 Rebuild containers
- [ ] 6.3 Drop 9 tables via SQL (if not dropped by migration)
- [ ] 6.4 Remove deleted migration entries from Laravel `migrations` table
- [ ] 6.5 Verify: web 200, API 200, containers healthy

## 7. Final verification

- [ ] 7.1 `SELECT count(*) FROM pg_tables WHERE schemaname = 'public'` = 48 (57 - 9)
- [ ] 7.2 AI chat still works (student sends message, gets response)
- [ ] 7.3 Admin AI settings still works (provider CRUD)
- [ ] 7.4 `/lecturer/ai-settings` returns 404
- [ ] 7.5 `/admin/ai-comparison` returns 404
- [ ] 7.6 Commit + archive OpenSpec
