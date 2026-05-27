import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface AdminPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
    itemLabel?: string;
}

function generatePageNumbers(current: number, total: number): (number | '...')[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [];

    pages.push(1);

    if (current > 3) {
        pages.push('...');
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (current < total - 2) {
        pages.push('...');
    }

    pages.push(total);

    return pages;
}

export function AdminPagination({
    currentPage,
    totalPages,
    totalItems,
    perPage,
    onPageChange,
    isLoading = false,
    itemLabel = 'data',
}: AdminPaginationProps) {
    if (totalPages <= 1 && totalItems === 0) return null;

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, totalItems);

    const pages = generatePageNumbers(currentPage, totalPages);

    return (
        <div className="flex flex-col gap-3 border-t border-white/60 pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-brand-muted-dark">
                Menampilkan{' '}
                <span className="font-medium text-brand-dark">{startItem}</span>
                {' '}-{' '}
                <span className="font-medium text-brand-dark">{endItem}</span>
                {' '}dari{' '}
                <span className="font-medium text-brand-dark">{totalItems}</span>
                {' '}{itemLabel}
                {isLoading && (
                    <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin text-brand-primary" />
                )}
            </p>

            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || isLoading}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Halaman sebelumnya"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                </button>

                {pages.map((page, i) =>
                    page === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-sm text-slate-400">
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            type="button"
                            onClick={() => onPageChange(page as number)}
                            disabled={isLoading}
                            className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-all duration-200"
                            style={{
                                background:
                                    page === currentPage
                                        ? 'linear-gradient(135deg, rgba(164,18,25,0.92) 0%, rgba(136,22,28,0.96) 100%)'
                                        : 'transparent',
                                color: page === currentPage ? 'white' : '#6B7280',
                                boxShadow:
                                    page === currentPage
                                        ? '0 4px 12px rgba(136,22,28,0.3)'
                                        : undefined,
                            }}
                            aria-current={page === currentPage ? 'page' : undefined}
                            aria-label={`Halaman ${page}`}
                        >
                            {page}
                        </button>
                    ),
                )}

                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || isLoading}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Halaman berikutnya"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

export type { AdminPaginationProps };
