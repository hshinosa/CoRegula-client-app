import { motion } from 'framer-motion';
import { BookOpen, FolderKanban, MessageSquare, Zap, Clock, X } from 'lucide-react';
import type { SpaceType, SpaceStatus } from '@/hooks/useSpaceFilters';

interface FilterChipProps {
    label: string;
    active: boolean;
    count?: number;
    onClick: () => void;
    icon?: React.ReactNode;
}

function FilterChip({ label, active, count, onClick, icon }: FilterChipProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200"
            style={{
                background: active ? 'rgba(136,22,28,0.12)' : 'rgba(255,255,255,0.6)',
                color: active ? '#88161c' : '#6B7280',
                border: active ? '1px solid rgba(136,22,28,0.2)' : '1px solid rgba(255,255,255,0.5)',
                backdropFilter: 'blur(8px)',
            }}
            aria-pressed={active}
            aria-label={`Filter ${label}${count !== undefined ? ` (${count})` : ''}`}
        >
            {icon}
            {label}
            {count !== undefined && (
                <span
                    className="ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{
                        background: active ? 'rgba(136,22,28,0.15)' : 'rgba(107,114,128,0.1)',
                        color: active ? '#88161c' : '#6B7280',
                    }}
                >
                    {count}
                </span>
            )}
        </button>
    );
}

interface FilterChipsProps {
    selectedTypes: SpaceType[];
    selectedStatuses: SpaceStatus[];
    onToggleType: (type: SpaceType) => void;
    onToggleStatus: (status: SpaceStatus) => void;
    onClearAll: () => void;
    typeCounts?: Record<SpaceType, number>;
    statusCounts?: Record<SpaceStatus, number>;
}

const TYPE_OPTIONS: { value: SpaceType; label: string; icon: React.ReactNode }[] = [
    { value: 'Akademik', label: 'Akademik', icon: <BookOpen className="h-3 w-3" /> },
    { value: 'Proyek', label: 'Proyek', icon: <FolderKanban className="h-3 w-3" /> },
    { value: 'Umum', label: 'Umum', icon: <MessageSquare className="h-3 w-3" /> },
];

const STATUS_OPTIONS: { value: SpaceStatus; label: string; icon: React.ReactNode }[] = [
    { value: 'Aktif', label: 'Aktif', icon: <Zap className="h-3 w-3" /> },
    { value: 'Tidak aktif', label: 'Tidak aktif', icon: <Clock className="h-3 w-3" /> },
];

export function FilterChips({
    selectedTypes,
    selectedStatuses,
    onToggleType,
    onToggleStatus,
    onClearAll,
    typeCounts,
    statusCounts,
}: FilterChipsProps) {
    const hasAnySelected = selectedTypes.length > 0 || selectedStatuses.length > 0;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
                {TYPE_OPTIONS.map(({ value, label, icon }) => (
                    <FilterChip
                        key={value}
                        label={label}
                        active={selectedTypes.includes(value)}
                        count={typeCounts?.[value]}
                        onClick={() => onToggleType(value)}
                        icon={icon}
                    />
                ))}
            </div>

            {(TYPE_OPTIONS.length > 0 && STATUS_OPTIONS.length > 0) && (
                <div className="mx-1 h-5 w-px" style={{ background: 'rgba(107,114,128,0.2)' }} />
            )}

            <div className="flex flex-wrap items-center gap-1.5">
                {STATUS_OPTIONS.map(({ value, label, icon }) => (
                    <FilterChip
                        key={value}
                        label={label}
                        active={selectedStatuses.includes(value)}
                        count={statusCounts?.[value]}
                        onClick={() => onToggleStatus(value)}
                        icon={icon}
                    />
                ))}
            </div>

            {hasAnySelected && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    type="button"
                    onClick={onClearAll}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-brand-muted-dark transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label="Hapus semua filter"
                >
                    <X className="h-3 w-3" />
                    Hapus filter
                </motion.button>
            )}
        </div>
    );
}
