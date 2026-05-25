import React, { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    type: 'error' | 'success' | 'info';
    onDismiss: () => void;
    duration?: number;
}

const toastVariants: Record<ToastProps['type'], { container: string; badge: string; label: string }> = {
    error: {
        container: 'border-[#88161c]/20 bg-[rgba(136,22,28,0.08)] text-[#6f1218]',
        badge: 'bg-[#88161c] text-white',
        label: 'Kesalahan',
    },
    success: {
        container: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        badge: 'bg-emerald-600 text-white',
        label: 'Berhasil',
    },
    info: {
        container: 'border-white/60 bg-white text-[#4A4A4A]',
        badge: 'bg-gray-700 text-white',
        label: 'Info',
    },
};

export const Toast: React.FC<ToastProps> = ({
    message,
    type,
    onDismiss,
    duration = 5000,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const variant = toastVariants[type];

    useEffect(() => {
        const frameId = window.requestAnimationFrame(() => {
            setIsVisible(true);
        });
        const timeoutId = window.setTimeout(() => {
            onDismiss();
        }, duration);

        return () => {
            window.cancelAnimationFrame(frameId);
            window.clearTimeout(timeoutId);
        };
    }, [duration, onDismiss]);

    return (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] justify-end sm:w-auto">
            <div
                role="alert"
                aria-live="polite"
                aria-atomic="true"
                className={`pointer-events-auto w-full max-w-sm rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-300 ease-out sm:w-96 ${variant.container} ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
            >
                <div className="flex items-start gap-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${variant.badge}`}>
                        {variant.label}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm leading-6">{message}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onDismiss}
                        className="shrink-0 rounded-full px-2 py-1 text-xs font-medium text-current/70 transition hover:bg-black/5 hover:text-current focus:outline-none focus:ring-2 focus:ring-current/20"
                        aria-label="Tutup"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Toast;
