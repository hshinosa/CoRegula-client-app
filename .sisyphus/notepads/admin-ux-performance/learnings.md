## Keyboard Shortcuts Implementation

- `react-hotkeys-hook` v5.3.2 used with `useHotkeys` hook
- AppLayout already had `searchOpen` state + raw Ctrl+K event listener; replaced with hook
- GlobalSearch was imported but NOT rendered in AppLayout JSX; fixed
- Design pattern: glassmorphism dialogs with z-[100]/z-[110] layering (above GlobalSearch z-[80]/z-[90])
- Admin nav has 6 items → Ctrl+1-6 routes via Inertia `router.get()`
- `isInputFocused()` helper prevents shortcuts from firing when typing in inputs
- Ctrl+? mapped to `ctrl+?` in react-hotkeys-hook (Shift+/ on US keyboards)
- `Ctrl+N` fires `onNew` callback — page-specific behavior, not hardcoded
