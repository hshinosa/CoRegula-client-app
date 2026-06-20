## Context

The Kolabri client-app codebase is currently unbuildable. A recent large uncommitted refactor (+24/-702 lines across 12 files) deleted three component files but left references to their symbols in place. Additionally, multiple pre-existing type bugs have accumulated: modal components have prop-interface mismatches with their callsites, null-safety issues exist in chat viewport access, and field names differ between definition and usage. The TypeScript configuration also lacks test-runner type declarations, causing tsc to reject test files that vitest runs successfully. Finally, two vitest tests fail: one correctly catches an architecture violation (direct JWT use from a page), and another has stale assertion copy.

The `tsconfig.json` file contained an invalid `"ignoreDeprecations": "6.0"` option (invalid for TS 5.9.2) that aborted tsc immediately; this has already been removed as a prerequisite. With that blocker gone, `tsc --noEmit` now surfaces the 65 real errors that must be fixed.

**Stakeholders**: All client-app developers blocked by build failures; deployment pipeline requiring clean type-checks.

**Current state**: 65 tsc errors across 10 files; 2 vitest test failures; uncommitted WIP refactor in working tree.

**Constraints**: Do not introduce new abstractions or libraries. Fix only diagnosed issues. Leave uncommitted refactor in place (do not commit or revert it). Respect BFF boundary rule (no raw JWT from pages to Core API).

## Goals / Non-Goals

**Goals:**
- Restore `tsc --noEmit` to zero errors (all 65 fixed)
- Restore `npm run test` to passing (2 test failures fixed)
- Document the already-completed tsconfig fix as context
- Classify each issue by root cause for maintainability

**Non-Goals:**
- Committing or reverting the WIP refactor (leave working tree as-is)
- Refactoring modal component architecture beyond minimal prop-type fixes
- Adding new testing infrastructure or coverage
- Speculative cleanup, linting, or formatting changes
- Performance optimization or feature work

## Decisions

### Decision 1: Single capability vs. split specs
**Choice**: Use one capability `client-app-build-health` covering all fixes.

**Rationale**: All 67 issues share the same root goal (restore build health) and same verification command (`tsc --noEmit` and `npm run test`). Splitting into `frontend-typecheck-health` and `bff-boundary-and-ui-tests` would create artificial boundaries; the architecture-guard test failure and PasswordStrengthMeter copy mismatch are both build-health concerns, not separate feature tracks.

**Alternatives considered**:
- Two capabilities (typecheck + tests): Rejected because tasks would still reference the same files and the change is conceptually atomic (make build pass).
- Three capabilities (WIP-refactor, pre-existing bugs, config): Rejected because decomposition by root-cause category belongs in tasks.md grouping, not spec-level splits.

### Decision 2: Modal prop-type reconciliation strategy
**Choice**: Modify modal component prop interfaces to accept the props callsites are already passing (`onClose` for ConfirmDialog, keep `closeOnOverlayClick` for BaseModal), rather than updating every callsite.

**Rationale**: 
- ConfirmDialog has 4 callsites passing `onClose`; the component internally maps `onCancel` → BaseModal's `onClose`, so adding an `onClose` prop that aliases `onCancel` is the minimal fix.
- BaseModal already HAS `closeOnOverlayClick`; the error is callsites passing the wrong name `closeOnBackdropClick`. Fix: rename prop at callsites.
- Updating component interfaces preserves existing behavior and minimizes diff size.

**Alternatives considered**:
- Update all callsites to use correct prop names: Rejected for ConfirmDialog (4 callsites vs. 1 component); accepted for BaseModal (typo correction is clearer than aliasing a synonym).

### Decision 3: EmptyState and derived reflection arrays
**Choice**: 
- Import `EmptyState` from `@/components/ui/EmptyState` (exists elsewhere in codebase).
- Re-derive `sessionReflections` and `weeklyReflections` as `useMemo` splitting `filteredReflections` by `reflection.type`.

**Rationale**: The refactor deleted local definitions but left usage intact. The `EmptyState` component exists globally (confirmed via search). The reflection-splitting logic was removed but the JSX still maps over the split arrays; restoring the `useMemo` derivation is the minimal fix that preserves intended UI (separate session vs. weekly sections).

**Alternatives considered**:
- Create a new local EmptyState component: Rejected because a global one exists.
- Merge session/weekly sections into one: Rejected because the JSX structure (two separate `.map` blocks) encodes intentional UI separation.

### Decision 4: LiquidGlassCard drag-handler forwarding
**Choice**: Wrap the `LiquidGlassCard` in a `<div>` that receives `onDragOver` and `onDrop`, rather than modifying the component's prop interface.

**Rationale**: `LiquidGlassCard` is a pure presentation component used in 40+ places across the codebase. Adding drag-handler props for one callsite (UnifiedMaterialsTab.tsx:685) would pollute the interface. Wrapping in a `div` isolates the drag behavior to the one place that needs it.

**Alternatives considered**:
- Add `onDragOver`/`onDrop` to LiquidGlassCard props: Rejected due to wide usage (40+ callsites); not worth the API surface expansion.

### Decision 5: tsconfig types array for vitest globals
**Choice**: Add `"types": ["vitest/globals"]` to `compilerOptions` in `tsconfig.json`.

**Rationale**: `vitest.config.ts` has `globals: true`, so vitest injects `describe`/`it`/`expect` at runtime. But tsc doesn't know about them without the type declarations. Adding `vitest/globals` to the `types` array gives tsc the ambient declarations it needs without changing how vitest runs.

**Trade-off**: Test globals become available to ALL files type-checked by this tsconfig (not just test files). This is acceptable because the repo uses a single tsconfig for both source and tests, and developers expect test globals in test files. If source files accidentally use test globals, tsc will catch it at build time (unused import / implicit any).

**Alternatives considered**:
- Separate `tsconfig.test.json` extending base config: Rejected because the repo doesn't currently use split configs; introducing one is scope creep.
- Exclude test files from tsc: Rejected because type-checking tests catches real bugs (e.g., wrong field names in assertions).

### Decision 6: JWT architecture violation (chat/room.tsx:1548)
**Choice**: Route the API call through a new Laravel BFF endpoint `/api/chat/vector-search` instead of using `Authorization: Bearer ${jwtToken}` directly from the page.

**Rationale**: The BFF boundary rule forbids raw JWT from pages to Core API. The architecture-guard test is correct and must stay. The fix requires adding a BFF proxy endpoint that accepts the request from the page, attaches the JWT server-side, and forwards to Core API.

**Alternatives considered**:
- Suppress the test: Rejected because it enforces a core security constraint (JWT tokens should not be exposed to client-side code paths where they can be logged/leaked).
- Use a different auth mechanism: Rejected because Core API requires JWT; the BFF proxy is the intended pattern for all page-to-Core communication.

### Decision 7: PasswordStrengthMeter test copy
**Choice**: Read the actual rendered hint copy from the component, then update the test's regex to match it.

**Rationale**: The test is stale; the component's copy changed but the test was not updated. This is a maintenance task, not a functional bug. The test should reflect the current UI copy.

**Alternatives considered**:
- Remove the test: Rejected because it validates that the PasswordStrengthMeter shows hints for weak passwords.

## Risks / Trade-offs

**Risk: Uncommitted refactor interferes with fixes**
- **Impact**: Medium. The refactor deleted files and left dangling references; fixing those references might conflict with the refactor's intended end-state.
- **Mitigation**: The spec explicitly restores only the minimal symbols needed to make current code compile (EmptyState import, derived arrays). If the refactor is later completed, those additions can be removed as part of that work.

**Risk: Modal prop-type fixes introduce behavioral drift**
- **Impact**: Low. Adding `onClose` to ConfirmDialog as an alias for `onCancel` might confuse future developers about which prop to use.
- **Mitigation**: Document in code comments that `onClose` is an alias for `onCancel` and prefer `onCancel` for new code.

**Risk: Test globals in tsconfig pollute source type-checking**
- **Impact**: Low. Source files could accidentally use `describe`/`it`/`expect` and tsc would not flag them as errors.
- **Mitigation**: Linters and code review catch accidental test-global usage. If it becomes a problem, split tsconfig later (not in this change).

**Risk: BFF proxy endpoint adds latency**
- **Impact**: Low. The vector-search call already crosses the network twice (page → Core API). Adding a BFF hop is consistent with all other page-to-Core calls.
- **Mitigation**: None needed; the BFF pattern is the standard architecture.

**Trade-off: Fixing symptoms vs. refactoring modal architecture**
- **Decision**: Fix symptoms (prop-type mismatches) rather than redesigning modal components.
- **Rationale**: The goal is build health, not modal architecture. A larger refactor would expand scope and delay unblocking developers.
