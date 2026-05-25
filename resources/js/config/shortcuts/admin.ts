import { KeyboardShortcutMap } from '@/hooks/useKeyboardShortcuts';

export const adminShortcuts: KeyboardShortcutMap = {
    navigation: [
        { key: 'ctrl+1', description: 'Dashboard', route: '/admin/dashboard' },
        { key: 'ctrl+2', description: 'Users', route: '/admin/users' },
        { key: 'ctrl+3', description: 'Master Data', route: '/admin/master-data' },
        { key: 'ctrl+4', description: 'AI Settings', route: '/admin/ai-settings' },
        { key: 'ctrl+5', description: 'AI Comparison', route: '/admin/ai-comparison' },
        { key: 'ctrl+6', description: 'Audit Log', route: '/admin/audit-log' },
    ],
    modals: [
        { key: 'ctrl+k', description: 'Open search', action: () => {} },
        { key: 'ctrl+?', description: 'Show keyboard shortcuts', action: () => {} },
        { key: 'esc', description: 'Close modal', action: () => {} },
    ],
};
