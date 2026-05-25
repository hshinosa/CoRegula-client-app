import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollProps {
    onLoadMore: () => void;
    hasMore: boolean;
    isLoading: boolean;
    children?: React.ReactNode;
    threshold?: number;
    showLoadMoreButton?: boolean;
}

export function InfiniteScroll({
    onLoadMore,
    hasMore,
    isLoading,
    children,
    threshold = 200,
    showLoadMoreButton = false,
}: InfiniteScrollProps) {
    const sentinelRef = useRef<HTMLDivElement>(null);
    const [observerAvailable, setObserverAvailable] = useState(true);

    const handleIntersect = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !isLoading) {
                onLoadMore();
            }
        },
        [hasMore, isLoading, onLoadMore],
    );

    useEffect(() => {
        if (showLoadMoreButton || !hasMore) return;

        if (typeof IntersectionObserver === 'undefined') {
            setObserverAvailable(false);
            return;
        }

        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(handleIntersect, {
            rootMargin: `${threshold}px`,
        });

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [handleIntersect, hasMore, threshold, showLoadMoreButton]);

    if (!hasMore && !isLoading && !children) return null;

    const useLoadMoreButton = showLoadMoreButton || !observerAvailable;

    return (
        <div>
            {children}

            {isLoading && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-[#88161c]" />
                    <span className="ml-2 text-sm text-[#6B7280]">Memuat data...</span>
                </div>
            )}

            {!isLoading && hasMore && useLoadMoreButton && (
                <div className="flex justify-center py-4">
                    <button
                        type="button"
                        onClick={onLoadMore}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#88161c]/20 bg-white px-6 py-2.5 text-sm font-medium text-[#88161c] transition-colors hover:bg-[#88161c]/5"
                    >
                        Load more
                    </button>
                </div>
            )}

            {!isLoading && hasMore && !useLoadMoreButton && (
                <div ref={sentinelRef} className="h-px" />
            )}

            {!hasMore && !isLoading && (
                <p className="py-4 text-center text-sm text-[#6B7280]">
                    Semua data sudah dimuat
                </p>
            )}
        </div>
    );
}

export type { InfiniteScrollProps };
