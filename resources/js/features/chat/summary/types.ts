export interface ChatDiscussionSummary {
    roomId: string;
    headline: string;
    keyPoints: string[];
    detailedSummary: string;
    generatedAt: string;
}

export type ChatSummaryState =
    | { status: 'loading' }
    | { status: 'empty' }
    | { status: 'error'; message: string }
    | { status: 'ready'; summary: ChatDiscussionSummary };
