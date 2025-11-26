import { Head, Link, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, FormEvent } from 'react';

import AppLayout from '@/layouts/app-layout';
import { useStudentNav } from '@/components/navigation/student-nav';
import { Course } from '@/types';
import student from '@/routes/student';
import { room as chatRoom } from '@/routes/student/courses/chat';

interface ChatSpaceGoal {
    id: string;
    content: string;
    isValidated: boolean;
    createdBy: {
        id: string;
        name: string;
    };
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
}

// Helper function to get the correct URL based on whether goal exists
const getChatSpaceUrl = (courseId: string, chatSpace: ChatSpace): string => {
    // If session is closed, always go to room to view history
    if (chatSpace.isClosed) {
        return chatRoom.url({ course: courseId, chatSpace: chatSpace.id });
    }
    if (chatSpace.myGoal) {
        // Has goal, go directly to chat room
        return chatRoom.url({ course: courseId, chatSpace: chatSpace.id });
    }
    // No goal, go to goal creation page first
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

interface Props {
    course: Course;
    group: Group;
}

export default function ChatSpacesIndex({ course, group }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const navItems = useStudentNav('chat-spaces', { courseId: course.id });
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(student.groups.chatSpaces.store.url({ group: group.id }), {
            onSuccess: () => {
                reset();
                setShowCreateModal(false);
            },
        });
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const chatSpaces = group.chatSpaces || [];

    return (
        <AppLayout title={`Diskusi - ${group.name}`} navItems={navItems}>
            <Head title={`Diskusi - ${course.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                            Sesi Diskusi
                        </h1>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            {course.name} • Grup: {group.name}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Sesi Baru
                    </button>
                </motion.div>

                {/* All Chat Spaces */}
                {chatSpaces.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {chatSpaces.map((chatSpace, index) => (
                                <Link
                                    key={chatSpace.id}
                                    href={getChatSpaceUrl(course.id, chatSpace)}
                                    className={`card group block p-4 transition-all hover:shadow-md ${
                                        chatSpace.isClosed
                                            ? 'border-zinc-300 bg-zinc-50 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-zinc-600'
                                            : 'hover:border-primary-300 dark:hover:border-primary-700'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                            chatSpace.isClosed
                                                ? 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'
                                                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                        }`}>
                                            {chatSpace.isClosed ? (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-semibold truncate ${
                                                chatSpace.isClosed
                                                    ? 'text-zinc-600 group-hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200'
                                                    : 'text-zinc-900 group-hover:text-primary-600 dark:text-zinc-100 dark:group-hover:text-primary-400'
                                            }`}>
                                                {chatSpace.name}
                                            </h3>
                                            {chatSpace.description && (
                                                <p className="mt-0.5 text-xs text-zinc-500 line-clamp-2">
                                                    {chatSpace.description}
                                                </p>
                                            )}
                                            <div className="mt-2 flex items-center gap-2">
                                                {chatSpace.isClosed ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                        Sesi Ditutup
                                                    </span>
                                                ) : chatSpace.myGoal ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-2 py-0.5 text-xs text-accent-700 dark:bg-accent-900/30 dark:text-accent-300">
                                                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        Masuk Diskusi
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-caution-100 px-2 py-0.5 text-xs text-caution-700 dark:bg-caution-900/30 dark:text-caution-300">
                                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Tetapkan Tujuan
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <svg className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:translate-x-1 ${
                                            chatSpace.isClosed
                                                ? 'text-zinc-400 group-hover:text-zinc-500'
                                                : 'text-zinc-400 group-hover:text-primary-500'
                                        }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Empty State */}
                {chatSpaces.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card flex flex-col items-center justify-center p-12 text-center"
                    >
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                            <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            Belum Ada Sesi Diskusi
                        </h3>
                        <p className="mt-2 text-sm text-zinc-500">
                            Buat sesi diskusi baru untuk mulai belajar bersama.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary mt-4"
                        >
                            Buat Sesi Pertama
                        </button>
                    </motion.div>
                )}

                {/* Tip Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                Tips: Gunakan Sesi Terpisah
                            </h4>
                            <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                                Buat sesi diskusi terpisah untuk topik berbeda agar diskusi lebih terfokus. 
                                Setiap sesi memiliki tujuan pembelajaran sendiri.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                Buat Sesi Diskusi Baru
                            </h2>
                            <p className="mt-1 text-sm text-zinc-500">
                                Buat sesi diskusi baru untuk topik tertentu.
                            </p>

                            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Nama Sesi <span className="text-danger-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: Diskusi Bab 3"
                                        className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-800"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-xs text-danger-500">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Deskripsi (Opsional)
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Jelaskan topik yang akan dibahas..."
                                        rows={3}
                                        className="mt-1 block w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-zinc-700 dark:bg-zinc-800"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="btn-primary"
                                    >
                                        {processing ? 'Membuat...' : 'Buat Sesi'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
