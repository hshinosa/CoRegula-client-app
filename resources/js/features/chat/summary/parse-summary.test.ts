import { describe, expect, it } from 'vitest';
import { parseSummaryText } from './parse-summary';

describe('parseSummaryText', () => {
    it('returns null for empty or blank input', () => {
        expect(parseSummaryText(null, 'room-1')).toBeNull();
        expect(parseSummaryText(undefined, 'room-1')).toBeNull();
        expect(parseSummaryText('   \n  ', 'room-1')).toBeNull();
    });

    it('parses a markdown summary string into structured shape', () => {
        const text = '# Ringkasan Sesi\n- Poin pertama\n- Poin kedua\nKalimat penutup.';
        const result = parseSummaryText(text, 'room-1', '2026-06-19T00:00:00.000Z');

        expect(result).not.toBeNull();
        expect(result!.roomId).toBe('room-1');
        expect(result!.headline).toBe('Ringkasan Sesi');
        expect(result!.keyPoints).toEqual(['Poin pertama', 'Poin kedua']);
        expect(result!.detailedSummary).toBe(text);
        expect(result!.generatedAt).toBe('2026-06-19T00:00:00.000Z');
    });

    it('caps key points at five and strips bullet markers', () => {
        const text = 'Judul\n- a\n* b\n- c\n- d\n- e\n- f\n- g';
        const result = parseSummaryText(text, 'room-2');

        expect(result!.keyPoints).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('falls back to a default headline when first line is blank-ish', () => {
        const result = parseSummaryText('#\n- only point', 'room-3');
        expect(result!.headline).toBe('Ringkasan diskusi');
    });
});
