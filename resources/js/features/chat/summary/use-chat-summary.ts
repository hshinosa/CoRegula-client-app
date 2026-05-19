import { useEffect, useState } from 'react';
import type { ChatDiscussionSummary, ChatSummaryState } from './types';

export interface UseChatSummaryOptions {
    courseId: string | undefined;
    chatSpaceId: string | undefined;
    enabled: boolean;
    initialSummary?: ChatDiscussionSummary | null;
}

export function useChatSummary({
    courseId,
    chatSpaceId,
    enabled,
    initialSummary,
}: UseChatSummaryOptions): { state: ChatSummaryState } {
    const [state, setState] = useState<ChatSummaryState>(() => {
        if (initialSummary) return { status: 'ready', summary: initialSummary };
        return enabled && chatSpaceId && courseId ? { status: 'loading' } : { status: 'empty' };
    });

    useEffect(() => {
        if (initialSummary) {
            setState({ status: 'ready', summary: initialSummary });
            return;
        }

        if (!enabled || !chatSpaceId || !courseId) {
            setState({ status: 'empty' });
            return;
        }

        let cancelled = false;
        setState({ status: 'loading' });

        fetch(`/student/courses/${courseId}/chat-spaces/${chatSpaceId}/summary`, {
            credentials: 'include',
            headers: { 'Accept': 'application/json' },
        })
            .then((response) => {
                if (response.status === 404) return null;
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then((data: { summary: ChatDiscussionSummary | null } | null) => {
                if (cancelled) return;
                if (!data || !data.summary) {
                    setState({ status: 'empty' });
                } else {
                    setState({ status: 'ready', summary: data.summary });
                }
            })
            .catch((error) => {
                if (cancelled) return;
                setState({
                    status: 'error',
                    message: error instanceof Error ? error.message : 'Failed to load summary',
                });
            });

        return () => {
            cancelled = true;
        };
    }, [courseId, chatSpaceId, enabled, initialSummary]);

    return { state };
}
