import { router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    BookOpen,
    FileText,
    Loader2,
    Search,
    Settings,
    User,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface SearchResultItem {
    id: string;
    title: string;
    subtitle: string;
    href: string;
    type: string;
}

interface SearchResultGroup {
    label: string;
    type: string;
    items: SearchResultItem[];
}

function ItemIcon({ type }: { type: string }) {
    const baseClass = 'h-4 w-4';
    switch (type) {
        case 'user':
            return <User className={baseClass} />;
        case 'course':
            return <BookOpen className={baseClass} />;
        case 'setting':
            return <Settings className={baseClass} />;
        case 'group':
            return <User className={baseClass} />;
        case 'reflection':
            return <FileText className={baseClass} />;
        case 'session':
            return <BookOpen className={baseClass} />;
        case 'student':
            return <User className={baseClass} />;
        case 'analytics':
            return <FileText className={baseClass} />;
        default:
            return <FileText className={baseClass} />;
    }
}

function GroupIcon({ type }: { type: string }) {
    const baseClass = 'h-3.5 w-3.5';
    switch (type) {
        case 'user':
            return <User className={baseClass} />;
        case 'course':
            return <BookOpen className={baseClass} />;
        case 'setting':
            return <FileText className={baseClass} />;
        case 'group':
            return <User className={baseClass} />;
        case 'reflection':
            return <FileText className={baseClass} />;
        case 'session':
            return <BookOpen className={baseClass} />;
        case 'student':
            return <User className={baseClass} />;
        case 'analytics':
            return <FileText className={baseClass} />;
        default:
            return <FileText className={baseClass} />;
    }
}

interface GlobalSearchModalProps {
    open: boolean;
    onClose: () => void;
    results: SearchResultGroup[];
    isLoading: boolean;
    query: string;
    onQueryChange: (query: string) => void;
    debouncedQuery: string;
}

export function GlobalSearchModal({
    open,
    onClose,
    results,
    isLoading,
    query,
    onQueryChange,
    debouncedQuery,
}: GlobalSearchModalProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const allItems = useMemo(
        () => results.flatMap((g) => g.items),
        [results],
    );

    useEffect(() => {
        if (open) {
            onQueryChange('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open, onQueryChange]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [results]);

    useEffect(() => {
        const item = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
        item?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    const handleNavigate = useCallback(
        (href: string) => {
            onClose();
            router.visit(href);
        },
        [onClose],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex((i) => (i + 1) % Math.max(allItems.length, 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex((i) => (i - 1 + allItems.length) % Math.max(allItems.length, 1));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (allItems[selectedIndex]) {
                        handleNavigate(allItems[selectedIndex].href);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        },
        [allItems, selectedIndex, handleNavigate, onClose],
    );

    if (!open) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="relative w-full max-w-2xl mx-4"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        {/* Search Input */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => onQueryChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search..."
                                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-base"
                            />
                            {isLoading && (
                                <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0" />
                            )}
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </button>
                        </div>

                        {/* Results */}
                        <div
                            ref={listRef}
                            className="max-h-[60vh] overflow-y-auto"
                        >
                            {!debouncedQuery.trim() || debouncedQuery.trim().length < 2 ? (
                                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                    Type at least 2 characters to search
                                </div>
                            ) : results.length === 0 && !isLoading ? (
                                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                    No results found
                                </div>
                            ) : (
                                <div className="py-2">
                                    {results.map((group, groupIndex) => (
                                        <div key={groupIndex} className="mb-4 last:mb-0">
                                            {/* Group Header */}
                                            <div className="px-4 py-2 flex items-center gap-2">
                                                <GroupIcon type={group.type} />
                                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    {group.label}
                                                </span>
                                            </div>

                                            {/* Group Items */}
                                            <div>
                                                {group.items.map((item, itemIndex) => {
                                                    const globalIndex = results
                                                        .slice(0, groupIndex)
                                                        .reduce((acc, g) => acc + g.items.length, 0) + itemIndex;

                                                    return (
                                                        <button
                                                            key={item.id}
                                                            data-index={globalIndex}
                                                            onClick={() => handleNavigate(item.href)}
                                                            className={`w-full px-4 py-2.5 flex items-center gap-3 transition-colors ${
                                                                globalIndex === selectedIndex
                                                                    ? 'bg-blue-50 dark:bg-blue-900/20'
                                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                            }`}
                                                        >
                                                            <div
                                                                className={`flex-shrink-0 ${
                                                                    globalIndex === selectedIndex
                                                                        ? 'text-blue-600 dark:text-blue-400'
                                                                        : 'text-gray-400 dark:text-gray-500'
                                                                }`}
                                                            >
                                                                <ItemIcon type={item.type} />
                                                            </div>
                                                            <div className="flex-1 text-left min-w-0">
                                                                <div
                                                                    className={`text-sm font-medium truncate ${
                                                                        globalIndex === selectedIndex
                                                                            ? 'text-blue-900 dark:text-blue-100'
                                                                            : 'text-gray-900 dark:text-gray-100'
                                                                    }`}
                                                                >
                                                                    {item.title}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                    {item.subtitle}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                                        ↑↓
                                    </kbd>
                                    Navigate
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                                        ↵
                                    </kbd>
                                    Select
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                                        Esc
                                    </kbd>
                                    Close
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
