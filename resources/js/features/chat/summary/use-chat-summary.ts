import { useCallback, useEffect, useState } from 'react';
import { parseSummaryText } from './parse-summary';
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
            const data: { summary: string | null; generatedAt?: string | null } = await response.json();
            const parsed = chatSpaceId ? parseSummaryText(data.summary, chatSpaceId, data.generatedAt) : null;
            if (!parsed) {
                setState({ status: 'empty' });
            } else {
                setState({ status: 'ready', summary: parsed });
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
            .then((data: { summary: string | null; generatedAt?: string | null } | null) => {
                if (cancelled) return;
                const parsed = data && chatSpaceId ? parseSummaryText(data.summary, chatSpaceId, data.generatedAt) : null;
                if (!parsed) {
                    setState({ status: 'empty' });
                } else {
                    setState({ status: 'ready', summary: parsed });
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
                const summary = parseSummaryText(data.data.summary, chatSpaceId, data.data.generatedAt);
                if (summary) {
                    setState({ status: 'ready', summary });
                } else {
                    setState({ status: 'empty' });
                }
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
