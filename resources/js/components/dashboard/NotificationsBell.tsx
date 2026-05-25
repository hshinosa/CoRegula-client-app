import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    type?: 'info' | 'success' | 'warning' | 'error';
    link?: string;
}

interface NotificationsBellProps {
    lightMode?: boolean;
}

export default function NotificationsBell({ lightMode = true }: NotificationsBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/notifications?limit=10', {
                    headers: { Accept: 'application/json' },
                });
                if (res.ok) {
                    const data = await res.json();
                    const items: Notification[] = data.data ?? data.notifications ?? [];
                    setNotifications(items);
                    setUnreadCount(items.filter((n) => !n.read).length);
                }
            } catch {}
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60_000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
        } catch {}
    };

    const markAllAsRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        try {
            await fetch('/api/notifications/read-all', { method: 'POST' });
        } catch {}
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
        return `${diffDays}h lalu`;
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
                        className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl"
                        style={{
                            background: lightMode ? 'rgba(255,255,255,0.95)' : 'rgba(20,20,30,0.95)',
                            backdropFilter: 'blur(20px)',
                            border: lightMode ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                        }}
                    >
                        <div
                            className="flex items-center justify-between border-b px-4 py-3"
                            style={{ borderColor: lightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}
                        >
                            <h3 className="text-sm font-semibold" style={{ color: lightMode ? '#4A4A4A' : '#e5e7eb' }}>
                                Notifikasi
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
                                    style={{ color: '#88161c' }}
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Tandai semua dibaca
                                </button>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    <Bell className="mx-auto mb-2 h-8 w-8 opacity-30" style={{ color: lightMode ? '#6B7280' : '#9ca3af' }} />
                                    <p className="text-sm" style={{ color: lightMode ? '#6B7280' : '#9ca3af' }}>
                                        Tidak ada notifikasi
                                    </p>
                                </div>
                            ) : (
                                notifications.slice(0, 10).map((notif) => (
                                    <div
                                        key={notif.id}
                                        className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors"
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
                                        onClick={() => {
                                            markAsRead(notif.id);
                                            if (notif.link) window.location.href = notif.link;
                                        }}
                                    >
                                        <div
                                            className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full"
                                            style={{
                                                background: !notif.read ? (notif.type ? typeColors[notif.type] : '#88161c') : 'transparent',
                                            }}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p
                                                className="truncate text-sm font-medium"
                                                style={{ color: lightMode ? '#4A4A4A' : '#e5e7eb' }}
                                            >
                                                {notif.title}
                                            </p>
                                            <p
                                                className="mt-0.5 line-clamp-2 text-xs"
                                                style={{ color: lightMode ? '#6B7280' : '#9ca3af' }}
                                            >
                                                {notif.message}
                                            </p>
                                            <p className="mt-1 text-[10px]" style={{ color: lightMode ? '#9ca3af' : '#6b7280' }}>
                                                {formatTimestamp(notif.timestamp)}
                                            </p>
                                        </div>
                                        {!notif.read && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(notif.id);
                                                }}
                                                className="mt-1 flex-shrink-0 rounded-md p-1 transition-colors hover:bg-black/5"
                                                title="Tandai dibaca"
                                            >
                                                <Check className="h-3.5 w-3.5" style={{ color: '#6B7280' }} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div
                                className="border-t px-4 py-2.5 text-center"
                                style={{ borderColor: lightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}
                            >
                                <button
                                    className="text-xs font-medium transition-colors hover:opacity-80"
                                    style={{ color: '#88161c' }}
                                    onClick={() => setIsOpen(false)}
                                >
                                    Lihat semua notifikasi
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
