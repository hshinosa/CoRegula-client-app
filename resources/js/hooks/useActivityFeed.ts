import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { ActivityType, CursorPaginatedActivities, GroupActivity } from '@/types';

interface UseActivityFeedParams {
    groupId: string;
    type?: ActivityType | null;
    limit?: number;
}

interface UseActivityFeedResult {
    activities: GroupActivity[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    isFetching: boolean;
    isFetchingNextPage: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
    refetch: () => void;
}

async function fetchActivities(groupId: string, cursor?: string, type?: ActivityType | null, limit = 20): Promise<CursorPaginatedActivities> {
    const params: Record<string, string | number> = { limit };
    if (cursor) params['cursor'] = cursor;
    if (type) params['type'] = type;

    const { data } = await axios.get<CursorPaginatedActivities>(
        `/student/groups/${groupId}/activities`,
        { params }
    );
    return data;
}

export function useActivityFeed({ groupId, type, limit = 20 }: UseActivityFeedParams): UseActivityFeedResult {
    const {
        data,
        isLoading,
        isError,
        error,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch,
    } = useInfiniteQuery({
        queryKey: ['group-activities', groupId, { type: type || '', limit }],
        queryFn: ({ pageParam }) => fetchActivities(groupId, pageParam as string, type, limit),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor : undefined,
        staleTime: 1000 * 60 * 1,
    });

    const activities = data?.pages.flatMap((page) => page.data) ?? [];

    return {
        activities,
        isLoading,
        isError,
        error: error as Error | null,
        isFetching,
        isFetchingNextPage,
        hasNextPage: hasNextPage ?? false,
        fetchNextPage,
        refetch,
    };
}
