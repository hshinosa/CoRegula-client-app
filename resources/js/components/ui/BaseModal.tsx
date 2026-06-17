import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useId, useRef } from 'react';

type Size = 'sm' | 'md' | 'lg' | 'xl';

interface BaseModalProps {
    open: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    size?: Size;
    closeOnOverlayClick?: boolean;
    closeOnEsc?: boolean;
    className?: string;
}

const sizeClass: Record<Size, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
};

export function BaseModal({
    open,
    title,
    onClose,
    children,
    size = 'md',
    closeOnOverlayClick = true,
    closeOnEsc = true,
    className = '',
}: BaseModalProps) {
    const labelId = useId();
    const dialogRef = useRef<HTMLDivElement>(null);
    const lastActiveRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!open) return;
        lastActiveRef.current = document.activeElement as HTMLElement | null;
        const onKeyDown = (e: KeyboardEvent) => {
            if (closeOnEsc && e.key === 'Escape') onClose();
            if (e.key !== 'Tab') return;
            const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );
            if (!focusables || focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        };
        document.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';
        setTimeout(() => dialogRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus(), 0);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
            lastActiveRef.current?.focus?.();
        };
    }, [open, closeOnEsc, onClose]);

    if (!open) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                onClick={closeOnOverlayClick ? onClose : undefined}
                role="presentation"
            >
                <motion.div
                    ref={dialogRef}
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 10 }}
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={labelId}
                    className={`w-full ${sizeClass[size]} overflow-hidden rounded-2xl bg-white shadow-xl ${className}`}
                >
                    <div id={labelId} className="sr-only">{title}</div>
                    {children}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
