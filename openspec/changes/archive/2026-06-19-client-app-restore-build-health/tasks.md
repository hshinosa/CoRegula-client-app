## 0. Prerequisite (Already Complete)

- [x] 0.1 Document that `tsconfig.json` invalid `"ignoreDeprecations": "6.0"` (incompatible with TS 5.9.2) was already removed, unblocking tsc execution

## 1. Fix WIP-Incomplete-Refactor Issues (13 errors)

- [x] 1.1 In `resources/js/pages/student/reflections/index.tsx`, import `EmptyState` from `@/components/ui/EmptyState` to resolve TS2304 errors at lines 325 and 336
- [x] 1.2 In `resources/js/pages/student/reflections/index.tsx`, add `useMemo` deriving `sessionReflections` from `filteredReflections.filter(r => r.type === 'session')` to resolve TS2304 errors at lines 349, 354, 358
- [x] 1.3 In `resources/js/pages/student/reflections/index.tsx`, add `useMemo` deriving `weeklyReflections` from `filteredReflections.filter(r => r.type === 'weekly')` to resolve TS2304 errors at lines 430, 435, 439
- [x] 1.4 In `resources/js/pages/student/reflections/index.tsx`, add explicit types to `.map((reflection: Reflection, index: number) => ...)` callback parameters at lines 358 and 439 to resolve TS7006 implicit any errors
## 2. Fix Pre-Existing Modal Prop-Type Bugs (5 errors)
VERIFIED FACTS (read from source): `ConfirmDialogProps` (resources/js/components/ui/ConfirmDialog.tsx:4-14) exposes `onCancel`, NOT `onClose` — it already wires `<BaseModal onClose={onCancel}>` internally. `BaseModalProps` (resources/js/components/ui/BaseModal.tsx:6-15) exposes `onClose` and `closeOnOverlayClick` (NOT `closeOnBackdropClick`). Therefore all three ConfirmDialog callsites passing `onClose` must rename to `onCancel`, and the BaseModal callsite passing `closeOnBackdropClick` must rename to `closeOnOverlayClick`. NO interface changes needed.
- [x] 2.1 In `resources/js/pages/student/chat/room.tsx` at line 3162, rename the `onClose=` prop passed to `<ConfirmDialog>` to `onCancel=` (ConfirmDialogProps has `onCancel`, not `onClose`)
- [x] 2.2 In `resources/js/pages/student/profile/components/AvatarSection.tsx` at line 325 AND in `resources/js/pages/student/ai-chat/index.tsx` at line 934, rename the `onClose=` prop passed to `<ConfirmDialog>` to `onCancel=` (same reason as 2.1; supersedes former task 1.5)
- [x] 2.3 In `resources/js/pages/student/chat/room.tsx` at line 3049, rename the `closeOnBackdropClick` prop to `closeOnOverlayClick` (the correct prop name on BaseModalProps) to fix TS2322 error

## 3. Fix Pre-Existing Type Bugs - Other (12 errors)

- [x] 3.1 In `resources/js/pages/student/chat/room.tsx`, add null-guard checks before accessing `viewport` properties at lines 1395, 1399, 1402 (e.g., `if (viewport) { ... }` or optional chaining `viewport?.`) to resolve TS18047 "possibly null" errors
- [x] 3.2 In `resources/js/components/lecturer/UnifiedMaterialsTab.tsx` at lines 685 and 689, wrap `LiquidGlassCard` in a `<div>` element and attach `onDragOver` and `onDrop` handlers to the div instead of passing them as props (LiquidGlassCard does not accept these props) to fix TS2322 and TS7006 errors
- [x] 3.3 In `resources/js/components/chat/ChatMessageList.tsx` at line 156, rename property access from `isRelevant` to `is_relevant` (correct field name per message type definition) to fix TS2551 error
- [x] 3.4 In `resources/js/pages/student/chat/index.tsx` at line 630, either define the missing `clearDraft` function in scope or remove/replace the call to fix TS2304 error (investigate component logic to determine correct fix)
- [x] 3.5 In `resources/js/pages/student/profile/components/AvatarSection.tsx` at line 243, coalesce `string | null` to `string | undefined` using `?? undefined` operator to match expected type and fix TS2322 error
- [x] 3.6 In `resources/js/pages/student/profile/components/AvatarUpload.tsx` at line 254, coalesce `string | null` to `string | undefined` using `?? undefined` operator to match expected type and fix TS2322 error
- [x] 3.7 In `resources/js/routes/lecturer/ai-settings/index.ts`, resolve symbol collision between imported `history` (line 2) and local `history` declaration (line 246) by either renaming the import, renaming the local variable, or regenerating the file to fix TS2440 and TS2395 errors

## 4. Fix env/config Issue (36 errors)

- [x] 4.1 In `tsconfig.json`, add `"types": ["vitest/globals"]` to `compilerOptions` object so tsc recognizes `describe`, `it`, `expect` globals in test files, fixing all 36 TS2593/TS2304 errors in `resources/js/__tests__/sanitize.test.ts` (lines vary - all `describe`/`it`/`expect` references)

## 5. Fix Stale-Test vs New-Code Issues (2 test failures)

- [x] 5.1 In `resources/js/pages/student/chat/room.tsx` around line 1548, the fetch already targets a BFF endpoint (`/api/discussion-direction/summary`, served by Laravel) — the ONLY BFF-boundary violation is the client-side `'Authorization': \`Bearer ${jwtToken}\`` header. Remove that header line (and the `jwtToken` reference if it becomes unused) so the request relies on server-side session auth in the BFF controller. This resolves the `architecture-guards.test.ts` > 'forbids Authorization Bearer with jwtToken in pages' failure. Do NOT create any new endpoint — `/api/discussion-direction/summary` already exists server-side.
- [x] 5.4 In `tests/Unit/components/ui/PasswordStrengthMeter.test.tsx`, update the test case "shows Lemah for a password that only meets one rule" to match the current hint copy rendered by the PasswordStrengthMeter component (read actual component output first, then update test regex) to fix test failure

## 6. Verification

- [x] 6.1 Run `tsc --noEmit` from project root and verify exit code 0 with zero errors (confirm all 65 type errors resolved)
- [x] 6.2 Run `npm run test` and verify all tests pass with zero failures (confirm both architecture-guard and PasswordStrengthMeter tests pass)
- [x] 6.3 Review tsc and vitest output to confirm no regressions introduced by fixes
