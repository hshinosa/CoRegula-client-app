## 1. Pre-flight

- [ ] 1.1 Run baseline: `npm run test`, `vendor/bin/phpunit`, `npx playwright test`
- [ ] 1.2 Audit direct-Core calls: `grep -rn 'VITE_API_BASE_URL\|getAuthToken' resources/js/pages/`
- [ ] 1.3 Identify Core endpoint for each site

## 2. Pilot: lecturer analytics refresh

- [ ] 2.1 Add Laravel route `lecturer.analytics.refresh`
- [ ] 2.2 Add `LecturerAnalyticsController::refresh` proxying via `apiRequest()`
- [ ] 2.3 Update `pages/lecturer/analytics/index.tsx:225` to call Laravel route
- [ ] 2.4 Run analytics e2e test

## 3. Admin user export

- [ ] 3.1 Add Laravel route + controller for `/admin/users/export`
- [ ] 3.2 Stream binary response (CSV)
- [ ] 3.3 Update `pages/admin/user-management.tsx:712`

## 4. Admin master data export

- [ ] 4.1 Same pattern for `master-data.tsx:1140`

## 5. Student reflection submit

- [ ] 5.1 Same pattern for `chat/room.tsx:751`

## 6. AI chat stream (most complex)

- [ ] 6.1 Add Laravel route for AI chat stream proxy
- [ ] 6.2 Implement streaming proxy via Guzzle (NOT Laravel HTTP client which buffers)
- [ ] 6.3 Forward `text/event-stream` headers
- [ ] 6.4 Update `pages/student/ai-chat/index.tsx:259`

## 7. Static analysis safeguard

- [ ] 7.1 Add Vitest test that fails if grep finds `VITE_API_BASE_URL` in `pages/`
- [ ] 7.2 Add `tests/Static/no-direct-core-calls.test.ts`

## 8. Verify

- [ ] 8.1 All e2e tests passing
- [ ] 8.2 Manual: open browser devtools, verify Authorization header NOT present in any page request
- [ ] 8.3 `openspec validate client-app-bff-boundary-enforcement --strict`
