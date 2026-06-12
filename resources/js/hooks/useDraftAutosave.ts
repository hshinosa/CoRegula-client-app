import { useCallback, useEffect, useRef } from 'react';

const DRAFT_KEY_PREFIX = 'kolabri_draft:';
const DEBOUNCE_MS = 1000;

function getDraftKey(conversationId: string): string {
    return `${DRAFT_KEY_PREFIX}${conversationId}`;
}

export function saveDraft(conversationId: string, text: string): void {
    try {
        if (!conversationId) return;
        const key = getDraftKey(conversationId);
        if (text.trim()) {
            localStorage.setItem(key, text);
        } else {
            localStorage.removeItem(key);
        }
    } catch {
        // storage unavailable — silently ignore
    }
}

export function loadDraft(conversationId: string): string {
    try {
        if (!conversationId) return '';
        return localStorage.getItem(getDraftKey(conversationId)) || '';
    } catch {
        return '';
    }
}

export function clearDraft(conversationId: string): void {
    try {
        if (!conversationId) return;
        localStorage.removeItem(getDraftKey(conversationId));
    } catch {
        // silently ignore
    }
}

export function useDraftAutosave(
    conversationId: string,
    text: string,
    setText: (value: string) => void,
) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const textRef = useRef(text);
    textRef.current = text;

    const flush = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        saveDraft(conversationId, textRef.current);
    }, [conversationId]);

    const clear = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        clearDraft(conversationId);
    }, [conversationId]);

    useEffect(() => {
        if (!conversationId) return;

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            saveDraft(conversationId, text);
            timerRef.current = null;
        }, DEBOUNCE_MS);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [conversationId, text]);

    useEffect(() => {
        if (!conversationId) return;

        const draft = loadDraft(conversationId);
        if (draft) {
            setText(draft);
        }
    }, [conversationId, setText]);

    useEffect(() => {
        return () => {
            saveDraft(conversationId, textRef.current);
        };
    }, [conversationId]);

    return { flush, clear };
}
