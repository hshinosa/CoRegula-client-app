import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import axios from 'axios';
import { useDebounce } from '@/hooks/useDebounce';
import type { Course, Group, Reflection } from '@/types';

interface StudentSearchResponse {
    courses: Course[];
    groups: Group[];
    reflections: Reflection[];
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

export function useStudentGlobalSearch(query: string) {
    const debouncedQuery = useDebounce(query, 300);

    const searchQuery = useQuery<StudentSearchResponse>({
        queryKey: ['student-global-search', debouncedQuery],
        queryFn: async () => {
            const response = await axios.get<StudentSearchResponse>('/student/search', {
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
                    href: `/student/courses/${c.id}`,
                    type: 'course',
                })),
            });
        }

        if (data?.groups && data.groups.length > 0) {
            groups.push({
                label: 'Groups',
                type: 'group',
                items: data.groups.map((g) => ({
                    id: g.id,
                    title: g.name,
                    subtitle: g.course?.name || 'Group',
                    href: `/student/groups/${g.id}`,
                    type: 'group',
                })),
            });
        }

        if (data?.reflections && data.reflections.length > 0) {
            groups.push({
                label: 'Reflections',
                type: 'reflection',
                items: data.reflections.map((r) => ({
                    id: r.id,
                    title: r.title || 'Untitled Reflection',
                    subtitle: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'No date',
                    href: `/student/reflections`,
                    type: 'reflection',
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
