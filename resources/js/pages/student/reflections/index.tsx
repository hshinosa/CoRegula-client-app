import { Head, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormEvent, useState, useMemo, useEffect, useCallback } from 'react';
import { BookOpen, ChevronDown, Lightbulb, MessageSquare, Pencil, Plus, X } from 'lucide-react';

import { LiquidGlassCard, PrimaryButton, SecondaryButton } from '@/components/Welcome/utils/helpers';
import { InputError } from '@/components/ui/input-error';
import { InputLabel } from '@/components/ui/input-label';
import { useStudentNav } from '@/components/navigation/student-nav';
import AppLayout from '@/layouts/app-layout';
import student from '@/routes/student';
import { Course, Reflection, ReflectionTemplate } from '@/types';
import { Skeleton } from '@/components/ui/skeletons';
import { EmptyState } from '@/components/ui/EmptyState';

import { ReflectionSearchBar } from './components/ReflectionSearchBar';
import { FilterChips } from './components/FilterChips';
import { TemplatePanel } from './components/TemplatePanel';

import { TagInput } from './components/TagInput';
import { TagBadge } from './components/TagBadge';

interface Props {
    reflections: Reflection[];
    courses: Course[];
}

function ReflectionBadge({ label, tone }: { label: string; tone: 'session' | 'weekly' }) {
    const styles = tone === 'session'
        ? {
            background: 'rgba(136,22,28,0.08)',
            color: 'var(--color-brand-primary)',
            border: '1px solid rgba(136,22,28,0.15)',
        }
        : {
            background: 'rgba(74,74,74,0.08)',
            color: 'var(--color-brand-dark)',
            border: '1px solid rgba(74,74,74,0.15)',
        };

    return (
        <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={styles}
        >
            {label}
        </span>
    );
}

function SectionHeader({
    icon,
    title,
    count,
    tone,
}: {
    icon: React.ReactNode;
    title: string;
    count: number;
    tone: 'session' | 'weekly';
}) {
    const iconStyles = tone === 'session'
        ? {
            background: 'rgba(136,22,28,0.08)',
            border: '1px solid rgba(136,22,28,0.12)',
            color: 'var(--color-brand-primary)',
        }
        : {
            background: 'rgba(74,74,74,0.08)',
            border: '1px solid rgba(74,74,74,0.12)',
            color: 'var(--color-brand-dark)',
        };

    const badgeStyles = tone === 'session'
        ? {
            background: 'rgba(136,22,28,0.08)',
            color: 'var(--color-brand-primary)',
            border: '1px solid rgba(136,22,28,0.15)',
        }
        : {
            background: 'rgba(74,74,74,0.08)',
            color: 'var(--color-brand-dark)',
            border: '1px solid rgba(74,74,74,0.15)',
        };

    return (
        <div className="mb-3 flex items-center gap-3">
            <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={iconStyles}
            >
                {icon}
            </div>
            <h3 className="text-base font-semibold font-sans text-brand-dark">
                {title}
            </h3>
            <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                style={badgeStyles}
            >
                {count}
            </span>
        </div>
    );
}

function highlightText(text: string, query: string): React.ReactNode {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
        regex.test(part) ? (
            <mark key={i} className="rounded bg-yellow-200/60 px-0.5">{part}</mark>
        ) : part
    );
}

export default function StudentReflectionsIndex({ reflections, courses }: Props) {
    const safeReflections = reflections ?? [];
    const safeCourses = courses ?? [];
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [expandedReflection, setExpandedReflection] = useState<string | null>(null);

    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [reflectionTags, setReflectionTags] = useState<Record<string, string[]>>({});
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [currentTags, setCurrentTags] = useState<string[]>([]);

    const navItems = useStudentNav('reflections');

    useEffect(() => {
        const timer = setTimeout(() => setIsInitialLoading(false), 300);
        return () => clearTimeout(timer);
    }, []);

    const { data, setData, post, processing, errors, reset } = useForm({
        course_id: '',
        content: '',
        type: 'weekly' as const,
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        const tags = params.get('tags');
        const from = params.get('from');
        const to = params.get('to');
        if (q) setSearchQuery(q);
        if (tags) setSelectedTags(tags.split(','));
        if (from) setDateFrom(from);
        if (to) setDateTo(to);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
        if (dateFrom) params.set('from', dateFrom);
        if (dateTo) params.set('to', dateTo);
        const qs = params.toString();
        const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
        window.history.replaceState(null, '', url);
    }, [searchQuery, selectedTags, dateFrom, dateTo]);

    useEffect(() => {
        fetch('/student/reflections/tags', { headers: { 'Accept': 'application/json' } })
            .then((r) => r.ok ? r.json() : { data: [] })
            .then((d) => setAvailableTags((d.data ?? []).map((t: { tag: string }) => t.tag)))
            .catch(() => {});
    }, []);

    const fetchTagsForReflection = useCallback(async (reflectionId: string) => {
        try {
            const response = await fetch(`/student/reflections/tags?reflection_id=${reflectionId}`, {
                headers: { 'Accept': 'application/json' },
            });
            if (response.ok) {
                const d = await response.json();
                setReflectionTags((prev) => ({
                    ...prev,
                    [reflectionId]: (d.data ?? []).map((t: { tag: string }) => t.tag),
                }));
            }
        } catch (_) {
        }
    }, []);

    const saveTagsForReflection = useCallback(async (reflectionId: string, tags: string[]) => {
        try {
            await fetch('/student/reflections/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ reflection_id: reflectionId, tags }),
            });
            setReflectionTags((prev) => ({ ...prev, [reflectionId]: tags }));
            const allTags = new Set(availableTags);
            tags.forEach((t) => allTags.add(t));
            setAvailableTags(Array.from(allTags));
        } catch (_) {
        }
    }, [availableTags]);

    const filteredReflections = useMemo(() => {
        let result = safeReflections;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter((r) =>
                r.content.toLowerCase().includes(q) ||
                (r.chatSpace?.name ?? '').toLowerCase().includes(q) ||
                (r.course?.name ?? '').toLowerCase().includes(q)
            );
        }

        if (selectedTags.length > 0) {
            result = result.filter((r) => {
                const tags = reflectionTags[r.id] ?? [];
                return selectedTags.some((t) => tags.includes(t));
            });
        }

        if (dateFrom) {
            result = result.filter((r) => {
                const d = r.createdAt ?? r.created_at ?? '';
                return d >= dateFrom;
            });
        }
        if (dateTo) {
            result = result.filter((r) => {
                const d = r.createdAt ?? r.created_at ?? '';
                return d <= dateTo + 'T23:59:59';
            });
        }

        return result;
    }, [safeReflections, searchQuery, selectedTags, dateFrom, dateTo, reflectionTags]);

    const sessionReflections = filteredReflections.filter((r) => r.type === 'session');
    const weeklyReflections = filteredReflections.filter((r) => r.type === 'weekly');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(student.reflections.store.url(), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
                setCurrentTags([]);
            },
        });
    };

    const handleTemplateSelect = (template: ReflectionTemplate) => {
        setData('content', template.content_template);
        setShowCreateModal(true);
    };

    const formatDate = (date?: string) => {
        if (!date) return '';
        const d = new Date(date);
        if (Number.isNaN(d.getTime())) return date;

        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const createdAtFor = (reflection: Reflection) => reflection.createdAt ?? reflection.created_at ?? '';

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const clearFilters = () => {
        setSelectedTags([]);
        setDateFrom('');
        setDateTo('');
        setSearchQuery('');
    };

    const hasActiveFilters = searchQuery || selectedTags.length > 0 || dateFrom || dateTo;

    return (
        <AppLayout title="Refleksi Saya" navItems={navItems}>
            <Head title="Refleksi Saya" />

            {isInitialLoading ? (
                <div className="space-y-6">
                    <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.6)' }}>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="mt-2 h-4 w-72" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-32 rounded-lg" />
                        <Skeleton className="h-10 w-28 rounded-lg" />
                        <Skeleton className="h-10 w-28 rounded-lg" />
                    </div>
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-20 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="rounded-3xl p-5" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.6)' }}>
                                <Skeleton className="h-5 w-32 rounded-full" />
                                <Skeleton className="mt-3 h-4 w-full" />
                                <Skeleton className="mt-2 h-4 w-3/4" />
                                <div className="mt-3 flex gap-2">
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
            <div className="space-y-6">
                <LiquidGlassCard intensity="light" className="p-6" lightMode={true}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold font-sans text-brand-dark">
                                Refleksi Saya
                            </h2>
                            <p className="mt-1 text-sm text-brand-muted-dark">
                                Lacak perjalanan pembelajaran Anda melalui refleksi sesi dan mingguan.
                            </p>
                        </div>

                    </div>
                </LiquidGlassCard>





                <LiquidGlassCard intensity="light" className="p-4" lightMode={true}>
                    <div className="space-y-3">
                        <ReflectionSearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            onClear={() => setSearchQuery('')}
                        />
                        <FilterChips
                            selectedTags={selectedTags}
                            dateFrom={dateFrom}
                            dateTo={dateTo}
                            onToggleTag={toggleTag}
                            onDateFromChange={setDateFrom}
                            onDateToChange={setDateTo}
                            onClearAll={clearFilters}
                            availableTags={availableTags}
                        />
                    </div>
                </LiquidGlassCard>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <LiquidGlassCard intensity="light" className="p-5" lightMode={true}>
                                <div className="flex items-start gap-4">
                                    <div
                                        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                                        style={{
                                            background: 'rgba(136,22,28,0.08)',
                                            border: '1px solid rgba(136,22,28,0.12)',
                                        }}
                                    >
                                        <Lightbulb className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
                                    </div>
                                    <div>
                                        <p className="text-base font-semibold font-sans text-brand-dark">
                                            Tentang Refleksi
                                        </p>
                                        <p className="mt-2 leading-6 text-sm text-brand-muted-dark">
                                            Refleksi reguler membantu Anda mengkonsolidasikan pembelajaran dan melacak kemajuan. Di sini Anda
                                            akan melihat <strong>refleksi sesi</strong> yang dibuat saat sesi diskusi ditutup dan
                                            <strong> refleksi mingguan</strong> yang Anda buat sendiri.
                                        </p>
                                    </div>
                                </div>
                            </LiquidGlassCard>
                        </motion.div>

                        {hasActiveFilters && filteredReflections.length === 0 ? (
                            <EmptyState
                                icon={Pencil}
                                title="Tidak ada refleksi yang cocok"
                                description="Coba ubah kata kunci pencarian atau filter yang digunakan"
                                action={
                                    <SecondaryButton onClick={clearFilters}>
                                        Hapus Filter
                                    </SecondaryButton>
                                }
                            />
                        ) : safeReflections.length === 0 ? (
                            <EmptyState
                                icon={Pencil}
                                title="Belum ada refleksi"
                                description="Mulai perjalanan refleksi Anda dengan menulis refleksi pertama"
                                action={
                                    <PrimaryButton onClick={() => setShowCreateModal(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tulis Refleksi
                                    </PrimaryButton>
                                }
                            />
                        ) : (
                            <div className="space-y-6">
                                {sessionReflections.length > 0 && (
                                    <div>
                                        <SectionHeader
                                            icon={<MessageSquare className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />}
                                            title="Refleksi Sesi"
                                            count={sessionReflections.length}
                                            tone="session"
                                        />
                                        <div className="space-y-4">
                                            {sessionReflections.map((reflection, index) => (
                                                <motion.div
                                                    key={reflection.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05, duration: 0.4 }}
                                                >
                                                    <LiquidGlassCard intensity="light" className="overflow-hidden" lightMode={true}>
                                                        <div
                                                            className="flex cursor-pointer items-center justify-between gap-4 p-5"
                                                            onClick={() => setExpandedReflection(expandedReflection === reflection.id ? null : reflection.id)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <ReflectionBadge label="Sesi" tone="session" />
                                                                <div>
                                                                    <p className="font-semibold font-sans text-brand-dark">
                                                                        {searchQuery ? highlightText(reflection.chatSpace?.name || 'Sesi Diskusi', searchQuery) : (reflection.chatSpace?.name || 'Sesi Diskusi')}
                                                                    </p>
                                                                    <p className="mt-1 text-sm text-brand-muted-dark">
                                                                        {formatDate(createdAtFor(reflection))}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {(reflectionTags[reflection.id] ?? []).length > 0 && (
                                                                    <div className="flex gap-1">
                                                                        {(reflectionTags[reflection.id] ?? []).slice(0, 3).map((tag) => (
                                                                            <TagBadge key={tag} tag={tag} size="sm" />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                <motion.div animate={{ rotate: expandedReflection === reflection.id ? 180 : 0 }}>
                                                                    <ChevronDown className="h-5 w-5 text-brand-muted-dark" />
                                                                </motion.div>
                                                            </div>
                                                        </div>
                                                        <AnimatePresence>
                                                            {expandedReflection === reflection.id && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.3 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="border-t border-white/30 px-5 pb-5 pt-4">
                                                                        <p className="whitespace-pre-wrap text-sm leading-6 text-brand-dark">
                                                                            {searchQuery ? highlightText(reflection.content, searchQuery) : reflection.content}
                                                                        </p>
                                                                        {reflection.ai_feedback && (
                                                                            <div
                                                                                className="mt-4 rounded-2xl p-4"
                                                                                style={{
                                                                                    background: 'rgba(136,22,28,0.06)',
                                                                                    border: '1px solid rgba(136,22,28,0.12)',
                                                                                }}
                                                                            >
                                                                                <div className="mb-2 flex items-center gap-2">
                                                                                    <Lightbulb className="h-4 w-4" style={{ color: 'var(--color-brand-primary)' }} />
                                                                                    <span className="text-sm font-semibold font-sans text-brand-dark">
                                                                                        Umpan Balik AI
                                                                                    </span>
                                                                                </div>
                                                                                <p className="text-sm leading-6 text-brand-muted-dark">
                                                                                    {reflection.ai_feedback}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                        <div className="mt-4">
                                                                            <p className="mb-1.5 text-xs font-medium text-brand-dark">Tag</p>
                                                                            <TagInput
                                                                                tags={reflectionTags[reflection.id] ?? []}
                                                                                onChange={(tags) => saveTagsForReflection(reflection.id, tags)}
                                                                                reflectionId={reflection.id}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </LiquidGlassCard>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {weeklyReflections.length > 0 && (
                                    <div>
                                        <SectionHeader
                                            icon={<BookOpen className="h-5 w-5" style={{ color: 'var(--color-brand-dark)' }} />}
                                            title="Refleksi Mingguan"
                                            count={weeklyReflections.length}
                                            tone="weekly"
                                        />
                                        <div className="space-y-4">
                                            {weeklyReflections.map((reflection, index) => (
                                                <motion.div
                                                    key={reflection.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05, duration: 0.4 }}
                                                >
                                                    <LiquidGlassCard intensity="light" className="overflow-hidden" lightMode={true}>
                                                        <div
                                                            className="flex cursor-pointer items-center justify-between gap-4 p-5"
                                                            onClick={() => setExpandedReflection(expandedReflection === reflection.id ? null : reflection.id)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <ReflectionBadge label="Mingguan" tone="weekly" />
                                                                <div>
                                                                    <p className="font-semibold font-sans text-brand-dark">
                                                                        {searchQuery ? highlightText(reflection.course?.name || 'Kelas Tidak Diketahui', searchQuery) : (reflection.course?.name || 'Kelas Tidak Diketahui')}
                                                                    </p>
                                                                    <p className="mt-1 text-sm text-brand-muted-dark">
                                                                        {formatDate(createdAtFor(reflection))}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {(reflectionTags[reflection.id] ?? []).length > 0 && (
                                                                    <div className="flex gap-1">
                                                                        {(reflectionTags[reflection.id] ?? []).slice(0, 3).map((tag) => (
                                                                            <TagBadge key={tag} tag={tag} size="sm" />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                <motion.div animate={{ rotate: expandedReflection === reflection.id ? 180 : 0 }}>
                                                                    <ChevronDown className="h-5 w-5 text-brand-muted-dark" />
                                                                </motion.div>
                                                            </div>
                                                        </div>
                                                        <AnimatePresence>
                                                            {expandedReflection === reflection.id && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.3 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="border-t border-white/30 px-5 pb-5 pt-4">
                                                                        <p className="whitespace-pre-wrap text-sm leading-6 text-brand-dark">
                                                                            {searchQuery ? highlightText(reflection.content, searchQuery) : reflection.content}
                                                                        </p>
                                                                        {reflection.ai_feedback && (
                                                                            <div
                                                                                className="mt-4 rounded-2xl p-4"
                                                                                style={{
                                                                                    background: 'rgba(136,22,28,0.06)',
                                                                                    border: '1px solid rgba(136,22,28,0.12)',
                                                                                }}
                                                                            >
                                                                                <div className="mb-2 flex items-center gap-2">
                                                                                    <Lightbulb className="h-4 w-4" style={{ color: 'var(--color-brand-primary)' }} />
                                                                                    <span className="text-sm font-semibold font-sans text-brand-dark">
                                                                                        Umpan Balik AI
                                                                                    </span>
                                                                                </div>
                                                                                <p className="text-sm leading-6 text-brand-muted-dark">
                                                                                    {reflection.ai_feedback}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                        <div className="mt-4">
                                                                            <p className="mb-1.5 text-xs font-medium text-brand-dark">Tag</p>
                                                                            <TagInput
                                                                                tags={reflectionTags[reflection.id] ?? []}
                                                                                onChange={(tags) => saveTagsForReflection(reflection.id, tags)}
                                                                                reflectionId={reflection.id}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </LiquidGlassCard>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                             </div>
                         )}
                     </div>
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
                            <LiquidGlassCard intensity="heavy" className="w-full max-w-lg p-6" lightMode={true}>
                                <div onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-semibold font-sans text-brand-dark">
                                                Refleksi Mingguan Baru
                                            </h3>
                                            <p className="mt-1 text-sm text-brand-muted-dark">
                                                Refleksikan pengalaman pembelajaran mingguan Anda.
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
                                            <InputLabel htmlFor="course_id" required>
                                                Kelas
                                            </InputLabel>
                                            <select
                                                id="course_id"
                                                value={data.course_id}
                                                onChange={(e) => setData('course_id', e.target.value)}
                                                className="mt-1 block w-full rounded-xl border-0 bg-white/60 px-4 py-3 text-brand-dark shadow-brand-sm ring-1 ring-inset ring-white/50 focus:ring-2 focus:ring-inset focus:ring-[var(--color-brand-primary)]/30"
                                            >
                                                <option value="">Pilih kelas</option>
                                                {safeCourses.map((course) => (
                                                    <option key={course.id} value={course.id}>
                                                        {course.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.course_id} />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="content" required>
                                                Refleksi
                                            </InputLabel>
                                            <textarea
                                                id="content"
                                                value={data.content}
                                                onChange={(e) => setData('content', e.target.value)}
                                                className="mt-1 block min-h-[150px] w-full rounded-2xl border-0 bg-white/60 px-4 py-3 text-brand-dark shadow-brand-sm ring-1 ring-inset ring-white/50 placeholder:text-[#9ca3af] focus:ring-2 focus:ring-inset focus:ring-[var(--color-brand-primary)]/30"
                                                placeholder="Apa yang Anda pelajari hari ini? Tantangan apa yang Anda hadapi? Bagaimana Anda mengatasinya?"
                                                rows={5}
                                            />
                                            <InputError message={errors.content} />
                                            <p className="mt-2 text-xs text-brand-muted-dark">
                                                {data.content.length}/1000 karakter
                                            </p>
                                        </div>

                                        <div>
                                            <InputLabel>Tag</InputLabel>
                                            <TagInput
                                                tags={currentTags}
                                                onChange={setCurrentTags}
                                            />
                                        </div>

                                        <div
                                            className="rounded-2xl p-4"
                                            style={{
                                                background: 'rgba(255,255,255,0.35)',
                                                border: '1px solid rgba(255,255,255,0.5)',
                                            }}
                                        >
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-dark">
                                                Prompt refleksi mingguan
                                            </p>
                                            <ul className="space-y-1 text-xs leading-5 text-brand-muted-dark">
                                                <li>• Apa pencapaian pembelajaran terbesar minggu ini?</li>
                                                <li>• Tantangan apa yang dihadapi dan bagaimana mengatasinya?</li>
                                                <li>• Apa yang akan dilakukan berbeda minggu depan?</li>
                                            </ul>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <SecondaryButton onClick={() => setShowCreateModal(false)} className="flex-1">
                                                Batal
                                            </SecondaryButton>
                                            <PrimaryButton
                                                disabled={processing || !data.content.trim() || !data.course_id}
                                                className="flex-1"
                                            >
                                                {processing ? 'Menyimpan...' : 'Simpan Refleksi'}
                                            </PrimaryButton>
                                        </div>
                                    </form>
                                </div>
                            </LiquidGlassCard>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
