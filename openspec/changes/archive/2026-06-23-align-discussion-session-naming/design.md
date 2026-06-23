## Context

The discussion session subsystem spans 3 services:
- **core-api**: owns `ChatSpace` Prisma model, `chat_spaces` PostgreSQL table, MongoDB `ChatLog.chatSpaceId`. API endpoints under `/api/chat-spaces`, `/api/groups/{id}/chat-spaces`. All internal identifiers use `chatSpace`/`ChatSpace`.
- **client-app**: Laravel BFF + React frontend. Routes use `chat-spaces` path segments. TypeScript types use `ChatSpace`/`chatSpaceId`. UI text is inconsistent: mostly "sesi diskusi" but leaks "chat space" (English), "ruang diskusi", "sesi chat" in ~14 places.
- **ai-engine**: Python/FastAPI. Uses `chat_space_id` in 3 API-facing spots (AskRequest, GoalValidateBody, export route) but the main orchestration path uses `group_id` + `chat_room_id`. Has 6 bugs in the discussion session flow.

## Goals / Non-Goals

**Goals:**
- Align all user-facing UI text to "sesi diskusi" — zero English "chat space" or alternative Indonesian terms
- Fix 6 ai-engine bugs that cause TypeError, AttributeError, or dead endpoints
- Remove dead code (batch_routes.py, unused chat_space_id field)

**Non-Goals:**
- Renaming internal identifiers (DB tables, Prisma models, API paths, TypeScript types, variables) — these are cross-service contracts; renaming would require coordinated migration across 3 services + DB + MongoDB
- Changing the discussion session flow or adding new features
- Touching core-api backend naming (internal only, no user-facing text)

## Decisions

### D1: UI-only naming alignment, internal identifiers unchanged

**Decision**: Only change user-facing strings (headings, labels, buttons, descriptions, tooltips). Keep all internal identifiers (`chatSpace`, `ChatSpace`, `chat_space_id`, `/chat-spaces` routes) as-is.

**Rationale**: The internal naming is a cross-service contract between core-api, client-app, and ai-engine. Renaming would require: Prisma migration (rename table), MongoDB field rename, API path change (breaking all clients), TypeScript type rename across 40+ files, PHP controller/method rename, Python schema rename. Risk/cost far exceeds the benefit since users never see these identifiers.

### D2: Fix ai-engine bugs in-place, no refactor

**Decision**: Fix the 6 bugs with minimal changes — add missing methods, fix kwarg names, remove dead code.

**Rationale**: The ai-engine orchestration flow is complex but functional for the main path (POST /api/chat). The bugs are in secondary paths (anomaly detection, group status endpoints, batch routes). Fix them surgically.

### D3: Remove batch_routes.py entirely

**Decision**: Delete `batch_routes.py` — it's never mounted in `routes/__init__.py` and has a `use_cache` TypeError.

**Rationale**: Dead code. If batch processing is needed later, it should be written fresh with correct signatures.

### D4: Remove AskRequest.chat_space_id field

**Decision**: Remove the `chat_space_id` field from `AskRequest` — it's accepted but never used in the `/ask` handler.

**Rationale**: Dead API surface. The `/ask` endpoint uses only `course_id` to build the collection name. Keeping the field creates false expectations.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Missed UI string with "chat space" | Comprehensive search across all TSX/PHP files after edits |
| `groups.py` delegating methods break if Orchestrator interface changes | Methods are thin wrappers calling `logic_listener.*` — stable interface |
| Removing `chat_space_id` from AskRequest breaks a caller | `/ask` is called by core-api; verify core-api doesn't send `chat_space_id` in the ask payload |
