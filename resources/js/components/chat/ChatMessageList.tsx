import React from 'react';
import type { ChatDisplayMessage } from '@/types/chat';
import { sanitizeText } from '@/utils/sanitize';

export type ChatMessage = ChatDisplayMessage;

interface ChatMessageListProps {
    messages: ChatMessage[];
    currentUserId?: string;
    containerRef?: React.RefObject<HTMLDivElement>;
    onReply?: (message: ChatMessage) => void;
    onImageClick?: (url: string, name: string) => void;
    isLoading?: boolean;
    emptyText?: string;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
    messages,
    currentUserId,
    containerRef,
    onReply,
    onImageClick,
    isLoading = false,
    emptyText = 'Belum ada pesan. Mulai diskusi!',
}) => {
    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="animate-pulse text-gray-400 text-sm">Memuat pesan...</div>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <p className="text-gray-400 text-sm">{emptyText}</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {messages.map((message) => {
                const isOwn = message.sender_id === currentUserId;
                const isAI = message.sender_type === 'ai' || message.sender_type === 'bot';
                const isSystem = message.sender_type === 'system';

                return (
                    <div
                        key={message.id}
                        className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${message.isGrouped ? 'mt-0.5' : 'mt-3'}`}
                    >
                        {!isOwn && message.showAvatar && (
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                                style={{ background: isAI ? 'rgba(136,22,28,0.8)' : isSystem ? 'rgba(136,22,28,0.6)' : 'rgba(107,114,128,0.6)' }}
                            >
                                {isAI ? 'AI' : message.sender_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                        )}
                        {!isOwn && !message.showAvatar && <div className="w-8 flex-shrink-0" />}

                        <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                            {message.showName && !isOwn && (
                                <span className="mb-1 text-xs font-medium text-gray-500">
                                    {sanitizeText(message.sender_name)}
                                </span>
                            )}

                            {message.reply_to && (
                                <div className="mb-1 rounded-lg border-l-2 border-[#88161c] bg-gray-100 px-2 py-1 text-xs text-gray-500">
                                    <span className="font-medium">{sanitizeText(message.reply_to.senderName)}</span>
                                    <p className="truncate">{sanitizeText(message.reply_to.content)}</p>
                                </div>
                            )}

                            <div
                                className={`rounded-2xl px-3 py-2 text-sm ${
                                    isOwn
                                        ? 'rounded-tr-sm bg-[#88161c] text-white'
                                        : isAI || isSystem
                                        ? 'rounded-tl-sm bg-[rgba(136,22,28,0.08)] text-[#4A4A4A]'
                                        : 'rounded-tl-sm bg-white text-[#4A4A4A]'
                                }`}
                                style={{ border: isOwn ? 'none' : '1px solid rgba(255,255,255,0.5)' }}
                            >
                                <p className="whitespace-pre-wrap break-words">{sanitizeText(message.content)}</p>

                                {message.attachments && message.attachments.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {message.attachments.map((att) => (
                                            <div key={att.id}>
                                                {att.type.startsWith('image/') ? (
                                                    <img
                                                        src={att.previewUrl || att.url}
                                                        alt={att.name}
                                                        className="max-h-48 cursor-pointer rounded-lg object-cover"
                                                        loading="lazy"
                                                        onClick={() => onImageClick?.(att.url, att.name)}
                                                    />
                                                ) : (
                                                    <a
                                                        href={att.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-xs underline opacity-80"
                                                    >
                                                        📎 {att.name}
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-0.5 flex items-center gap-2">
                                {message.showTime && (
                                    <span className="text-xs text-gray-400">
                                        {new Date(message.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                                {onReply && !isSystem && (
                                    <button
                                        onClick={() => onReply(message)}
                                        className="text-xs text-gray-400 opacity-0 transition-opacity hover:text-[#88161c] group-hover:opacity-100"
                                    >
                                        Balas
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ChatMessageList;
