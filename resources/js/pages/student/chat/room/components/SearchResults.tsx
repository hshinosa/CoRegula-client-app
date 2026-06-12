import { motion } from 'framer-motion';
import { MessageSquare, ChevronDown, X } from 'lucide-react';
import { sanitizeHtml } from '@/utils/sanitize';

export interface SearchResult {
    id: string;
    content: string;
    highlighted_content: string;
    sender_name: string;
    created_at: string;
}

interface SearchResultsProps {
    results: SearchResult[];
    hasMore: boolean;
    isLoading: boolean;
    totalResults: number;
    onResultClick: (messageId: string) => void;
    onLoadMore: () => void;
    onClose: () => void;
}

export function SearchResults({
    results,
    hasMore,
    isLoading,
    totalResults,
    onResultClick,
    onLoadMore,
    onClose,
}: SearchResultsProps) {
    if (results.length === 0 && !isLoading) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-1/2 top-full z-40 mt-1 w-full max-w-md -translate-x-1/2 max-h-[24vh] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
        >
            <div className="flex items-center justify-between border-b border-gray-200 px-3 py-1 dark:border-gray-700">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {totalResults} pesan ditemukan
                </span>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700"
                    aria-label="Tutup hasil pencarian"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(24vh - 28px)' }}>
                {isLoading && results.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {results.map((result) => (
                            <button
                                key={result.id}
                                type="button"
                                onClick={() => onResultClick(result.id)}
                                className="flex w-full items-start gap-2 px-3 py-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                                <MessageSquare className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                                            {result.sender_name}
                                        </span>
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                            {new Date(result.created_at).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                    <p
                                        className="mt-0.5 text-xs text-gray-700 line-clamp-1 dark:text-gray-300"
                                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(result.highlighted_content) }}
                                    />
                                </div>
                            </button>
                        ))}

                        {hasMore && (
                            <button
                                type="button"
                                onClick={onLoadMore}
                                disabled={isLoading}
                                className="flex w-full items-center justify-center gap-1 py-2 text-xs text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                            >
                                {isLoading ? (
                                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                                ) : (
                                    <>
                                        <ChevronDown className="h-3.5 w-3.5" />
                                        Muat lebih banyak
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}