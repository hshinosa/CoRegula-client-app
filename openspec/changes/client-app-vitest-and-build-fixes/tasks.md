## 1. Pre-flight

- [ ] 1.1 Audit: `find tests -name "*.test.tsx" -o -name "*.test.ts" | grep -v node_modules`
- [ ] 1.2 Confirm Vitest currently finds them: `npx vitest run --reporter=default`
- [ ] 1.3 Note: CI uses Linux (case-sensitive)

## 2. Fix Vitest include pattern

- [ ] 2.1 Choose: rename to lowercase OR glob both cases
- [ ] 2.2 Update `vitest.config.ts`
- [ ] 2.3 Verify `npx vitest run` finds expected count

## 3. (If renaming) Move test files

- [ ] 3.1 `git mv tests/Unit/components/* tests/unit/components/`
- [ ] 3.2 `git mv tests/Unit/utils/* tests/unit/utils/`
- [ ] 3.3 Verify imports still resolve

## 4. Build pipeline

- [ ] 4.1 Update `package.json` build script to set `NODE_ENV=production` explicitly
- [ ] 4.2 Verify `vite.config.ts` `drop:` logic still triggers
- [ ] 4.3 Manual: `npm run build` and inspect bundle for console statements

## 5. CI workflow

- [ ] 5.1 Add `npm run test:unit` to CI workflow
- [ ] 5.2 Verify Linux runner discovers tests
- [ ] 5.3 Add build step with NODE_ENV check

## 6. Tests

- [ ] 6.1 Snapshot test count before/after
- [ ] 6.2 Verify CI run executes >0 frontend tests

## 7. Verify

- [ ] 7.1 `npx vitest run` finds 5+ component tests
- [ ] 7.2 `npm run build` produces console-free bundle
- [ ] 7.3 `openspec validate client-app-vitest-and-build-fixes --strict`
