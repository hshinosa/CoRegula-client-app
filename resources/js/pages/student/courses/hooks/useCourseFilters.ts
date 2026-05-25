import { useCallback, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import type { CourseStatus } from '@/types';

export interface CourseFilters {
    q: string;
    status: CourseStatus | null;
    page: number;
}

export function useCourseFilters() {
    const { url } = usePage();
    const searchParams = useMemo(() => new URLSearchParams(url.split('?')[1] || ''), [url]);

    const filters: CourseFilters = useMemo(() => ({
        q: searchParams.get('q') || '',
        status: (searchParams.get('filter[status]') as CourseStatus) || null,
        page: parseInt(searchParams.get('page') || '1', 10),
    }), [searchParams]);

    const updateFilters = useCallback((updates: Partial<CourseFilters>) => {
        const newFilters = { ...filters, ...updates };

        if (updates.q !== undefined || updates.status !== undefined) {
            newFilters.page = 1;
        }

        const params: Record<string, string | number> = {};
        if (newFilters.q) params['q'] = newFilters.q;
        if (newFilters.status) params['filter[status]'] = newFilters.status;
        if (newFilters.page > 1) params['page'] = newFilters.page;

        router.get('/student/courses', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [filters]);

    const setQuery = useCallback((q: string) => {
        updateFilters({ q });
    }, [updateFilters]);

    const toggleStatus = useCallback((status: CourseStatus) => {
        updateFilters({
            status: filters.status === status ? null : status,
        });
    }, [filters.status, updateFilters]);

    const setPage = useCallback((page: number) => {
        updateFilters({ page });
    }, [updateFilters]);

    const resetFilters = useCallback(() => {
        router.get('/student/courses', {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, []);

    const hasActiveFilters = useMemo(() => {
        return !!(filters.q || filters.status);
    }, [filters.q, filters.status]);

    return {
        filters,
        setQuery,
        toggleStatus,
        setPage,
        resetFilters,
        hasActiveFilters,
    };
}
