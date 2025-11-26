import { Toaster as HotToaster, toast as hotToast } from 'react-hot-toast';

export function Toaster() {
    return (
        <HotToaster
            position="top-right"
            gutter={8}
            containerStyle={{
                top: 80,
            }}
            toastOptions={{
                duration: 4000,
                style: {
                    background: 'var(--color-zinc-900)',
                    color: 'var(--color-zinc-100)',
                    borderRadius: '0.75rem',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                },
                success: {
                    iconTheme: {
                        primary: 'var(--color-accent-500)',
                        secondary: 'white',
                    },
                },
                error: {
                    iconTheme: {
                        primary: 'var(--color-warning-500)',
                        secondary: 'white',
                    },
                },
            }}
        />
    );
}

export const toast = {
    success: (message: string) => {
        hotToast.success(message);
    },
    error: (message: string) => {
        hotToast.error(message);
    },
    loading: (message: string) => {
        return hotToast.loading(message);
    },
    dismiss: (toastId?: string) => {
        hotToast.dismiss(toastId);
    },
    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string;
            error: string;
        }
    ) => {
        return hotToast.promise(promise, messages);
    },
    custom: (message: string, options?: { icon?: string; duration?: number }) => {
        hotToast(message, {
            icon: options?.icon,
            duration: options?.duration,
        });
    },
};
