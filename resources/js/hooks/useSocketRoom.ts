import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface SocketChatMessage {
    id: string;
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

interface ReplyTo {
    messageId: string;
    senderId: string;
    senderName: string;
    content: string;
}

interface FileAttachment {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    previewUrl?: string;
}

interface DisplayMessage {
    id: string;
    sender_id: string;
    sender_type: string;
    sender_name: string;
    content: string;
    created_at: string;
    is_intervention?: boolean;
    reply_to?: ReplyTo;
    attachments?: FileAttachment[];
    mentions?: string[];
}

interface OnlineUser {
    odId: string;
    userName: string;
}

interface DiscussionQuality {
    qualityScore: number;
    engagementTypes: Record<string, number>;
    hotPercentage: number;
    lastMessage?: string;
}

interface UseSocketRoomOptions {
    jwtToken: string;
    courseId: string;
    groupId: string;
    chatSpaceId: string;
    socketUrl?: string;
    onSessionClosed?: (payload: { closedAt?: string; message?: string }) => void;
    onSessionReopened?: () => void;
    onMessagesLoaded?: (messages: DisplayMessage[]) => void;
    onMessageReceived?: (message: DisplayMessage, raw: SocketChatMessage) => void;
    onMessageDeleted?: (messageId: string) => void;
}

interface UseSocketRoomReturn {
    socketRef: React.MutableRefObject<Socket | null>;
    isConnected: boolean;
    connectionError: string | null;
    typingUsers: string[];
    onlineUsers: OnlineUser[];
    discussionQuality: DiscussionQuality | null;
    showQualityFeedback: boolean;
}

export function useSocketRoom({
    jwtToken,
    courseId,
    groupId,
    chatSpaceId,
    socketUrl,
    onSessionClosed,
    onSessionReopened,
    onMessagesLoaded,
    onMessageReceived,
    onMessageDeleted,
}: UseSocketRoomOptions): UseSocketRoomReturn {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [discussionQuality, setDiscussionQuality] = useState<DiscussionQuality | null>(null);
    const [showQualityFeedback, setShowQualityFeedback] = useState(false);
    const qualityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const onSessionClosedRef = useRef(onSessionClosed);
    const onSessionReopenedRef = useRef(onSessionReopened);
    const onMessagesLoadedRef = useRef(onMessagesLoaded);
    const onMessageReceivedRef = useRef(onMessageReceived);
    const onMessageDeletedRef = useRef(onMessageDeleted);

    onSessionClosedRef.current = onSessionClosed;
    onSessionReopenedRef.current = onSessionReopened;
    onMessagesLoadedRef.current = onMessagesLoaded;
    onMessageReceivedRef.current = onMessageReceived;
    onMessageDeletedRef.current = onMessageDeleted;

    useEffect(() => {
        if (!jwtToken) return;
        if (!courseId || !groupId || !chatSpaceId) {
            setConnectionError('Missing course, group, or chat space information');
            return;
        }

        const apiUrl = socketUrl || import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';

        socketRef.current = io(apiUrl, {
            auth: { token: jwtToken },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current.on('connect', () => {
            setConnectionError(null);
            socketRef.current?.emit('join_room', { courseId, groupId, chatSpaceId });
        });

        socketRef.current.on('connect_error', (error) => {
            setConnectionError(`Connection failed: ${error.message}`);
            setIsConnected(false);
        });

        socketRef.current.on('room_joined', () => {
            setIsConnected(true);
            setConnectionError(null);
        });

        socketRef.current.on('chat_history', (data: { messages: SocketChatMessage[] }) => {
            const historyMessages: DisplayMessage[] = data.messages.map((msg) => ({
                id: msg.id,
                sender_id: msg.senderId,
                sender_type: msg.senderType,
                sender_name: msg.senderName,
                content: msg.content,
                created_at: msg.createdAt,
                is_intervention: msg.isIntervention,
                reply_to: msg.replyTo,
                attachments: msg.attachments,
                mentions: msg.mentions,
            }));
            onMessagesLoadedRef.current?.(historyMessages);
        });

        socketRef.current.on('disconnect', () => {
            setIsConnected(false);
        });

        socketRef.current.on('error', (data: { message: string }) => {
            setConnectionError(data.message);
            setIsConnected(false);
        });

        socketRef.current.on('session_closed', (payload: { closedAt?: string; message?: string }) => {
            onSessionClosedRef.current?.(payload);
        });

        socketRef.current.on('session_reopened', () => {
            onSessionReopenedRef.current?.();
        });

        socketRef.current.on('receive_message', (message: SocketChatMessage) => {
            const displayMessage: DisplayMessage = {
                id: message.id,
                sender_id: message.senderId,
                sender_type: message.senderType,
                sender_name: message.senderName,
                content: message.content,
                created_at: message.createdAt,
                is_intervention: message.isIntervention,
                reply_to: message.replyTo,
                attachments: message.attachments,
                mentions: message.mentions,
            };
            onMessageReceivedRef.current?.(displayMessage, message);
        });

        socketRef.current.on('message_deleted', (data: { messageId: string }) => {
            onMessageDeletedRef.current?.(data.messageId);
        });

        socketRef.current.on('user_typing', (data: { userId: string; userName: string; isTyping: boolean }) => {
            setTypingUsers((prev) => {
                if (data.isTyping) {
                    return prev.includes(data.userName) ? prev : [...prev, data.userName];
                }
                return prev.filter((name) => name !== data.userName);
            });
        });

        socketRef.current.on('online_users', (data: { users: OnlineUser[] }) => {
            setOnlineUsers(data.users);
        });

        socketRef.current.on('user_joined', (data: { userId: string; userName: string }) => {
            setOnlineUsers((prev) => {
                if (prev.some((u) => u.odId === data.userId)) return prev;
                return [...prev, { odId: data.userId, userName: data.userName }];
            });
        });

        socketRef.current.on('user_left', (data: { userId: string }) => {
            setOnlineUsers((prev) => prev.filter((u) => u.odId !== data.userId));
        });

        socketRef.current.on('quality_update', (data: {
            qualityScore: number;
            engagementTypes: Record<string, number>;
            hotPercentage: number;
            message?: string;
        }) => {
            setDiscussionQuality({
                qualityScore: data.qualityScore,
                engagementTypes: data.engagementTypes,
                hotPercentage: data.hotPercentage,
                lastMessage: data.message,
            });
            setShowQualityFeedback(true);
            if (qualityTimerRef.current) clearTimeout(qualityTimerRef.current);
            qualityTimerRef.current = setTimeout(() => {
                setShowQualityFeedback(false);
                qualityTimerRef.current = null;
            }, 5000);
        });

        socketRef.current.on('intervention_sent', (data: { message: string; triggerReason: string }) => {
            void data.triggerReason;
        });

        return () => {
            if (qualityTimerRef.current) {
                clearTimeout(qualityTimerRef.current);
                qualityTimerRef.current = null;
            }
            socketRef.current?.off('session_closed');
            socketRef.current?.off('session_reopened');
            socketRef.current?.off('quality_update');
            socketRef.current?.off('intervention_sent');
            socketRef.current?.emit('leave_room', chatSpaceId);
            socketRef.current?.disconnect();
        };
    }, [jwtToken, courseId, groupId, chatSpaceId, socketUrl]);

    return {
        socketRef,
        isConnected,
        connectionError,
        typingUsers,
        onlineUsers,
        discussionQuality,
        showQualityFeedback,
    };
}
