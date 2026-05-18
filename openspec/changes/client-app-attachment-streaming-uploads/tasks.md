## 1. Pre-flight

- [ ] 1.1 Run baseline: `npm run test`, e2e
- [ ] 1.2 Read `pages/student/chat/room.tsx:647` upload logic
- [ ] 1.3 Verify Core API has `/api/upload` endpoint or coordinate to add

## 2. Add Laravel upload route

- [ ] 2.1 `routes/web.php` — add `POST /api/upload` (auth.jwt group)
- [ ] 2.2 `app/Http/Controllers/UploadController.php` (new)
- [ ] 2.3 Validate file size (max 10MB) + MIME type whitelist
- [ ] 2.4 Forward to Core API via apiRequest

## 3. Frontend upload helper

- [ ] 3.1 Create `resources/js/lib/uploadAttachments.ts`
- [ ] 3.2 Use XMLHttpRequest for progress events
- [ ] 3.3 Handle errors with retry option

## 4. Refactor chat/room.tsx

- [ ] 4.1 Replace FileReader/base64 with `uploadAttachments(...)`
- [ ] 4.2 Show progress UI per file
- [ ] 4.3 Disable send button during upload
- [ ] 4.4 Emit `send_message` with metadata-only attachments

## 5. Fix ObjectURL leak

- [ ] 5.1 Before `setPendingFiles([])`, iterate and `URL.revokeObjectURL(f.previewUrl)`
- [ ] 5.2 Same on component unmount

## 6. Tests

- [ ] 6.1 Unit: uploadAttachments handles success/error
- [ ] 6.2 E2E: send file in chat, verify <10MB constraint, verify file appears for other user

## 7. Verify

- [ ] 7.1 `npm run test`, `vendor/bin/phpunit`, e2e passing
- [ ] 7.2 Manual: send 5MB image, verify Socket.IO frame stays small
- [ ] 7.3 `openspec validate client-app-attachment-streaming-uploads --strict`
