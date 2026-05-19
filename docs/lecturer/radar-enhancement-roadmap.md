# Lecturer Radar Page — Enhancement Roadmap

Saved from review session 2026-05-19.

## Quick Wins (15-30 minutes each)

### 1. Comparison mode
Overlay 2 entities on the same radar (e.g., Kelompok A vs B). Insight comes from comparison, not single chart.

### 2. Sort + filter sidebar
Sort by score descending, filter "needs attention" (score < 6 in any metric). Helps in larger classes.

### 3. Score breakdown table
Below the radar: 6 metrics × value × delta vs class average. Numbers are more actionable than visual radar alone.

### 4. Empty state for sessions
Skip mock when class has 0 sessions. Currently assumes always ≥1.

### 5. Color-coded score chips in sidebar
≥7 success (green-tone), 5-7 warning (amber), <5 danger (red). Visual scan for under-performers.

## Medium (1-2 hours each)

### 6. Time-series mini chart per metric
Last 4 sessions for each of the 6 dimensions. Trend > snapshot for SSRL tracking.

### 7. Export PDF/PNG
Radar + summary as downloadable artifact for evaluation meetings.

### 8. Link from analytics dashboard
"View radar →" CTA on group cards in `/lecturer/courses/{id}/analytics`.

### 9. Drill-down navigation
Click group radar → automatic switch to student tab filtered by that group.

### 10. Class average overlay
Faint background polygon when scope is group/student/session. Adds context: "Andi 8.8 vs class avg 7.4".

## Bigger (3-6 hours each)

### 11. Real API integration
Replace `MOCK_CLASSES` with Core API endpoint. Requires Core API endpoint design + Prisma aggregation queries.

### 12. Cohort comparison
Semester ganjil vs genap, year-over-year. Higher-level institutional analytics.

### 13. Recommendation engine (rule-based)
Pattern-match metrics to actions, e.g., "Reflection <6 AND Performance >7 → suggest reflection-focused session". Cheaper + more interpretable than LLM.

## Visual / UX Polish (15-30 minutes each)

### 14. Tooltip with metric definitions
Hover label shows full term: "Hot = Higher-Order Thinking", "Forethought = SRL planning phase", etc.

### 15. Keyboard navigation
Arrow keys cycle entities in sidebar.

### 16. Dark mode support
Currently `lightMode={true}` hardcoded. Read from theme context.

### 17. Mobile responsive
Radar 420px height crops on mobile. Adjust per breakpoint.

### 18. Loading skeleton
Class switch shows skeleton while data loads (relevant once real API lands).

## Top 3 Recommended (Implementing Now)

1. **#1 Comparison mode** — single most-asked feature for analytics radars
2. **#3 Score breakdown table** — radar visual masih ambigu, tabel bikin actionable
3. **#10 Class average overlay** — context-aware view tanpa nambah click

Combined effort: ~1 jam, value tinggi.
