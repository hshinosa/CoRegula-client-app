import { useState, useCallback } from 'react';
import { Activity, Loader2 } from 'lucide-react';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { ActivityItem } from './ActivityItem';
import type { ActivityType } from '@/types';

const headingStyle = {
    color: '#4A4A4A',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
} as const;

const bodyTextClass = 'text-sm text-[#6B7280]';

const activityTypeFilters: { value: ActivityType | ''; label: string }[] = [
    { value: '', label: 'Semua' },
    { value: 'member_joined', label: 'Bergabung' },
    { value: 'member_left', label: 'Keluar' },
    { value: 'task_submitted', label: 'Tugas' },
    { value: 'comment_added', label: 'Komentar' },
    { value: 'document_updated', label: 'Dokumen' },
    { value: 'settings_changed', label: 'Pengaturan' },
];

interface ActivityFeedProps {
    groupId: string;
}

export function ActivityFeed({ groupId }: ActivityFeedProps) {
    const [typeFilter, setTypeFilter] = useState<ActivityType | ''>('');

    const {
        activities,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useActivityFeed({
        groupId,
        type: typeFilter || null,
    });

    const handleTypeFilter = useCallback((type: ActivityType | '') => {
        setTypeFilter(type);
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {activityTypeFilters.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => handleTypeFilter(filter.value)}
                        className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                        style={{
                            background: typeFilter === filter.value
                                ? 'rgba(136,22,28,0.1)'
                                : 'rgba(0,0,0,0.03)',
                            color: typeFilter === filter.value ? '#88161c' : '#6B7280',
                            border: typeFilter === filter.value
                                ? '1px solid rgba(136,22,28,0.2)'
                                : '1px solid transparent',
                        }}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <div
                                className="h-10 w-10 animate-pulse rounded-full"
                                style={{ background: 'rgba(0,0,0,0.05)' }}
                            />
                            <div className="flex-1 space-y-2">
                                <div
                                    className="h-4 w-3/4 animate-pulse rounded"
                                    style={{ background: 'rgba(0,0,0,0.05)' }}
                                />
                                <div
                                    className="h-3 w-1/4 animate-pulse rounded"
                                    style={{ background: 'rgba(0,0,0,0.05)' }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : activities.length === 0 ? (
                <div
                    className="flex flex-col items-center justify-center rounded-xl py-12"
                    style={{ background: 'rgba(0,0,0,0.02)' }}
                >
                    <Activity className="mb-3 h-12 w-12 text-gray-300" />
                    <h4 className="text-sm font-semibold" style={headingStyle}>
                        Belum ada aktivitas
                    </h4>
                    <p className={`mt-1 ${bodyTextClass}`}>
                        Aktivitas grup akan muncul di sini
                    </p>
                </div>
            ) : (
                <div className="space-y-0">
                    {activities.map((activity, index) => (
                        <ActivityItem
                            key={activity.id}
                            activity={activity}
                            index={index}
                            isLast={index === activities.length - 1 && !hasNextPage}
                        />
                    ))}
                </div>
            )}

            {hasNextPage && (
                <div className="flex justify-center pt-2">
                    <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50"
                        style={{
                            background: 'rgba(136,22,28,0.08)',
                            color: '#88161c',
                            border: '1px solid rgba(136,22,28,0.15)',
                        }}
                    >
                        {isFetchingNextPage ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Memuat...
                            </>
                        ) : (
                            'Muat Lebih Banyak'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
