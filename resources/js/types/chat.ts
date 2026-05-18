export interface ReplyTo {
    messageId: string;
    senderId: string;
    senderName: string;
    content: string;
}

export interface FileAttachment {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    previewUrl?: string;
}

export interface ChatSocketMessage {
    id: string;
    clientId?: string;
    senderId: string;
    senderName: string;
    senderType: string;
    content: string;
    createdAt: string;
    isIntervention?: boolean;
    replyTo?: ReplyTo;
    attachments?: FileAttachment[];
    mentions?: string[];
}

export interface ChatDisplayMessage {
    id: string;
    clientId?: string;
    sender_id: string;
    sender_type: string;
    sender_name: string;
    content: string;
    created_at: string;
    is_intervention?: boolean;
    reply_to?: ReplyTo;
    attachments?: FileAttachment[];
    mentions?: string[];
    deliveryStatus?: 'sending' | 'sent' | 'failed';
    isOptimistic?: boolean;
    retryCount?: number;
    showAvatar?: boolean;
    showName?: boolean;
    showTime?: boolean;
    isGrouped?: boolean;
}
