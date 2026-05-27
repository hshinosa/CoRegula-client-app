import { Head, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, FormEvent, useMemo, useEffect } from 'react';
import { Lightbulb, Plus, X } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { useStudentNav } from '@/components/navigation/student-nav';
import { Course } from '@/types';
import student from '@/routes/student';
import { room as chatRoom } from '@/routes/student/courses/chat';
import { LiquidGlassCard, PrimaryButton, SecondaryButton } from '@/components/Welcome/utils/helpers';
import { Skeleton } from '@/components/ui/skeletons';

import { useSpaceFilters } from '@/hooks/useSpaceFilters';
import { SearchBar } from '@/components/chat-spaces/SearchBar';
import { FilterChips } from '@/components/chat-spaces/FilterChips';
import { SortDropdown } from '@/components/chat-spaces/SortDropdown';
import { SpaceCard } from '@/components/chat-spaces/SpaceCard';
import { EmptyState } from '@/components/chat-spaces/EmptyState';
import { Pagination } from '@/components/chat-spaces/Pagination';

import type { SpaceType, SpaceStatus } from '@/hooks/useSpaceFilters';

interface ChatSpaceGoal {
    id: string;
    content: string;
    isValidated: boolean;
    createdBy: { id: string; name: string };
    createdAt: string;
}

interface ChatSpace {
    id: string;
    name: string;
    description?: string;
    isDefault: boolean;
    isClosed?: boolean;
    closedAt?: string;
    myGoal?: ChatSpaceGoal | null;
    createdAt?: string;
    lastMessage?: string | null;
    lastMessageAt?: string | null;
    lastMessageSender?: string | null;
    type?: SpaceType;
    status?: SpaceStatus;
}

const isClosedChatSpace = (space: ChatSpace) => {
    return Boolean(space.isClosed || space.closedAt || (!space.isDefault && space.closedAt));
};

const getChatSpaceUrl = (courseId: string, chatSpace: ChatSpace): string => {
    const closed = isClosedChatSpace(chatSpace);
    if (closed) {
        return chatRoom.url({ course: courseId, chatSpace: chatSpace.id });
    }
    if (chatSpace.myGoal) {
        return chatRoom.url({ course: courseId, chatSpace: chatSpace.id });
    }
    return student.goals.create.url({ course: courseId, chatSpace: chatSpace.id });
};

interface GroupMember {
    id: string;
    name: string;
    email: string;
}

interface Group {
    id: string;
    name: string;
    joinCode: string;
    members?: GroupMember[];
    chatSpaces?: ChatSpace[];
}

interface ChatSpaceMeta {
    data?: ChatSpace[];
    pagination?: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
}

interface Props {
    course: Course;
    group: Group;
    chatSpaceMeta?: ChatSpaceMeta | null;
}

const headingStyle = {
    color: 'rgb(var(--color-brand-dark))',
} as const;

const bodyTextClass = 'text-sm text-brand-muted-dark';

export default function ChatSpacesIndex({ course, group, chatSpaceMeta }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const navItems = useStudentNav('chat-spaces', { courseId: course.id });
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    useEffect(() => {
        const timer = setTimeout(() => setIsInitialLoading(false), 300);
        return () => clearTimeout(timer);
    }, []);

    const {
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
    } = useSpaceFilters();

    const allChatSpaces: ChatSpace[] = group.chatSpaces || [];
    const hasServerData = !!chatSpaceMeta?.data;

    const {
        filteredSpaces,
        typeCounts,
        statusCounts,
    } = useMemo(() => {
        if (hasServerData) {
            const serverSpaces = chatSpaceMeta!.data!;
            const tCounts: Record<SpaceType, number> = { Akademik: 0, Proyek: 0, Umum: 0 };
            const sCounts: Record<SpaceStatus, number> = { Aktif: 0, 'Tidak aktif': 0 };
            allChatSpaces.forEach((s) => {
                if (s.type) tCounts[s.type] = (tCounts[s.type] || 0) + 1;
                const isActive = !isClosedChatSpace(s);
                sCounts[isActive ? 'Aktif' : 'Tidak aktif'] += 1;
            });
            return { filteredSpaces: serverSpaces, typeCounts: tCounts, statusCounts: sCounts };
        }

        let spaces = [...allChatSpaces];

        if (filters.q) {
            const q = filters.q.toLowerCase();
            spaces = spaces.filter(
                (s) =>
                    s.name.toLowerCase().includes(q) ||
                    (s.description && s.description.toLowerCase().includes(q))
            );
        }

        if (filters.types.length > 0) {
            spaces = spaces.filter((s) => s.type && filters.types.includes(s.type));
        }

        if (filters.statuses.length > 0) {
            spaces = spaces.filter((s) => {
                const isActive = !isClosedChatSpace(s);
                const spaceStatus: SpaceStatus = isActive ? 'Aktif' : 'Tidak aktif';
                return filters.statuses.includes(spaceStatus);
            });
        }

        const sortFns: Record<string, (a: ChatSpace, b: ChatSpace) => number> = {
            'terbaru': (a, b) => {
                const dateA = a.lastMessageAt || a.createdAt || '';
                const dateB = b.lastMessageAt || b.createdAt || '';
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            },
            'paling-aktif': (_a, _b) => 0,
            'alfabet': (a, b) => a.name.localeCompare(b.name, 'id'),
        };

        spaces.sort(sortFns[filters.sort] || sortFns['terbaru']);

        const tCounts: Record<SpaceType, number> = { Akademik: 0, Proyek: 0, Umum: 0 };
        const sCounts: Record<SpaceStatus, number> = { Aktif: 0, 'Tidak aktif': 0 };
        allChatSpaces.forEach((s) => {
            if (s.type) tCounts[s.type] = (tCounts[s.type] || 0) + 1;
            const isActive = !isClosedChatSpace(s);
            sCounts[isActive ? 'Aktif' : 'Tidak aktif'] += 1;
        });

        return { filteredSpaces: spaces, typeCounts: tCounts, statusCounts: sCounts };
    }, [allChatSpaces, filters.q, filters.types, filters.statuses, filters.sort, hasServerData, chatSpaceMeta]);

    const totalPages = chatSpaceMeta?.pagination?.last_page ?? Math.ceil(filteredSpaces.length / filters.perPage);
    const totalItems = chatSpaceMeta?.pagination?.total ?? filteredSpaces.length;
    const currentPage = chatSpaceMeta?.pagination?.current_page ?? filters.page;
    const paginatedSpaces = chatSpaceMeta?.data ?? filteredSpaces.slice(
        (filters.page - 1) * filters.perPage,
        filters.page * filters.perPage
    );

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(student.groups.chatSpaces.store.url({ group: group.id }), {
            onSuccess: () => {
                reset();
                setShowCreateModal(false);
            },
        });
    };

    const showEmptyState = allChatSpaces.length === 0 && !filters.q && !hasActiveFilters;
    const showFilterEmpty = filteredSpaces.length === 0 && hasActiveFilters && !filters.q;
    const showSearchEmpty = filteredSpaces.length === 0 && filters.q.length > 0;

    return (
        <AppLayout title={`Diskusi - ${group.name}`} navItems={navItems}>
            <Head title={`Diskusi - ${course.name}`} />

            {isInitialLoading ? (
                <div className="space-y-6">
                    <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.6)' }}>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="mt-2 h-4 w-64" />
                    </div>
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-20 rounded-full" />
                        <Skeleton className="h-8 w-20 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="rounded-3xl p-5" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.6)' }}>
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="mt-2 h-4 w-64" />
                                <div className="mt-3 flex gap-2">
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {!isInitialLoading && (
            <>
            <div className="space-y-6">
                <LiquidGlassCard intensity="light" className="p-6" lightMode={true}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold font-sans text-brand-dark">
                                Sesi Diskusi
                            </h1>
                            <p className="mt-1 text-sm text-brand-muted-dark">
                                {course.name} • Grup: {group.name}
                            </p>
                        </div>
                        <PrimaryButton onClick={() => setShowCreateModal(true)}>
                            <Plus className="h-4 w-4" />
                            Sesi Baru
                        </PrimaryButton>
                    </div>
                </LiquidGlassCard>

                {allChatSpaces.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="space-y-4"
                    >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <SearchBar
                                value={filters.q}
                                onChange={setQuery}
                                onClear={clearSearch}
                            />
                            <SortDropdown
                                value={filters.sort}
                                onChange={setSort}
                            />
                        </div>

                        <FilterChips
                            selectedTypes={filters.types}
                            selectedStatuses={filters.statuses}
                            onToggleType={toggleType}
                            onToggleStatus={toggleStatus}
                            onClearAll={clearFilters}
                            typeCounts={typeCounts}
                            statusCounts={statusCounts}
                        />

                        {activeFilterCount > 0 && (
                            <p className="text-xs text-brand-muted-dark">
                                {activeFilterCount} filter aktif • {filteredSpaces.length} ruang ditemukan
                            </p>
                        )}
                    </motion.div>
                )}

                {paginatedSpaces.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {paginatedSpaces.map((chatSpace, index) => (
                                <SpaceCard
                                    key={chatSpace.id}
                                    space={chatSpace}
                                    courseId={course.id}
                                    getChatSpaceUrl={getChatSpaceUrl}
                                    index={index}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {showEmptyState && (
                    <EmptyState
                        variant="no-spaces"
                        onCreateNew={() => setShowCreateModal(true)}
                    />
                )}

                {showFilterEmpty && (
                    <EmptyState
                        variant="no-filter-results"
                        onClearFilters={clearFilters}
                    />
                )}

                {showSearchEmpty && (
                    <EmptyState
                        variant="no-search-results"
                        onClearSearch={clearSearch}
                        searchQuery={filters.q}
                    />
                )}

                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        perPage={filters.perPage}
                        onPageChange={setPage}
                    />
                )}

                {!showEmptyState && !showFilterEmpty && !showSearchEmpty && allChatSpaces.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <LiquidGlassCard intensity="light" className="p-5" lightMode={true}>
                            <div className="flex items-start gap-4">
                                <div
                                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                                    style={{
                                        background: 'rgba(136,22,28,0.08)',
                                        border: '1px solid rgba(136,22,28,0.12)',
                                    }}
                                >
                                    <Lightbulb className="h-5 w-5" style={{ color: 'rgb(var(--color-brand-primary))' }} />
                                </div>
                                <div>
                                    <p className="text-base font-semibold font-sans text-brand-dark">
                                        Tips: Gunakan Sesi Terpisah
                                    </p>
                                    <p className="mt-2 leading-6 text-sm text-brand-muted-dark">
                                        Buat sesi diskusi terpisah untuk topik berbeda agar diskusi lebih terfokus.
                                        Setiap sesi memiliki tujuan pembelajaran sendiri.
                                    </p>
                                </div>
                            </div>
                        </LiquidGlassCard>
                    </motion.div>
                )}
            </div>
            </>
            )}

            <AnimatePresence>
                {showCreateModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <LiquidGlassCard intensity="heavy" className="w-full max-w-md p-6" lightMode={true}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold font-sans text-brand-dark">
                                            Buat Sesi Diskusi Baru
                                        </h3>
                                        <p className="mt-1 text-sm text-brand-muted-dark">
                                            Buat sesi diskusi baru untuk topik tertentu.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="rounded-lg p-2 text-brand-muted-dark transition-colors hover:bg-white/50 hover:text-brand-dark"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-brand-dark">
                                            Nama Sesi <span style={{ color: 'rgb(var(--color-brand-primary))' }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Contoh: Diskusi Bab 3"
                                            className="mt-1 block w-full rounded-xl border-0 bg-white/60 px-4 py-3 text-brand-dark shadow-sm ring-1 ring-inset ring-white/50 placeholder:text-[#9ca3af] focus:ring-2 focus:ring-inset focus:ring-brand-primary/30 sm:text-sm sm:leading-6"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-brand-dark">
                                            Deskripsi (Opsional)
                                        </label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Jelaskan topik yang akan dibahas..."
                                            rows={3}
                                            className="mt-1 block w-full rounded-xl border-0 bg-white/60 px-4 py-3 text-brand-dark shadow-sm ring-1 ring-inset ring-white/50 placeholder:text-[#9ca3af] focus:ring-2 focus:ring-inset focus:ring-brand-primary/30 sm:text-sm sm:leading-6"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <SecondaryButton
                                            onClick={() => setShowCreateModal(false)}
                                            className="flex-1"
                                        >
                                            Batal
                                        </SecondaryButton>
                                        <PrimaryButton
                                            disabled={processing || !data.name.trim()}
                                            className="flex-1"
                                        >
                                            {processing ? 'Membuat...' : 'Buat Sesi'}
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </LiquidGlassCard>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
