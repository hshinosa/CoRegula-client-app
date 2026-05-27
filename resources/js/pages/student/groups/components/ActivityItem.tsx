import { motion } from 'framer-motion';
import { UserPlus, UserMinus, FileText, MessageSquare, FileEdit, Settings, Clock } from 'lucide-react';
import type { GroupActivity, ActivityType } from '@/types';

const activityConfig: Record<ActivityType, { icon: typeof UserPlus; color: string; bg: string }> = {
    member_joined: { icon: UserPlus, color: '#16A34A', bg: 'rgba(22,163,74,0.1)' },
    member_left: { icon: UserMinus, color: '#DC2626', bg: 'rgba(220,38,38,0.1)' },
    task_submitted: { icon: FileText, color: '#2563EB', bg: 'rgba(37,99,235,0.1)' },
    comment_added: { icon: MessageSquare, color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
    document_updated: { icon: FileEdit, color: '#D97706', bg: 'rgba(217,119,6,0.1)' },
    settings_changed: { icon: Settings, color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
};

function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface ActivityItemProps {
    activity: GroupActivity;
    index?: number;
    isLast?: boolean;
}

export function ActivityItem({ activity, index = 0, isLast = false }: ActivityItemProps) {
    const config = activityConfig[activity.type];
    const ActivityIcon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative flex gap-4"
        >
            {!isLast && (
                <div
                    className="absolute left-5 top-10 h-full w-0.5"
                    style={{ background: 'rgba(0,0,0,0.06)' }}
                />
            )}

            <div
                className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                style={{ background: config.bg }}
            >
                <ActivityIcon className="h-4 w-4" style={{ color: config.color }} />
            </div>

            <div className="flex-1 pb-6">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="text-sm" style={{ color: '#4A4A4A' }}>
                            <span className="font-semibold">{activity.user.name}</span>
                            {' '}
                            <span className="text-brand-muted-dark">{activity.description}</span>
                        </p>
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <p className="mt-1 text-xs text-brand-muted-dark">
                                {String(activity.metadata['detail'] ?? '')}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1.5">
                        {activity.is_recent && (
                            <span
                                className="rounded-full px-2 py-0.5 text-xs font-medium"
                                style={{
                                    background: 'rgba(136,22,28,0.08)',
                                    color: '#88161c',
                                }}
                            >
                                Baru
                            </span>
                        )}
                        <div className="flex items-center gap-1 text-xs text-brand-muted-dark">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(activity.created_at)}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
