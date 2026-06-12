export type {
  ReplyTo,
  FileAttachment,
  ChatSocketMessage,
  ChatDisplayMessage,
} from '@/types/chat';

import type {
  ChatDisplayMessage,
  ChatSocketMessage,
  FileAttachment,
  ReplyTo,
} from '@/types/chat';

interface CreateOptimisticMessageInput {
  clientId: string;
  senderId: string;
  senderName: string;
  senderType: string;
  content: string;
  createdAt: string;
  replyTo?: ReplyTo;
  attachments?: FileAttachment[];
  mentions?: string[];
}

interface SocketPayloadContext {
  roomId: string;
  courseId: string;
  groupId: string;
}

export function createOptimisticMessage(input: CreateOptimisticMessageInput): ChatDisplayMessage {
  return {
    id: input.clientId,
    clientId: input.clientId,
    sender_id: input.senderId,
    sender_type: input.senderType,
    sender_name: input.senderName,
    content: input.content,
    created_at: input.createdAt,
    reply_to: input.replyTo,
    attachments: input.attachments ?? [],
    mentions: input.mentions ?? [],
    deliveryStatus: 'sending',
    isOptimistic: true,
    retryCount: 0,
  };
}

export function mapSocketMessageToDisplayMessage(message: ChatSocketMessage): ChatDisplayMessage {
  return {
    id: message.id,
    clientId: message.clientId,
    sender_id: message.senderId,
    sender_type: message.senderType,
    sender_name: message.senderName,
    content: message.content,
    created_at: message.createdAt,
    is_intervention: message.isIntervention,
    reply_to: message.replyTo,
    attachments: message.attachments ?? [],
    mentions: message.mentions ?? [],
    deliveryStatus: 'sent',
    isOptimistic: false,
    guardrail_outcome: message.guardrailOutcome,
    guardrail_reason: message.guardrailReason,
    intervention_type: message.interventionType,
    intervention_reason: message.interventionReason,
    scaffolding_level: message.scaffoldingLevel,
    is_relevant: message.isRelevant,
    citations: message.citations,
  };
}

export function reconcileIncomingMessage(
  previous: ChatDisplayMessage[],
  incoming: ChatSocketMessage,
): ChatDisplayMessage[] {
  const incomingDisplay = mapSocketMessageToDisplayMessage(incoming);
  if (incoming.clientId) {
    const idx = previous.findIndex((m) => m.isOptimistic && m.clientId === incoming.clientId);
    if (idx >= 0) {
      const next = previous.slice();
      next[idx] = incomingDisplay;
      next[idx].deliveryStatus = 'sent';
      next[idx].isOptimistic = false;
      return next;
    }
  }
  return [...previous, incomingDisplay];
}

export function markMessageFailed(list: ChatDisplayMessage[], clientId: string): ChatDisplayMessage[] {
  return list.map((m) =>
    m.clientId === clientId && m.isOptimistic
      ? { ...m, deliveryStatus: 'failed', retryCount: (m.retryCount ?? 0) + 1 }
      : m,
  );
}

export function markMessageSending(
  list: ChatDisplayMessage[],
  clientId: string,
  deliveryStatus: ChatDisplayMessage['deliveryStatus'] = 'sending',
  retryCount?: number,
): ChatDisplayMessage[] {
  return list.map((m) =>
    m.clientId === clientId && m.isOptimistic
      ? { ...m, deliveryStatus, ...(retryCount === undefined ? {} : { retryCount }) }
      : m,
  );
}

export function toSocketPayload(message: ChatDisplayMessage, context: SocketPayloadContext) {
  return {
    roomId: context.roomId,
    courseId: context.courseId,
    groupId: context.groupId,
    clientId: message.clientId,
    content: message.content,
    replyTo: message.reply_to,
    attachments: message.attachments && message.attachments.length > 0 ? message.attachments : undefined,
    mentions: message.mentions && message.mentions.length > 0 ? message.mentions : undefined,
  };
}
