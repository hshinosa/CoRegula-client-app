## ADDED Requirements

### Requirement: TypeScript Compilation Passes Without Errors

The client-app codebase MUST compile successfully when running `tsc --noEmit`, with zero type errors reported. All TypeScript files in the `resources/js/` directory tree MUST satisfy the compiler's type-checking rules configured in `tsconfig.json`.

#### Scenario: Running tsc with no emit flag produces zero errors
- **WHEN** a developer runs `tsc --noEmit` from the project root
- **THEN** the TypeScript compiler exits with code 0
- **AND** no error messages are printed to stderr
- **AND** no "error TS" diagnostic codes appear in the output

#### Scenario: Previously failing files now compile cleanly
- **WHEN** tsc type-checks files that previously had errors (reflections/index.tsx, chat/room.tsx, profile/components/AvatarSection.tsx, ai-chat/index.tsx, lecturer/UnifiedMaterialsTab.tsx, chat/ChatMessageList.tsx, chat/index.tsx, profile/components/AvatarUpload.tsx, routes/lecturer/ai-settings/index.ts, __tests__/sanitize.test.ts)
- **THEN** each file has zero type errors
- **AND** all symbol references resolve to declared identifiers
- **AND** all property accesses match their type definitions
- **AND** all function calls satisfy parameter type constraints

### Requirement: Test Suite Passes Without Failures

The vitest test suite MUST run to completion with all tests passing when executing `npm run test`. No test cases MUST be in a failing state, and no test files MUST be skipped due to configuration issues.

#### Scenario: Running vitest produces zero test failures
- **WHEN** a developer runs `npm run test`
- **THEN** vitest exits with code 0
- **AND** all test suites complete successfully
- **AND** the summary line shows "X passed" with no "failed" or "skipped" counts

#### Scenario: Architecture guard test enforces BFF boundary
- **WHEN** the test suite runs `tests/Unit/static/architecture-guards.test.ts`
- **THEN** the test "forbids Authorization Bearer with jwtToken in pages" MUST pass
- **AND** no page-level files MUST contain patterns matching raw JWT Authorization headers to Core API

#### Scenario: UI component tests match current implementation
- **WHEN** the test suite runs `tests/Unit/components/ui/PasswordStrengthMeter.test.tsx`
- **THEN** all test cases MUST pass
- **AND** assertions about rendered copy MUST match the actual component output

### Requirement: Incomplete Refactor Artifacts Are Resolved

Files affected by an incomplete refactor (where component definitions were deleted but references remain) MUST be restored to a compilable state by re-introducing minimal missing symbols or imports. The resolution MUST NOT revert or complete the refactor itself, only fix the immediate compilation failures.

#### Scenario: Reflections page has all required symbols defined
- **WHEN** TypeScript compiles `resources/js/pages/student/reflections/index.tsx`
- **THEN** the `EmptyState` component MUST be imported or defined
- **AND** the `sessionReflections` derived array MUST be defined (splitting `filteredReflections` by type === 'session')
- **AND** the `weeklyReflections` derived array MUST be defined (splitting `filteredReflections` by type === 'weekly')
- **AND** all `.map((reflection, index) => ...)` callbacks MUST have explicit parameter types

#### Scenario: AI chat modal has valid ConfirmDialog usage
- **WHEN** TypeScript compiles `resources/js/pages/student/ai-chat/index.tsx` at line 934
- **THEN** the ConfirmDialog component MUST accept the props being passed
- **OR** the callsite MUST use only props defined in ConfirmDialogProps

### Requirement: Modal Component Prop Types Match Callsite Usage

Modal UI components (ConfirmDialog, BaseModal) MUST have prop type definitions that accept all props passed by their callsites across the codebase. Callsites MUST NOT pass props that do not exist on the component's interface.

#### Scenario: ConfirmDialog accepts onClose prop
- **WHEN** TypeScript type-checks files passing `onClose` to ConfirmDialog (chat/room.tsx:3162, profile/components/AvatarSection.tsx:325, ai-chat/index.tsx:934)
- **THEN** the ConfirmDialogProps interface MUST include an `onClose?: () => void` property
- **OR** callsites MUST be updated to use `onCancel` instead

#### Scenario: BaseModal callsites use correct overlay-click prop name
- **WHEN** TypeScript type-checks `resources/js/pages/student/chat/room.tsx` at line 3049
- **THEN** the callsite MUST pass `closeOnOverlayClick` (not `closeOnBackdropClick`)
- **AND** BaseModalProps already defines `closeOnOverlayClick?: boolean`

### Requirement: Null-Safety Guards Prevent Runtime Errors

Code paths that access potentially-null values MUST include appropriate null-checks before dereferencing properties or calling methods. The TypeScript compiler's strictNullChecks MUST be satisfied.

#### Scenario: Viewport access in chat room is null-safe
- **WHEN** TypeScript type-checks `resources/js/pages/student/chat/room.tsx` at lines 1395, 1399, 1402
- **THEN** the `viewport` variable MUST be checked for null before accessing its properties
- **AND** no TS18047 errors ("possibly null") MUST be reported

### Requirement: Component Prop Forwarding Matches Prop Definitions

When a component receives event-handler props (e.g., drag handlers), either the component's prop interface MUST declare those props, or the handlers MUST be attached to a wrapping element instead of passed as props.

#### Scenario: LiquidGlassCard drag handlers are properly attached
- **WHEN** TypeScript type-checks `resources/js/components/lecturer/UnifiedMaterialsTab.tsx` at lines 685 & 689
- **THEN** `onDragOver` and `onDrop` handlers MUST NOT cause TS2322 errors
- **AND** handler callback parameters MUST NOT be implicit any (TS7006)
- **AND** either LiquidGlassCard declares these props in its interface, or the handlers are moved to a wrapping div

### Requirement: Property Names Match Type Definitions

When accessing object properties, the property name used MUST exactly match the name defined in the type or interface. Mismatched names (e.g., camelCase vs. snake_case) MUST be corrected.

#### Scenario: ChatMessageList uses correct relevance field name
- **WHEN** TypeScript type-checks `resources/js/components/chat/ChatMessageList.tsx` at line 156
- **THEN** the code MUST reference `is_relevant` (not `isRelevant`)
- **AND** the field name MUST match the definition in the message type

### Requirement: All Referenced Functions Are Defined

All function calls MUST resolve to a declared function in scope. No undefined function references MUST remain in the codebase.

#### Scenario: Chat index page has clearDraft defined
- **WHEN** TypeScript type-checks `resources/js/pages/student/chat/index.tsx` at line 630
- **THEN** a `clearDraft` function MUST be defined in scope
- **OR** the call MUST be removed or replaced with a valid alternative

### Requirement: Type Coercion Matches Expected Types

When passing values between functions with strict type constraints, the value's type MUST exactly match the parameter's type. If a type accepts `undefined` but not `null`, null values MUST be coerced to undefined.

#### Scenario: Avatar components coalesce null to undefined
- **WHEN** TypeScript type-checks `resources/js/pages/student/profile/components/AvatarSection.tsx` at line 243 and `AvatarUpload.tsx` at line 254
- **THEN** `string | null` values MUST be coerced to `string | undefined` (e.g., via `?? undefined`)
- **AND** no TS2322 type-mismatch errors MUST occur

### Requirement: Generated Code Does Not Conflict With Local Declarations

Auto-generated code files (e.g., route definitions) MUST NOT introduce symbol name collisions with variables declared in the same scope.

#### Scenario: AI settings routes file has no symbol collisions
- **WHEN** TypeScript type-checks `resources/js/routes/lecturer/ai-settings/index.ts` at lines 2 and 246
- **THEN** the imported `history` symbol MUST NOT conflict with a local `history` declaration
- **AND** no TS2440 or TS2395 errors MUST be reported
- **AND** either the import is renamed, the local declaration is renamed, or the file is regenerated

### Requirement: Test Files Have Access To Test Framework Globals

TypeScript MUST recognize test framework globals (`describe`, `it`, `expect`) when type-checking test files. The `tsconfig.json` configuration MUST include type declarations for the test runner's global API.

#### Scenario: TypeScript recognizes vitest globals in test files
- **WHEN** tsc type-checks files in `resources/js/__tests__/` directory
- **THEN** test functions like `describe`, `it`, `expect` MUST NOT produce TS2593 or TS2304 "not found" errors
- **AND** `tsconfig.json` `compilerOptions.types` array MUST include `"vitest/globals"`
- **AND** vitest continues to run successfully (no behavioral change)

### Requirement: BFF Boundary Prevents Direct JWT Usage From Pages

Page-level code (files in `resources/js/pages/`) MUST NOT send raw JWT tokens in Authorization headers directly to Core API. All Core API calls from pages MUST be proxied through Laravel BFF endpoints that attach authentication server-side.

#### Scenario: Chat room vector search routes through BFF
- **WHEN** the architecture guard test inspects `resources/js/pages/student/chat/room.tsx`
- **THEN** line 1548 (or equivalent fetch/axios call) MUST NOT contain `'Authorization': \`Bearer ${jwtToken}\``
- **AND** the call MUST instead target a Laravel BFF endpoint (e.g., `/api/chat/vector-search`)
- **AND** the BFF endpoint MUST forward the request to Core API with server-side JWT attachment

### Requirement: Test Assertions Match Current Component Behavior

Test expectations (assertion predicates, expected output strings, DOM queries) MUST accurately reflect the current implementation's behavior. When UI copy or component structure changes, corresponding tests MUST be updated.

#### Scenario: PasswordStrengthMeter test matches current hint copy
- **WHEN** vitest runs `tests/Unit/components/ui/PasswordStrengthMeter.test.tsx`
- **THEN** the test case "shows Lemah for a password that only meets one rule" MUST pass
- **AND** the test's expected-copy regex MUST match the hint text actually rendered by the component

### Requirement: Prerequisite Configuration Fixes Are Documented

The removal of invalid `tsconfig.json` configuration that blocked all tsc invocations MUST be documented as a completed prerequisite step, so the change history is complete and auditable.

#### Scenario: Proposal acknowledges tsconfig fix
- **WHEN** a developer reads the proposal or design artifacts
- **THEN** the documents MUST note that `"ignoreDeprecations": "6.0"` was invalid for TS 5.9.2 and has already been removed
- **AND** the 65 tsc errors discussed are those surfaced AFTER that fix was applied
