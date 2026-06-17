import { X } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';

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
    return (
        <BaseModal open={open && !!target} title={target?.title ?? 'Document'} onClose={onClose} size="xl" className="flex h-[min(90vh,800px)] flex-col border border-white/40">
            {target && (
                <>
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
                </>
            )}
        </BaseModal>
    );
}
