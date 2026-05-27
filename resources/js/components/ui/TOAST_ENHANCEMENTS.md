# Toast Notification Enhancements

## Overview
Enhanced toast notification system with action buttons, progress bars, distinct type styling, and smooth animations.

## Features Implemented

### 1. Action Button Support (Task 8.1)
Toasts can now include optional action buttons:

```typescript
interface ToastAction {
    label: string;
    onClick: () => void;
}

interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
    action?: ToastAction;  // Optional action button
}
```

**Usage Example:**
```typescript
const addToast = (message: string, type: ToastType, action?: ToastAction) => {
    // Action button will appear below the message
    // Clicking it triggers the action and dismisses the toast
};
```

### 2. Slide-Up Entrance Animation (Task 8.2)
Toasts now enter with a smooth slide-up animation:

```typescript
initial={{ opacity: 0, y: 20, scale: 0.95 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, scale: 0.95, y: 10 }}
transition={{ type: 'spring', stiffness: 300, damping: 30 }}
```

- Slides up from 20px below
- Smooth spring physics
- Scales from 95% to 100%

### 3. Auto-Dismiss with Progress Bar (Task 8.3)
5-second auto-dismiss with visual progress indicator:

```typescript
<motion.div
    className="absolute top-0 left-0 h-1 bg-{type}-500"
    initial={{ width: '100%' }}
    animate={{ width: '0%' }}
    transition={{ duration: 5, ease: 'linear' }}
/>
```

- Progress bar at top of toast
- Animates from 100% to 0% over 5 seconds
- Color matches toast type

### 4. Distinct Type Styling (Task 8.4)
Four toast types with unique color schemes:

| Type | Light Mode | Dark Mode | Icon |
|------|-----------|-----------|------|
| **success** | Emerald bg/border/text | Emerald-950 bg, emerald-100 text | CheckCircle2 |
| **error** | Rose bg/border/text | Rose-950 bg, rose-100 text | AlertCircle |
| **warning** | Amber bg/border/text | Amber-950 bg, amber-100 text | AlertTriangle |
| **info** | Blue bg/border/text | Blue-950 bg, blue-100 text | Info |

**Color System:**
- Light mode: `{type}-50/95` background, `{type}-200/50` border, `{type}-900` text
- Dark mode: `{type}-950/95` background, `{type}-800/50` border, `{type}-100` text
- Icons: `{type}-600` (light) / `{type}-400` (dark)

### 5. Toast Stacking (Task 8.5)
Consistent 8px spacing between toasts:

```typescript
<div className="flex flex-col gap-2">  // gap-2 = 8px
    <AnimatePresence>
        {toasts.map((toast) => (
            <motion.div layout key={toast.id}>
                {/* Toast content */}
            </motion.div>
        ))}
    </AnimatePresence>
</div>
```

- Uses Framer Motion `layout` prop for smooth repositioning
- Toasts stack vertically with 8px gap
- Bottom-right positioning (responsive)

## Flash Message Support

Backend can now send warning messages:

```php
// Laravel controller
return redirect()->back()->with('warning', 'Peringatan penting');
```

```typescript
// Supported flash types
interface ToastPageProps {
    flash?: {
        success?: string;
        error?: string;
        info?: string;
        warning?: string;  // New!
    };
}
```

## Visual Design

### Progress Bar
- 1px height
- Positioned at top of toast
- Type-specific color (emerald/rose/amber/blue-500)
- Linear animation over 5 seconds

### Action Button
- Appears below message text
- Small underlined text
- Type-specific color (darker in light mode, lighter in dark mode)
- Hover opacity transition
- Dismisses toast on click

### Close Button
- Top-right corner
- Subtle hover background
- 40% opacity, increases to 60% on hover
- Respects light/dark mode

## Accessibility

- Progress bar is visual-only (decorative)
- Close button has `aria-label="Tutup notifikasi"`
- Toast container has `role="alert"` (inherited from AnimatePresence wrapper)
- Keyboard accessible (close button is focusable)

## Testing

All features covered by unit tests:
- Success/error/info/warning flash messages
- Auto-dismiss after 5 seconds
- Manual dismiss via close button
- Dark mode styling
- Multiple toasts rendering together

Run tests:
```bash
npm run test:unit -- ToastNotification.test.tsx
```

## Migration Notes

### Breaking Changes
None - fully backward compatible.

### New Features Available
1. Add `warning` to flash messages
2. Pass `action` prop to programmatically created toasts
3. Duration changed from 4.5s to 5s (minor)

### Styling Changes
- Toast backgrounds now type-specific (was generic white/slate)
- Icon colors now match type theme (was fixed emerald/rose/blue)
- Gap reduced from 12px to 8px (gap-3 → gap-2)
- Animation changed from slide-right to slide-up

## Future Enhancements

Potential improvements:
- Configurable duration per toast
- Toast queue limit (max visible toasts)
- Pause on hover
- Sound effects (optional)
- Persistent toasts (no auto-dismiss)
- Custom icons per toast
