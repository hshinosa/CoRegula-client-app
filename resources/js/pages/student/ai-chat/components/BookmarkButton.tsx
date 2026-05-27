import { useState, useEffect } from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface BookmarkButtonProps {
    messageId: string;
    conversationId?: string;
    initialBookmarked?: boolean;
    onToggle?: (bookmarked: boolean) => void;
    size?: 'sm' | 'md';
}

export function BookmarkButton({
    messageId,
    conversationId,
    initialBookmarked = false,
    onToggle,
    size = 'sm',
}: BookmarkButtonProps) {
    const [bookmarked, setBookmarked] = useState(initialBookmarked);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setBookmarked(initialBookmarked);
    }, [initialBookmarked]);

    const handleToggle = async () => {
        if (isLoading) return;

        const previousState = bookmarked;
        setBookmarked(!bookmarked);
        setIsLoading(true);

        try {
            const response = await fetch('/ai-chat/bookmarks/toggle', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    message_id: messageId,
                    conversation_id: conversationId,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setBookmarked(data.bookmarked);
                onToggle?.(data.bookmarked);
            } else {
                setBookmarked(previousState);
            }
        } catch (error) {
            console.error('Failed to toggle bookmark:', error);
            setBookmarked(previousState);
        } finally {
            setIsLoading(false);
        }
    };

    const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggle}
            disabled={isLoading}
            className={`rounded-lg p-1.5 transition-all ${
                bookmarked
                    ? 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20'
                    : 'text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-brand-muted-dark'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={bookmarked ? 'Hapus bookmark' : 'Bookmark pesan ini'}
        >
            {isLoading ? (
                <Loader2 className={`${iconSize} animate-spin`} />
            ) : (
                <Bookmark
                    className={iconSize}
                    fill={bookmarked ? 'currentColor' : 'none'}
                />
            )}
        </motion.button>
    );
}
