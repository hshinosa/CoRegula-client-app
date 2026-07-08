import { KeyboardShortcutMap } from '@/hooks/useKeyboardShortcuts';

export const lecturerShortcuts: KeyboardShortcutMap = {
    navigation: [
        { key: 'ctrl+1', description: 'Dasbor', route: '/lecturer/dashboard' },
        { key: 'ctrl+2', description: 'Kelas', route: '/lecturer/courses' },
        { key: 'ctrl+3', description: 'Sesi', route: '/lecturer/sessions' },
        { key: 'ctrl+4', description: 'Analitik', route: '/lecturer/analytics' },
        { key: 'ctrl+6', description: 'Kelompok', route: '/lecturer/groups' },
    ],
    modals: [
        { key: 'ctrl+k', description: 'Open search', action: () => {} },
        { key: 'ctrl+?', description: 'Show keyboard shortcuts', action: () => {} },
        { key: 'esc', description: 'Close modal', action: () => {} },
    ],
};
