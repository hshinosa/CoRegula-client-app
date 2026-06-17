# Kolabri Client App — Modal Accessibility Audit

## Key Finding

`BaseModal` **already exists** at `resources/js/components/ui/BaseModal.tsx` and implements the core accessibility features required by M1. The M1 work is therefore **refactor/consolidation**, not green-field implementation.

---

## 1. Shared Modal Components in `resources/js/components/ui/`

| File | Uses BaseModal? | Type | Notes |
|------|----------------|------|-------|
| `BaseModal.tsx` | — | foundation | Has role="dialog", aria-modal="true", aria-labelledby, ESC, focus trap, body scroll lock |
| `ConfirmDialog.tsx` | Yes | alert/confirm | Danger/warning confirmation |
| `GlobalSearchModal.tsx` | Yes | custom/search | Adds arrow-key navigation, result selection |
| `KeyboardShortcutsHelpModal.tsx` | Yes | custom/help | Lists keyboard shortcuts |
| `DocumentViewerModal.tsx` | Yes (in `components/course/`) | custom/viewer | PDF/image/document preview |
| `SessionSummaryModal.tsx` | Yes (in `components/chat/`) | custom/summary | Discussion session summary |

---

## 2. Modal Usages Across `resources/js/pages/`

| File | Modal Instances | Implementation |
|------|-----------------|----------------|
| `admin/user-management.tsx` | 5 | Inline `FormModal` (duplicate) |
| `admin/master-data.tsx` | 9 | Inline `FormModal` (duplicate) |
| `admin/ai-settings.tsx` | 4 | Inline `FormModal` (duplicate) |
| `student/chat/room.tsx` | 6 | 4 inline + `SessionSummaryModal` + `DocumentViewerModal` |
| `student/chat-spaces/index.tsx` | 1 | Inline modal |
| `student/groups/index.tsx` | 2 | Inline modals |
| `lecturer/analytics/show.tsx` | 2 | Inline modals |
| `lecturer/session-mgmt/index.tsx` | 1 | Inline `CreateSessionModal` |
| `lecturer/groups/index.tsx` | 3 | Inline modals |
| `student/courses/show.tsx` | 3 | Inline modals |
| `student/ai-chat/index.tsx` | 1 | Inline modal |
| `settings/components/SecurityTab.tsx` | 1 | Inline modal |
| `student/profile/components/AvatarSection.tsx` | 1 | Inline modal |
| `student/reflections/components/TemplateModal.tsx` | 1 | Inline modal |
| `student/courses/index.tsx` | 1 | Inline modal |
| `student/chat/index.tsx` | 1 | Inline modal |
| `admin/audit-log.tsx` | 1 | Inline modal |
| `admin/dashboard.tsx` | 1 | Inline modal |
| `admin/templates.tsx` | 1 | Inline modal |
| `lecturer/ai-settings.tsx` | 1 | Inline modal |
| `student/reflections/index.tsx` | 1 | Inline modal |
| `student/ai-chat/components/SavedMaterialsPanel.tsx` | 1 | Inline modal |
| `components/lecturer/UnifiedMaterialsTab.tsx` | 1 | Inline upload modal |
| `layouts/app-layout.tsx` | 2 | `GlobalSearchModal`, `KeyboardShortcutsHelpModal` |

**Total modal instances: 50+** (target 25+ exceeded).

---

## 3. Accessibility Assessment

### Shared modals (all use BaseModal)

| Modal | role="dialog" | aria-modal | aria-labelledby/label | ESC | Focus trap | Body scroll lock |
|-------|---------------|------------|------------------------|-----|------------|------------------|
| `BaseModal` | Yes | Yes | Yes (aria-labelledby) | Yes | Yes | Yes |
| `ConfirmDialog` | Yes (via BaseModal) | Yes | Yes | Yes | Yes | Yes |
| `GlobalSearchModal` | Yes | Yes | Yes | Yes | Yes | Yes |
| `KeyboardShortcutsHelpModal` | Yes | Yes | Yes | Yes | Yes | Yes |
| `SessionSummaryModal` | Yes | Yes | Yes | Yes | Yes | Yes |
| `DocumentViewerModal` | Yes | Yes | Yes | Yes | Yes | Yes |

### Inline / duplicate modals

| Implementation | role | aria-modal | aria-labelledby/label | ESC | Focus trap | Body scroll lock |
|----------------|------|------------|------------------------|-----|------------|------------------|
| `FormModal` (admin pages) | No | No | No | No | No | No |
| `CreateSessionModal` | No | No | No | No | No | No |
| `TemplateModal` | No | No | No | No | No | No |
| `student/chat-spaces/index.tsx` modal | No | No | No | No | No | No |
| `student/groups/index.tsx` modals | No | No | No | No | No | No |
| `student/courses/show.tsx` modals | No | No | No | No | No | No |
| `lecturer/groups/index.tsx` modals | No | No | No | No | No | No |
| `lecturer/analytics/show.tsx` modals | No | No | No | No | No | No |
| `student/chat/room.tsx` modals | Yes | Yes | Yes (aria-label) | Yes | Yes (trapFocusWithin) | No explicit lock |
| `components/lecturer/UnifiedMaterialsTab.tsx` | Yes | Yes | Yes | Yes (custom) | No | No |

---

## 4. Categorization by Type

| Type | Examples |
|------|----------|
| **Alert** | `ConfirmDialog`, delete/reset password modals |
| **Confirm** | Close session confirm, permanent delete confirm |
| **Form** | All `FormModal` duplicates, `CreateSessionModal`, `TemplateModal`, create/edit user/course/provider modals |
| **Custom** | `GlobalSearchModal`, `KeyboardShortcutsHelpModal`, `DocumentViewerModal`, `SessionSummaryModal`, image preview, reflection modal |

---

## 5. Three Duplicate `FormModal` Implementations (Admin Section)

| File | Lines | Notes |
|------|-------|-------|
| `pages/admin/user-management.tsx` | 135–212 | `max-w-lg` fixed, no `maxWidth` prop |
| `pages/admin/master-data.tsx` | 240–319 | Adds `maxWidth` prop |
| `pages/admin/ai-settings.tsx` | 124–203 | Adds `maxWidth` + `max-h-[90vh] overflow-y-auto` |

All three share the same structure: `AnimatePresence`, overlay `motion.div`, centered `motion.div`, header with title/description/X button, and children slot. They differ only in sizing options. These should be replaced by a single shared `FormModal` built on top of `BaseModal`.

---

## 6. Recommended M1 Plan

1. **Keep `BaseModal`** as the single foundation; verify it covers all needed sizes/variants.
2. **Create a shared `FormModal`** component in `components/ui/` that wraps `BaseModal` and accepts title, description, children, size, and footer actions.
3. **Replace the 3 admin `FormModal` duplicates** with the shared component (18 admin modal instances total).
4. **Refactor high-impact inline modals** to use `BaseModal` or `FormModal`:
   - `student/chat-spaces/index.tsx`
   - `student/groups/index.tsx`
   - `student/courses/show.tsx`
   - `lecturer/groups/index.tsx`
   - `lecturer/session-mgmt/index.tsx` (`CreateSessionModal`)
   - `student/reflections/components/TemplateModal.tsx`
5. **Preserve `student/chat/room.tsx`** modals as-is (they already meet accessibility requirements) or optionally migrate to `BaseModal` for consistency.
6. **Add regression checks**: ensure every modal has `role="dialog"`, `aria-modal="true"`, labelled title, ESC close, focus trap, and body scroll lock.
