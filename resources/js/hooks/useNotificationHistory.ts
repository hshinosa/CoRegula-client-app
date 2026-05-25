import { useCallback, useState } from 'react';

export interface StoredNotification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    type?: 'info' | 'success' | 'warning' | 'error';
    link?: string;
    source: 'api' | 'local';
}

const STORAGE_KEY = 'kolabri_notifications_history';
const MAX_HISTORY = 100;

function loadFromStorage(): StoredNotification[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as StoredNotification[];
    } catch {
        return [];
    }
}

function saveToStorage(notifications: StoredNotification[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_HISTORY)));
    } catch {
        // storage full or unavailable — silently ignore
    }
}

export function useNotificationHistory() {
    const [history, setHistory] = useState<StoredNotification[]>(loadFromStorage);

    const mergeApiNotifications = useCallback((apiNotifications: StoredNotification[]) => {
        setHistory((prev) => {
            const merged = new Map<string, StoredNotification>();

            // API notifications take priority
            for (const n of apiNotifications) {
                merged.set(n.id, { ...n, source: 'api' });
            }

            // Fill in with local-only notifications
            for (const n of prev) {
                if (!merged.has(n.id) && n.source === 'local') {
                    merged.set(n.id, n);
                }
            }

            const result = Array.from(merged.values())
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, MAX_HISTORY);

            saveToStorage(result);
            return result;
        });
    }, []);

    const addLocalNotification = useCallback((notif: Omit<StoredNotification, 'source'>) => {
        setHistory((prev) => {
            const exists = prev.some((n) => n.id === notif.id);
            if (exists) return prev;

            const entry: StoredNotification = { ...notif, source: 'local' };
            const result = [entry, ...prev].slice(0, MAX_HISTORY);
            saveToStorage(result);
            return result;
        });
    }, []);

    const toggleRead = useCallback((id: string) => {
        setHistory((prev) => {
            const result = prev.map((n) =>
                n.id === id ? { ...n, read: !n.read } : n,
            );
            saveToStorage(result);
            return result;
        });
    }, []);

    const markAllAsRead = useCallback(() => {
        setHistory((prev) => {
            const result = prev.map((n) => ({ ...n, read: true }));
            saveToStorage(result);
            return result;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return {
        history,
        mergeApiNotifications,
        addLocalNotification,
        toggleRead,
        markAllAsRead,
        clearHistory,
    };
}
