## 1. Pre-flight

- [ ] 1.1 Run baseline tests, verify Core API close endpoint returns summary in `data.summary` field
- [ ] 1.2 Document expected response shape

## 2. Backend pass-through verification

- [ ] 2.1 Verify `StudentCourseController::closeSession` returns full Core response unchanged
- [ ] 2.2 Add type comment documenting summary field

## 3. Frontend hook update

- [ ] 3.1 Add `initialSummary?: ChatDiscussionSummary | null` to `UseChatSummaryOptions`
- [ ] 3.2 Initialize state from `initialSummary` if provided
- [ ] 3.3 Skip fetch if `initialSummary` truthy
- [ ] 3.4 Update existing tests + add test for initial-summary path

## 4. Frontend room.tsx integration

- [ ] 4.1 Add `initialSummary` state in `chat/room.tsx`
- [ ] 4.2 Capture from `handleCloseSession` response
- [ ] 4.3 Convert Core string → `ChatDiscussionSummary` shape
- [ ] 4.4 Pass `initialSummary` to `useChatSummary`

## 5. Verify

- [ ] 5.1 Manual: close session, verify summary card renders with content
- [ ] 5.2 `npx tsc --noEmit` clean
- [ ] 5.3 `npx vitest run` passing
- [ ] 5.4 `openspec validate client-app-summary-from-close-response --strict`
