import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export interface DocumentViewerTarget {
    title: string;
    fileName: string;
    streamUrl: string;
    fileType?: string | null;
}

interface DocumentViewerModalProps {
    open: boolean;
    target: DocumentViewerTarget | null;
    onClose: () => void;
}

function isPdf(fileType?: string | null, fileName?: string): boolean {
    if (fileType?.includes('pdf')) return true;
    return (fileName ?? '').toLowerCase().endsWith('.pdf');
}

function isImage(fileType?: string | null, fileName?: string): boolean {
    if (fileType?.startsWith('image/')) return true;
    const n = (fileName ?? '').toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].some((ext) => n.endsWith(ext));
}

export function DocumentViewerModal({ open, target, onClose }: DocumentViewerModalProps) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && target && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-2 sm:p-4"
                    onClick={onClose}
                    role="presentation"
                >
                    <motion.div
                        initial={{ scale: 0.96, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.96, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label={target.title}
                        className="flex h-[min(90vh,800px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/40 bg-white shadow-xl"
                    >
                        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
                            <div className="min-w-0">
                                <p className="truncate font-semibold text-brand-dark">{target.title}</p>
                                <p className="truncate text-xs text-brand-muted-dark">{target.fileName}</p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                                aria-label="Tutup"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </header>
                        <div className="min-h-0 flex-1 bg-gray-50">
                            {isPdf(target.fileType, target.fileName) ? (
                                <iframe
                                    title={target.title}
                                    src={target.streamUrl}
                                    className="h-full w-full border-0"
                                />
                            ) : isImage(target.fileType, target.fileName) ? (
                                <div className="flex h-full items-center justify-center overflow-auto p-4">
                                    <img
                                        src={target.streamUrl}
                                        alt={target.title}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                                    <p className="text-sm text-brand-muted-dark">
                                        Pratinjau tidak tersedia untuk tipe file ini. Buka di aplikasi pemutar
                                        eksternal jika perlu.
                                    </p>
                                    <a
                                        href={target.streamUrl}
                                        download={target.fileName}
                                        className="text-sm font-medium text-brand-primary hover:underline"
                                    >
                                        Unduh {target.fileName}
                                    </a>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}