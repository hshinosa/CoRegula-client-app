import { useEffect, useMemo, useState } from 'react';
import type { ChatDisplayMessage } from '@/types/chat';

const VIRTUALIZE_THRESHOLD = 100;
const VISIBLE_WINDOW_SIZE = 80;

export interface MessageWindow<T extends ChatDisplayMessage> {
    visibleMessages: T[];
    hiddenCount: number;
    isVirtualized: boolean;
    showAll: () => void;
    showRecent: () => void;
    showingAll: boolean;
}

export function useMessageWindow<T extends ChatDisplayMessage>(messages: T[]): MessageWindow<T> {
    const [showingAll, setShowingAll] = useState(false);
    const totalCount = messages.length;
    const isVirtualized = totalCount > VIRTUALIZE_THRESHOLD && !showingAll;

    useEffect(() => {
        if (totalCount <= VIRTUALIZE_THRESHOLD) {
            setShowingAll(false);
        }
    }, [totalCount]);

    const visibleMessages = useMemo(() => {
        if (!isVirtualized) return messages;
        return messages.slice(-VISIBLE_WINDOW_SIZE);
    }, [messages, isVirtualized]);

    const hiddenCount = isVirtualized ? totalCount - visibleMessages.length : 0;

    return {
        visibleMessages,
        hiddenCount,
        isVirtualized,
        showAll: () => setShowingAll(true),
        showRecent: () => setShowingAll(false),
        showingAll,
    };
}
