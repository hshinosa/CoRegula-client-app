import { useState, useCallback, useEffect } from 'react';
import { Search, Filter, Users } from 'lucide-react';
import { useGroupMembers } from '@/hooks/useGroupMembers';
import { MemberCard } from './MemberCard';
import type { GroupMemberRole } from '@/types';

const headingStyle = {
    color: '#4A4A4A',
} as const;

const bodyTextClass = 'text-sm text-brand-muted-dark';

const roleFilters: { value: GroupMemberRole | ''; label: string }[] = [
    { value: '', label: 'Semua' },
    { value: 'owner', label: 'Pemilik' },
    { value: 'admin', label: 'Admin' },
    { value: 'member', label: 'Anggota' },
];

interface MemberSearchProps {
    groupId: string;
    currentUserId?: string;
    isOwner?: boolean;
    onRoleChange?: (memberId: string, newRole: GroupMemberRole) => void;
    onRemove?: (memberId: string) => void;
}

export function MemberSearch({ groupId, currentUserId, isOwner, onRoleChange, onRemove }: MemberSearchProps) {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<GroupMemberRole | ''>('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const { members, meta, isLoading, isFetching } = useGroupMembers({
        groupId,
        q: debouncedQuery,
        role: roleFilter || null,
        page,
    });

    const handleSearch = useCallback((value: string) => {
        setQuery(value);
    }, []);

    const handleRoleFilter = useCallback((role: GroupMemberRole | '') => {
        setRoleFilter(role);
        setPage(1);
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                    <input
                        type="text"
                        placeholder="Cari anggota berdasarkan nama atau email..."
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-brand-primary focus:outline-none"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-600" />
                    <select
                        value={roleFilter}
                        onChange={(e) => handleRoleFilter(e.target.value as GroupMemberRole | '')}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-brand-primary focus:outline-none"
                    >
                        {roleFilters.map((filter) => (
                            <option key={filter.value} value={filter.value}>
                                {filter.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <span className="text-xs text-brand-muted-dark">
                    {meta.total} anggota ditemukan
                </span>
                {isFetching && !isLoading && (
                    <span className="text-xs text-brand-primary">Memperbarui...</span>
                )}
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-16 animate-pulse rounded-xl"
                            style={{ background: 'rgba(0,0,0,0.05)' }}
                        />
                    ))}
                </div>
            ) : members.length === 0 ? (
                <div
                    className="flex flex-col items-center justify-center rounded-xl py-12"
                    style={{ background: 'rgba(0,0,0,0.02)' }}
                >
                    <Users className="mb-3 h-12 w-12 text-gray-300" />
                    <h4 className="text-sm font-semibold" style={headingStyle}>
                        Tidak ada anggota ditemukan
                    </h4>
                    <p className={`mt-1 ${bodyTextClass}`}>
                        {debouncedQuery
                            ? `Tidak ada hasil untuk "${debouncedQuery}"`
                            : 'Belum ada anggota dalam grup ini'}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {members.map((member, index) => (
                        <MemberCard
                            key={member.id}
                            member={member}
                            index={index}
                            currentUserId={currentUserId}
                            isOwner={isOwner}
                            onRoleChange={onRoleChange}
                            onRemove={onRemove}
                        />
                    ))}
                </div>
            )}

            {meta.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                        style={{
                            background: 'rgba(136,22,28,0.08)',
                            color: '#88161c',
                        }}
                    >
                        Sebelumnya
                    </button>
                    <span className="text-xs text-brand-muted-dark">
                        Halaman {page} dari {meta.last_page}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                        disabled={page === meta.last_page}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                        style={{
                            background: 'rgba(136,22,28,0.08)',
                            color: '#88161c',
                        }}
                    >
                        Selanjutnya
                    </button>
                </div>
            )}
        </div>
    );
}
