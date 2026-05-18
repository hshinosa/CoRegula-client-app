## 1. Pre-flight

- [ ] 1.1 Confirm `client-app-bff-boundary-enforcement` is COMPLETE
- [ ] 1.2 Run baseline: `vendor/bin/phpunit`, `npm run test`
- [ ] 1.3 Audit token usage: `grep -rn 'getAuthToken\|@/lib/auth' resources/js/`

## 2. Audit remaining getAuthToken callers

- [ ] 2.1 Confirm all callers are Socket.IO setup (allowed)
- [ ] 2.2 Document each caller with comment "// Socket.IO auth handshake"

## 3. Rename for clarity

- [ ] 3.1 Rename `getAuthToken.ts` → `getSocketAuthToken.ts`
- [ ] 3.2 Rename function `getAuthToken` → `getSocketAuthToken`
- [ ] 3.3 Update all 3-4 import sites
- [ ] 3.4 Update endpoint name to `/api/auth/socket-token` (optional, breaks core-api compat — coordinate)

## 4. Remove legacy auth.ts

- [ ] 4.1 Verify `resources/js/lib/auth.ts` has no live references (grep imports)
- [ ] 4.2 Delete `resources/js/lib/auth.ts`
- [ ] 4.3 Remove import from `resources/js/app.tsx:15`
- [ ] 4.4 Remove any related types/exports

## 5. Optional: short-TTL socket token

- [ ] 5.1 Add new endpoint `/api/auth/socket-token` returning JWT with 1-hour TTL specifically for socket
- [ ] 5.2 Add audience claim `aud: 'socket'` to socket-scoped token
- [ ] 5.3 Update Core API auth middleware to verify audience for socket connections

## 6. Documentation

- [ ] 6.1 Create `docs/security/jwt-handling.md` documenting BFF rule + Socket.IO exception
- [ ] 6.2 Update CLAUDE.md / AGENTS.md if applicable

## 7. Static analysis safeguard

- [ ] 7.1 Add test: `grep -rn 'VITE_API_BASE_URL' resources/js/pages/` returns 0 results
- [ ] 7.2 Add test: `getSocketAuthToken` only imported from socket setup files

## 8. Verify

- [ ] 8.1 All tests passing
- [ ] 8.2 Manual: verify `/api/auth/token` (or renamed endpoint) is only hit during socket connect
- [ ] 8.3 `openspec validate client-app-token-exposure-reduction --strict`
