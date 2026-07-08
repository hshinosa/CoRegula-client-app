import { buildPersistedOptimisticMessages } from './streaming-state';

describe('buildPersistedOptimisticMessages', () => {
    it('keeps the final assistant reply visible after streaming finishes', () => {
        const previous = [
            { id: 'opt-user-1', role: 'user' as const, content: 'Halo AI', created_at: '2026-06-26T01:00:00.000Z' },
        ];

        const result = buildPersistedOptimisticMessages(
            previous,
            'Halo juga, ini jawaban lengkap.',
            '2026-06-26T01:00:05.000Z',
        );

        expect(result).toEqual([
            {
                id: 'sent-user-2026-06-26T01:00:05.000Z',
                role: 'user',
                content: 'Halo AI',
                created_at: '2026-06-26T01:00:00.000Z',
            },
            {
                id: 'sent-assistant-2026-06-26T01:00:05.000Z',
                role: 'assistant',
                content: 'Halo juga, ini jawaban lengkap.',
                created_at: '2026-06-26T01:00:05.000Z',
            },
        ]);
    });

    it('leaves optimistic messages unchanged when no final assistant content exists', () => {
        const previous = [
            { id: 'opt-user-2', role: 'user' as const, content: 'Tes', created_at: '2026-06-26T01:00:00.000Z' },
        ];

        expect(buildPersistedOptimisticMessages(previous, '')).toEqual(previous);
    });
});
