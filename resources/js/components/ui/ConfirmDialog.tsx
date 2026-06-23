import { AlertTriangle, Loader2, X } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning';
    isProcessing?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = 'Konfirmasi',
    cancelLabel = 'Batal',
    variant = 'danger',
    isProcessing = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <BaseModal open={open} title={title} onClose={onCancel} size="sm" className="p-6" closeOnOverlayClick>
                <div className="mb-4 flex items-start gap-3">
                    <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{
                            background: variant === 'danger'
                                ? 'rgba(220,38,38,0.1)'
                                : 'rgba(234,179,8,0.1)',
                            border: `1px solid ${variant === 'danger' ? 'rgba(220,38,38,0.2)' : 'rgba(234,179,8,0.2)'}`,
                        }}
                    >
                        <AlertTriangle className="h-5 w-5" style={{ color: variant === 'danger' ? '#dc2626' : '#ca8a04' }} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-semibold">{title}</h3>
                        <p className="mt-1 text-sm text-brand-muted-dark">{message}</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-brand-muted-dark transition-colors hover:bg-[rgba(136,22,28,0.08)] hover:text-brand-primary"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="rounded-xl px-4 py-2 text-sm font-medium text-brand-muted-dark transition-colors hover:bg-[rgba(136,22,28,0.06)] disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all disabled:opacity-70"
                        style={{
                            background: variant === 'danger' ? '#dc2626' : '#88161c',
                            boxShadow: `0 4px 12px ${variant === 'danger' ? 'rgba(220,38,38,0.3)' : 'rgba(136,22,28,0.3)'}`,
                        }}
                    >
                        {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                        {confirmLabel}
                    </button>
                </div>
        </BaseModal>
    );
}
