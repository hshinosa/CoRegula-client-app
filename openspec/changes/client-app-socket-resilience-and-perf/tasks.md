## 1. Pre-flight

- [ ] 1.1 Run baseline: `npm run test`, e2e
- [ ] 1.2 Read `useSocketRoom.ts`, `room.tsx`, controller examples
- [ ] 1.3 Audit chart lib usage

## 2. Socket re-auth on token expiry

- [ ] 2.1 Add `connect_error` handler in `useSocketRoom`
- [ ] 2.2 Detect auth-related errors, clear token cache, refetch, reconnect
- [ ] 2.3 Limit retries to 1 to avoid loop

## 3. Timer cleanup

- [ ] 3.1 Track `qualityTimerRef` and clear in cleanup effect
- [ ] 3.2 Audit other setTimeout/setInterval in useSocketRoom

## 4. Stable callback props

- [ ] 4.1 Move callback props to refs
- [ ] 4.2 Effect deps simplified to `[socket]` only

## 5. Surface service errors

- [ ] 5.1 `CourseController::index` — return `serviceError` prop on failure
- [ ] 5.2 Audit other Inertia controllers swallowing failures
- [ ] 5.3 Frontend renders error banner when `serviceError` present

## 6. Chat virtualization

- [ ] 6.1 Install `react-window`
- [ ] 6.2 Wrap `ChatMessageList` items in `FixedSizeList` when count > 100
- [ ] 6.3 Maintain scroll-to-bottom behavior
- [ ] 6.4 E2E: large room test

## 7. Chart memoization

- [ ] 7.1 `MetricsRadarChart.tsx` — useMemo for data + options
- [ ] 7.2 `PlanVsDiskusiChart.tsx` — same

## 8. Remove unused chart libs

- [ ] 8.1 `grep -rn "vue-chartjs" resources/`
- [ ] 8.2 If unused: `npm uninstall vue-chartjs`
- [ ] 8.3 Same audit for other chart libs

## 9. Verify

- [ ] 9.1 All tests passing
- [ ] 9.2 Manual: long-lived socket, force token expiry, verify auto-reconnect
- [ ] 9.3 Manual: chat with 200+ messages, verify smooth scroll
- [ ] 9.4 `openspec validate client-app-socket-resilience-and-perf --strict`
