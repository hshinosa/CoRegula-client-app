export interface ChatBubbleMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

export function buildPersistedOptimisticMessages(
    previous: ChatBubbleMessage[],
    finalAssistantContent: string,
    now: string = new Date().toISOString(),
): ChatBubbleMessage[] {
    const userMessage = previous.find((message) => message.role === 'user');

    if (!userMessage) {
        return previous;
    }

    if (!finalAssistantContent) {
        return previous;
    }

    return [
        {
            ...userMessage,
            id: `sent-user-${now}`,
        },
        {
            id: `sent-assistant-${now}`,
            role: 'assistant',
            content: finalAssistantContent,
            created_at: now,
        },
    ];
}
