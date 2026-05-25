import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';

export type SpaceType = 'Akademik' | 'Proyek' | 'Umum';
export type SpaceStatus = 'Aktif' | 'Tidak aktif';
export type SpaceSort = 'terbaru' | 'paling-aktif' | 'alfabet';

export interface SpaceFilters {
    q: string;
    types: SpaceType[];
    statuses: SpaceStatus[];
    sort: SpaceSort;
    page: number;
    perPage: number;
}

interface UseSpaceFiltersOptions {
    debounceMs?: number;
    perPage?: number;
}

interface UseSpaceFiltersReturn {
    filters: SpaceFilters;
    setQuery: (q: string) => void;
    toggleType: (type: SpaceType) => void;
    toggleStatus: (status: SpaceStatus) => void;
    setSort: (sort: SpaceSort) => void;
    setPage: (page: number) => void;
    clearFilters: () => void;
    clearSearch: () => void;
    hasActiveFilters: boolean;
    activeFilterCount: number;
}

function parseUrlFilters(): Partial<SpaceFilters> {
    if (typeof window === 'undefined') return {};
    const params = new URLSearchParams(window.location.search);

    const q = params.get('q') || '';
    const types = params.getAll('type') as SpaceType[];
    const statuses = params.getAll('status') as SpaceStatus[];
    const sort = (params.get('sort') as SpaceSort) || 'terbaru';
    const page = parseInt(params.get('page') || '1', 10);
    const perPage = parseInt(params.get('per_page') || '12', 10);

    return {
        q: q || undefined,
        types: types.length > 0 ? types : undefined,
        statuses: statuses.length > 0 ? statuses : undefined,
        sort: sort || undefined,
        page: isNaN(page) ? 1 : page,
        perPage: isNaN(perPage) ? 12 : perPage,
    };
}

function buildUrlParams(filters: SpaceFilters): Record<string, string | string[]> {
    const params: Record<string, string | string[]> = {};

    if (filters.q) params.q = filters.q;
    if (filters.types.length > 0) {
        params.type = filters.types;
    }
    if (filters.statuses.length > 0) {
        params.status = filters.statuses;
    }
    if (filters.sort !== 'terbaru') {
        params.sort = filters.sort;
    }
    if (filters.page > 1) {
        params.page = String(filters.page);
    }
    if (filters.perPage !== 12) {
        params.per_page = String(filters.perPage);
    }

    return params;
}

export function useSpaceFilters(options: UseSpaceFiltersOptions = {}): UseSpaceFiltersReturn {
    const { debounceMs = 300, perPage = 12 } = options;
    const page = usePage();

    const initialFilters = useMemo<SpaceFilters>(() => {
        const parsed = parseUrlFilters();
        return {
            q: parsed.q || '',
            types: parsed.types || [],
            statuses: parsed.statuses || [],
            sort: parsed.sort || 'terbaru',
            page: parsed.page || 1,
            perPage: parsed.perPage || perPage,
        };
    }, []);

    const [filters, setFilters] = useState<SpaceFilters>(initialFilters);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync filters to URL
    const syncToUrl = useCallback((newFilters: SpaceFilters) => {
        const params = buildUrlParams(newFilters);
        router.get(
            window.location.pathname,
            params as Record<string, string>,
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, []);

    const updateFilters = useCallback(
        (updater: (prev: SpaceFilters) => SpaceFilters, sync: boolean = true) => {
            setFilters((prev) => {
                const next = updater(prev);
                if (sync) {
                    syncToUrl(next);
                }
                return next;
            });
        },
        [syncToUrl]
    );

    const setQuery = useCallback(
        (q: string) => {
            setFilters((prev) => ({ ...prev, q, page: 1 }));

            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            debounceTimerRef.current = setTimeout(() => {
                setFilters((prev) => {
                    syncToUrl({ ...prev, q, page: 1 });
                    return prev;
                });
            }, debounceMs);
        },
        [debounceMs, syncToUrl]
    );

    const toggleType = useCallback(
        (type: SpaceType) => {
            updateFilters((prev) => {
                const types = prev.types.includes(type)
                    ? prev.types.filter((t) => t !== type)
                    : [...prev.types, type];
                return { ...prev, types, page: 1 };
            });
        },
        [updateFilters]
    );

    const toggleStatus = useCallback(
        (status: SpaceStatus) => {
            updateFilters((prev) => {
                const statuses = prev.statuses.includes(status)
                    ? prev.statuses.filter((s) => s !== status)
                    : [...prev.statuses, status];
                return { ...prev, statuses, page: 1 };
            });
        },
        [updateFilters]
    );

    const setSort = useCallback(
        (sort: SpaceSort) => {
            updateFilters((prev) => ({ ...prev, sort, page: 1 }));
        },
        [updateFilters]
    );

    const setPage = useCallback(
        (page: number) => {
            updateFilters((prev) => ({ ...prev, page }));
        },
        [updateFilters]
    );

    const clearFilters = useCallback(() => {
        updateFilters((prev) => ({
            ...prev,
            types: [],
            statuses: [],
            q: '',
            page: 1,
        }));
    }, [updateFilters]);

    const clearSearch = useCallback(() => {
        setQuery('');
    }, [setQuery]);

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const parsed = parseUrlFilters();
        setFilters({
            q: parsed.q || '',
            types: parsed.types || [],
            statuses: parsed.statuses || [],
            sort: parsed.sort || 'terbaru',
            page: parsed.page || 1,
            perPage: parsed.perPage || perPage,
        });
    }, [page.url]);

    const hasActiveFilters = filters.types.length > 0 || filters.statuses.length > 0 || filters.q.length > 0;
    const activeFilterCount = filters.types.length + filters.statuses.length + (filters.q.length > 0 ? 1 : 0);

    return {
        filters,
        setQuery,
        toggleType,
        toggleStatus,
        setSort,
        setPage,
        clearFilters,
        clearSearch,
        hasActiveFilters,
        activeFilterCount,
    };
}
