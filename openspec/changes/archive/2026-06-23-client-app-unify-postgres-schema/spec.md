# Spec: Single PostgreSQL Schema

## Requirement: All tables SHALL exist in `public` schema only

The PostgreSQL database SHALL have a single schema (`public`) for all tables managed by both Prisma (core-api) and Laravel (client-app). The `app` schema SHALL NOT exist after migration.

### Scenario: No duplicate schema

- **WHEN** the database is inspected
- **THEN** `SELECT schemaname FROM pg_tables WHERE schemaname = 'app'` SHALL return 0 rows
- **AND** all Laravel-managed tables (attendance_sessions, material_views, sessions, etc.) SHALL exist in `public`

### Scenario: Laravel migrations tracked in public

- **WHEN** `php artisan migrate:status` is run
- **THEN** all migrations SHALL show as "ran" against the `public` schema
- **AND** the `migrations` table SHALL exist in `public` (not `app`)

## Requirement: Overlapping tables SHALL use Prisma's column types

Tables that exist in both Prisma and Laravel migrations (`course_weeks`, `course_week_materials`, `chat_messages`) SHALL retain Prisma's `TEXT` column types. Laravel migrations SHALL skip these tables via `if (!Schema::hasTable(...))`.

### Scenario: course_weeks uses TEXT id

- **WHEN** `course_weeks` table is inspected
- **THEN** the `id` column SHALL be `TEXT` (not native `uuid`)
- **AND** Prisma `$queryRaw` with `::text` casts SHALL work correctly

## Requirement: course_materials SHALL include Laravel-specific columns

The `course_materials` table SHALL include all columns from both Prisma and Laravel schemas: `id`, `course_id`, `title`, `file_name`, `file_path`, `module_id`, `description`, `file_type`, `file_size`, `uploaded_by`, `view_count`, `sort_order`, `timestamps`.

### Scenario: Material views tracking works

- **WHEN** a student views a course material
- **THEN** `material_views` table SHALL record the view in `public.material_views`
- **AND** `course_materials.view_count` SHALL be available for increment

## Requirement: DB_SCHEMA config SHALL be `public`

Both `.env` and `.env.example` SHALL set `DB_SCHEMA=public`.

### Scenario: New deployment uses public schema

- **WHEN** a fresh deployment is configured
- **THEN** `DB_SCHEMA=public` SHALL be the default in `.env.example`
- **AND** Laravel migrations SHALL target the `public` schema
