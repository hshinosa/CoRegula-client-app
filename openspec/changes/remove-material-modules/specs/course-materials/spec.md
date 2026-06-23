## ADDED Requirements

### Requirement: Materials grouped by course weeks

Materials are grouped exclusively via the `course_weeks` + `course_week_materials` pivot system. The legacy `material_modules` grouping system is removed entirely — no `material_modules` table, no `module_id` column on `course_materials`, and no module CRUD endpoints.

#### Scenario: Lecturer uploads material to course pool
- **WHEN** a lecturer uploads a file via the UnifiedMaterialsTab
- **THEN** the material is created in `course_materials` without any module assignment
- **AND** the material appears in the unassigned pool

#### Scenario: Lecturer assigns material to a week
- **WHEN** a lecturer assigns a pool material to a course week
- **THEN** a `course_week_materials` pivot row is created linking the material to the week
- **AND** the material no longer appears in the pool

#### Scenario: Lecturer removes material from a week
- **WHEN** a lecturer unassigns a material from a week
- **THEN** the `course_week_materials` pivot row is deleted
- **AND** the material returns to the unassigned pool

### Requirement: Material CRUD without module dependency

Material upload, update, delete, view tracking, and reindex operations do not reference `module_id` or `material_modules`.

#### Scenario: Material upload does not set module_id
- **WHEN** a lecturer uploads a material via `POST /lecturer/courses/{course}/materials`
- **THEN** the `CourseMaterial::create()` call does not include `module_id`
- **AND** no `MaterialModule` query is executed

#### Scenario: Material deletion does not reference modules
- **WHEN** a lecturer deletes a material via `DELETE /lecturer/courses/{course}/materials/{materialId}`
- **THEN** the material is deleted without any `module_id` update or `MaterialModule` lookup

### Requirement: No module_id in types or tests

TypeScript types and test schema setups do not include `module_id`.

#### Scenario: TypeScript CourseMaterial interface has no module_id
- **WHEN** the `CourseMaterial` interface is referenced in `resources/js/types/index.d.ts`
- **THEN** the interface does not include a `module_id` field

#### Scenario: Test schema setup has no module_id column
- **WHEN** a test creates a `course_materials` table in setup
- **THEN** the table schema does not include a `module_id` column
- **AND** the test does not set `module_id` on any material factory or insert

## REMOVED Requirements

### Requirement: Material module CRUD

**Reason**: The `material_modules` grouping system is fully replaced by `course_weeks` + `course_week_materials`. The `module_id` FK column was already dropped from `course_materials` by Prisma migration `20260612101423`, making all module code non-functional.

**Migration**: None required. Zero materials were linked to modules (column already dropped). All 84 materials are linked via `course_week_materials`. The `material_modules` table (42 orphaned rows) will be dropped.
