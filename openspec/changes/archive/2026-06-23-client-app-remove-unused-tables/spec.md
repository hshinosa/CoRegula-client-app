# Spec: No Unused Tables or Dead Code

## Requirement: Removed tables SHALL NOT exist in database

After migration, the following tables SHALL NOT exist in `public` schema:
- `ai_ab_tests`
- `ai_ab_test_results`
- `ai_model_comparisons`
- `ai_model_comparison_results`
- `ai_presets`
- `saved_reports`
- `shared_reports`
- `learning_sessions`
- `session_templates`

### Scenario: Database inspection after migration

- **WHEN** `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('ai_ab_tests', 'ai_ab_test_results', 'ai_model_comparisons', 'ai_model_comparison_results', 'ai_presets', 'saved_reports', 'shared_reports', 'learning_sessions', 'session_templates')` is executed
- **THEN** it SHALL return 0 rows

## Requirement: Removed Prisma models SHALL NOT exist in schema

The `schema.prisma` file SHALL NOT contain models: `AiAbTest`, `AiAbTestResult`, `AiModelComparison`, `AiModelComparisonResult`, or enum `AbTestStatus`.

### Scenario: Prisma generate succeeds

- **WHEN** `npx prisma generate` is run
- **THEN** it SHALL succeed without errors
- **AND** the Prisma client SHALL NOT have properties `aiAbTest`, `aiAbTestResult`, `aiModelComparison`, `aiModelComparisonResult`

## Requirement: Removed routes SHALL NOT exist

### Scenario: AB test routes return 404

- **WHEN** `GET /api/lecturer/ai/ab-tests` is requested
- **THEN** it SHALL return 404

### Scenario: Model comparison route returns 404

- **WHEN** `POST /api/admin/ai-compare` is requested
- **THEN** it SHALL return 404

## Requirement: Removed frontend pages SHALL NOT exist

### Scenario: Lecturer AI settings page removed

- **WHEN** `GET /lecturer/ai-settings` is requested
- **THEN** it SHALL return 404 (route removed)

### Scenario: Admin AI comparison page removed

- **WHEN** `GET /admin/ai-comparison` is requested
- **THEN** it SHALL return 404 (route removed)

## Requirement: TypeScript and PHP SHALL compile without errors

### Scenario: Core-api TypeScript

- **WHEN** `npx tsc --noEmit` is run in core-api
- **THEN** it SHALL succeed with 0 errors

### Scenario: Client-app TypeScript

- **WHEN** `npx tsc --noEmit` is run in client-app
- **THEN** it SHALL succeed with 0 errors

## Requirement: Application SHALL remain functional

### Scenario: AI chat still works

- **WHEN** a student sends a message to AI chat
- **THEN** the AI SHALL respond (ai_chats, ai_chat_messages untouched)

### Scenario: Admin AI provider management still works

- **WHEN** admin accesses `/admin/ai-settings`
- **THEN** provider CRUD SHALL work (ai_providers untouched)

### Scenario: Usage stats still work

- **WHEN** admin views usage stats
- **THEN** data SHALL display (ai_usages untouched)
