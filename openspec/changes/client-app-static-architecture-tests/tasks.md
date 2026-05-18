## 1. Pre-flight

- [ ] 1.1 Verify Vitest config includes test pattern that picks up `tests/static/**`
- [ ] 1.2 Decide ALLOWED_FILES whitelist for socket-related JWT exceptions

## 2. No-direct-Core test

- [ ] 2.1 Create `tests/static/no-direct-core-calls.test.ts`
- [ ] 2.2 List forbidden patterns (Authorization Bearer, VITE_API_URL fetch, etc.)
- [ ] 2.3 Whitelist socket auth files
- [ ] 2.4 Verify test FAILS on current code (proves it works)
- [ ] 2.5 After BFF enforcement implemented, test should PASS

## 3. No-legacy-auth test

- [ ] 3.1 Create `tests/static/no-legacy-auth.test.ts`
- [ ] 3.2 Check `app.tsx` does not import `setupAxiosInterceptors`
- [ ] 3.3 Check no other files import from `@/lib/auth`
- [ ] 3.4 Verify FAILS on current code

## 4. Test discovery coverage test

- [ ] 4.1 Create `tests/static/test-discovery-coverage.test.ts`
- [ ] 4.2 Glob `tests/Unit/**/*.test.{ts,tsx}` — assert count > 5
- [ ] 4.3 Glob `resources/js/features/**/*.test.{ts,tsx}` — assert count > 2

## 5. Vitest config

- [ ] 5.1 Verify `tests/static/**` matches existing include pattern
- [ ] 5.2 Optionally add `test:static` script in `package.json`

## 6. Verify

- [ ] 6.1 `npx vitest run tests/static` runs all static tests
- [ ] 6.2 Tests fail in current state (proves coverage), green only after BFF fixes
- [ ] 6.3 `openspec validate client-app-static-architecture-tests --strict`
