import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { Course, CourseFilterCounts, CourseStatus, PaginatedResponse } from '@/types';

interface UseCoursesParams {
    q?: string;
    status?: CourseStatus | null;
    page?: number;
    perPage?: number;
}

interface UseCoursesResult {
    courses: Course[];
    meta: PaginatedResponse<Course>['meta'];
    filterCounts: CourseFilterCounts;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    isFetching: boolean;
    refetch: () => void;
}

const EMPTY_META = { total: 0, per_page: 12, current_page: 1, last_page: 1 };
const EMPTY_FILTER_COUNTS: CourseFilterCounts = { aktif: 0, selesai: 0, belum_mulai: 0 };

async function fetchCourses(params: UseCoursesParams): Promise<PaginatedResponse<Course>> {
    const queryParams: Record<string, string | number> = {};
    if (params.q) queryParams['q'] = params.q;
    if (params.status) queryParams['filter[status]'] = params.status;
    if (params.page && params.page > 1) queryParams['page'] = params.page;
    if (params.perPage) queryParams['per_page'] = params.perPage;

    const { data } = await axios.get<PaginatedResponse<Course>>('/student/courses-data', {
        params: queryParams,
    });
    return data;
}

export function useCourses({ q, status, page = 1, perPage = 12 }: UseCoursesParams = {}): UseCoursesResult {
    const queryKey = ['student-courses', { q: q || '', status: status || '', page, perPage }];

    const {
        data,
        isLoading,
        isError,
        error,
        isFetching,
        refetch,
    } = useQuery({
        queryKey,
        queryFn: () => fetchCourses({ q, status, page, perPage }),
        staleTime: 1000 * 60 * 2,
        placeholderData: (prev) => prev,
    });

    return {
        courses: data?.data ?? [],
        meta: data?.meta ?? EMPTY_META,
        filterCounts: data?.filter_counts ?? EMPTY_FILTER_COUNTS,
        isLoading,
        isError,
        error: error as Error | null,
        isFetching,
        refetch,
    };
}
