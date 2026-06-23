# Remove 9 Unused Tables + Dead Code

## Problem Statement

Table audit (2026-06-23) found 9 PostgreSQL tables with 0 rows that are never used in production:

### AI Experimentation (5 tables)
- `ai_ab_tests`, `ai_ab_test_results` — A/B testing feature built but never used. 0 data. Not in lecturer nav menu. Accessible only via hidden URL `/lecturer/ai-settings` → tab "ab-testing".
- `ai_model_comparisons`, `ai_model_comparison_results` — Model comparison feature. 0 data. In admin nav but never used.
- `ai_presets` — AI preset storage (Laravel). 0 data. Same hidden page as AB tests.

### Orphaned Laravel Tables (4 tables)
- `saved_reports`, `shared_reports` — Migrations create tables, but no Eloquent model, no controller writes/reads. Analytics proxies to core-api API.
- `learning_sessions`, `session_templates` — Controllers exist but ALL methods are API proxy to core-api. No local DB access. No Eloquent models.

### Root Cause

Features were scaffolded (migration + model + controller + frontend page) but never adopted. They add maintenance burden, confuse the schema, and waste DB space.

## Proposed Solution

**Delete all 9 tables + all associated code (backend + frontend).**

### What gets deleted

**Core-api:**
- 4 Prisma models (`AiAbTest`, `AiAbTestResult`, `AiModelComparison`, `AiModelComparisonResult`) + `AbTestStatus` enum
- Back-relations on `User`, `Course`, `AiProvider` models
- 7 AB test methods from `LecturerAiController`
- `compareModels` method from `AdminAiController` + `AIService`
- 8 routes (7 AB test + 1 compare)
- Validators: AB test schemas + `aiCompareSchema`
- Tests: `admin-ai.controller.test.ts` compareModels tests

**Client-app:**
- Frontend pages: `lecturer/ai-settings.tsx`, `admin/ai-comparison.tsx`
- Controllers: `LecturerAISettingsController.php`, `LearningSessionController.php`, `SessionTemplateController.php`
- Model: `AiPreset.php`
- 5 migration files
- Routes in `web.php` (lecturer ai-settings, admin ai-comparison, session-templates, sessions)
- Nav items: "AI Comparison" in admin nav, shortcuts, global search entries

### What stays
- `ai_providers` — admin CRUD for AI providers
- `ai_usages` — usage stats + lecturer history
- `ai_chats`, `ai_chat_messages` — student AI chat
- Laravel framework tables (sessions, cache, jobs, etc.)
- `material_modules` — used by LecturerMaterialsController

## Scope

- **Core-api**: schema.prisma + controllers + services + routes + validators + tests
- **Client-app**: pages + controllers + models + migrations + routes + nav
- **VPS PostgreSQL**: drop 9 tables

## Out of Scope

- Fixing `module_id` missing from `course_materials` (separate issue)
- Removing `consent_records`, `data_retention_policies`, `escalation_states`, `export_jobs` (these have routes + controllers, may be used)
- Changing AI provider architecture

## Risk

- **Low**: All 9 tables have 0 rows. No data loss.
- **Low**: Features were never used (0 data proves it).
- **Medium**: Need to verify no hidden references to deleted code exist. Mitigated by TypeScript check + PHP syntax check.
