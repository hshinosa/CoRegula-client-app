## 1. UI naming alignment — client-app (14 strings)

- [ ] 1.1 Lecturer groups modal: "Buat Chat Space Baru" → "Buat Sesi Diskusi Baru", "Nama Chat Space" → "Nama Sesi", desc "ruang diskusi" → "sesi diskusi"
- [ ] 1.2 Lecturer groups stat: "Chat Space Aktif" → "Sesi Diskusi Aktif"
- [ ] 1.3 Goals/create: "Untuk chat space: {name}" → "Untuk sesi diskusi: {name}", "topik diskusi di chat space ini" → "topik diskusi di sesi ini"
- [ ] 1.4 EmptyState: "sesi chat" → "sesi diskusi" (2 strings), "ruang" → "sesi" in filter/search (4 strings)
- [ ] 1.5 SearchBar: "Cari ruang diskusi" → "Cari sesi diskusi" (placeholder + aria-label)
- [ ] 1.6 Course show: "ruang chat" → "sesi diskusi" in mixed empty state string
- [ ] 1.7 Pre-read: "masuk ruang diskusi" → "masuk sesi diskusi"
- [ ] 1.8 Landing FeaturesSection: "Chat spaces dengan AI assistant" → "Sesi diskusi dengan AI assistant"
- [ ] 1.9 Admin dashboard: "chat spaces are supporting discussion activity" → Indonesian
- [ ] 1.10 Admin master-data: "Chat Spaces: {n}" → "Sesi Diskusi: {n}"
- [ ] 1.11 Shortcuts student: "Chat Spaces" → "Sesi Diskusi"
- [ ] 1.12 Grep sweep: confirm zero "chat space" / "ruang diskusi" / "sesi chat" in user-facing strings

## 2. AI-engine bug fixes

- [ ] 2.1 Fix `process_mining_anomaly.py:274` — change `case_id=` to `chat_space_id=` in recursive call
- [ ] 2.2 Fix `process_mining_anomaly.py:266,706` — group by `CaseID` prefix instead of `event.get('chatSpaceId')`
- [ ] 2.3 Fix `groups.py` — add 4 delegating methods to Orchestrator (check_group_status, track_participation, update_last_message_time, set_group_topic)
- [ ] 2.4 Delete `batch_routes.py` + remove any import in `routes/__init__.py`
- [ ] 2.5 Remove `chat_space_id` from `AskRequest` + `field_validator` in `schemas.py`
- [ ] 2.6 Remove `silence_monitor_task` from `main.py` lifespan

## 3. Verify

- [ ] 3.1 Client-app `npx tsc --noEmit` — 0 errors
- [ ] 3.2 AI-engine `python -m py_compile` on changed files
- [ ] 3.3 Client-app grep sweep: no user-facing "chat space" / "ruang diskusi" / "sesi chat"

## 4. Deploy + commit

- [ ] 4.1 rsync client-app + ai-engine to VPS
- [ ] 4.2 Rebuild ai-engine + client-app containers
- [ ] 4.3 Verify web 200, API 200, AI chat works
- [ ] 4.4 Git commit both repos
- [ ] 4.5 Archive OpenSpec
