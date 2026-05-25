import { motion } from 'framer-motion';
import { Calendar, Filter, RotateCcw } from 'lucide-react';
import { CourseStatus, CourseFilterCounts } from '@/types';

interface CourseFiltersProps {
    activeStatus: CourseStatus | null;
    onStatusChange: (status: CourseStatus | null) => void;
    statusCounts: CourseFilterCounts;
    activeSemester: string | null;
    onSemesterChange: (semester: string | null) => void;
    semesterCounts: Record<string, number>;
    hasActiveFilters: boolean;
    onResetFilters: () => void;
}

const STATUS_OPTIONS: { value: CourseStatus; label: string }[] = [
    { value: 'aktif', label: 'Aktif' },
    { value: 'belum_mulai', label: 'Belum Mulai' },
    { value: 'selesai', label: 'Selesai' },
];

export function CourseFilters({
    activeStatus,
    onStatusChange,
    statusCounts,
    activeSemester,
    onSemesterChange,
    semesterCounts,
    hasActiveFilters,
    onResetFilters,
}: CourseFiltersProps) {
    const semesterOptions = Object.entries(semesterCounts)
        .sort(([a], [b]) => b.localeCompare(a));

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#6B7280]">
                    <Filter className="h-3.5 w-3.5" />
                    Status:
                </div>

                {STATUS_OPTIONS.map(({ value, label }) => {
                    const isActive = activeStatus === value;
                    const count = statusCounts[value];

                    return (
                        <motion.button
                            key={value}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onStatusChange(isActive ? null : value)}
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200"
                            style={{
                                background: isActive
                                    ? 'rgba(136,22,28,0.12)'
                                    : 'rgba(136,22,28,0.04)',
                                color: isActive ? '#88161c' : '#6B7280',
                                border: isActive
                                    ? '1px solid rgba(136,22,28,0.25)'
                                    : '1px solid rgba(136,22,28,0.1)',
                            }}
                        >
                            {label}
                            <span
                                className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold"
                                style={{
                                    background: isActive
                                        ? 'rgba(136,22,28,0.15)'
                                        : 'rgba(136,22,28,0.08)',
                                }}
                            >
                                {count}
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            {semesterOptions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#6B7280]">
                        <Calendar className="h-3.5 w-3.5" />
                        Semester:
                    </div>

                    {semesterOptions.map(([key, count]) => {
                        const isActive = activeSemester === key;

                        return (
                            <motion.button
                                key={key}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onSemesterChange(isActive ? null : key)}
                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200"
                                style={{
                                    background: isActive
                                        ? 'rgba(136,22,28,0.12)'
                                        : 'rgba(136,22,28,0.04)',
                                    color: isActive ? '#88161c' : '#6B7280',
                                    border: isActive
                                        ? '1px solid rgba(136,22,28,0.25)'
                                        : '1px solid rgba(136,22,28,0.1)',
                                }}
                            >
                                {key}
                                <span
                                    className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold"
                                    style={{
                                        background: isActive
                                            ? 'rgba(136,22,28,0.15)'
                                            : 'rgba(136,22,28,0.08)',
                                    }}
                                >
                                    {count}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            )}

            {hasActiveFilters && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onResetFilters}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#6B7280] transition-colors hover:text-[#88161c]"
                >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                </motion.button>
            )}
        </div>
    );
}
