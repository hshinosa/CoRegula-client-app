import { describe, expect, it } from 'vitest';
import { aggregateCitedMaterials, buildMaterialIndexFromApi } from './cited-materials';
import type { ChatDisplayMessage } from '@/types/chat';

describe('cited-materials', () => {
    const mat = {
        id: 'm1',
        title: 'Slide 1',
        file_name: 'slide.pdf',
        file_type: 'application/pdf',
    };

    it('dedupes cited materials across AI messages', () => {
        const index = buildMaterialIndexFromApi({
            primary: [{ material: mat }],
            earlier: [],
        });
        const messages: ChatDisplayMessage[] = [
            {
                id: '1',
                sender_id: 'ai',
                sender_type: 'ai',
                sender_name: 'AI',
                content: 'a',
                created_at: new Date().toISOString(),
                citations: [{ course_material_id: 'm1', label: 'A' }],
            },
            {
                id: '2',
                sender_id: 'ai',
                sender_type: 'ai',
                sender_name: 'AI',
                content: 'b',
                created_at: new Date().toISOString(),
                citations: [{ course_material_id: 'm1', label: 'B' }],
            },
        ];
        const rows = aggregateCitedMaterials(messages, index);
        expect(rows).toHaveLength(1);
        expect(rows[0].material.id).toBe('m1');
    });
});