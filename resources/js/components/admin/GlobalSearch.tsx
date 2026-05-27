import { router } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
    BookOpen,
    FileText,
    Loader2,
    Search,
    Settings,
    User,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';
import type { Course, User as UserType } from '@/types';
import axios from 'axios';

interface SearchResultItem {
    id: string;
    title: string;
    subtitle: string;
    href: string;
    type: 'user' | 'course' | 'setting';
}

interface SearchResultGroup {
    label: string;
    type: 'user' | 'course' | 'setting';
    items: SearchResultItem[];
}

const SETTINGS_ITEMS: SearchResultItem[] = [
    {
        id: 'ai-settings',
        title: 'AI Settings',
        subtitle: 'Kelola pengaturan AI',
        href: '/admin/ai-settings',
        type: 'setting',
    },
    {
        id: 'ai-comparison',
        title: 'AI Comparison',
        subtitle: 'Bandingkan model AI',
        href: '/admin/ai-comparison',
        type: 'setting',
    },
    {
        id: 'user-management',
        title: 'User Management',
        subtitle: 'Kelola pengguna sistem',
        href: '/admin/users',
        type: 'setting',
    },
    {
        id: 'master-data',
        title: 'Master Data',
        subtitle: 'Kelola data master kursus',
        href: '/admin/master-data',
        type: 'setting',
    },
    {
        id: 'course-templates',
        title: 'Course Templates',
        subtitle: 'Kelola template kursus',
        href: '/admin/course-templates',
        type: 'setting',
    },
    {
        id: 'audit-log',
        title: 'Audit Log',
        subtitle: 'Lihat log aktivitas',
        href: '/admin/audit-log',
        type: 'setting',
    },
    {
        id: 'dashboard',
        title: 'Dashboard',
        subtitle: 'Ringkasan admin',
        href: '/admin/dashboard',
        type: 'setting',
    },
];

const ROLE_LABELS: Record<string, string> = {
    admin: 'Admin',
    lecturer: 'Lecturer',
    student: 'Student',
};

interface UsersApiResponse {
    data: {
        users: UserType[];
    };
}

interface CoursesApiResponse {
    data: {
        courses: Course[];
    };
}

function useGlobalSearch(query: string) {
    const debouncedQuery = useDebounce(query, 300);

    const usersQuery = useQuery<UsersApiResponse>({
        queryKey: ['global-search', 'users', debouncedQuery],
        queryFn: async () => {
            const response = await axios.get<UsersApiResponse>('/admin/users', {
                headers: { Accept: 'application/json' },
                params: {
                    search: debouncedQuery || undefined,
                    limit: 5,
                    page: 1,
                },
            });
            return response.data;
        },
        enabled: debouncedQuery.trim().length >= 2,
        staleTime: 1000 * 60 * 2,
    });

    const coursesQuery = useQuery<CoursesApiResponse>({
        queryKey: ['global-search', 'courses', debouncedQuery],
        queryFn: async () => {
            const response = await axios.get<CoursesApiResponse>('/admin/master-data', {
                headers: { Accept: 'application/json' },
                params: {
                    search: debouncedQuery || undefined,
                    limit: 5,
                    page: 1,
                    tab: 'active',
                },
            });
            return response.data;
        },
        enabled: debouncedQuery.trim().length >= 2,
        staleTime: 1000 * 60 * 2,
    });

    const isLoading = usersQuery.isLoading || coursesQuery.isLoading;
    const isError = usersQuery.isError || coursesQuery.isError;

    const results = useMemo<SearchResultGroup[]>(() => {
        if (!debouncedQuery.trim() || debouncedQuery.trim().length < 2) return [];

        const groups: SearchResultGroup[] = [];

        const users = usersQuery.data?.data?.users ?? [];
        if (users.length > 0) {
            groups.push({
                label: 'Users',
                type: 'user',
                items: users.map((u) => ({
                    id: u.id,
                    title: u.name,
                    subtitle: `${u.email} · ${ROLE_LABELS[u.role] ?? u.role}`,
                    href: `/admin/users`,
                    type: 'user' as const,
                })),
            });
        }

        const courses = coursesQuery.data?.data?.courses ?? [];
        if (courses.length > 0) {
            groups.push({
                label: 'Courses',
                type: 'course',
                items: courses.map((c) => ({
                    id: c.id,
                    title: c.name,
                    subtitle: c.code,
                    href: `/admin/master-data`,
                    type: 'course' as const,
                })),
            });
        }

        const q = debouncedQuery.toLowerCase();
        const filteredSettings = SETTINGS_ITEMS.filter(
            (s) =>
                s.title.toLowerCase().includes(q) ||
                s.subtitle.toLowerCase().includes(q),
        );
        if (filteredSettings.length > 0) {
            groups.push({
                label: 'Pages & Settings',
                type: 'setting',
                items: filteredSettings,
            });
        }

        return groups;
    }, [debouncedQuery, usersQuery.data, coursesQuery.data]);

    return { results, isLoading, isError, debouncedQuery };
}

function ResultIcon({ type }: { type: 'user' | 'course' | 'setting' }) {
    const baseClass = 'h-4 w-4';
    switch (type) {
        case 'user':
            return <User className={baseClass} />;
        case 'course':
            return <BookOpen className={baseClass} />;
        case 'setting':
            return <Settings className={baseClass} />;
    }
}

function GroupIcon({ type }: { type: 'user' | 'course' | 'setting' }) {
    const baseClass = 'h-3.5 w-3.5';
    switch (type) {
        case 'user':
            return <User className={baseClass} />;
        case 'course':
            return <BookOpen className={baseClass} />;
        case 'setting':
            return <FileText className={baseClass} />;
    }
}

interface GlobalSearchProps {
    open: boolean;
    onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const { results, isLoading, debouncedQuery } = useGlobalSearch(query);

    const allItems = useMemo(
        () => results.flatMap((g) => g.items),
        [results],
    );

    useEffect(() => {
        if (open) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [results]);

    useEffect(() => {
        const item = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
        item?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    const handleNavigate = useCallback(
        (href: string) => {
            onClose();
            router.visit(href);
        },
        [onClose],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex((i) => (i + 1) % Math.max(allItems.length, 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex((i) => (i - 1 + allItems.length) % Math.max(allItems.length, 1));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (allItems[selectedIndex]) {
                        handleNavigate(allItems[selectedIndex].href);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        },
        [allItems, selectedIndex, handleNavigate, onClose],
    );

    let flatIndex = -1;

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[10vh] px-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                            className="w-full max-w-xl overflow-hidden rounded-2xl"
                            style={{
                                background: 'rgba(255,255,255,0.98)',
                                backdropFilter: 'blur(20px) saturate(180%)',
                                border: '1px solid rgba(136,22,28,0.1)',
                                boxShadow:
                                    '0 25px 60px rgba(0,0,0,0.15), 0 10px 24px rgba(0,0,0,0.08)',
                            }}
                            onKeyDown={handleKeyDown}
                        >
                            <div
                                className="flex items-center gap-3 px-4 py-3"
                                style={{ borderBottom: '1px solid rgba(136,22,28,0.08)' }}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-brand-primary" />
                                ) : (
                                    <Search className="h-5 w-5 shrink-0 text-brand-muted-dark" />
                                )}
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Cari users, kursus, atau halaman..."
                                    className="flex-1 bg-transparent text-sm text-brand-dark placeholder-[#9CA3AF] outline-none"
                                />
                                <kbd
                                    className="hidden sm:inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-brand-muted-dark"
                                    style={{
                                        background: 'rgba(136,22,28,0.06)',
                                        border: '1px solid rgba(136,22,28,0.1)',
                                    }}
                                >
                                    ESC
                                </kbd>
                                <button
                                    onClick={onClose}
                                    className="rounded-lg p-1 text-brand-muted-dark hover:text-brand-dark hover:bg-black/5 transition-colors lg:hidden"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div
                                ref={listRef}
                                className="max-h-80 overflow-y-auto overscroll-contain"
                            >
                                {debouncedQuery.trim().length < 2 && !isLoading && (
                                    <div className="px-4 py-8 text-center">
                                        <Search className="mx-auto mb-3 h-8 w-8 text-[#D1D5DB]" />
                                        <p className="text-sm font-medium text-brand-dark">
                                            Ketik untuk mulai mencari
                                        </p>
                                        <p className="mt-1 text-xs text-brand-muted-dark">
                                            Cari users, kursus, atau halaman admin
                                        </p>
                                    </div>
                                )}

                                {isLoading && debouncedQuery.trim().length >= 2 && (
                                    <div className="px-4 py-6 text-center">
                                        <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-brand-primary" />
                                        <p className="text-xs text-brand-muted-dark">Mencari...</p>
                                    </div>
                                )}

                                {!isLoading &&
                                    debouncedQuery.trim().length >= 2 &&
                                    results.length === 0 && (
                                        <div className="px-4 py-8 text-center">
                                            <Search className="mx-auto mb-3 h-8 w-8 text-[#D1D5DB]" />
                                            <p className="text-sm font-medium text-brand-dark">
                                                Tidak ada hasil ditemukan
                                            </p>
                                            <p className="mt-1 text-xs text-brand-muted-dark">
                                                Coba kata kunci lain
                                            </p>
                                        </div>
                                    )}

                                {results.map((group) => (
                                    <div key={group.type}>
                                        <div
                                            className="flex items-center gap-2 px-4 py-2"
                                            style={{
                                                background: 'rgba(136,22,28,0.03)',
                                                borderBottom: '1px solid rgba(136,22,28,0.05)',
                                            }}
                                        >
                                            <GroupIcon type={group.type} />
                                            <span
                                                className="text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: '#6B7280' }}
                                            >
                                                {group.label}
                                            </span>
                                            <span
                                                className="ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                                                style={{
                                                    background: 'rgba(136,22,28,0.08)',
                                                    color: '#88161c',
                                                }}
                                            >
                                                {group.items.length}
                                            </span>
                                        </div>

                                        {group.items.map((item) => {
                                            flatIndex++;
                                            const idx = flatIndex;
                                            const isSelected = idx === selectedIndex;

                                            return (
                                                <button
                                                    key={item.id}
                                                    data-index={idx}
                                                    onClick={() => handleNavigate(item.href)}
                                                    onMouseEnter={() => setSelectedIndex(idx)}
                                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors"
                                                    style={{
                                                        background: isSelected
                                                            ? 'rgba(136,22,28,0.06)'
                                                            : 'transparent',
                                                    }}
                                                >
                                                    <div
                                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                                        style={{
                                                            background: isSelected
                                                                ? 'rgba(136,22,28,0.1)'
                                                                : 'rgba(136,22,28,0.04)',
                                                            color: '#88161c',
                                                        }}
                                                    >
                                                        <ResultIcon type={item.type} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p
                                                            className="truncate text-sm font-medium"
                                                            style={{ color: '#4A4A4A' }}
                                                        >
                                                            {item.title}
                                                        </p>
                                                        <p
                                                            className="truncate text-xs"
                                                            style={{ color: '#6B7280' }}
                                                        >
                                                            {item.subtitle}
                                                        </p>
                                                    </div>
                                                    <svg
                                                        className="h-4 w-4 shrink-0 opacity-0 transition-opacity"
                                                        style={{
                                                            opacity: isSelected ? 0.4 : 0,
                                                            color: '#88161c',
                                                        }}
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 5l7 7-7 7"
                                                        />
                                                    </svg>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>

                            <div
                                className="flex items-center gap-4 px-4 py-2"
                                style={{
                                    background: 'rgba(136,22,28,0.02)',
                                    borderTop: '1px solid rgba(136,22,28,0.06)',
                                }}
                            >
                                <div className="flex items-center gap-1.5">
                                    <kbd
                                        className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium"
                                        style={{
                                            background: 'rgba(136,22,28,0.06)',
                                            color: '#6B7280',
                                            border: '1px solid rgba(136,22,28,0.08)',
                                        }}
                                    >
                                        ↑↓
                                    </kbd>
                                    <span className="text-[10px] text-brand-muted-dark">navigasi</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <kbd
                                        className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium"
                                        style={{
                                            background: 'rgba(136,22,28,0.06)',
                                            color: '#6B7280',
                                            border: '1px solid rgba(136,22,28,0.08)',
                                        }}
                                    >
                                        ↵
                                    </kbd>
                                    <span className="text-[10px] text-brand-muted-dark">pilih</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <kbd
                                        className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium"
                                        style={{
                                            background: 'rgba(136,22,28,0.06)',
                                            color: '#6B7280',
                                            border: '1px solid rgba(136,22,28,0.08)',
                                        }}
                                    >
                                        esc
                                    </kbd>
                                    <span className="text-[10px] text-brand-muted-dark">tutup</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
