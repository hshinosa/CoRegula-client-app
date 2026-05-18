## 1. Pre-flight

- [ ] 1.1 Run baseline: `npm run test:unit`
- [ ] 1.2 Verify `useSocketRoom` passes `(display, raw)` to onMessageReceived
- [ ] 1.3 Inventory `URL.createObjectURL` sites and `setPendingFiles([])` sites

## 2. Fix chat/room.tsx reconciliation

- [ ] 2.1 Update `onMessageReceived` to use `(_display, raw)` and call `reconcileIncomingMessage(prev, raw)`
- [ ] 2.2 Verify import of `reconcileIncomingMessage` already present
- [ ] 2.3 Manual test: send message → server echo → no duplicate

## 3. ObjectURL revoke helper

- [ ] 3.1 Add `revokePendingFilePreviews(files)` helper (inline or module)
- [ ] 3.2 chat/room.tsx — call before `setPendingFiles([])` after send
- [ ] 3.3 chat/room.tsx — add unmount cleanup using ref pattern
- [ ] 3.4 chat/index.tsx — same pattern

## 4. OpenSpec status correction

- [ ] 4.1 Open `chat-summary-integration/tasks.md`
- [ ] 4.2 Re-mark Laravel proxy task as `[ ]`
- [ ] 4.3 Add note pointing to `client-app-summary-bff-proxy` for completion

## 5. Verify

- [ ] 5.1 `npx tsc --noEmit` clean
- [ ] 5.2 `npx eslint resources/js` clean
- [ ] 5.3 `npx vitest run` 98+ tests pass
- [ ] 5.4 Manual: optimistic send → confirm → no duplicate
- [ ] 5.5 Manual: send file → check chrome://memory-internals shows no orphan ObjectURLs (or at least pendingFiles=0)
- [ ] 5.6 `openspec validate client-app-fix-merge-regressions --strict`
