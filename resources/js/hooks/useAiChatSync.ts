import { useEffect, useRef, useCallback } from 'react';

export type AiChatSyncEvent =
    | { type: 'bookmark:toggled'; messageId: string; bookmarked: boolean }
    | { type: 'bookmark:deleted'; bookmarkId: string }
    | { type: 'template:created'; templateId: string }
    | { type: 'template:updated'; templateId: string }
    | { type: 'template:deleted'; templateId: string };

interface UseAiChatSyncOptions {
    onBookmarkToggled?: (messageId: string, bookmarked: boolean) => void;
    onBookmarkDeleted?: (bookmarkId: string) => void;
    onTemplateCreated?: (templateId: string) => void;
    onTemplateUpdated?: (templateId: string) => void;
    onTemplateDeleted?: (templateId: string) => void;
}

const CHANNEL_NAME = 'kolabri-ai-chat-sync';

/**
 * BroadcastChannel-based cross-tab sync for AI Chat features.
 * Ensures bookmark and template changes in one tab are reflected in other open tabs.
 */
export function useAiChatSync(options: UseAiChatSyncOptions = {}) {
    const channelRef = useRef<BroadcastChannel | null>(null);

    useEffect(() => {
        if (typeof BroadcastChannel === 'undefined') {
            return;
        }

        const channel = new BroadcastChannel(CHANNEL_NAME);
        channelRef.current = channel;

        channel.onmessage = (event: MessageEvent<AiChatSyncEvent>) => {
            const data = event.data;
            switch (data.type) {
                case 'bookmark:toggled':
                    options.onBookmarkToggled?.(data.messageId, data.bookmarked);
                    break;
                case 'bookmark:deleted':
                    options.onBookmarkDeleted?.(data.bookmarkId);
                    break;
                case 'template:created':
                    options.onTemplateCreated?.(data.templateId);
                    break;
                case 'template:updated':
                    options.onTemplateUpdated?.(data.templateId);
                    break;
                case 'template:deleted':
                    options.onTemplateDeleted?.(data.templateId);
                    break;
            }
        };

        return () => {
            channel.close();
            channelRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const broadcast = useCallback((event: AiChatSyncEvent) => {
        channelRef.current?.postMessage(event);
    }, []);

    return { broadcast };
}
