import type { ChatDiscussionSummary } from './types';

interface ChatSummaryDetailProps {
    summary: ChatDiscussionSummary;
}

export function ChatSummaryDetail({ summary }: ChatSummaryDetailProps) {
    return (
        <div className="space-y-3">
            <p className="text-sm leading-6 text-[#4A4A4A]">{summary.detailedSummary}</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-[#6B7280]">
                {summary.keyPoints.map((point) => (
                    <li key={point}>{point}</li>
                ))}
            </ul>
        </div>
    );
}
