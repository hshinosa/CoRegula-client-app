import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { Socket } from 'socket.io-client';

import type { ChatDisplayMessage } from '@/types/chat';

import { outboxRepository, type OutboxMessagePayload, type OutboxMessageRecord } from './outbox-repository';
import { retryWithBackoff } from './retry-with-backoff';

interface QueueMessageInput {
    message: ChatDisplayMessage;
    payload: OutboxMessagePayload;
}

interface UseOfflineQueueOptions {
    socketRef: RefObject<Socket | null>;
    isConnected: boolean;
    onMessageQueued?: (clientId: string) => void;
    onMessageRetrying?: (clientId: string, attempts: number) => void;
    onMessageFailed?: (clientId: string, attempts: number) => void;
}

function createQueueRecord(message: ChatDisplayMessage, payload: OutboxMessagePayload): OutboxMessageRecord {
    const clientId = message.clientId ?? message.id;

    return {
        id: clientId,
        conversationId: payload.roomId,
        timestamp: new Date(message.created_at).getTime(),
        message: {
            ...message,
            id: clientId,
            clientId,
            isOptimistic: true,
        },
        payload: {
            ...payload,
            clientId,
        },
    };
}

export function useOfflineQueue({
    socketRef,
    isConnected,
    onMessageQueued,
    onMessageRetrying,
    onMessageFailed,
}: UseOfflineQueueOptions) {
    const pendingResolversRef = useRef(new Map<string, { resolve: () => void; reject: (reason?: unknown) => void; timeoutId: number }>());
    const isFlushingRef = useRef(false);

    const confirmDelivered = useCallback(async (clientId?: string) => {
        if (!clientId) {
            return;
        }

        const pending = pendingResolversRef.current.get(clientId);
        if (pending) {
            window.clearTimeout(pending.timeoutId);
            pending.resolve();
            pendingResolversRef.current.delete(clientId);
        }

        await outboxRepository.remove(clientId);
    }, []);

    const emitWithAck = useCallback(
        (record: OutboxMessageRecord) =>
            new Promise<void>((resolve, reject) => {
                const socket = socketRef.current;
                if (!socket?.connected) {
                    reject(new Error('Socket disconnected'));
                    return;
                }

                const timeoutId = window.setTimeout(() => {
                    pendingResolversRef.current.delete(record.id);
                    reject(new Error('Message acknowledgement timeout'));
                }, 5000);

                pendingResolversRef.current.set(record.id, { resolve, reject, timeoutId });
                socket.emit('send_message', record.payload);
            }),
        [socketRef],
    );

    const sendRecord = useCallback(
        async (record: OutboxMessageRecord) => {
            onMessageRetrying?.(record.id, 0);

            try {
                const response = await retryWithBackoff(async () => {
                    const existingPending = pendingResolversRef.current.get(record.id);
                    if (existingPending) {
                        window.clearTimeout(existingPending.timeoutId);
                        existingPending.reject(new Error('Superseded retry attempt'));
                        pendingResolversRef.current.delete(record.id);
                    }

                    return emitWithAck(record);
                });

                await outboxRepository.remove(record.id);
                return response;
            } catch (error) {
                onMessageFailed?.(record.id, 3);
                throw error;
            }
        },
        [emitWithAck, onMessageFailed, onMessageRetrying],
    );

    const flushQueue = useCallback(async () => {
        if (isFlushingRef.current || !isConnected) {
            return;
        }

        isFlushingRef.current = true;

        try {
            const queued = await outboxRepository.getAll();
            const sentIds: string[] = [];

            for (const record of queued) {
                onMessageRetrying?.(record.id, 0);

                try {
                    const { attempts } = await sendRecord(record);
                    sentIds.push(record.id);
                    onMessageRetrying?.(record.id, attempts);
                } catch {
                    onMessageFailed?.(record.id, 3);
                }
            }

            if (sentIds.length > 1) {
                await outboxRepository.removeMany(sentIds);
            }
        } finally {
            isFlushingRef.current = false;
        }
    }, [isConnected, onMessageFailed, onMessageRetrying, sendRecord]);

    const queueOrSend = useCallback(
        async ({ message, payload }: QueueMessageInput) => {
            const record = createQueueRecord(message, payload);

            if (!isConnected || !socketRef.current?.connected) {
                await outboxRepository.add(record);
                onMessageQueued?.(record.id);
                return { queued: true as const, attempts: 0 };
            }

            try {
                const response = await sendRecord(record);
                return { queued: false as const, attempts: response.attempts };
            } catch {
                await outboxRepository.add(record);
                return { queued: false as const, attempts: 3 };
            }
        },
        [isConnected, onMessageQueued, sendRecord, socketRef],
    );

    useEffect(() => {
        if (!isConnected) {
            return;
        }

        void flushQueue();
    }, [flushQueue, isConnected]);

    useEffect(() => {
        return () => {
            pendingResolversRef.current.forEach((pending) => {
                window.clearTimeout(pending.timeoutId);
                pending.reject(new Error('Socket queue disposed'));
            });
            pendingResolversRef.current.clear();
        };
    }, []);

    return {
        queueOrSend,
        confirmDelivered,
        flushQueue,
    };
}
