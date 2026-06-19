## Why

The Kolabri client-app build process is broken, preventing reliable development and deployment. Running `tsc --noEmit` fails with 65 type errors across 10 files, and 2 vitest tests fail. These issues stem from an incomplete refactor (deleted components still referenced), pre-existing type mismatches (modal prop inconsistencies, null-safety gaps, field name errors), misconfigured TypeScript (missing test globals), and stale tests. The build must be restored to a clean, passing state to unblock further work and ensure type safety.

## What Changes

- **Fix WIP-incomplete-refactor issues**: Restore missing component definitions and derived data arrays deleted during an incomplete refactor of the reflections page and AI chat modal
- **Fix pre-existing modal prop-type bugs**: Reconcile ConfirmDialog and BaseModal prop interfaces with their callsites across chat, profile, and AI chat pages (fix `onClose`/`closeOnBackdropClick` mismatches)
- **Fix pre-existing type bugs**: Add null-guards for viewport access, forward drag handlers properly through LiquidGlassCard, rename `isRelevant` to `is_relevant`, define missing `clearDraft`, coalesce null-to-undefined for avatar uploads, and address generated routes file symbol collision
- **Fix env/config issue**: Add `vitest/globals` to tsconfig `types` array so tsc recognizes test globals without breaking vitest runs
- **Fix stale-test issues**: Route JWT-bearing API call through BFF proxy instead of direct Core API access (architecture violation), and update PasswordStrengthMeter test to match current hint copy
- **Document prerequisite**: Record that `tsconfig.json`'s invalid `"ignoreDeprecations": "6.0"` was already removed as a completed prerequisite step

All 65 tsc errors and 2 vitest failures will be resolved. No speculative cleanup or new features.

## Capabilities

### New Capabilities
- `client-app-build-health`: Restore TypeScript type-checking and vitest test suite to passing state by fixing incomplete refactor artifacts, modal prop mismatches, pre-existing type bugs, missing test globals config, and stale test violations
