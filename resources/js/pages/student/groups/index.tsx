import { Head, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormEvent, useState } from 'react';

import { InputError } from '@/components/ui/input-error';
import { InputLabel } from '@/components/ui/input-label';
import AppLayout from '@/layouts/app-layout';
import { useStudentNav } from '@/components/navigation/student-nav';
import { Course, User } from '@/types';
import student from '@/routes/student';

interface ChatSpace {
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
    chatSpaces?: ChatSpace[];
    goalsCount?: number;
}

interface Props {
    course: Course;
    groups: GroupWithDetails[];
    myGroup: GroupWithDetails | null;
    students: User[];
}

export default function StudentGroupsIndex({ course, groups, myGroup, students }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);

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

    return (
        <AppLayout title={`Grup - ${course.name}`} navItems={navItems}>
            <Head title={`Grup - ${course.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-sm font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                            {course.code}
                        </span>
                    </div>
                    <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        Cari atau Buat Grup
                    </h2>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Bergabung dengan grup yang sudah ada atau buat grup baru untuk {course.name}
                    </p>
                </motion.div>

                {/* Already in a group */}
                {myGroup && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card border-accent-200 bg-accent-50 p-6 dark:border-accent-800 dark:bg-accent-900/20"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100 dark:bg-accent-900/30">
                                <svg className="h-6 w-6 text-accent-600 dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-accent-800 dark:text-accent-200">
                                    Anda sudah bergabung dengan grup
                                </h3>
                                <p className="text-sm text-accent-700 dark:text-accent-300">
                                    <span className="font-medium">{myGroup.name}</span> • Kode: <code className="rounded bg-accent-200 px-1 py-0.5 font-mono text-xs dark:bg-accent-800">{myGroup.joinCode}</code>
                                </p>
                            </div>
                            <a
                                href={student.courses.show.url({ course: course.id })}
                                className="btn-primary"
                            >
                                Kembali ke Kelas
                            </a>
                        </div>
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
                            className="card group flex items-center gap-4 p-6 text-left transition-all hover:border-primary-300 hover:shadow-md dark:hover:border-primary-700"
                        >
                            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 transition-colors group-hover:bg-primary-200 dark:bg-primary-900/30 dark:group-hover:bg-primary-900/50">
                                <svg className="h-7 w-7 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                    Gabung dengan Kode
                                </h3>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Masukkan kode grup yang diberikan oleh teman atau dosen
                                </p>
                            </div>
                        </button>

                        {/* Create New Group */}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="card group flex items-center gap-4 p-6 text-left transition-all hover:border-accent-300 hover:shadow-md dark:hover:border-accent-700"
                        >
                            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-accent-100 transition-colors group-hover:bg-accent-200 dark:bg-accent-900/30 dark:group-hover:bg-accent-900/50">
                                <svg className="h-7 w-7 text-accent-600 dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                    Buat Grup Baru
                                </h3>
                                <p className="mt-1 text-sm text-zinc-500">
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
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            Grup yang Tersedia ({groups.length})
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {groups.map((group, index) => (
                                <motion.div
                                    key={group.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + index * 0.05 }}
                                    className="card p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                                            {group.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                                                {group.name}
                                            </h4>
                                            <p className="text-xs text-zinc-500">
                                                {group.members?.length || 0} anggota
                                            </p>
                                        </div>
                                    </div>
                                    {group.members && group.members.length > 0 && (
                                        <div className="mt-3 flex -space-x-2">
                                            {group.members.slice(0, 5).map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-zinc-200 text-xs font-medium text-zinc-700 dark:border-zinc-900 dark:bg-zinc-700 dark:text-zinc-300"
                                                    title={member.name}
                                                >
                                                    {member.name.charAt(0)}
                                                </div>
                                            ))}
                                            {group.members.length > 5 && (
                                                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-zinc-300 text-xs font-medium text-zinc-600 dark:border-zinc-900 dark:bg-zinc-600 dark:text-zinc-300">
                                                    +{group.members.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    )}
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
                        className="card flex flex-col items-center justify-center py-16 text-center"
                    >
                        <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
                            <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                            Belum ada grup
                        </h3>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            Jadilah yang pertama! Buat grup baru atau masukkan kode dari teman.
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Create Group Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="fixed inset-0 z-40 bg-black"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                    Buat Grup Baru
                                </h3>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Kode unik akan dibuat otomatis untuk teman bergabung
                                </p>
                                <form onSubmit={handleCreateGroup} className="mt-4 space-y-4">
                                    <div>
                                        <InputLabel htmlFor="group_name" required>
                                            Nama Grup
                                        </InputLabel>
                                        <input
                                            id="group_name"
                                            type="text"
                                            value={createForm.data.name}
                                            onChange={(e) => createForm.setData('name', e.target.value)}
                                            className="input-field mt-1"
                                            placeholder="misalnya, Kelompok A"
                                            autoFocus
                                        />
                                        <InputError message={createForm.errors.name} />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="btn-secondary flex-1"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={createForm.processing}
                                            className="btn-primary flex-1"
                                        >
                                            {createForm.processing ? 'Membuat...' : 'Buat Grup'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Join Group Modal */}
            <AnimatePresence>
                {showJoinModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowJoinModal(false)}
                            className="fixed inset-0 z-40 bg-black"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                    Gabung dengan Kode
                                </h3>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Masukkan kode grup 6 karakter yang diberikan kepada Anda
                                </p>
                                <form onSubmit={handleJoinGroup} className="mt-4 space-y-4">
                                    <div>
                                        <InputLabel htmlFor="join_code" required>
                                            Kode Grup
                                        </InputLabel>
                                        <input
                                            id="join_code"
                                            type="text"
                                            value={joinForm.data.join_code}
                                            onChange={(e) => joinForm.setData('join_code', e.target.value.toUpperCase())}
                                            className="input-field mt-1 text-center font-mono text-xl tracking-widest"
                                            placeholder="XXXXXX"
                                            maxLength={6}
                                            autoFocus
                                        />
                                        <InputError message={joinForm.errors.join_code} />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowJoinModal(false)}
                                            className="btn-secondary flex-1"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={joinForm.processing || joinForm.data.join_code.length < 6}
                                            className="btn-primary flex-1"
                                        >
                                            {joinForm.processing ? 'Bergabung...' : 'Gabung'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
