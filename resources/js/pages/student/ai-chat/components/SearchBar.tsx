import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
    id: string;
    title: string;
    created_at: string | null;
    updated_at: string | null;
    snippet: string | null;
    match_type: 'title' | 'content' | 'bookmark';
}

interface SearchBarProps {
    onSelectResult: (chatId: string) => void;
    bookmarkedOnly?: boolean;
    className?: string;
}

export function SearchBar({ onSelectResult, bookmarkedOnly = false, className = '' }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const performSearch = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2 && !bookmarkedOnly) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.set('q', searchQuery);
            if (bookmarkedOnly) params.set('bookmarked', 'true');

            const response = await fetch(`/student/ai-chat/search?${params.toString()}`, {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setResults(data.data || []);
                setIsOpen(true);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    }, [bookmarkedOnly]);

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            performSearch(query);
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query, performSearch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (chatId: string) => {
        onSelectResult(chatId);
        setIsOpen(false);
        setQuery('');
    };

    const highlightMatch = (text: string, searchQuery: string) => {
        if (!searchQuery || !text) return text;
        const parts = text.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === searchQuery.toLowerCase()
                ? <mark key={i} className="bg-yellow-200/70 rounded px-0.5">{part}</mark>
                : part
        );
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (results.length > 0) setIsOpen(true);
                    }}
                    placeholder={bookmarkedOnly ? "Cari bookmark..." : "Cari percakapan..."}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white/80 py-2.5 pl-10 pr-10 text-sm text-brand-dark placeholder-[#9CA3AF] backdrop-blur-sm transition-all focus:border-brand-primary/30 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-primary animate-spin" />
                )}
                {query && !isLoading && (
                    <button
                        onClick={() => {
                            setQuery('');
                            setResults([]);
                            setIsOpen(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] hover:text-brand-dark transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white/95 shadow-lg backdrop-blur-md"
                    >
                        {results.map((result) => (
                            <button
                                key={result.id}
                                onClick={() => handleSelect(result.id)}
                                className="flex w-full flex-col gap-1 border-b border-[#F3F4F6] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#F9FAFB]"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-brand-dark">
                                        {highlightMatch(result.title, query)}
                                    </span>
                                    {result.match_type === 'bookmark' && (
                                        <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-medium text-brand-primary">
                                            Bookmark
                                        </span>
                                    )}
                                </div>
                                {result.snippet && (
                                    <p className="text-xs text-brand-muted-dark line-clamp-2">
                                        {highlightMatch(result.snippet, query)}
                                    </p>
                                )}
                                {result.updated_at && (
                                    <span className="text-[10px] text-[#9CA3AF]">
                                        {new Date(result.updated_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </span>
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}

                {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-[#E5E7EB] bg-white/95 p-4 text-center shadow-lg backdrop-blur-md"
                    >
                        <p className="text-sm text-brand-muted-dark">Tidak ada percakapan yang cocok</p>
                        <p className="mt-1 text-xs text-[#9CA3AF]">Coba kata kunci lain atau hapus filter</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
