import { X } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';

interface FormModalProps {
    open: boolean;
    title: string;
    description: string;
    children: React.ReactNode;
    onClose: () => void;
    maxWidth?: 'max-w-sm' | 'max-w-md' | 'max-w-lg' | 'max-w-xl' | 'max-w-2xl' | 'max-w-4xl';
    scrollable?: boolean;
}

const modalSizeMap: Record<NonNullable<FormModalProps['maxWidth']>, 'sm' | 'md' | 'lg' | 'xl'> = {
    'max-w-sm': 'sm',
    'max-w-md': 'md',
    'max-w-lg': 'lg',
    'max-w-xl': 'xl',
    'max-w-2xl': 'xl',
    'max-w-4xl': 'xl',
};

export function FormModal({
    open,
    title,
    description,
    children,
    onClose,
    maxWidth = 'max-w-lg',
    scrollable = false,
}: FormModalProps) {
    return (
        <BaseModal
            open={open}
            title={title}
            onClose={onClose}
            size={modalSizeMap[maxWidth] ?? 'lg'}
            className={`rounded-3xl ${scrollable ? 'max-h-[90vh] overflow-y-auto' : ''}`}
        >
            <div
                className="p-6 shadow-2xl"
                style={{
                    background: 'var(--dm-surface)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid var(--dm-border-strong)',
                }}
            >
                <div
                    className="flex items-start justify-between gap-4 pb-4"
                    style={{ borderBottom: '1px solid var(--dm-border)' }}
                >
                    <div>
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-brand-dark)' }}>
                            {title}
                        </h3>
                        <p className="mt-1 text-sm text-brand-muted-dark">{description}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-brand-muted-dark transition-all duration-150"
                        style={{ ['--hover-bg' as string]: 'var(--dm-surface-hover)' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--dm-surface-hover)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="mt-6 space-y-4">{children}</div>
            </div>
        </BaseModal>
    );
}
