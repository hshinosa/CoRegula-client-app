import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { GroupMember, GroupMemberRole, PaginatedMembers } from '@/types';

interface UseGroupMembersParams {
    groupId: string;
    q?: string;
    role?: GroupMemberRole | null;
    page?: number;
    perPage?: number;
}

interface UseGroupMembersResult {
    members: GroupMember[];
    meta: PaginatedMembers['meta'];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    isFetching: boolean;
    refetch: () => void;
}

const EMPTY_META = { total: 0, per_page: 20, current_page: 1, last_page: 1 };

async function fetchGroupMembers(params: UseGroupMembersParams): Promise<PaginatedMembers> {
    const queryParams: Record<string, string | number> = {};
    if (params.q) queryParams['q'] = params.q;
    if (params.role) queryParams['role'] = params.role;
    if (params.page && params.page > 1) queryParams['page'] = params.page;
    if (params.perPage) queryParams['per_page'] = params.perPage;

    const { data } = await axios.get<PaginatedMembers>(
        `/student/groups/${params.groupId}/members/search`,
        { params: queryParams }
    );
    return data;
}

export function useGroupMembers({ groupId, q, role, page = 1, perPage = 20 }: UseGroupMembersParams): UseGroupMembersResult {
    const queryKey = ['group-members', groupId, { q: q || '', role: role || '', page, perPage }];

    const {
        data,
        isLoading,
        isError,
        error,
        isFetching,
        refetch,
    } = useQuery({
        queryKey,
        queryFn: () => fetchGroupMembers({ groupId, q, role, page, perPage }),
        staleTime: 1000 * 60 * 2,
        placeholderData: (prev) => prev,
    });

    return {
        members: data?.data ?? [],
        meta: data?.meta ?? EMPTY_META,
        isLoading,
        isError,
        error: error as Error | null,
        isFetching,
        refetch,
    };
}
