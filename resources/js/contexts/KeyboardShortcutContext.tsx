import { createContext, useContext, PropsWithChildren } from 'react';
import { KeyboardShortcutMap } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutContextValue {
    shortcuts: KeyboardShortcutMap;
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextValue | undefined>(undefined);

interface KeyboardShortcutProviderProps extends PropsWithChildren {
    shortcuts: KeyboardShortcutMap;
}

export function KeyboardShortcutProvider({ children, shortcuts }: KeyboardShortcutProviderProps) {
    return (
        <KeyboardShortcutContext.Provider value={{ shortcuts }}>
            {children}
        </KeyboardShortcutContext.Provider>
    );
}

export function useKeyboardShortcutContext() {
    const context = useContext(KeyboardShortcutContext);
    if (!context) {
        throw new Error('useKeyboardShortcutContext must be used within KeyboardShortcutProvider');
    }
    return context;
}
