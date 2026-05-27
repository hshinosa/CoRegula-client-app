import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

import { SharedData } from '@/types';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastPageProps extends SharedData {
    flash?: {
        success?: string;
        error?: string;
        info?: string;
        warning?: string;
    };
    errors?: Record<string, string>;
}

interface ToastAction {
    label: string;
    onClick: () => void;
}

interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
    action?: ToastAction;
}

export function ToastNotification({ lightMode = true }: { lightMode?: boolean }) {
    const { flash, errors } = usePage<ToastPageProps>().props;
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        const addToast = (message: string, type: ToastType, action?: ToastAction) => {
            const id = Math.random().toString(36).substr(2, 9);
            setToasts((prev) => [...prev, { id, message, type, action }]);

            setTimeout(() => {
                removeToast(id);
            }, 5000);
        };

        if (flash?.success) {
            addToast(flash.success, 'success');
        }
        if (flash?.error) {
            addToast(flash.error, 'error');
        }
        if (flash?.info) {
            addToast(flash.info, 'info');
        }
        if (flash?.warning) {
            addToast(flash.warning, 'warning');
        }

        // Handle validation errors globally
        if (errors) {
            const errorMessages = Object.values(errors);
            if (errorMessages.length > 0) {
                // Just show the first error to avoid spamming
                addToast(errorMessages[0] as string, 'error');
            }
        }
    }, [flash, errors]);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="h-5 w-5" />;
            case 'error':
                return <AlertCircle className="h-5 w-5" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5" />;
            case 'info':
            default:
                return <Info className="h-5 w-5" />;
        }
    };

    const getTypeStyles = (type: ToastType) => {
        const baseStyles = lightMode 
            ? 'bg-white/95 border-slate-200/50' 
            : 'bg-slate-900/95 border-slate-800/50';
        
        switch (type) {
            case 'success':
                return lightMode
                    ? 'bg-emerald-50/95 border-emerald-200/50 text-emerald-900'
                    : 'bg-emerald-950/95 border-emerald-800/50 text-emerald-100';
            case 'error':
                return lightMode
                    ? 'bg-rose-50/95 border-rose-200/50 text-rose-900'
                    : 'bg-rose-950/95 border-rose-800/50 text-rose-100';
            case 'warning':
                return lightMode
                    ? 'bg-amber-50/95 border-amber-200/50 text-amber-900'
                    : 'bg-amber-950/95 border-amber-800/50 text-amber-100';
            case 'info':
            default:
                return lightMode
                    ? 'bg-blue-50/95 border-blue-200/50 text-blue-900'
                    : 'bg-blue-950/95 border-blue-800/50 text-blue-100';
        }
    };

    const getIconColor = (type: ToastType) => {
        switch (type) {
            case 'success':
                return lightMode ? 'text-emerald-600' : 'text-emerald-400';
            case 'error':
                return lightMode ? 'text-rose-600' : 'text-rose-400';
            case 'warning':
                return lightMode ? 'text-amber-600' : 'text-amber-400';
            case 'info':
            default:
                return lightMode ? 'text-blue-600' : 'text-blue-400';
        }
    };

    return (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2 sm:bottom-8 sm:right-8">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className={`pointer-events-auto relative flex w-[350px] flex-col overflow-hidden rounded-2xl shadow-xl backdrop-blur-md border ${getTypeStyles(toast.type)}`}
                        style={{
                            boxShadow: lightMode 
                                ? '0 10px 40px -10px rgba(0,0,0,0.1)' 
                                : '0 10px 40px -10px rgba(0,0,0,0.5)'
                        }}
                    >
                        {/* Progress bar */}
                        <motion.div
                            className={`absolute top-0 left-0 h-1 ${
                                toast.type === 'success' ? 'bg-emerald-500' :
                                toast.type === 'error' ? 'bg-rose-500' :
                                toast.type === 'warning' ? 'bg-amber-500' :
                                'bg-blue-500'
                            }`}
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: 5, ease: 'linear' }}
                        />

                        <div className="flex items-start gap-3 p-4">
                            <div className={`mt-0.5 flex-shrink-0 ${getIconColor(toast.type)}`}>
                                {getIcon(toast.type)}
                            </div>
                            
                            <div className="flex-1">
                                <div className="text-sm font-medium leading-relaxed">
                                    {toast.message}
                                </div>
                                
                                {toast.action && (
                                    <button
                                        onClick={() => {
                                            toast.action?.onClick();
                                            removeToast(toast.id);
                                        }}
                                        className={`mt-2 text-xs font-semibold underline underline-offset-2 transition-opacity hover:opacity-70 ${
                                            toast.type === 'success' ? (lightMode ? 'text-emerald-700' : 'text-emerald-300') :
                                            toast.type === 'error' ? (lightMode ? 'text-rose-700' : 'text-rose-300') :
                                            toast.type === 'warning' ? (lightMode ? 'text-amber-700' : 'text-amber-300') :
                                            (lightMode ? 'text-blue-700' : 'text-blue-300')
                                        }`}
                                    >
                                        {toast.action.label}
                                    </button>
                                )}
                            </div>
                            
                            <button
                                onClick={() => removeToast(toast.id)}
                                className={`flex-shrink-0 rounded-full p-1 transition-colors ${
                                    lightMode 
                                        ? 'hover:bg-black/5 text-current/40 hover:text-current/60' 
                                        : 'hover:bg-white/10 text-current/40 hover:text-current/60'
                                }`}
                                aria-label="Tutup notifikasi"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
