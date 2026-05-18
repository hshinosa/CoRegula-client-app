import { useEffect, useState } from 'react';
import type { ChatDiscussionSummary, ChatSummaryState } from './types';

export interface UseChatSummaryOptions {
    chatSpaceId: string | undefined;
    enabled: boolean;
    apiBaseUrl?: string;
    jwtToken?: string;
}

export function useChatSummary({
    chatSpaceId,
    enabled,
    apiBaseUrl,
    jwtToken,
}: UseChatSummaryOptions): { state: ChatSummaryState } {
    const [state, setState] = useState<ChatSummaryState>({ status: 'loading' });

    useEffect(() => {
        if (!enabled || !chatSpaceId) {
            setState({ status: 'empty' });
            return;
        }

        const baseUrl = apiBaseUrl || import.meta.env.VITE_API_URL || '';
        if (!baseUrl || !jwtToken) {
            setState({ status: 'empty' });
            return;
        }

        let cancelled = false;
        setState({ status: 'loading' });

        fetch(`${baseUrl}/api/chatspaces/${chatSpaceId}/summary`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${jwtToken}`,
            },
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
    }, [chatSpaceId, enabled, apiBaseUrl, jwtToken]);

    return { state };
}
