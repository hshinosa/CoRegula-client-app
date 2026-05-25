import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import type { PinnedMessage } from '../components/PinnedMessages';

interface UsePinnedMessagesOptions {
    conversationId: string;
    socketRef: React.RefObject<{ emit: (event: string, data: unknown) => void } | null>;
}

interface UsePinnedMessagesReturn {
    pinnedMessages: PinnedMessage[];
    isLoading: boolean;
    pinMessage: (messageId: string, content: string, senderName: string) => Promise<void>;
    unpinMessage: (messageId: string) => Promise<void>;
    refreshPinned: () => Promise<void>;
}

export function usePinnedMessages({
    conversationId,
    socketRef,
}: UsePinnedMessagesOptions): UsePinnedMessagesReturn {
    const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const refreshPinned = useCallback(async () => {
        try {
            const response = await axios.get('/api/chat/messages/pinned', {
                params: { conversation_id: conversationId },
            });
            setPinnedMessages(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch pinned messages:', error);
        }
    }, [conversationId]);

    useEffect(() => {
        refreshPinned();
    }, [refreshPinned]);

    const pinMessage = useCallback(
        async (messageId: string, content: string, senderName: string) => {
            setIsLoading(true);
            try {
                const response = await axios.post(`/api/chat/messages/${messageId}/pin`, {
                    conversation_id: conversationId,
                    content,
                    sender_name: senderName,
                });

                if (response.data.success) {
                    setPinnedMessages((prev) => [response.data.data, ...prev]);

                    socketRef.current?.emit('pin_message', {
                        messageId,
                        conversationId,
                        pinnedMessage: response.data.data,
                    });
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    throw new Error(error.response.data.message);
                }
                throw new Error('Gagal menyematkan pesan');
            } finally {
                setIsLoading(false);
            }
        },
        [conversationId, socketRef]
    );

    const unpinMessage = useCallback(
        async (messageId: string) => {
            setIsLoading(true);
            try {
                const response = await axios.delete(`/api/chat/messages/${messageId}/pin`, {
                    data: { conversation_id: conversationId },
                });

                if (response.data.success) {
                    setPinnedMessages((prev) =>
                        prev.filter((msg) => msg.message_id !== messageId)
                    );

                    socketRef.current?.emit('unpin_message', {
                        messageId,
                        conversationId,
                    });
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.data?.message) {
                    throw new Error(error.response.data.message);
                }
                throw new Error('Gagal melepas sematan pesan');
            } finally {
                setIsLoading(false);
            }
        },
        [conversationId, socketRef]
    );

    return {
        pinnedMessages,
        isLoading,
        pinMessage,
        unpinMessage,
        refreshPinned,
    };
}