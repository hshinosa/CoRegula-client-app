import { motion } from 'framer-motion';
import type { CourseStatus, CourseFilterCounts } from '@/types';

interface FilterChipsProps {
    activeStatus: CourseStatus | null;
    onToggleStatus: (status: CourseStatus) => void;
    filterCounts: CourseFilterCounts;
    isFetching?: boolean;
}

const STATUS_OPTIONS: { value: CourseStatus; label: string }[] = [
    { value: 'aktif', label: 'Berjalan' },
    { value: 'belum_mulai', label: 'Belum Mulai' },
    { value: 'selesai', label: 'Selesai' },
];

export function FilterChips({ activeStatus, onToggleStatus, filterCounts, isFetching }: FilterChipsProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(({ value, label }) => {
                const isActive = activeStatus === value;
                const count = filterCounts[value] ?? 0;

                return (
                    <motion.button
                        key={value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onToggleStatus(value)}
                        disabled={isFetching}
                        className={`
                            inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium
                            transition-all duration-200 disabled:opacity-60
                            ${isActive
                                ? 'bg-[#88161c] text-white shadow-md shadow-[#88161c]/20'
                                : 'bg-white text-[#6B7280] border border-slate-200 hover:border-[#88161c]/30 hover:text-[#4A4A4A]'
                            }
                        `}
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        {label}
                        <span
                            className={`
                                inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 py-0.5 text-xs
                                ${isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-100 text-[#9CA3AF]'
                                }
                            `}
                        >
                            {count}
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
}
