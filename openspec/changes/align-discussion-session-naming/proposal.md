## Why

The discussion session subsystem uses three competing terms in the UI: "chat space" (English), "ruang diskusi", and "sesi chat" — while the target term "sesi diskusi" is already used in most places. This confuses users and looks unprofessional (e.g., a lecturer modal says "Buat Chat Space Baru" right next to "Tambahkan ruang diskusi terpisah"). Additionally, the ai-engine has 2 critical bugs in the discussion session flow (TypeError in anomaly detection, dead group-status endpoints).

## What Changes

### UI naming alignment (client-app — 14 user-facing strings)
- **Lecturer groups modal**: "Buat Chat Space Baru" → "Buat Sesi Diskusi Baru"; "Nama Chat Space" → "Nama Sesi"; "Chat Space Aktif" → "Sesi Diskusi Aktif"
- **Goals/create page**: "Untuk chat space: {name}" → "Untuk sesi diskusi: {name}"; "topik diskusi di chat space ini" → "topik diskusi di sesi ini"
- **EmptyState**: "sesi chat" → "sesi diskusi"; "ruang" → "sesi" in filter/search variants
- **SearchBar**: "Cari ruang diskusi" → "Cari sesi diskusi"
- **Course show**: "ruang chat" → "sesi diskusi" in mixed string
- **Pre-read**: "masuk ruang diskusi" → "masuk sesi diskusi"
- **Landing page**: "Chat spaces dengan AI assistant" → "Sesi diskusi dengan AI assistant"
- **Admin dashboard**: "chat spaces are supporting discussion activity" → "sesi diskusi mendukung aktivitas diskusi"
- **Admin master-data**: "Chat Spaces: {n}" → "Sesi Diskusi: {n}"
- **Shortcuts**: "Chat Spaces" → "Sesi Diskusi"

### AI-engine critical fixes
- **BUG**: Fix `detect_session_anomalies` TypeError — recursive call uses `case_id=` kwarg but param is named `chat_space_id`
- **BUG**: Fix `event.get('chatSpaceId')` dead grouping — no writer sets this field; use `CaseID` prefix instead
- **BUG**: Fix `groups.py` 4 routes calling non-existent Orchestrator methods — add delegating methods
- **BUG**: Remove `batch_routes.py` (unmounted + `use_cache` kwarg doesn't exist)
- **BUG**: Remove `AskRequest.chat_space_id` (accepted but never used)
- **BUG**: Fix `silence_monitor_task` calling deprecated `check_silence`

### Non-goals (internal identifiers stay)
- DB table name `chat_spaces` stays (cross-service contract)
- Prisma model `ChatSpace` stays
- API paths `/api/chat-spaces`, `/api/groups/{id}/chat-spaces` stay
- TypeScript `ChatSpace` interface, `chatSpaceId` variables stay
- Mongo `ChatLog.chatSpaceId` field stays

## Capabilities

### New Capabilities

_None — this is a UI alignment + bug fix._

### Modified Capabilities

- `discussion-session-ui`: All user-facing text referring to discussion sessions uses "sesi diskusi" consistently. No English "chat space" or alternative "ruang diskusi"/"sesi chat" in any user-visible string.
- `ai-orchestration`: Anomaly detection and group-status endpoints work without TypeError/AttributeError. Dead code (batch_routes, unused chat_space_id field) removed.
