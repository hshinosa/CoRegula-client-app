import { useState, useEffect } from 'react';
import { Bookmark, X, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidGlassCard, SecondaryButton } from '@/components/Welcome/utils/helpers';

interface BookmarkItem {
    id: string;
    message_id: string;
    conversation_id: string | null;
    note: string | null;
    created_at: string;
}

interface BookmarkPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigateToMessage: (conversationId: string, messageId: string) => void;
    onBookmarkDeleted?: (bookmarkId: string) => void;
}

export function BookmarkPanel({ isOpen, onClose, onNavigateToMessage, onBookmarkDeleted }: BookmarkPanelProps) {
    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchBookmarks();
        }
    }, [isOpen]);

    const fetchBookmarks = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/ai-chat/bookmarks', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setBookmarks(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch bookmarks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (bookmarkId: string) => {
        setDeletingId(bookmarkId);
        try {
            const response = await fetch(`/ai-chat/bookmarks/${bookmarkId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (response.ok) {
                setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
                onBookmarkDeleted?.(bookmarkId);
            }
        } catch (error) {
            console.error('Failed to delete bookmark:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                    />
                    <motion.aside
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col"
                    >
                        <LiquidGlassCard intensity="heavy" className="flex h-full flex-col rounded-l-2xl" lightMode={true}>
                            <div className="flex items-center justify-between border-b border-[#E5E7EB]/50 p-4">
                                <div className="flex items-center gap-2">
                                    <Bookmark className="h-5 w-5 text-brand-primary" />
                                    <h2 className="text-base font-semibold text-brand-dark">Bookmark</h2>
                                    <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-brand-primary">
                                        {bookmarks.length}
                                    </span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="rounded-lg p-1.5 text-brand-muted-dark transition-colors hover:bg-[#F3F4F6] hover:text-brand-dark"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-6 w-6 text-brand-primary animate-spin" />
                                    </div>
                                ) : bookmarks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Bookmark className="h-12 w-12 text-[#E5E7EB]" />
                                        <p className="mt-4 text-sm font-medium text-brand-dark">Belum ada bookmark</p>
                                        <p className="mt-1 text-xs text-[#9CA3AF]">
                                            Bookmark pesan penting dengan menekan ikon bookmark
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {bookmarks.map((bookmark) => (
                                            <motion.div
                                                key={bookmark.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="group rounded-xl border border-[#E5E7EB]/50 bg-white/50 p-3 transition-all hover:border-brand-primary/20 hover:bg-white/80"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-[#9CA3AF]">
                                                            {formatDate(bookmark.created_at)}
                                                        </p>
                                                        {bookmark.note && (
                                                            <p className="mt-1 text-sm text-brand-dark line-clamp-2">
                                                                {bookmark.note}
                                                            </p>
                                                        )}
                                                        <p className="mt-1 text-[10px] text-[#9CA3AF]">
                                                            ID: {bookmark.message_id.slice(0, 8)}...
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                        {bookmark.conversation_id && (
                                                            <button
                                                                onClick={() => onNavigateToMessage(bookmark.conversation_id!, bookmark.message_id)}
                                                                className="rounded-lg p-1.5 text-brand-muted-dark transition-colors hover:bg-[#F3F4F6] hover:text-brand-primary"
                                                                title="Lihat pesan"
                                                            >
                                                                <ExternalLink className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(bookmark.id)}
                                                            disabled={deletingId === bookmark.id}
                                                            className="rounded-lg p-1.5 text-brand-muted-dark transition-colors hover:bg-red-50 hover:text-red-600"
                                                            title="Hapus bookmark"
                                                        >
                                                            {deletingId === bookmark.id ? (
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </LiquidGlassCard>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
