import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Clock, Eye, EyeOff, History, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { StoredNotification, useNotificationHistory } from '@/hooks/useNotificationHistory';
import { onNotification } from '@/lib/notification-events';

type Tab = 'unread' | 'history';

interface NotificationCenterProps {
    lightMode?: boolean;
}

export default function NotificationCenter({ lightMode = true }: NotificationCenterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [tab, setTab] = useState<Tab>('unread');
    const [apiNotifications, setApiNotifications] = useState<StoredNotification[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const {
        history,
        mergeApiNotifications,
        addLocalNotification,
        toggleRead,
        markAllAsRead,
        clearHistory,
    } = useNotificationHistory();

    const unreadNotifications = history.filter((n) => !n.read);
    const unreadCount = unreadNotifications.length;
    const displayNotifications = tab === 'unread' ? unreadNotifications : history;

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/notifications?limit=20', {
                    headers: { Accept: 'application/json' },
                });
                if (res.ok) {
                    const data = await res.json();
                    const items: StoredNotification[] = (data.data ?? data.notifications ?? []).map(
                        (n: StoredNotification) => ({ ...n, source: 'api' }),
                    );
                    setApiNotifications(items);
                    mergeApiNotifications(items);
                }
            } catch {
                // network error — keep existing history
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60_000);
        return () => clearInterval(interval);
    }, [mergeApiNotifications]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const unsubscribe = onNotification((notif) => {
            addLocalNotification(notif);
        });
        return unsubscribe;
    }, [addLocalNotification]);

    const handleToggleRead = async (id: string, currentRead: boolean) => {
        toggleRead(id);
        const endpoint = currentRead
            ? `/api/notifications/${id}/unread`
            : `/api/notifications/${id}/read`;
        try {
            await fetch(endpoint, { method: 'POST' });
        } catch {
            // network error — local state already toggled
        }
    };

    const handleMarkAllAsRead = async () => {
        markAllAsRead();
        const unreadIds = unreadNotifications.map((n) => n.id);
        try {
            await fetch('/api/notifications/read-all', { method: 'POST' });
        } catch {
            // network error — local state already updated
        }
        void unreadIds;
    };

    const formatTimestamp = (ts: string) => {
        const date = new Date(ts);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60_000);
        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins}m lalu`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}j lalu`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}h lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    const typeColors: Record<string, string> = {
        info: '#3b82f6',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:scale-105"
                style={{
                    background: lightMode ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.08)',
                    border: lightMode ? '1px solid rgba(255,255,255,0.7)' : '1px solid rgba(255,255,255,0.1)',
                }}
                aria-label="Notifikasi"
            >
                <Bell className="h-5 w-5" style={{ color: lightMode ? '#4A4A4A' : '#e5e7eb' }} />
                {unreadCount > 0 && (
                    <span
                        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: '#88161c' }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 z-50 mt-2 w-96 overflow-hidden rounded-2xl"
                        style={{
                            background: lightMode ? 'rgba(255,255,255,0.97)' : 'rgba(20,20,30,0.97)',
                            backdropFilter: 'blur(20px)',
                            border: lightMode ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                        }}
                    >
                        <div
                            className="flex items-center justify-between px-4 py-3"
                            style={{ borderBottom: lightMode ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <h3
                                className="text-sm font-semibold"
                                style={{ color: lightMode ? '#4A4A4A' : '#e5e7eb' }}
                            >
                                Notifikasi
                            </h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && tab === 'unread' && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
                                        style={{ color: '#88161c' }}
                                    >
                                        <CheckCheck className="h-3.5 w-3.5" />
                                        Baca semua
                                    </button>
                                )}
                                {tab === 'history' && history.length > 0 && (
                                    <button
                                        onClick={clearHistory}
                                        className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
                                        style={{ color: '#ef4444' }}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Hapus
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-lg p-1 transition-colors hover:bg-black/5"
                                    style={{ color: lightMode ? '#6B7280' : '#9ca3af' }}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div
                            className="flex border-b"
                            style={{ borderColor: lightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}
                        >
                            {([
                                { key: 'unread' as Tab, label: 'Belum dibaca', icon: Bell, count: unreadCount },
                                { key: 'history' as Tab, label: 'Riwayat', icon: History, count: history.length },
                            ]).map((t) => (
                                <button
                                    key={t.key}
                                    onClick={() => setTab(t.key)}
                                    className="relative flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors"
                                    style={{
                                        color: tab === t.key ? '#88161c' : lightMode ? '#6B7280' : '#9ca3af',
                                    }}
                                >
                                    <t.icon className="h-3.5 w-3.5" />
                                    {t.label}
                                    {t.count > 0 && (
                                        <span
                                            className="ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
                                            style={{ background: tab === t.key ? '#88161c' : lightMode ? '#d1d5db' : '#4b5563' }}
                                        >
                                            {t.count > 99 ? '99+' : t.count}
                                        </span>
                                    )}
                                    {tab === t.key && (
                                        <motion.div
                                            layoutId="notificationTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5"
                                            style={{ background: '#88161c' }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {displayNotifications.length === 0 ? (
                                <div className="px-4 py-10 text-center">
                                    <Bell
                                        className="mx-auto mb-2 h-8 w-8 opacity-30"
                                        style={{ color: lightMode ? '#6B7280' : '#9ca3af' }}
                                    />
                                    <p
                                        className="text-sm"
                                        style={{ color: lightMode ? '#6B7280' : '#9ca3af' }}
                                    >
                                        {tab === 'unread'
                                            ? 'Tidak ada notifikasi baru'
                                            : 'Belum ada riwayat'}
                                    </p>
                                </div>
                            ) : (
                                displayNotifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className="flex items-start gap-3 px-4 py-3 transition-colors"
                                        style={{
                                            background: !notif.read
                                                ? lightMode
                                                    ? 'rgba(136,22,28,0.04)'
                                                    : 'rgba(136,22,28,0.08)'
                                                : 'transparent',
                                            borderBottom: lightMode
                                                ? '1px solid rgba(0,0,0,0.04)'
                                                : '1px solid rgba(255,255,255,0.04)',
                                        }}
                                    >
                                        <div
                                            className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full"
                                            style={{
                                                background: !notif.read
                                                    ? notif.type
                                                        ? typeColors[notif.type]
                                                        : '#88161c'
                                                    : 'transparent',
                                            }}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p
                                                className="truncate text-sm font-medium"
                                                style={{
                                                    color: lightMode ? '#4A4A4A' : '#e5e7eb',
                                                    fontWeight: notif.read ? 400 : 500,
                                                }}
                                            >
                                                {notif.title}
                                            </p>
                                            <p
                                                className="mt-0.5 line-clamp-2 text-xs"
                                                style={{ color: lightMode ? '#6B7280' : '#9ca3af' }}
                                            >
                                                {notif.message}
                                            </p>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span
                                                    className="text-[10px]"
                                                    style={{ color: lightMode ? '#9ca3af' : '#6b7280' }}
                                                >
                                                    {formatTimestamp(notif.timestamp)}
                                                </span>
                                                {notif.source === 'local' && (
                                                    <span
                                                        className="flex items-center gap-0.5 text-[10px]"
                                                        style={{ color: lightMode ? '#9ca3af' : '#6b7280' }}
                                                    >
                                                        <Clock className="h-2.5 w-2.5" />
                                                        lokal
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleRead(notif.id, notif.read);
                                            }}
                                            className="mt-1 flex-shrink-0 rounded-md p-1 transition-colors hover:bg-black/5"
                                            title={notif.read ? 'Tandai belum dibaca' : 'Tandai dibaca'}
                                        >
                                            {notif.read ? (
                                                <EyeOff className="h-3.5 w-3.5" style={{ color: '#6B7280' }} />
                                            ) : (
                                                <Check className="h-3.5 w-3.5" style={{ color: '#6B7280' }} />
                                            )}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
