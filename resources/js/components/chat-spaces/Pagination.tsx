import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
    onPageChange: (page: number) => void;
}

export function Pagination({
    currentPage,
    totalPages,
    totalItems,
    perPage,
    onPageChange,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, totalItems);

    const pages = generatePageNumbers(currentPage, totalPages);

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-sm text-brand-muted-dark">
                Menampilkan{' '}
                <span className="font-medium text-brand-dark">{startItem}</span>
                {' '}-{' '}
                <span className="font-medium text-brand-dark">{endItem}</span>
                {' '}dari{' '}
                <span className="font-medium text-brand-dark">{totalItems}</span>
                {' '}ruang
            </p>

            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="inline-flex items-center justify-center rounded-lg p-2 text-brand-muted-dark transition-colors hover:bg-white/60 hover:text-brand-dark disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Halaman sebelumnya"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {pages.map((page, i) => (
                    page === '...' ? (
                        <span
                            key={`ellipsis-${i}`}
                            className="px-2 text-sm text-brand-muted-dark"
                        >
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            type="button"
                            onClick={() => onPageChange(page as number)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200"
                            style={{
                                background: page === currentPage
                                    ? 'linear-gradient(135deg, rgba(164,18,25,0.92) 0%, rgba(136,22,28,0.96) 100%)'
                                    : 'transparent',
                                color: page === currentPage ? 'white' : '#6B7280',
                                ...(page !== currentPage ? {} : {
                                    boxShadow: '0 4px 12px rgba(136,22,28,0.3)',
                                }),
                            }}
                            aria-current={page === currentPage ? 'page' : undefined}
                            aria-label={`Halaman ${page}`}
                        >
                            {page}
                        </button>
                    )
                ))}

                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="inline-flex items-center justify-center rounded-lg p-2 text-brand-muted-dark transition-colors hover:bg-white/60 hover:text-brand-dark disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Halaman berikutnya"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
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
