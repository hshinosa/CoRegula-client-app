# Timeout Configuration Matrix

This document describes the timeout configuration across the Kolabri Client-App (Laravel BFF) and its React frontend.

## Architecture Overview

```
Browser (React/axios) → Client-App (Laravel BFF) → Core-API (Express.js) → AI-Engine (FastAPI)
```

Timeouts are configured at each layer to prevent cascading failures and ensure predictable behavior.

## Frontend (React/axios)

| Component | Timeout | Connect | File | Notes |
|-----------|---------|---------|------|-------|
| Global axios default | 30s | - | `resources/js/app.tsx` | Standard API requests |
| File upload (XHR) | 120s | - | `resources/js/lib/upload-attachments.ts` | Large file uploads |
| AI chat (fetch) | 60s | - | `resources/js/pages/student/ai-chat/index.tsx` | LLM generation can be slow |
| AI chat default | 30s | - | `resources/js/pages/student/ai-chat/index.tsx` | Non-LLM API calls |
| Reveal catch-up | 12s | - | `resources/js/pages/student/ai-chat/index.tsx` | Streaming display sync |
| Toast messages | 4s | - | `resources/js/components/ui/toaster.tsx` | Auto-dismiss duration |
| Toast (chat) | 5s | - | `resources/js/components/chat/Toast.tsx` | Chat-specific toasts |

## Backend (Laravel BFF)

### Controller Base Helper

| Helper | Timeout | Connect | File | Notes |
|--------|---------|---------|------|-------|
| `Controller::apiRequest()` | 10s | 5s | `app/Http/Controllers/Controller.php` | Default for all Core-API calls |
| `Controller::coreApiRequest()` | 10s | 5s | `app/Http/Controllers/Controller.php` | Internal API calls (no JWT) |
| `CoreApiInternalClient::request()` | 15s | 5s | `app/Services/CoreApiInternalClient.php` | Internal service-to-service |

### Jobs (Background Processing)

| Job | HTTP Timeout | Connect | Job Timeout | Retries | File |
|-----|-------------|---------|-------------|---------|------|
| ActivateScheduledSessions | 30s | 5s | 60s | 3 | `app/Jobs/ActivateScheduledSessions.php` |
| AutoCloseInactiveSessions | 30s | 5s | 60s | 3 | `app/Jobs/AutoCloseInactiveSessions.php` |
| BulkSessionOperation | 60s | 5s | 120s | 3 | `app/Jobs/BulkSessionOperation.php` |

### Services

| Service | Timeout | Connect | File | Notes |
|---------|---------|---------|------|-------|
| SessionNotificationService (warning) | 10s | 5s | `app/Services/SessionNotificationService.php` | Session auto-close warning |
| SessionNotificationService (activated) | 10s | 5s | `app/Services/SessionNotificationService.php` | Session activation notification |
| SessionNotificationService (closed) | 10s | 5s | `app/Services/SessionNotificationService.php` | Session closed notification |

### Controllers

| Controller | Timeout | Connect | File | Notes |
|------------|---------|---------|------|-------|
| LecturerMaterialsHubController | 10s | 5s | `app/Http/Controllers/Lecturer/LecturerMaterialsHubController.php` | Knowledge base fetch |
| AssertChatMembership middleware | 10s | 5s | `app/Http/Middleware/AssertChatMembership.php` | Chat authorization check |

### Seeders

| Seeder | Timeout | Connect | File | Notes |
|--------|---------|---------|------|-------|
| AttendanceDemoSeeder (login) | 30s | 5s | `database/seeders/AttendanceDemoSeeder.php` | Demo data login |
| AttendanceDemoSeeder (courses) | 30s | 5s | `database/seeders/AttendanceDemoSeeder.php` | Course fetch |
| AttendanceDemoSeeder (students) | 30s | 5s | `database/seeders/AttendanceDemoSeeder.php` | Student list fetch |
| MaterialsDemoSeeder (login) | 30s | 5s | `database/seeders/MaterialsDemoSeeder.php` | Demo data login |
| MaterialsDemoSeeder (courses) | 30s | 5s | `database/seeders/MaterialsDemoSeeder.php` | Course fetch |

## Timeout Design Principles

1. **Frontend > Backend**: Frontend timeouts are longer to allow for BFF processing time
2. **Connect < Total**: Connect timeouts are always shorter than total timeouts (fail fast on unreachable services)
3. **Batch > Single**: Batch operations get longer timeouts (60s vs 10s default)
4. **AI > Standard**: AI/LLM operations get 60s due to inference latency
5. **Upload > Standard**: File uploads get 120s for large files
6. **Jobs have retry**: All background jobs have `tries=3` with exponential backoff

## Configuration via Environment

| Variable | Default | Used By | Notes |
|----------|---------|---------|-------|
| `API_TIMEOUT` | 30 | `.env` | Available for custom timeout override |
| `API_BASE_URL` | `http://localhost:3000` | `.env` | Core-API base URL |

## Error Handling

When a timeout occurs:
- **Frontend**: axios throws `ECONNABORTED` error, caught by `.catch()` handlers, toast displayed
- **Backend**: Laravel HTTP client throws `ConnectionException`, caught and logged via `Log::error()`
- **Jobs**: Job fails, automatically retried up to `tries` times

## Monitoring

All timeout failures are logged with structured context:
- `ProfileController`: `Log::error('Profile stats: courses failed', ['error' => $e->getMessage()])`
- `ProfileStatsController`: `Log::error('Stats: submissions fetch failed', ['error' => $e->getMessage()])`
- Jobs: `Log::error('ActivateScheduledSessions failed', ['error' => $e->getMessage()])`
