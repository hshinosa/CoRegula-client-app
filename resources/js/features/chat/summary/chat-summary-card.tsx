import { useState } from 'react';

import { ChatSummaryDetail } from './chat-summary-detail';
import type { ChatSummaryState } from './types';

interface ChatSummaryCardProps {
    state: ChatSummaryState;
    onOpenDetail: () => void;
    onRetry?: () => Promise<void>;
}

export function ChatSummaryCard({ state, onOpenDetail, onRetry }: ChatSummaryCardProps) {
    const [showInlineDetail, setShowInlineDetail] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);

    if (state.status === 'loading') {
        return <div className="rounded-2xl border border-[rgba(255,255,255,0.45)] bg-white/70 p-4 text-sm text-brand-muted-dark">Sedang memuat ringkasan diskusi...</div>;
    }

    if (state.status === 'empty') {
        return (
            <div className="space-y-3 rounded-2xl border border-dashed border-[rgba(107,114,128,0.25)] bg-white/60 p-4 text-sm text-brand-muted-dark">
                <p>Ringkasan diskusi belum tersedia untuk room ini.</p>
                {onRetry && (
                    <button
                        type="button"
                        disabled={isRetrying}
                        onClick={async () => {
                            setIsRetrying(true);
                            try {
                                await onRetry();
                            } finally {
                                setIsRetrying(false);
                            }
                        }}
                        className="rounded-lg bg-brand-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {isRetrying ? 'Mencoba ulang...' : 'Buat Ringkasan'}
                    </button>
                )}
            </div>
        );
    }

    if (state.status === 'error') {
        return (
            <div className="space-y-3 rounded-2xl border border-[rgba(239,68,68,0.18)] bg-[rgba(254,242,242,0.9)] p-4 text-sm text-[#991B1B]">
                <p>{state.message}</p>
                {onRetry && (
                    <button
                        type="button"
                        disabled={isRetrying}
                        onClick={async () => {
                            setIsRetrying(true);
                            try {
                                await onRetry();
                            } finally {
                                setIsRetrying(false);
                            }
                        }}
                        className="rounded-lg bg-[#991B1B] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {isRetrying ? 'Mencoba ulang...' : 'Coba Lagi'}
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3 rounded-2xl border border-[rgba(255,255,255,0.45)] bg-white/75 p-4 shadow-brand-sm">
            <div className="space-y-2">
                <p className="text-sm font-semibold text-brand-dark">Ringkasan diskusi</p>
                <p className="text-sm leading-6 text-brand-dark">{state.summary.headline}</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-brand-muted-dark">
                    {state.summary.keyPoints.slice(0, 3).map((point) => (
                        <li key={point}>{point}</li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    className="rounded-lg bg-brand-primary px-3 py-2 text-sm font-medium text-white"
                    onClick={() => {
                        setShowInlineDetail((prev) => !prev);
                        onOpenDetail();
                    }}
                >
                    Lihat detail
                </button>
            </div>

            {showInlineDetail && <ChatSummaryDetail summary={state.summary} />}
        </div>
    );
}
