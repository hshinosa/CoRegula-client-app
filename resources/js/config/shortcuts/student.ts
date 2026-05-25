import { KeyboardShortcutMap } from '@/hooks/useKeyboardShortcuts';

export const studentShortcuts: KeyboardShortcutMap = {
    navigation: [
        { key: 'ctrl+1', description: 'Dashboard', route: '/student/dashboard' },
        { key: 'ctrl+2', description: 'Courses', route: '/student/courses' },
        { key: 'ctrl+3', description: 'Groups', route: '/student/groups' },
        { key: 'ctrl+4', description: 'Reflections', route: '/student/reflections' },
        { key: 'ctrl+5', description: 'AI Chat', route: '/student/ai-chat' },
        { key: 'ctrl+6', description: 'Chat Spaces', route: '/student/chat-spaces' },
        { key: 'ctrl+7', description: 'Profile', route: '/student/profile' },
    ],
    modals: [
        { key: 'ctrl+k', description: 'Open search', action: () => {} },
        { key: 'ctrl+?', description: 'Show keyboard shortcuts', action: () => {} },
        { key: 'esc', description: 'Close modal', action: () => {} },
    ],
};
