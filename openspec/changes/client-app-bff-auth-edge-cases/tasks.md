## 1. Pre-flight

- [ ] 1.1 Run baseline tests
- [ ] 1.2 Audit `JwtAuthMiddleware::decodeJwtPayload`
- [ ] 1.3 List all `$this->apiRequest()->...` call sites in controllers

## 2. JWT strict 3-part validation

- [ ] 2.1 `JwtAuthMiddleware::decodeJwtPayload` — change `count($parts) < 2` to `!== 3`
- [ ] 2.2 Validate signature segment non-empty
- [ ] 2.3 Add test: 2-part token rejected

## 3. Proxy 401 helper

- [ ] 3.1 Add `Controller::proxyResponse()` method
- [ ] 3.2 Logic: if Core 401, `session()->forget()` + return JSON 401
- [ ] 3.3 Update controllers using `apiRequest()` to call `proxyResponse()`:
  - StudentCourseController::closeSession
  - StudentCourseController::submitReflection
  - StudentCourseController::chatSpaceSummary
  - UserManagementController::exportData
  - MasterDataController::exportData
  - AnalyticsController::liveStats
  - others as needed

## 4. Tests

- [ ] 4.1 Test malformed JWT (2-part) → middleware reject
- [ ] 4.2 Test Core 401 → session cleared + 401 returned
- [ ] 4.3 Test Core 200 → session preserved + response forwarded

## 5. Verify

- [ ] 5.1 `vendor/bin/phpunit` passing
- [ ] 5.2 `npx vitest run` passing
- [ ] 5.3 Manual: simulate Core 401, verify Laravel session cleared
- [ ] 5.4 `openspec validate client-app-bff-auth-edge-cases --strict`
