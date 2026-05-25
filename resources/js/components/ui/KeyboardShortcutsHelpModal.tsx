import { AnimatePresence, motion } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { KeyboardShortcutMap } from '@/hooks/useKeyboardShortcuts';

interface ShortcutDisplay {
    keys: string[];
    description: string;
}

interface ShortcutGroup {
    label: string;
    shortcuts: ShortcutDisplay[];
}

function parseKeyToDisplay(key: string): string[] {
    return key.split('+').map(k => {
        const normalized = k.trim().toLowerCase();
        if (normalized === 'ctrl') return 'Ctrl';
        if (normalized === 'shift') return 'Shift';
        if (normalized === 'alt') return 'Alt';
        if (normalized === 'meta' || normalized === 'cmd') return 'Cmd';
        if (normalized === 'esc' || normalized === 'escape') return 'Esc';
        return k.trim().toUpperCase();
    });
}

function buildShortcutGroups(shortcuts: KeyboardShortcutMap): ShortcutGroup[] {
    const groups: ShortcutGroup[] = [];

    if (shortcuts.navigation && shortcuts.navigation.length > 0) {
        groups.push({
            label: 'Navigasi',
            shortcuts: shortcuts.navigation.map(nav => ({
                keys: parseKeyToDisplay(nav.key),
                description: nav.description,
            })),
        });
    }

    if (shortcuts.actions && shortcuts.actions.length > 0) {
        groups.push({
            label: 'Aksi',
            shortcuts: shortcuts.actions.map(action => ({
                keys: parseKeyToDisplay(action.key),
                description: action.description,
            })),
        });
    }

    if (shortcuts.modals && shortcuts.modals.length > 0) {
        groups.push({
            label: 'Modal',
            shortcuts: shortcuts.modals.map(modal => ({
                keys: parseKeyToDisplay(modal.key),
                description: modal.description,
            })),
        });
    }

    return groups;
}

function KeyBadge({ children }: { children: React.ReactNode }) {
    return (
        <span
            className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg text-xs font-semibold"
            style={{
                background: 'var(--dm-accent-bg)',
                color: 'var(--dm-accent)',
                border: '1px solid var(--dm-accent-border)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
        >
            {children}
        </span>
    );
}

interface KeyboardShortcutsHelpProps {
    open: boolean;
    onClose: () => void;
    shortcuts: KeyboardShortcutMap;
}

export function KeyboardShortcutsHelpModal({ open, onClose, shortcuts }: KeyboardShortcutsHelpProps) {
    const shortcutGroups = buildShortcutGroups(shortcuts);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl p-6"
                            style={{
                                background: 'rgba(255,255,255,0.98)',
                                backdropFilter: 'blur(20px)',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{
                                            background: 'linear-gradient(135deg, var(--dm-accent) 0%, var(--dm-accent-dark) 100%)',
                                        }}
                                    >
                                        <Keyboard className="w-5 h-5 text-white" />
                                    </div>
                                    <h2
                                        className="text-xl font-bold"
                                        style={{
                                            color: 'var(--dm-text)',
                                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                                        }}
                                    >
                                        Pintasan Keyboard
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                                    style={{
                                        background: 'var(--dm-surface)',
                                        color: 'var(--dm-text-secondary)',
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {shortcutGroups.map((group, groupIndex) => (
                                    <div key={groupIndex}>
                                        <h3
                                            className="text-sm font-semibold mb-3 uppercase tracking-wider"
                                            style={{
                                                color: 'var(--dm-text-secondary)',
                                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                            }}
                                        >
                                            {group.label}
                                        </h3>
                                        <div className="space-y-2">
                                            {group.shortcuts.map((shortcut, shortcutIndex) => (
                                                <div
                                                    key={shortcutIndex}
                                                    className="flex items-center justify-between p-3 rounded-xl transition-all hover:scale-[1.02]"
                                                    style={{
                                                        background: 'var(--dm-surface)',
                                                    }}
                                                >
                                                    <span
                                                        className="text-sm font-medium"
                                                        style={{
                                                            color: 'var(--dm-text)',
                                                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                        }}
                                                    >
                                                        {shortcut.description}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {shortcut.keys.map((key, keyIndex) => (
                                                            <KeyBadge key={keyIndex}>{key}</KeyBadge>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
