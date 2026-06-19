import type { ChatDiscussionSummary } from './types';

/**
 * Parse a raw markdown-ish summary string (as produced by the AI engine and
 * persisted on ChatSpace.summary) into the structured ChatDiscussionSummary
 * shape the UI renders. Returns null for empty/blank input.
 */
export function parseSummaryText(
    text: string | null | undefined,
    roomId: string,
    generatedAt?: string | null,
): ChatDiscussionSummary | null {
    if (typeof text !== 'string' || text.trim().length === 0) {
        return null;
    }

    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    const keyPoints = lines
        .slice(1)
        .filter((l) => l.startsWith('-') || l.startsWith('*'))
        .map((l) => l.replace(/^[-*]\s*/, ''))
        .slice(0, 5);

    return {
        roomId,
        headline: lines[0]?.replace(/^#+\s*/, '').slice(0, 120) || 'Ringkasan diskusi',
        keyPoints,
        detailedSummary: text,
        generatedAt: generatedAt || new Date().toISOString(),
    };
}
