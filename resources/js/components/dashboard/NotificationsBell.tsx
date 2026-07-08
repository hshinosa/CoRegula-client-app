import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from '@/components/ui/toaster';

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

interface ApiNotification extends Omit<Notification, 'read' | 'timestamp'> {
    read?: boolean;
    isRead?: boolean;
    timestamp?: string;
    createdAt?: string;
}

function normalizeNotifications(data: unknown): Notification[] {
    const payload = data as {
        data?: ApiNotification[] | { notifications?: ApiNotification[] };
        notifications?: ApiNotification[];
    };
    const items = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.data?.notifications)
            ? payload.data.notifications
            : Array.isArray(payload.notifications)
                ? payload.notifications
                : [];

    return items.map((item) => ({
        ...item,
        read: item.read ?? item.isRead ?? false,
        timestamp: item.timestamp ?? item.createdAt ?? new Date().toISOString(),
    }));
}

export default function NotificationsBell({ lightMode = true }: NotificationsBellProps) {
    void lightMode;
    return null;
}
