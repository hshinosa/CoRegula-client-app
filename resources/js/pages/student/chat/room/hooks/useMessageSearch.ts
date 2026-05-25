import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import type { SearchResult } from '../components/SearchResults';

interface UseMessageSearchOptions {
    conversationId: string;
}

interface UseMessageSearchReturn {
    results: SearchResult[];
    hasMore: boolean;
    isLoading: boolean;
    totalResults: number;
    isActive: boolean;
    search: (query: string) => void;
    loadMore: () => void;
    clear: () => void;
    scrollToMessage: (messageId: string) => void;
    highlightMessageId: string | null;
}

export function useMessageSearch({
    conversationId,
}: UseMessageSearchOptions): UseMessageSearchReturn {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [totalResults, setTotalResults] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [highlightMessageId, setHighlightMessageId] = useState<string | null>(null);
    const [currentQuery, setCurrentQuery] = useState('');
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const search = useCallback(
        async (query: string) => {
            if (query.trim().length < 2) return;

            setIsLoading(true);
            setIsActive(true);
            setCurrentQuery(query);

            try {
                const response = await axios.get('/api/chat/messages/search', {
                    params: {
                        conversation_id: conversationId,
                        q: query,
                        limit: 20,
                    },
                });

                const data = response.data;
                setResults(data.data || []);
                setHasMore(data.pagination?.has_more || false);
                setNextCursor(data.pagination?.next_cursor || null);
                setTotalResults(data.data?.length || 0);
            } catch (error) {
                console.error('Search failed:', error);
                setResults([]);
                setHasMore(false);
                setTotalResults(0);
            } finally {
                setIsLoading(false);
            }
        },
        [conversationId]
    );

    const loadMore = useCallback(async () => {
        if (!nextCursor || isLoading) return;

        setIsLoading(true);

        try {
            const response = await axios.get('/api/chat/messages/search', {
                params: {
                    conversation_id: conversationId,
                    q: currentQuery,
                    cursor: nextCursor,
                    limit: 20,
                },
            });

            const data = response.data;
            setResults((prev) => [...prev, ...(data.data || [])]);
            setHasMore(data.pagination?.has_more || false);
            setNextCursor(data.pagination?.next_cursor || null);
            setTotalResults((prev) => prev + (data.data?.length || 0));
        } catch (error) {
            console.error('Load more failed:', error);
        } finally {
            setIsLoading(false);
        }
    }, [conversationId, currentQuery, nextCursor, isLoading]);

    const clear = useCallback(() => {
        setResults([]);
        setHasMore(false);
        setIsLoading(false);
        setTotalResults(0);
        setIsActive(false);
        setCurrentQuery('');
        setNextCursor(null);
        setHighlightMessageId(null);
        if (highlightTimerRef.current) {
            clearTimeout(highlightTimerRef.current);
        }
    }, []);

    const scrollToMessage = useCallback((messageId: string) => {
        setHighlightMessageId(messageId);

        if (highlightTimerRef.current) {
            clearTimeout(highlightTimerRef.current);
        }

        highlightTimerRef.current = setTimeout(() => {
            setHighlightMessageId(null);
        }, 3000);

        const element = document.getElementById(`message-${messageId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

    return {
        results,
        hasMore,
        isLoading,
        totalResults,
        isActive,
        search,
        loadMore,
        clear,
        scrollToMessage,
        highlightMessageId,
    };
}