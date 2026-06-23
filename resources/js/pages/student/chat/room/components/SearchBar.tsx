import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    onClear: () => void;
    isSearching: boolean;
    resultCount: number;
    isActive: boolean;
}

export function SearchBar({
    onSearch,
    onClear,
    isSearching,
    resultCount,
    isActive,
}: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const debouncedSearch = useCallback(
        (value: string) => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            if (value.trim().length < 2) {
                onClear();
                return;
            }

            debounceRef.current = setTimeout(() => {
                onSearch(value.trim());
            }, 300);
        },
        [onSearch, onClear]
    );

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        debouncedSearch(value);
    };

    const handleClear = () => {
        setQuery('');
        onClear();
        setIsExpanded(false);
    };

    const handleToggle = () => {
        if (isExpanded) {
            handleClear();
        } else {
            setIsExpanded(true);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {isExpanded ? (
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-3 py-1.5 dark:border-gray-700 dark:bg-gray-800/80">
                    <Search className="h-4 w-4 text-gray-600" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleChange}
                        placeholder="Cari pesan..."
                        className="w-48 border-0 bg-transparent text-sm text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-0 dark:text-gray-100 sm:w-64"
                        aria-label="Cari pesan dalam sesi diskusi"
                    />
                    {isSearching && (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
                    )}
                    {isActive && !isSearching && (
                        <span className="text-xs text-gray-500 dark:text-gray-600">
                            {resultCount} hasil
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={handleClear}
                        className="flex h-5 w-5 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                        aria-label="Tutup pencarian"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={handleToggle}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-600 dark:hover:bg-gray-700"
                    aria-label="Buka pencarian"
                >
                    <Search className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}