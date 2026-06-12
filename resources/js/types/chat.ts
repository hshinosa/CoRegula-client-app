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

export interface ChatCitation {
    course_material_id: string;
    label?: string;
    page?: number;
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
    editedAt?: string | null;
    isDeleted?: boolean;
    deletedAt?: string | null;
    isPinned?: boolean;
    pinnedAt?: string | null;
    pinnedBy?: string | null;
    guardrailOutcome?: string;
    guardrailReason?: string;
    interventionType?: string;
    interventionReason?: string;
    scaffoldingLevel?: string;
    isRelevant?: boolean | null;
    citations?: ChatCitation[];
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
    deliveryStatus?: 'sending' | 'sent' | 'failed' | 'retrying';
    isOptimistic?: boolean;
    retryCount?: number;
    showAvatar?: boolean;
    showName?: boolean;
    showTime?: boolean;
    isGrouped?: boolean;
    edited_at?: string | null;
    is_deleted?: boolean;
    deleted_at?: string | null;
    is_pinned?: boolean;
    pinned_at?: string | null;
    pinned_by?: string | null;
    version?: number;
    guardrail_outcome?: string;
    guardrail_reason?: string;
    intervention_type?: string;
    intervention_reason?: string;
    scaffolding_level?: string;
    is_relevant?: boolean | null;
    citations?: ChatCitation[];
}
