# Color Contrast Compliance Migration

## Overview

This document describes the color contrast improvements made to comply with WCAG 2.1 AA standards (minimum 4.5:1 contrast ratio for normal text).

## Changes Made

### Replaced Low-Contrast Colors

The following low-contrast text colors were replaced with `text-gray-600` throughout the codebase:

1. **`text-[#9CA3AF]`** (hex) → `text-gray-600`
   - Original: Gray-400 equivalent, fails AA contrast on white backgrounds
   - Replacement: Gray-600, passes AA contrast (7:1 ratio)

2. **`text-[#9ca3af]`** (lowercase hex) → `text-gray-600`
   - Same as above, lowercase variant

3. **`text-slate-400`** → `text-gray-600`
   - Original: Slate-400, fails AA contrast on white backgrounds
   - Replacement: Gray-600, passes AA contrast (7:1 ratio)

4. **`text-gray-400`** → `text-gray-600`
   - Original: Gray-400, fails AA contrast on white backgrounds
   - Replacement: Gray-600, passes AA contrast (7:1 ratio)

## Scope

- **Files affected**: 53+ TypeScript/TSX files
- **Total replacements**: ~199 occurrences
  - 43 instances of `text-[#9CA3AF]` in 14 files
  - 156 instances of `text-gray-400` and `text-slate-400` in 39 files

## Usage Patterns

### Appropriate Use Cases for `text-gray-600`

✅ **Primary use**: Secondary/muted text that needs to be readable
- Helper text and descriptions
- Timestamps and metadata
- Labels and captions
- Search result snippets
- Activity feeds
- Form field descriptions

### Examples

```tsx
// Helper text
<p className="text-sm text-gray-600">Masukkan email Anda</p>

// Timestamps
<span className="text-xs text-gray-600">
  {new Date(message.created_at).toLocaleTimeString()}
</span>

// Metadata
<p className="text-xs text-gray-600">{s.email}</p>

// Empty states
<div className="text-sm text-gray-600">Belum ada data</div>
```

### Decorative Elements

Some `text-gray-400` usage was intentionally kept for:
- Icon colors where lower contrast is acceptable
- Decorative borders and dividers
- Background patterns

## Contrast Ratios

| Color | Hex | Contrast on White | WCAG AA (4.5:1) | WCAG AAA (7:1) |
|-------|-----|-------------------|-----------------|----------------|
| Gray-400 | #9CA3AF | 3.0:1 | ❌ Fail | ❌ Fail |
| Gray-600 | #4B5563 | 7.0:1 | ✅ Pass | ✅ Pass |
| Gray-900 | #111827 | 17.4:1 | ✅ Pass | ✅ Pass |

## Verification

### Automated Checks

- [ ] Run Lighthouse accessibility audit on main pages
- [ ] Run axe-core scan on top 10 affected pages
- [ ] Verify zero "contrast ratio" violations

### Manual Checks

- [ ] Secondary text (gray-600) readable on white backgrounds
- [ ] Secondary text (gray-600) visually distinct from primary text (gray-900)
- [ ] Text on non-white backgrounds (cards, badges) still passes 4.5:1
- [ ] Dark mode: gray-600 maps appropriately to lighter shade

## Dark Mode Considerations

In dark mode, Tailwind's `text-gray-600` automatically maps to a lighter shade via the `dark:` variant:

```tsx
<p className="text-gray-600 dark:text-gray-400">
  Secondary text in both light and dark modes
</p>
```

## Exceptions

The following patterns were reviewed and kept as-is:
- Auth pages (`.tsx.bak` files): Using `text-slate-400` with `dark:` variants
- Icon colors: Lower contrast acceptable for decorative elements
- Borders and dividers: Not text content

## Testing

### Visual Testing

1. Open pages in light mode
2. Verify all secondary text is clearly readable
3. Switch to dark mode
4. Verify text remains readable with appropriate contrast

### Automated Testing

```bash
# Run Lighthouse
npx lighthouse http://localhost:8000 --view

# Run axe-core
npm run test:a11y
```

## Related Documentation

- [TIMEOUTS.md](./TIMEOUTS.md) - Timeout configuration
- [sanitization-guide.md](./sanitization-guide.md) - Input sanitization
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/#contrast-minimum
