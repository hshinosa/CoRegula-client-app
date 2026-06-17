import { useCallback, useEffect, useState } from 'react';
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
}: UseChatSummaryOptions): { state: ChatSummaryState; retry: () => Promise<void> } {
    const [state, setState] = useState<ChatSummaryState>(() => {
        if (initialSummary) return { status: 'ready', summary: initialSummary };
        return enabled && chatSpaceId && courseId ? { status: 'loading' } : { status: 'empty' };
    });

    const fetchSummary = useCallback(async () => {
        if (!chatSpaceId || !courseId) {
            setState({ status: 'empty' });
            return;
        }

        setState({ status: 'loading' });

        try {
            const response = await fetch(`/student/courses/${courseId}/chat-spaces/${chatSpaceId}/summary`, {
                credentials: 'include',
                headers: { 'Accept': 'application/json' },
            });
            if (response.status === 404) {
                setState({ status: 'empty' });
                return;
            }
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data: { summary: ChatDiscussionSummary | null } = await response.json();
            if (!data.summary) {
                setState({ status: 'empty' });
            } else {
                setState({ status: 'ready', summary: data.summary });
            }
        } catch (error) {
            setState({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to load summary',
            });
        }
    }, [courseId, chatSpaceId]);

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

    const retry = useCallback(async () => {
        if (!chatSpaceId || !courseId) return;

        setState({ status: 'loading' });

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
            const regenerateResponse = await fetch(`/student/courses/${courseId}/chat-spaces/${chatSpaceId}/regenerate-summary`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            if (!regenerateResponse.ok) throw new Error(`HTTP ${regenerateResponse.status}`);
            const data = await regenerateResponse.json();

            if (data?.data?.success && typeof data.data.summary === 'string') {
                const summaryText: string = data.data.summary;
                const lines = summaryText.split('\n').filter((l: string) => l.trim().length > 0);
                const summary: ChatDiscussionSummary = {
                    roomId: chatSpaceId,
                    headline: lines[0]?.replace(/^#+\s*/, '').slice(0, 120) || 'Ringkasan diskusi',
                    keyPoints: lines.slice(1).filter((l: string) => l.startsWith('-') || l.startsWith('*')).map((l: string) => l.replace(/^[-*]\s*/, '')).slice(0, 5),
                    detailedSummary: summaryText,
                    generatedAt: data.data.generatedAt || new Date().toISOString(),
                };
                setState({ status: 'ready', summary });
            } else {
                const errorMsg: string = data?.data?.error || 'Ringkasan gagal dibuat';
                setState({ status: 'error', message: errorMsg });
            }
        } catch (error) {
            setState({
                status: 'error',
                message: error instanceof Error ? error.message : 'Gagal membuat ringkasan',
            });
        }
    }, [courseId, chatSpaceId]);

    return { state, retry };
}
