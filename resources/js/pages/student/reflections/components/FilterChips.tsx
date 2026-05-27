import { motion } from 'framer-motion';
import { Calendar, Tag, X } from 'lucide-react';

interface FilterChipsProps {
    selectedTags: string[];
    dateFrom: string;
    dateTo: string;
    onToggleTag: (tag: string) => void;
    onDateFromChange: (date: string) => void;
    onDateToChange: (date: string) => void;
    onClearAll: () => void;
    availableTags?: string[];
}

export function FilterChips({
    selectedTags,
    dateFrom,
    dateTo,
    onToggleTag,
    onDateFromChange,
    onDateToChange,
    onClearAll,
    availableTags = [],
}: FilterChipsProps) {
    const hasFilters = selectedTags.length > 0 || dateFrom || dateTo;

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

            {availableTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <Tag className="h-3.5 w-3.5 text-brand-muted-dark" />
                    {availableTags.map((tag) => (
                        <motion.button
                            key={tag}
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onToggleTag(tag)}
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all"
                            style={{
                                background: selectedTags.includes(tag) ? 'rgba(136,22,28,0.12)' : 'rgba(255,255,255,0.6)',
                                color: selectedTags.includes(tag) ? '#88161c' : '#6B7280',
                                border: selectedTags.includes(tag) ? '1px solid rgba(136,22,28,0.2)' : '1px solid rgba(255,255,255,0.5)',
                            }}
                            aria-pressed={selectedTags.includes(tag)}
                        >
                            {tag}
                        </motion.button>
                    ))}
                </div>
            )}

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
