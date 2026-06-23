## MODIFIED Requirements

### Requirement: Consistent "sesi diskusi" terminology in UI

All user-facing text referring to discussion sessions uses "sesi diskusi" consistently. No English "chat space", no alternative "ruang diskusi", no "sesi chat" in any user-visible string.

#### Scenario: Lecturer creates a discussion session
- **WHEN** a lecturer opens the create-session modal on the groups page
- **THEN** the modal title says "Buat Sesi Diskusi Baru"
- **AND** the name field label says "Nama Sesi"
- **AND** the description says "Tambahkan sesi diskusi terpisah di dalam grup untuk topik tertentu."

#### Scenario: Student sees goal creation page
- **WHEN** a student navigates to the goal creation page
- **THEN** the page says "Untuk sesi diskusi: {name}"
- **AND** the hint says "Jaga agar relevan dengan topik diskusi di sesi ini"

#### Scenario: Student searches for a discussion session
- **WHEN** a student types in the search bar on the sessions page
- **THEN** the placeholder says "Cari sesi diskusi..."

#### Scenario: Student sees empty state with no sessions
- **WHEN** a group has no discussion sessions
- **THEN** the empty state says "Belum ada sesi diskusi"
- **AND** the description says "Buat sesi diskusi pertama Anda untuk mulai berdiskusi dengan kelompok"

#### Scenario: Student sees pre-read page
- **WHEN** a student opens the pre-read page before entering a session
- **THEN** the page says "dan masuk sesi diskusi" (not "ruang diskusi")

#### Scenario: Admin views dashboard
- **WHEN** an admin views the dashboard
- **THEN** the subtext says "sesi diskusi mendukung aktivitas diskusi" (not "chat spaces are supporting discussion activity")
- **AND** the master-data page shows "Sesi Diskusi: {n}" (not "Chat Spaces: {n}")

#### Scenario: Landing page feature description
- **WHEN** a visitor views the landing page
- **THEN** the feature description says "Sesi diskusi dengan AI assistant untuk membantu mahasiswa..."

#### Scenario: Keyboard shortcut description
- **WHEN** a student views the keyboard shortcuts help
- **THEN** the description for ctrl+6 says "Sesi Diskusi" (not "Chat Spaces")

#### Scenario: Lecturer sees active session count
- **WHEN** a lecturer views the groups page
- **THEN** the stat card says "Sesi Diskusi Aktif" (not "Chat Space Aktif")
