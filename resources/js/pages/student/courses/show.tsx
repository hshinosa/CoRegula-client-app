import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { FormEvent, useState, useMemo, useEffect } from 'react';
import { MessageSquare, Check, KeyRound, Plus, Users, Search } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { useStudentNav } from '@/components/navigation/student-nav';
import { Course, User } from '@/types';
import student from '@/routes/student';
import Breadcrumbs from '@/components/dashboard/Breadcrumbs';
import { LiquidGlassCard, PrimaryButton, SecondaryButton } from '@/components/Welcome/utils/helpers';
import { FormModal } from '@/components/ui/FormModal';
import { InputError } from '@/components/ui/input-error';
import { InputLabel } from '@/components/ui/input-label';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/toaster';

interface ChatSpace {
    id: string;
    name: string;
    description?: string;
    isDefault: boolean;
    weekTitle?: string | null;
    weekIndex?: number | null;
    createdAt?: string;
    isClosed?: boolean;
    closedAt?: string;
}

interface GroupWithDetails {
    id: string;
    name: string;
    joinCode: string;
    members?: User[];
    members_count?: number;
    creator?: User | null;
    chatSpaces?: ChatSpace[];
    goalsCount?: number;
}

interface Props {
    course: Course;
    myGroup: GroupWithDetails | null;
    availableGroups: GroupWithDetails[];
    sessions: ChatSpace[];
}

export default function StudentCourseShow({ course, myGroup, availableGroups, sessions }: Props) {
    const navItems = useStudentNav('course-detail', { courseId: course.id, groupId: myGroup?.id });

    // Modal state
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);
    const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);

    // Session filter/sort state
    const [sessionSearch, setSessionSearch] = useState('');
    const [sessionSort, setSessionSort] = useState<'terbaru' | 'alfabet'>('terbaru');

    // Week options for create session
    const [weekOptions, setWeekOptions] = useState<{ id: string; week_index: number; title: string }[]>([]);
    const [weeksLoading, setWeeksLoading] = useState(false);

    // Forms
    const createGroupForm = useForm({ name: '' });
    const joinGroupForm = useForm({ join_code: '' });
    const createSessionForm = useForm({
        name: '',
        description: '',
        week_id: '',
        course_id: course.id,
    });

    // Load weeks when create session modal opens
    useEffect(() => {
        if (!showCreateSessionModal || !myGroup) return;
        setWeeksLoading(true);
        fetch(`/student/courses/${course.id}/weeks`)
            .then((res) => res.json())
            .then((json) => setWeekOptions(json.weeks || []))
            .catch(() => {
                toast.error('Gagal memuat minggu');
                setWeekOptions([]);
            })
            .finally(() => setWeeksLoading(false));
    }, [showCreateSessionModal, course.id, myGroup]);

    // Filter and sort sessions
    const filteredSessions = useMemo(() => {
        let result = [...sessions];
        
        if (sessionSearch) {
            const q = sessionSearch.toLowerCase();
            result = result.filter(s => 
                s.name.toLowerCase().includes(q) || 
                (s.description && s.description.toLowerCase().includes(q))
            );
        }

        if (sessionSort === 'terbaru') {
            result.sort((a, b) => {
                const dateA = a.createdAt || '';
                const dateB = b.createdAt || '';
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            });
        } else if (sessionSort === 'alfabet') {
            result.sort((a, b) => a.name.localeCompare(b.name, 'id'));
        }

        return result;
    }, [sessions, sessionSearch, sessionSort]);

    const handleCreateGroup = (e: FormEvent) => {
        e.preventDefault();
        createGroupForm.post(student.groups.store.url({ course: course.id }), {
            onSuccess: () => {
                setShowCreateGroupModal(false);
                createGroupForm.reset();
            },
        });
    };

    const handleJoinGroup = (e: FormEvent) => {
        e.preventDefault();
        joinGroupForm.post(student.groups.join.url(), {
            onSuccess: () => {
                setShowJoinGroupModal(false);
                joinGroupForm.reset();
            },
        });
    };

    const handleCreateSession = (e: FormEvent) => {
        e.preventDefault();
        if (!myGroup) return;
        createSessionForm.post(student.groups.chatSpaces.store.url({ group: myGroup.id }), {
            onSuccess: () => {
                createSessionForm.reset();
                setShowCreateSessionModal(false);
            },
        });
    };

    const memberRangeLabel = `${course.min_members_per_group ?? 1}–${course.max_members_per_group ?? 10} anggota per grup`;

    const breadcrumbItems = [
        { label: 'Kelas', href: student.courses.index.url() },
        { label: course.name },
    ];

    return (
        <AppLayout title={course.name} navItems={navItems}>
            <Head title={course.name} />
            <Breadcrumbs items={breadcrumbItems} />

            <div className="space-y-6">
                {/* Section 1: Course Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                        <div className="flex items-center gap-2">
                            <span 
                                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                style={{ 
                                    background: 'rgba(136,22,28,0.10)', 
                                    color: 'var(--color-brand-primary)',
                                    border: '1px solid rgba(136,22,28,0.15)'
                                }}
                            >
                                {course.code}
                            </span>
                        </div>
                        <h2 className="mt-3 text-2xl font-bold font-sans text-brand-dark">
                            {course.name}
                        </h2>
                        {course.owner && (
                            <p className="mt-2 text-sm text-brand-muted-dark">
                                Dosen: {course.owner.name}
                            </p>
                        )}
                    </LiquidGlassCard>
                </motion.div>

                {/* Section 2: Group Management */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                >
                    <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                        <h3 className="text-lg font-semibold font-sans text-brand-dark mb-4">
                            Grup
                        </h3>

                        {myGroup ? (
                            <div className="flex items-center gap-4">
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                                    style={{
                                        background: 'rgba(136,22,28,0.08)',
                                        border: '1px solid rgba(136,22,28,0.12)',
                                    }}
                                >
                                    <Check className="h-6 w-6 text-brand-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-brand-muted-dark">Anda sudah bergabung</p>
                                    <p className="font-semibold text-brand-dark">
                                        {myGroup.name}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-sm text-brand-muted-dark">
                                            {myGroup.members_count ?? myGroup.members?.length ?? 0} anggota
                                        </span>
                                        {myGroup.creator && (
                                            <span className="text-xs text-brand-muted-dark">
                                                Ketua: {myGroup.creator.name}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-brand-muted-dark mt-1">
                                        Kode:{' '}
                                        <code
                                            className="rounded px-1.5 py-0.5 font-mono text-xs"
                                            style={{
                                                background: 'rgba(136,22,28,0.08)',
                                                color: 'var(--color-brand-primary)',
                                            }}
                                        >
                                            {myGroup.joinCode}
                                        </code>
                                    </p>
                                </div>
                                <a
                                    href={`/student/groups/${myGroup.id}`}
                                    className="rounded-xl px-4 py-2 text-sm font-medium transition-colors bg-brand-primary text-white"
                                >
                                    Buka Grup
                                </a>
                            </div>
                        ) : (
                            // Student has not joined a group
                            <>
                                <p className="text-sm text-brand-muted-dark mb-4">
                                    {memberRangeLabel}
                                </p>

                                {/* Action buttons */}
                                <div className="grid gap-3 sm:grid-cols-2 mb-6">
                                    <button
                                        onClick={() => setShowJoinGroupModal(true)}
                                        className="group flex items-center gap-3 rounded-xl p-4 text-left transition-all"
                                        style={{
                                            background: 'rgba(255,255,255,0.5)',
                                            border: '1px solid rgba(255,255,255,0.6)',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.8)';
                                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.5)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                                        }}
                                    >
                                        <div
                                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                                            style={{
                                                background: 'rgba(136,22,28,0.08)',
                                                border: '1px solid rgba(136,22,28,0.12)',
                                            }}
                                        >
                                            <KeyRound className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-brand-dark">Gabung dengan Kode</p>
                                            <p className="text-xs text-brand-muted-dark">Masukkan kode dari teman</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setShowCreateGroupModal(true)}
                                        className="group flex items-center gap-3 rounded-xl p-4 text-left transition-all"
                                        style={{
                                            background: 'rgba(255,255,255,0.5)',
                                            border: '1px solid rgba(255,255,255,0.6)',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.8)';
                                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.5)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                                        }}
                                    >
                                        <div
                                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                                            style={{
                                                background: 'rgba(74,74,74,0.08)',
                                                border: '1px solid rgba(74,74,74,0.12)',
                                            }}
                                        >
                                            <Plus className="h-5 w-5 text-brand-dark" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-brand-dark">Buat Grup Baru</p>
                                            <p className="text-xs text-brand-muted-dark">Buat dan undang teman</p>
                                        </div>
                                    </button>
                                </div>

                                {/* Available groups list */}
                                {availableGroups.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-brand-dark mb-3">
                                            Grup yang Tersedia ({availableGroups.length})
                                        </h4>
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {availableGroups.map((group) => (
                                                <div
                                                    key={group.id}
                                                    className="rounded-xl p-3"
                                                    style={{
                                                        background: 'rgba(255,255,255,0.5)',
                                                        border: '1px solid rgba(255,255,255,0.6)',
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
                                                            style={{
                                                                background: 'rgba(136,22,28,0.08)',
                                                                color: 'var(--color-brand-primary)',
                                                            }}
                                                        >
                                                            {group.name.charAt(0)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-brand-dark truncate">
                                                                {group.name}
                                                            </p>
                                                            <p className="text-xs text-brand-muted-dark">
                                                                {group.members_count ?? group.members?.length ?? 0} anggota
                                                                {group.creator && ` · Ketua: ${group.creator.name}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Empty state */}
                                {availableGroups.length === 0 && (
                                    <EmptyState
                                        icon={Users}
                                        title="Belum ada grup"
                                        description="Buat grup baru untuk memulai diskusi dan kolaborasi."
                                    />
                                )}
                            </>
                        )}
                    </LiquidGlassCard>
                </motion.div>

                {/* Section 3: Discussion Sessions (only if student has a group) */}
                {myGroup && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold font-sans text-brand-dark">
                                    Sesi Diskusi
                                </h3>
                                <PrimaryButton onClick={() => setShowCreateSessionModal(true)}>
                                    <Plus className="h-4 w-4" />
                                    Sesi Baru
                                </PrimaryButton>
                            </div>

                            {sessions.length > 0 && (
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted-dark" />
                                        <input
                                            type="text"
                                            value={sessionSearch}
                                            onChange={(e) => setSessionSearch(e.target.value)}
                                            placeholder="Cari sesi..."
                className="w-full rounded-xl border-0 bg-white/60 pl-10 pr-4 py-2.5 text-sm text-brand-dark shadow-brand-sm ring-1 ring-inset ring-white/50 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-brand-primary/30"
                                        />
                                    </div>
                                    <select
                                        value={sessionSort}
                                        onChange={(e) => setSessionSort(e.target.value as 'terbaru' | 'alfabet')}
                                        className="rounded-xl border-0 bg-white/60 px-4 py-2.5 text-sm text-brand-dark shadow-brand-sm ring-1 ring-inset ring-white/50 focus:ring-2 focus:ring-inset focus:ring-brand-primary/30"
                                    >
                                        <option value="terbaru">Terbaru</option>
                                        <option value="alfabet">A-Z</option>
                                    </select>
                                </div>
                            )}

                            {filteredSessions.length > 0 ? (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {filteredSessions.map((session) => {
                                        const isClosed = session.isClosed || session.closedAt;
                                        return (
                                            <Link
                                                key={session.id}
                                                href={`/student/courses/${course.id}/chat/${session.id}`}
                                                className="block"
                                            >
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="rounded-xl p-4 transition-all"
                                                    style={{
                                                        background: isClosed 
                                                            ? 'rgba(156, 163, 175, 0.08)'
                                                            : 'rgba(255,255,255,0.6)',
                                                        border: '1px solid rgba(255,255,255,0.6)',
                                                    }}
                                                >
                                                    <p className="font-medium text-brand-dark truncate">
                                                        {session.name}
                                                    </p>
                                                    {session.description && (
                                                        <p className="text-sm text-brand-muted-dark mt-1 line-clamp-2">
                                                            {session.description}
                                                        </p>
                                                    )}
                                                    {session.weekTitle && (
                                                        <p className="text-xs text-brand-muted-dark mt-2">
                                                            Minggu {session.weekIndex}: {session.weekTitle}
                                                        </p>
                                                    )}
                                                    {isClosed && (
                                                        <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                                            Ditutup
                                                        </span>
                                                    )}
                                                </motion.div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : sessions.length === 0 ? (
                                <EmptyState
                                    icon={MessageSquare}
                                    title="Belum ada sesi diskusi"
                                    description="Sesi diskusi akan muncul setelah grup membuat ruang chat."
                                />
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-sm text-brand-muted-dark">
                                        Tidak ada sesi yang cocok dengan pencarian
                                    </p>
                                </div>
                            )}
                        </LiquidGlassCard>
                    </motion.div>
                )}
            </div>

            <FormModal
                open={showCreateGroupModal}
                title="Buat Grup Baru"
                description="Kode unik akan dibuat otomatis untuk teman bergabung"
                onClose={() => setShowCreateGroupModal(false)}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleCreateGroup} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="group_name" required>
                            Nama Grup
                        </InputLabel>
                        <input
                            id="group_name"
                            type="text"
                            value={createGroupForm.data.name}
                            onChange={(e) => createGroupForm.setData('name', e.target.value)}
                            className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-sans text-brand-dark placeholder:text-gray-600 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 sm:text-sm sm:leading-6"
                            placeholder="misalnya, Kelompok A"
                            autoFocus
                        />
                        <InputError message={createGroupForm.errors.name} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <SecondaryButton onClick={() => setShowCreateGroupModal(false)} className="flex-1">
                            Batal
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={createGroupForm.processing} className="flex-1">
                            {createGroupForm.processing ? 'Membuat...' : 'Buat Grup'}
                        </PrimaryButton>
                    </div>
                </form>
            </FormModal>

            <FormModal
                open={showJoinGroupModal}
                title="Gabung dengan Kode"
                description="Masukkan kode grup 8 karakter yang diberikan kepada Anda"
                onClose={() => setShowJoinGroupModal(false)}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleJoinGroup} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="join_code" required>
                            Kode Grup
                        </InputLabel>
                        <input
                            id="join_code"
                            type="text"
                            value={joinGroupForm.data.join_code}
                            onChange={(e) => joinGroupForm.setData('join_code', e.target.value.toUpperCase())}
                            className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-center font-mono text-xl tracking-widest font-sans text-brand-dark placeholder:text-gray-600 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                            placeholder="XXXXXXXX"
                            maxLength={8}
                            autoFocus
                        />
                        <InputError message={joinGroupForm.errors.join_code} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <SecondaryButton onClick={() => setShowJoinGroupModal(false)} className="flex-1">
                            Batal
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={joinGroupForm.processing || joinGroupForm.data.join_code.length < 8}
                            className="flex-1"
                        >
                            {joinGroupForm.processing ? 'Bergabung...' : 'Gabung'}
                        </PrimaryButton>
                    </div>
                </form>
            </FormModal>

            <FormModal
                open={showCreateSessionModal && !!myGroup}
                title="Buat Sesi Diskusi Baru"
                description="Buat sesi diskusi baru untuk topik tertentu."
                onClose={() => setShowCreateSessionModal(false)}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleCreateSession} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-dark">
                            Nama Sesi <span style={{ color: 'var(--color-brand-primary)' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={createSessionForm.data.name}
                            onChange={(e) => createSessionForm.setData('name', e.target.value)}
                            placeholder="Contoh: Diskusi Bab 3"
                            className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-brand-dark placeholder:text-gray-600 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 sm:text-sm sm:leading-6"
                            required
                        />
                        {createSessionForm.errors.name && <p className="mt-1 text-xs text-red-600">{createSessionForm.errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-dark">
                            Minggu kuliah <span style={{ color: 'var(--color-brand-primary)' }}>*</span>
                        </label>
                        <select
                            value={createSessionForm.data.week_id}
                            onChange={(e) => createSessionForm.setData('week_id', e.target.value)}
                            required
                            disabled={weeksLoading || weekOptions.length === 0}
                            className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-brand-dark focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 sm:text-sm"
                        >
                            <option value="">
                                {weeksLoading
                                    ? 'Memuat minggu…'
                                    : weekOptions.length === 0
                                      ? 'Belum ada minggu (minta dosen)'
                                      : 'Pilih minggu'}
                            </option>
                            {weekOptions.map((w) => (
                                <option key={w.id} value={w.id}>
                                    Minggu {w.week_index}: {w.title}
                                </option>
                            ))}
                        </select>
                        {createSessionForm.errors.week_id && <p className="mt-1 text-xs text-red-600">{createSessionForm.errors.week_id}</p>}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <SecondaryButton onClick={() => setShowCreateSessionModal(false)} className="flex-1">
                            Batal
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={createSessionForm.processing || !createSessionForm.data.name.trim() || !createSessionForm.data.week_id}
                            className="flex-1"
                        >
                            {createSessionForm.processing ? 'Membuat...' : 'Buat Sesi'}
                        </PrimaryButton>
                    </div>
                </form>
            </FormModal>
        </AppLayout>
    );
}
