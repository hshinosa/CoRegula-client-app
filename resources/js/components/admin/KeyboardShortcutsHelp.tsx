import { AnimatePresence, motion } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';

interface ShortcutGroup {
    label: string;
    shortcuts: {
        keys: string[];
        description: string;
    }[];
}

const shortcutGroups: ShortcutGroup[] = [
    {
        label: 'Navigasi',
        shortcuts: [
            { keys: ['Ctrl', '1'], description: 'Dashboard' },
            { keys: ['Ctrl', '2'], description: 'User Management' },
            { keys: ['Ctrl', '3'], description: 'Master Data' },
            { keys: ['Ctrl', '4'], description: 'AI Settings' },
            { keys: ['Ctrl', '5'], description: 'AI Comparison' },
            { keys: ['Ctrl', '6'], description: 'Audit Log' },
        ],
    },
    {
        label: 'Aksi',
        shortcuts: [
            { keys: ['Ctrl', 'K'], description: 'Pencarian' },
            { keys: ['Ctrl', 'N'], description: 'Buat baru' },
            { keys: ['Esc'], description: 'Tutup dialog' },
        ],
    },
    {
        label: 'Bantuan',
        shortcuts: [
            { keys: ['Ctrl', '?'], description: 'Tampilkan pintasan keyboard' },
        ],
    },
];

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
}

export function KeyboardShortcutsHelp({ open, onClose }: KeyboardShortcutsHelpProps) {
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
                                backdropFilter: 'blur(20px) saturate(180%)',
                                border: '1px solid rgba(136,22,28,0.1)',
                                boxShadow: '0 25px 60px rgba(0,0,0,0.15), 0 10px 24px rgba(0,0,0,0.08)',
                            }}
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                                        style={{
                                            background: 'var(--dm-accent-bg)',
                                            border: '1px solid var(--dm-accent-border)',
                                        }}
                                    >
                                        <Keyboard className="h-5 w-5 text-[var(--dm-accent)]" />
                                    </div>
                                    <div>
                                        <h2
                                            className="text-lg font-bold"
                                            style={{
                                                color: 'var(--dm-text)',
                                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                            }}
                                        >
                                            Pintasan Keyboard
                                        </h2>
                                        <p className="text-xs text-[var(--dm-text-secondary)]">
                                            Navigasi lebih cepat dengan keyboard
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="rounded-xl p-2 text-[var(--dm-text-secondary)] hover:text-[var(--dm-accent)] transition-colors"
                                    style={{ background: 'var(--dm-surface-transparent)' }}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-5">
                                {shortcutGroups.map((group) => (
                                    <div key={group.label}>
                                        <h3
                                            className="mb-2 text-xs font-semibold uppercase tracking-wider"
                                            style={{ color: 'var(--dm-text-secondary)' }}
                                        >
                                            {group.label}
                                        </h3>
                                        <div
                                            className="space-y-1 rounded-xl p-3"
                                            style={{
                                                background: 'var(--dm-surface-transparent)',
                                                border: '1px solid var(--dm-surface-divider)',
                                            }}
                                        >
                                            {group.shortcuts.map((shortcut, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-[var(--dm-accent-bg)]"
                                                >
                                                    <span
                                                        className="text-sm"
                                                        style={{ color: 'var(--dm-text)' }}
                                                    >
                                                        {shortcut.description}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {shortcut.keys.map((key, keyIdx) => (
                                                            <span key={keyIdx} className="flex items-center gap-1">
                                                                {keyIdx > 0 && (
                                                                    <span className="text-[var(--dm-text-secondary)] text-xs">+</span>
                                                                )}
                                                                <KeyBadge>{key}</KeyBadge>
                                                            </span>
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
