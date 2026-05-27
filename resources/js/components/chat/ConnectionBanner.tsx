import React from 'react';

interface ConnectionBannerProps {
    status: 'connecting' | 'reconnecting' | 'disconnected' | 'connected';
}

export const ConnectionBanner: React.FC<ConnectionBannerProps> = ({ status }) => {
    if (status === 'connected' || status === 'connecting') {
        return null;
    }

    if (status === 'reconnecting') {
        return (
            <div className="pointer-events-none fixed inset-x-4 top-4 z-40 flex justify-center">
                <div className="pointer-events-auto inline-flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-lg backdrop-blur-sm">
                    <span
                        aria-hidden="true"
                        className="h-4 w-4 animate-spin rounded-full border-2 border-amber-300 border-t-amber-700"
                    />
                    <p className="font-medium">Menyambungkan kembali...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pointer-events-none fixed inset-x-4 top-4 z-40 flex justify-center">
            <div className="pointer-events-auto flex w-full max-w-xl items-center justify-between gap-3 rounded-2xl border border-brand-primary/20 bg-[rgba(136,22,28,0.08)] px-4 py-3 text-sm text-[#6f1218] shadow-lg backdrop-blur-sm">
                <p className="font-medium">Koneksi terputus.</p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="rounded-full bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#6f1218] focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                >
                    Muat ulang
                </button>
            </div>
        </div>
    );
};

export default ConnectionBanner;
