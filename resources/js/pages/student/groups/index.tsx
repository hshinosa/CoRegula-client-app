/**
 * @deprecated This page has been consolidated into the unified course detail page.
 * The route `/courses/{course}/groups` now redirects to `/courses/{course}`.
 * See: resources/js/pages/student/courses/show.tsx
 */
import { Head, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormEvent, useState, useEffect } from 'react';
import { Check, KeyRound, Plus, Users, X } from 'lucide-react';

import { InputError } from '@/components/ui/input-error';
import { InputLabel } from '@/components/ui/input-label';
import { FormModal } from '@/components/ui/FormModal';
import AppLayout from '@/layouts/app-layout';
import { useStudentNav } from '@/components/navigation/student-nav';
import { Course, User } from '@/types';
import student from '@/routes/student';
import { LiquidGlassCard, PrimaryButton, SecondaryButton } from '@/components/Welcome/utils/helpers';
import { Skeleton } from '@/components/ui/skeletons';

interface SessionDiscussion {
    id: string;
    name: string;
    description?: string;
    isDefault: boolean;
}

interface GroupWithDetails {
    id: string;
    name: string;
    joinCode: string;
    members?: User[];
    sessionDiscussions?: SessionDiscussion[];
    goalsCount?: number;
}

interface Props {
    course: Course;
    groups: GroupWithDetails[];
    myGroup: GroupWithDetails | null;
    students: User[];
}

export default function StudentGroupsIndex({ course, groups, myGroup }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsInitialLoading(false), 300);
        return () => clearTimeout(timer);
    }, []);

    const navItems = useStudentNav('groups', { courseId: course.id });

    const createForm = useForm({
        name: '',
    });

    const joinForm = useForm({
        join_code: '',
    });

    const handleCreateGroup = (e: FormEvent) => {
        e.preventDefault();
        createForm.post(student.groups.store.url({ course: course.id }), {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    const handleJoinGroup = (e: FormEvent) => {
        e.preventDefault();
        joinForm.post(student.groups.join.url(), {
            onSuccess: () => {
                setShowJoinModal(false);
                joinForm.reset();
            },
        });
    };

    const memberRangeLabel = `${course.min_members_per_group ?? 1}–${course.max_members_per_group ?? 10} anggota per grup`;

    return (
        <AppLayout title={`Grup - ${course.name}`} navItems={navItems}>
            <Head title={`Grup - ${course.name}`} />

            {isInitialLoading ? (
                <div className="space-y-6">
                    <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.6)' }}>
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="mt-3 h-8 w-48" />
                        <Skeleton className="mt-2 h-4 w-72" />
                    </div>
                    <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.6)' }}>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-xl" />
                            <div className="flex-1">
                                <Skeleton className="h-5 w-56" />
                                <Skeleton className="mt-2 h-4 w-32" />
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)' }}>
                                <Skeleton className="h-14 w-14 rounded-xl" />
                                <Skeleton className="mt-3 h-5 w-40" />
                                <Skeleton className="mt-2 h-4 w-32" />
                            </div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="rounded-3xl p-4" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.6)' }}>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="mt-1 h-3 w-20" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
            <div className="space-y-6">
                <LiquidGlassCard intensity="light" className="p-6" lightMode={true}>
                    <div className="flex items-center gap-2">
                        <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{
                                background: 'rgba(136,22,28,0.08)',
                                color: 'var(--color-brand-primary)',
                                border: '1px solid rgba(136,22,28,0.15)',
                            }}
                        >
                            {course.code}
                        </span>
                    </div>
                    <h2
                        className="mt-3 text-2xl font-bold font-sans text-brand-dark"
                    >
                        Cari atau Buat Grup
                    </h2>
                    <p className="mt-1 text-sm text-brand-muted-dark">
                        Bergabung dengan grup yang sudah ada atau buat grup baru untuk {course.name}
                    </p>
                    <p className="mt-2 text-sm text-brand-muted-dark">Batas ukuran grup: {memberRangeLabel}</p>
                </LiquidGlassCard>

                {myGroup && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
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
                                    <h3
                                        className="text-lg font-semibold font-sans text-brand-dark"
                                    >
                                        Anda sudah bergabung dengan grup
                                    </h3>
                                    <p className="text-sm text-brand-muted-dark">
                                        <span className="font-medium">{myGroup.name}</span> • Kode:{' '}
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
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`/student/groups/${myGroup.id}`}
                                        className="rounded-xl px-4 py-2 text-sm font-medium transition-colors bg-brand-primary text-white"
                                    >
                                        Buka Grup
                                    </a>
                                    <a
                                        href={student.courses.show.url({ course: course.id })}
                                        className="rounded-xl px-4 py-2 text-sm font-medium transition-colors text-brand-primary"
                                        style={{
                                            background: 'rgba(136,22,28,0.08)',
                                            border: '1px solid rgba(136,22,28,0.15)',
                                        }}
                                    >
                                        Kembali ke Kelas
                                    </a>
                                </div>
                            </div>
                        </LiquidGlassCard>
                    </motion.div>
                )}

                {/* Action Buttons */}
                {!myGroup && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid gap-4 sm:grid-cols-2"
                    >
                        {/* Join with Code */}
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="group flex items-center gap-4 rounded-2xl p-6 text-left transition-all"
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
                                className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl transition-all group-hover:scale-105"
                                style={{
                                    background: 'rgba(136,22,28,0.08)',
                                    border: '1px solid rgba(136,22,28,0.12)',
                                }}
                            >
                                <KeyRound className="h-7 w-7" style={{ color: 'var(--color-brand-primary)' }} />
                            </div>
                            <div>
                                <h3
                                    className="text-lg font-semibold font-sans text-brand-dark"
                                >
                                    Gabung dengan Kode
                                </h3>
                                <p className="mt-1 text-sm text-brand-muted-dark">
                                    Masukkan kode grup yang diberikan oleh teman atau dosen
                                </p>
                            </div>
                        </button>

                        {/* Create New Group */}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="group flex items-center gap-4 rounded-2xl p-6 text-left transition-all"
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
                                className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl transition-all group-hover:scale-105"
                                style={{
                                    background: 'rgba(74,74,74,0.08)',
                                    border: '1px solid rgba(74,74,74,0.12)',
                                }}
                            >
                                <Plus className="h-7 w-7 text-brand-dark" />
                            </div>
                            <div>
                                <h3
                                    className="text-lg font-semibold font-sans text-brand-dark"
                                >
                                    Buat Grup Baru
                                </h3>
                                <p className="mt-1 text-sm text-brand-muted-dark">
                                    Buat grup baru dan ajak teman Anda untuk bergabung
                                </p>
                            </div>
                        </button>
                    </motion.div>
                )}

                {/* Available Groups */}
                {!myGroup && groups.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                    >
                        <h3
                            className="text-lg font-semibold font-sans text-brand-dark"
                        >
                            Grup yang Tersedia ({groups.length})
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {groups.map((group, index) => (
                                <motion.div
                                    key={group.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + index * 0.05 }}
                                >
                                    <LiquidGlassCard intensity="light" className="p-4" lightMode={true}>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold text-brand-primary"
                                                style={{
                                                    background: 'rgba(136,22,28,0.08)',
                                                    border: '1px solid rgba(136,22,28,0.12)',
                                                }}
                                            >
                                                {group.name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <h4
                                                    className="font-medium text-brand-dark"
                                                >
                                                    {group.name}
                                                </h4>
                                                <p className="text-xs text-brand-muted-dark">
                                                    {group.members?.length || 0} anggota
                                                </p>
                                            </div>
                                        </div>
                                        {group.members && group.members.length > 0 && (
                                            <div className="mt-3 flex -space-x-2">
                                                {group.members.slice(0, 5).map((member) => (
                                                    <div
                                                        key={member.id}
                                                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-medium"
                                                        style={{
                                                            borderColor: 'rgba(255,255,255,0.8)',
                                                            background: 'rgba(136,22,28,0.08)',
                                                            color: 'var(--color-brand-primary)',
                                                        }}
                                                        title={member.name}
                                                    >
                                                        {member.name.charAt(0)}
                                                    </div>
                                                ))}
                                                {group.members.length > 5 && (
                                                    <div
                                                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-medium"
                                                        style={{
                                                            borderColor: 'rgba(255,255,255,0.8)',
                                                            background: 'rgba(74,74,74,0.08)',
                                                            color: 'var(--color-brand-dark)',
                                                        }}
                                                    >
                                                        +{group.members.length - 5}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </LiquidGlassCard>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Empty State */}
                {!myGroup && groups.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <LiquidGlassCard
                            intensity="medium"
                            className="flex flex-col items-center justify-center py-16 text-center"
                            lightMode={true}
                        >
                            <div
                                className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
                                style={{
                                    background: 'rgba(136,22,28,0.08)',
                                    border: '1px solid rgba(136,22,28,0.12)',
                                }}
                            >
                                <Users className="h-8 w-8" style={{ color: 'var(--color-brand-primary)' }} />
                            </div>
                            <h3
                                className="text-lg font-semibold font-sans text-brand-dark"
                            >
                                Belum ada grup
                            </h3>
                            <p className="mt-2 max-w-sm text-sm text-brand-muted-dark">
                                Jadilah yang pertama! Buat grup baru atau masukkan kode dari teman.
                            </p>
                            <div className="mt-6">
                                <PrimaryButton onClick={() => setShowCreateModal(true)}>
                                    <Plus className="h-4 w-4" />
                                    Buat Grup Baru
                                </PrimaryButton>
                            </div>
                        </LiquidGlassCard>
                    </motion.div>
                )}
            </div>
            )}

            {/* Create Group Modal */}
            <FormModal open={showCreateModal} title="Buat Grup Baru" description="Kode unik akan dibuat otomatis untuk teman bergabung" onClose={() => setShowCreateModal(false)} maxWidth="max-w-md">
                                <form onSubmit={handleCreateGroup} className="space-y-4">
                                    <div>
                                        <InputLabel htmlFor="group_name" required>
                                            Nama Grup
                                        </InputLabel>
                                        <input
                                            id="group_name"
                                            type="text"
                                            value={createForm.data.name}
                                            onChange={(e) => createForm.setData('name', e.target.value)}
                className="mt-1 block w-full rounded-xl border-0 bg-white/60 px-4 py-3 font-sans text-brand-dark shadow-brand-sm ring-1 ring-inset ring-white/50 placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 sm:text-sm sm:leading-6"
                                            placeholder="misalnya, Kelompok A"
                                            autoFocus
                                        />
                                        <InputError message={createForm.errors.name} />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <SecondaryButton
                                            onClick={() => setShowCreateModal(false)}
                                            className="flex-1"
                                        >
                                            Batal
                                        </SecondaryButton>
                                        <PrimaryButton
                                            disabled={createForm.processing}
                                            className="flex-1"
                                        >
                                            {createForm.processing ? 'Membuat...' : 'Buat Grup'}
                                        </PrimaryButton>
                                    </div>
                                </form>
            </FormModal>

            {/* Join Group Modal */}
            <FormModal open={showJoinModal} title="Gabung dengan Kode" description="Masukkan kode grup 6 karakter yang diberikan kepada Anda" onClose={() => setShowJoinModal(false)} maxWidth="max-w-md">
                                <form onSubmit={handleJoinGroup} className="space-y-4">
                                    <div>
                                        <InputLabel htmlFor="join_code" required>
                                            Kode Grup
                                        </InputLabel>
                                        <input
                                            id="join_code"
                                            type="text"
                                            value={joinForm.data.join_code}
                                            onChange={(e) => joinForm.setData('join_code', e.target.value.toUpperCase())}
                className="mt-1 block w-full rounded-xl border-0 bg-white/60 px-4 py-3 text-center font-mono text-xl tracking-widest font-sans text-brand-dark shadow-brand-sm ring-1 ring-inset ring-white/50 placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                                            placeholder="XXXXXX"
                                            maxLength={6}
                                            autoFocus
                                        />
                                        <InputError message={joinForm.errors.join_code} />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <SecondaryButton
                                            onClick={() => setShowJoinModal(false)}
                                            className="flex-1"
                                        >
                                            Batal
                                        </SecondaryButton>
                                        <PrimaryButton
                                            disabled={joinForm.processing || joinForm.data.join_code.length < 6}
                                            className="flex-1"
                                        >
                                            {joinForm.processing ? 'Bergabung...' : 'Gabung'}
                                        </PrimaryButton>
                                    </div>
                                </form>
            </FormModal>
        </AppLayout>
    );
}
