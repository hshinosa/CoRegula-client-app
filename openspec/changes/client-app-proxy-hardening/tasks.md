## 1. Pre-flight

- [ ] 1.1 Run baseline
- [ ] 1.2 Verify Laravel throttle config in app/Http/Kernel.php

## 2. Add throttle middleware

- [ ] 2.1 `/api/chat/upload` → throttle:30,5
- [ ] 2.2 chat-space close + reflection routes → throttle:10,5
- [ ] 2.3 admin export routes → throttle:10,1

## 3. axios withCredentials default

- [ ] 3.1 `resources/js/app.tsx` — add `axios.defaults.withCredentials = true`
- [ ] 3.2 Place before CSRF token setup

## 4. Tests

- [ ] 4.1 Manual: spam upload 31 times in 5 min, verify 31st returns 429
- [ ] 4.2 Verify route:list shows throttle middleware

## 5. Verify

- [ ] 5.1 `npx vitest run` passing
- [ ] 5.2 `php artisan route:list | grep throttle` shows new entries
- [ ] 5.3 `openspec validate client-app-proxy-hardening --strict`
