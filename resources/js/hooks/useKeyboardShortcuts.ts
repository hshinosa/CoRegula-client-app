import { router } from '@inertiajs/react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useCallback } from 'react';

export interface KeyboardShortcut {
    key: string;
    description: string;
    action: () => void;
    category?: string;
}

export interface KeyboardShortcutMap {
    navigation?: Array<{ key: string; description: string; route: string }>;
    actions?: Array<{ key: string; description: string; action: () => void }>;
    modals?: Array<{ key: string; description: string; action: () => void }>;
}

interface UseKeyboardShortcutsOptions {
    shortcuts: KeyboardShortcutMap;
    searchOpen?: boolean;
    setSearchOpen?: (open: boolean | ((prev: boolean) => boolean)) => void;
    helpOpen?: boolean;
    setHelpOpen?: (open: boolean | ((prev: boolean) => boolean)) => void;
}

function isInputFocused(): boolean {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || el.getAttribute('contenteditable') === 'true';
}

export function useKeyboardShortcuts({
    shortcuts,
    searchOpen,
    setSearchOpen,
    helpOpen,
    setHelpOpen,
}: UseKeyboardShortcutsOptions) {
    const navigateToRoute = useCallback((route: string) => {
        router.get(route);
    }, []);

    const handleEscape = useCallback(() => {
        if (searchOpen && setSearchOpen) setSearchOpen(false);
        if (helpOpen && setHelpOpen) setHelpOpen(false);
    }, [searchOpen, helpOpen, setSearchOpen, setHelpOpen]);

    const handleSearch = useCallback((e: KeyboardEvent) => {
        if (isInputFocused() && !searchOpen) return;
        e.preventDefault();
        if (setSearchOpen) {
            setSearchOpen((prev) => !prev);
        }
    }, [searchOpen, setSearchOpen]);

    const handleHelp = useCallback((e: KeyboardEvent) => {
        e.preventDefault();
        if (setHelpOpen) {
            setHelpOpen((prev) => !prev);
        }
    }, [setHelpOpen]);

    useHotkeys('esc', handleEscape);
    useHotkeys('ctrl+?', handleHelp);

    if (setSearchOpen) {
        useHotkeys('ctrl+k', handleSearch, { enableOnFormTags: false });
    }

    shortcuts.navigation?.forEach((shortcut, index) => {
        useHotkeys(shortcut.key, (e) => {
            e.preventDefault();
            navigateToRoute(shortcut.route);
        });
    });

    shortcuts.actions?.forEach((shortcut) => {
        useHotkeys(shortcut.key, (e) => {
            if (isInputFocused()) return;
            e.preventDefault();
            shortcut.action();
        }, { enableOnFormTags: false });
    });

    shortcuts.modals?.forEach((shortcut) => {
        useHotkeys(shortcut.key, (e) => {
            e.preventDefault();
            shortcut.action();
        });
    });

    return {
        shortcuts,
        isInputFocused,
    };
}
