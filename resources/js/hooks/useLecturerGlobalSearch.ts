import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import axios from 'axios';
import { useDebounce } from '@/hooks/useDebounce';
import type { Course, User, AttendanceSession } from '@/types';

interface LecturerSearchResponse {
    courses: Course[];
    students: User[];
    sessions: AttendanceSession[];
}

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

export function useLecturerGlobalSearch(query: string) {
    const debouncedQuery = useDebounce(query, 300);

    const searchQuery = useQuery<LecturerSearchResponse>({
        queryKey: ['lecturer-global-search', debouncedQuery],
        queryFn: async () => {
            const response = await axios.get<LecturerSearchResponse>('/lecturer/search', {
                headers: { Accept: 'application/json' },
                params: {
                    search: debouncedQuery || undefined,
                    limit: 5,
                },
            });
            return response.data;
        },
        enabled: debouncedQuery.trim().length >= 2,
        staleTime: 1000 * 60 * 2,
    });

    const results = useMemo<SearchResultGroup[]>(() => {
        if (!debouncedQuery.trim() || debouncedQuery.trim().length < 2) return [];

        const groups: SearchResultGroup[] = [];
        const data = searchQuery.data;

        if (data?.courses && data.courses.length > 0) {
            groups.push({
                label: 'Courses',
                type: 'course',
                items: data.courses.map((c) => ({
                    id: c.id,
                    title: c.name,
                    subtitle: c.code || 'Course',
                    href: `/lecturer/courses/${c.id}`,
                    type: 'course',
                })),
            });
        }

        if (data?.students && data.students.length > 0) {
            groups.push({
                label: 'Students',
                type: 'student',
                items: data.students.map((s) => ({
                    id: s.id,
                    title: s.name,
                    subtitle: s.email,
                    href: `/lecturer/analytics`,
                    type: 'student',
                })),
            });
        }

        if (data?.sessions && data.sessions.length > 0) {
            groups.push({
                label: 'Sessions',
                type: 'session',
                items: data.sessions.map((s) => ({
                    id: s.id,
                    title: s.title,
                    subtitle: s.course?.name || 'Session',
                    href: `/lecturer/courses/${s.course_id}/sessions`,
                    type: 'session',
                })),
            });
        }

        return groups;
    }, [debouncedQuery, searchQuery.data]);

    return {
        results,
        isLoading: searchQuery.isLoading,
        debouncedQuery,
    };
}
