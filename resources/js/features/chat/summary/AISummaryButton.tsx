import { Loader2 } from 'lucide-react';

interface AISummaryButtonProps {
    onSummarize: () => void;
    isLoading: boolean;
}

export function AISummaryButton({ onSummarize, isLoading }: AISummaryButtonProps) {
    return (
        <button
            type="button"
            onClick={onSummarize}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/50 px-3 py-2 text-sm font-medium text-brand-dark transition-colors hover:bg-white/50 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: 'rgba(255,255,255,0.4)' }}
        >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            <span>Ringkas percakapan</span>
        </button>
    );
}
