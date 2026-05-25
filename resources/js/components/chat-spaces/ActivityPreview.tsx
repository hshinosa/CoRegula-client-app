import { Clock, MessageCircle } from 'lucide-react';

interface ActivityPreviewProps {
    lastMessage?: string | null;
    lastMessageAt?: string | null;
    lastMessageSender?: string | null;
}

function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return 'Baru saja';
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;

    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
}

function truncateText(text: string, maxLen: number = 100): string {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen).trimEnd() + '...';
}

export function ActivityPreview({ lastMessage, lastMessageAt, lastMessageSender }: ActivityPreviewProps) {
    const hasActivity = Boolean(lastMessage || lastMessageAt);

    if (!hasActivity) {
        return (
            <div className="flex items-center gap-1.5 text-[11px] text-[#9ca3af]">
                <MessageCircle className="h-3 w-3" />
                <span>Belum ada aktivitas</span>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {lastMessage && (
                <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
                    {lastMessageSender && (
                        <span className="font-medium text-[#4A4A4A]">
                            {lastMessageSender}:{' '}
                        </span>
                    )}
                    {truncateText(lastMessage)}
                </p>
            )}

            {lastMessageAt && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#9ca3af]">
                    <Clock className="h-3 w-3" />
                    <span>{formatRelativeTime(lastMessageAt)}</span>
                </div>
            )}
        </div>
    );
}
