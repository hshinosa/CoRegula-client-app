## 1. Pre-flight

- [ ] 1.1 Run baseline: `vendor/bin/phpunit`
- [ ] 1.2 Read `app/Http/Middleware/JwtAuthMiddleware.php`, `app/Http/Controllers/AuthController.php`
- [ ] 1.3 Audit other `Http::post`/`Http::get` calls without timeout

## 2. Harden JWT middleware

- [ ] 2.1 Reject decode failures (null payload)
- [ ] 2.2 Require `exp` claim presence
- [ ] 2.3 Extract `reject()` helper for consistency
- [ ] 2.4 Update tests

## 3. Refactor auth controllers

- [ ] 3.1 `login` → use `$this->apiRequest()`
- [ ] 3.2 `register` → same
- [ ] 3.3 `logout` → same
- [ ] 3.4 Audit any other Auth controller methods

## 4. Make timeouts configurable

- [ ] 4.1 Add `API_TIMEOUT` and `API_CONNECT_TIMEOUT` to `config/services.php`
- [ ] 4.2 Add to `.env.example`
- [ ] 4.3 Update `apiRequest()` to read from config
- [ ] 4.4 Verify defaults still 10s / 5s

## 5. Tests

- [ ] 5.1 Test malformed JWT (not 3 segments)
- [ ] 5.2 Test JWT without exp claim
- [ ] 5.3 Test JWT with non-numeric exp
- [ ] 5.4 Test login slow Core API → timeout
- [ ] 5.5 Test config override changes timeout

## 6. Verify

- [ ] 6.1 `vendor/bin/phpunit` passing
- [ ] 6.2 `npm run test` passing (if applicable)
- [ ] 6.3 `openspec validate client-app-jwt-and-auth-timeout-fix --strict`
