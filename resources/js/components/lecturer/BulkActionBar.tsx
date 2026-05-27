import { motion, AnimatePresence } from 'framer-motion';
import { Archive, Loader2, X } from 'lucide-react';

interface BulkActionBarProps {
    selectedCount: number;
    totalCount: number;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onBulkArchive: () => void;
    isProcessing: boolean;
}

export function BulkActionBar({
    selectedCount,
    totalCount,
    onSelectAll,
    onDeselectAll,
    onBulkArchive,
    isProcessing,
}: BulkActionBarProps) {
    const allSelected = selectedCount === totalCount && totalCount > 0;

    return (
        <AnimatePresence>
            {selectedCount > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
                >
                    <div
                        className="flex items-center gap-3 rounded-2xl px-5 py-3 shadow-2xl"
                        style={{
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                            border: '1px solid rgba(136,22,28,0.15)',
                            boxShadow: '0 20px 60px rgba(136,22,28,0.15), 0 8px 24px rgba(0,0,0,0.08)',
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full px-2 text-xs font-bold text-white"
                                style={{ background: '#88161c' }}
                            >
                                {selectedCount}
                            </span>
                            <span className="text-sm font-medium text-brand-dark">
                                dipilih
                            </span>
                        </div>

                        <div className="h-6 w-px bg-[rgba(136,22,28,0.12)]" />

                        <button
                            onClick={allSelected ? onDeselectAll : onSelectAll}
                            className="text-xs font-medium text-brand-muted-dark transition-colors hover:text-brand-primary"
                            disabled={isProcessing}
                        >
                            {allSelected ? 'Batal Pilih Semua' : 'Pilih Semua'}
                        </button>

                        <div className="h-6 w-px bg-[rgba(136,22,28,0.12)]" />

                        <button
                            onClick={onBulkArchive}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-60"
                            style={{
                                background: isProcessing
                                    ? 'linear-gradient(135deg, rgba(164,18,25,0.7) 0%, rgba(136,22,28,0.7) 100%)'
                                    : 'linear-gradient(135deg, rgba(164,18,25,0.92) 0%, rgba(136,22,28,0.96) 100%)',
                                boxShadow: '0 4px 16px rgba(136,22,28,0.3)',
                            }}
                        >
                            {isProcessing ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Archive className="h-3.5 w-3.5" />
                            )}
                            {isProcessing ? 'Mengarsipkan...' : 'Arsipkan'}
                        </button>

                        <button
                            onClick={onDeselectAll}
                            disabled={isProcessing}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-brand-muted-dark transition-colors hover:bg-[rgba(136,22,28,0.08)] hover:text-brand-primary"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
