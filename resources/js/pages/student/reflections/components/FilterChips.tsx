import { Calendar, X } from 'lucide-react';

interface FilterChipsProps {
    dateFrom: string;
    dateTo: string;
    onDateFromChange: (date: string) => void;
    onDateToChange: (date: string) => void;
    onClearAll: () => void;
}

export function FilterChips({
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
    onClearAll,
}: FilterChipsProps) {
    const hasFilters = dateFrom || dateTo;

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-brand-muted-dark">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Dari:</span>
                </div>
                <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => onDateFromChange(e.target.value)}
                    className="rounded-lg border-0 bg-white/60 px-2 py-1 text-xs text-brand-dark ring-1 ring-inset ring-white/50 focus:ring-2 focus:ring-inset focus:ring-brand-primary/30"
                />
                <div className="flex items-center gap-1 text-xs text-brand-muted-dark">
                    <span>Sampai:</span>
                </div>
                <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => onDateToChange(e.target.value)}
                    className="rounded-lg border-0 bg-white/60 px-2 py-1 text-xs text-brand-dark ring-1 ring-inset ring-white/50 focus:ring-2 focus:ring-inset focus:ring-brand-primary/30"
                />
            </div>

            {hasFilters && (
                <button
                    type="button"
                    onClick={onClearAll}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-brand-muted-dark transition-colors hover:bg-white/80 hover:text-brand-dark"
                >
                    <X className="h-3 w-3" />
                    Hapus filter
                </button>
            )}
        </div>
    );
}
