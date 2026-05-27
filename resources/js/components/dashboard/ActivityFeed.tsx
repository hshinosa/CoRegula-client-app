import { motion } from 'framer-motion';
import { Activity, BookOpen, MessageSquare, Pencil, Users, AlertTriangle } from 'lucide-react';

export interface ActivityItem {
    id: string;
    type?: string;
    senderName?: string;
    senderType?: string;
    content?: string;
    description?: string;
    createdAt?: string;
    timestamp?: string;
    groupName?: string;
    courseName?: string;
    actor?: { id: string; name: string; role: string } | null;
    target?: { id: string; name: string; type: string } | null;
}

interface ActivityFeedProps {
    activities: ActivityItem[];
    lightMode?: boolean;
    maxItems?: number;
    onActivityClick?: (item: ActivityItem) => void;
}

const activityIcons: Record<string, typeof Activity> = {
    message: MessageSquare,
    chat: MessageSquare,
    discussion: MessageSquare,
    course: BookOpen,
    group: Users,
    reflection: Pencil,
    user: Users,
    alert: AlertTriangle,
    default: Activity,
};

function getActivityIcon(type?: string) {
    if (!type) return activityIcons.default;
    const key = Object.keys(activityIcons).find((k) => type.toLowerCase().includes(k));
    return key ? activityIcons[key] : activityIcons.default;
}

function formatTime(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins}m lalu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}j lalu`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}h lalu`;
}

export default function ActivityFeed({ activities, lightMode = true, maxItems = 5, onActivityClick }: ActivityFeedProps) {
    const items = activities.slice(0, maxItems);

    if (items.length === 0) {
        return (
            <div className="px-4 py-8 text-center">
                <Activity className="mx-auto mb-2 h-8 w-8 opacity-30" style={{ color: lightMode ? '#6B7280' : '#9ca3af' }} />
                <p className="text-sm" style={{ color: lightMode ? '#6B7280' : '#9ca3af' }}>
                    Belum ada aktivitas terbaru
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {items.map((item, index) => {
                const Icon = getActivityIcon(item.type);
                const label = item.description ?? item.content ?? '';
                const actor = item.actor?.name ?? item.senderName ?? '';
                const time = formatTime(item.timestamp ?? item.createdAt);

                return (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 transition-colors"
                        style={{
                            background: 'transparent',
                        }}
                        onClick={() => onActivityClick?.(item)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = lightMode ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <div
                            className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                            style={{
                                background: lightMode ? 'rgba(136,22,28,0.08)' : 'rgba(136,22,28,0.15)',
                            }}
                        >
                            <Icon className="h-4 w-4" style={{ color: '#88161c' }} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm" style={{ color: lightMode ? '#4A4A4A' : '#e5e7eb' }}>
                                {actor && (
                                    <span className="font-medium">{actor} </span>
                                )}
                                <span className={lightMode ? 'text-brand-muted-dark' : 'text-gray-400'}>{label}</span>
                            </p>
                            {(item.groupName || item.courseName) && (
                                <p className="mt-0.5 text-xs" style={{ color: lightMode ? '#9ca3af' : '#6b7280' }}>
                                    {item.courseName}{item.groupName && item.courseName ? ' · ' : ''}{item.groupName}
                                </p>
                            )}
                        </div>
                        <span className="flex-shrink-0 text-[10px]" style={{ color: lightMode ? '#9ca3af' : '#6b7280' }}>
                            {time}
                        </span>
                    </motion.div>
                );
            })}
        </div>
    );
}
