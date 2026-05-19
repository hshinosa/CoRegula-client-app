## 1. Pre-flight

- [ ] 1.1 Run baseline tests
- [ ] 1.2 Verify server-side limits in ChatUploadController (10MB + MIME list)

## 2. Add validateFile helper

- [ ] 2.1 `validateFile(file)` returning Result<{ok}|{ok,reason}>
- [ ] 2.2 Constants `MAX_FILE_SIZE`, `MAX_PARALLEL`, `ALLOWED_MIME_TYPES`
- [ ] 2.3 Sync MIME list with server's mimes validator

## 3. Add concurrency pool

- [ ] 3.1 `withConcurrency` helper (or use p-limit if installed)
- [ ] 3.2 Extract single-file upload to `uploadOne(file, onProgress)`

## 4. Update uploadAttachments

- [ ] 4.1 Run pre-check before any upload starts
- [ ] 4.2 Replace `for...of` with `withConcurrency(files, 3, uploadOne)`
- [ ] 4.3 Throw early with reason if pre-check fails

## 5. Surface errors in pages

- [ ] 5.1 chat/room.tsx + chat/index.tsx — catch upload errors, show toast/banner
- [ ] 5.2 Error message should include file name + reason

## 6. Tests

- [ ] 6.1 Oversized file rejected before upload
- [ ] 6.2 Empty file rejected
- [ ] 6.3 Disallowed MIME type rejected
- [ ] 6.4 Parallel pool: max 3 concurrent
- [ ] 6.5 Progress callback fires per file

## 7. Verify

- [ ] 7.1 `npx vitest run` passing
- [ ] 7.2 Manual: select 5 files of varying sizes, verify upload completes in less time than sequential
- [ ] 7.3 `openspec validate client-app-upload-parallel-and-precheck --strict`
