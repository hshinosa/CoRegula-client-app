import { router } from '@inertiajs/react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useCallback } from 'react';

const ADMIN_NAV_ROUTES = [
    '/admin/dashboard',
    '/admin/users',
    '/admin/master-data',
    '/admin/ai-settings',
    '/admin/ai-comparison',
    '/admin/audit-log',
] as const;

interface UseAdminKeyboardShortcutsOptions {
    searchOpen: boolean;
    setSearchOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
    helpOpen: boolean;
    setHelpOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
    onNew?: () => void;
}

function isInputFocused(): boolean {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || el.getAttribute('contenteditable') === 'true';
}

export function useAdminKeyboardShortcuts({
    searchOpen,
    setSearchOpen,
    helpOpen,
    setHelpOpen,
    onNew,
}: UseAdminKeyboardShortcutsOptions) {
    const navigateToIndex = useCallback((index: number) => {
        if (index >= 0 && index < ADMIN_NAV_ROUTES.length) {
            router.get(ADMIN_NAV_ROUTES[index]);
        }
    }, []);

    const handleEscape = useCallback(() => {
        if (searchOpen) setSearchOpen(false);
        if (helpOpen) setHelpOpen(false);
    }, [searchOpen, helpOpen, setSearchOpen, setHelpOpen]);

    const handleSearch = useCallback((e: KeyboardEvent) => {
        if (isInputFocused() && !searchOpen) return;
        e.preventDefault();
        setSearchOpen((prev) => !prev);
    }, [searchOpen, setSearchOpen]);

    const handleHelp = useCallback((e: KeyboardEvent) => {
        e.preventDefault();
        setHelpOpen((prev) => !prev);
    }, [setHelpOpen]);

    const handleNew = useCallback((e: KeyboardEvent) => {
        if (isInputFocused()) return;
        e.preventDefault();
        if (onNew) {
            onNew();
        }
    }, [onNew]);

    useHotkeys('ctrl+k', handleSearch, { enableOnFormTags: false });
    useHotkeys('ctrl+?', handleHelp);
    useHotkeys('esc', handleEscape);

    useHotkeys('ctrl+n', handleNew, { enableOnFormTags: false });

    useHotkeys('ctrl+1', (e) => { e.preventDefault(); navigateToIndex(0); });
    useHotkeys('ctrl+2', (e) => { e.preventDefault(); navigateToIndex(1); });
    useHotkeys('ctrl+3', (e) => { e.preventDefault(); navigateToIndex(2); });
    useHotkeys('ctrl+4', (e) => { e.preventDefault(); navigateToIndex(3); });
    useHotkeys('ctrl+5', (e) => { e.preventDefault(); navigateToIndex(4); });
    useHotkeys('ctrl+6', (e) => { e.preventDefault(); navigateToIndex(5); });

    return { navigateToIndex };
}
