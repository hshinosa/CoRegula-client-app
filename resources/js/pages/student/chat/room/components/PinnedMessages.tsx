import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, ChevronDown, ChevronUp, X } from 'lucide-react';

export interface PinnedMessage {
    id: string;
    message_id: string;
    conversation_id: string;
    pinned_by: string;
    content: string;
    sender_name: string;
    pinned_at: string;
}

interface PinnedMessagesProps {
    pinnedMessages: PinnedMessage[];
    onUnpin: (messageId: string) => void;
    onMessageClick: (messageId: string) => void;
    canPin: boolean;
    canUnpin: boolean;
}

export function PinnedMessages({
    pinnedMessages,
    onUnpin,
    onMessageClick,
    canPin,
    canUnpin,
}: PinnedMessagesProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (pinnedMessages.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-gray-200 bg-gray-50/80 dark:border-gray-700 dark:bg-gray-800/50"
        >
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50"
                aria-expanded={isExpanded}
                aria-label={`${pinnedMessages.length} pesan disematkan`}
            >
                <div className="flex items-center gap-2">
                    <Pin className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {pinnedMessages.length} pesan disematkan
                    </span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-600" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                )}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {pinnedMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/30"
                                >
                                    <button
                                        type="button"
                                        onClick={() => onMessageClick(msg.message_id)}
                                        className="min-w-0 flex-1 text-left"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-600">
                                                {msg.sender_name}
                                            </span>
                                            <span className="text-xs text-gray-600 dark:text-gray-500">
                                                {new Date(msg.pinned_at).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-sm text-gray-700 line-clamp-2 dark:text-gray-300">
                                            {msg.content}
                                        </p>
                                    </button>
                                    {canUnpin && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onUnpin(msg.message_id);
                                            }}
                                            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                                            aria-label={`Lepas sematan pesan dari ${msg.sender_name}`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}