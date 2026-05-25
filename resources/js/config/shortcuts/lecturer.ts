import { KeyboardShortcutMap } from '@/hooks/useKeyboardShortcuts';

export const lecturerShortcuts: KeyboardShortcutMap = {
    navigation: [
        { key: 'ctrl+1', description: 'Dashboard', route: '/lecturer/dashboard' },
        { key: 'ctrl+2', description: 'Courses', route: '/lecturer/courses' },
        { key: 'ctrl+3', description: 'Sessions', route: '/lecturer/sessions' },
        { key: 'ctrl+4', description: 'Analytics', route: '/lecturer/analytics' },
        { key: 'ctrl+5', description: 'AI Settings', route: '/lecturer/ai-settings' },
        { key: 'ctrl+6', description: 'Groups', route: '/lecturer/groups' },
    ],
    modals: [
        { key: 'ctrl+k', description: 'Open search', action: () => {} },
        { key: 'ctrl+?', description: 'Show keyboard shortcuts', action: () => {} },
        { key: 'esc', description: 'Close modal', action: () => {} },
    ],
};
