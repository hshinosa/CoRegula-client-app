import type { ChatDiscussionSummary } from './types';

interface ChatSummaryDetailProps {
    summary: ChatDiscussionSummary;
}

export function ChatSummaryDetail({ summary }: ChatSummaryDetailProps) {
    return (
        <div className="space-y-3">
            <p className="text-sm leading-6 text-brand-dark">{summary.detailedSummary}</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-brand-muted-dark">
                {summary.keyPoints.map((point) => (
                    <li key={point}>{point}</li>
                ))}
            </ul>
        </div>
    );
}
