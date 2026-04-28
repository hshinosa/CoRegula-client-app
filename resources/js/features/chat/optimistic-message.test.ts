import { describe, expect, it } from 'vitest';

import {
    createOptimisticMessage,
    markMessageFailed,
    reconcileIncomingMessage,
    toSocketPayload,
    type ChatSocketMessage,
} from './optimistic-message';

describe('optimistic message helpers', () => {
    it('creates a sending optimistic message', () => {
        const message = createOptimisticMessage({
            clientId: 'temp-1',
            senderId: 'user-1',
            senderName: 'Rizky',
            senderType: 'student',
            content: 'Halo tim',
            createdAt: '2026-04-28T10:00:00.000Z',
            replyTo: undefined,
            attachments: [],
            mentions: [],
        });

        expect(message.id).toBe('temp-1');
        expect(message.clientId).toBe('temp-1');
        expect(message.deliveryStatus).toBe('sending');
        expect(message.isOptimistic).toBe(true);
    });

    it('reconciles an incoming socket message by clientId instead of duplicating it', () => {
        const optimistic = createOptimisticMessage({
            clientId: 'temp-2',
            senderId: 'user-1',
            senderName: 'Rizky',
            senderType: 'student',
            content: 'Pesan awal',
            createdAt: '2026-04-28T10:00:00.000Z',
            replyTo: undefined,
            attachments: [],
            mentions: [],
        });

        const incoming: ChatSocketMessage = {
            id: 'db-1',
            clientId: 'temp-2',
            senderId: 'user-1',
            senderName: 'Rizky',
            senderType: 'student',
            content: 'Pesan awal',
            createdAt: '2026-04-28T10:00:01.000Z',
            attachments: [],
            mentions: [],
        };

        const result = reconcileIncomingMessage([optimistic], incoming);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('db-1');
        expect(result[0].deliveryStatus).toBe('sent');
        expect(result[0].isOptimistic).toBe(false);
    });

    it('marks a message as failed while keeping it in the list', () => {
        const optimistic = createOptimisticMessage({
            clientId: 'temp-3',
            senderId: 'user-1',
            senderName: 'Rizky',
            senderType: 'student',
            content: 'Pesan gagal',
            createdAt: '2026-04-28T10:00:00.000Z',
            replyTo: undefined,
            attachments: [],
            mentions: [],
        });

        const result = markMessageFailed([optimistic], 'temp-3');

        expect(result).toHaveLength(1);
        expect(result[0].deliveryStatus).toBe('failed');
        expect(result[0].isOptimistic).toBe(true);
    });

    it('reuses optimistic data to rebuild a socket payload for retry', () => {
        const optimistic = createOptimisticMessage({
            clientId: 'temp-4',
            senderId: 'user-1',
            senderName: 'Rizky',
            senderType: 'student',
            content: 'Coba lagi',
            createdAt: '2026-04-28T10:00:00.000Z',
            replyTo: {
                messageId: 'm-1',
                senderId: 'user-2',
                senderName: 'Budi',
                content: 'Pesan lama',
            },
            attachments: [
                { id: 'a-1', name: 'cat.png', type: 'image/png', size: 1234, url: 'data:image/png;base64,abc' },
            ],
            mentions: ['user-2'],
        });

        const payload = toSocketPayload(optimistic, {
            roomId: 'room-1',
            courseId: 'course-1',
            groupId: 'group-1',
        });

        expect(payload.clientId).toBe('temp-4');
        expect(payload.replyTo?.messageId).toBe('m-1');
        expect(payload.attachments).toHaveLength(1);
        expect(payload.mentions).toEqual(['user-2']);
    });

    it('appends unmatched incoming messages normally', () => {
        const result = reconcileIncomingMessage([], {
            id: 'db-10',
            senderId: 'user-2',
            senderName: 'Budi',
            senderType: 'student',
            content: 'Halo balik',
            createdAt: '2026-04-28T10:01:00.000Z',
            attachments: [],
            mentions: [],
        });

        expect(result).toHaveLength(1);
        expect(result[0].deliveryStatus).toBe('sent');
    });
});
