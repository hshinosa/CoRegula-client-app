import { Head, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormEvent, useState } from 'react';

import { InputError } from '@/components/ui/input-error';
import { InputLabel } from '@/components/ui/input-label';
import AppLayout from '@/layouts/app-layout';
import { useStudentNav } from '@/components/navigation/student-nav';
import { Reflection, Course } from '@/types';
import student from '@/routes/student';

interface Props {
    reflections: Reflection[];
    courses: Course[];
}

export default function StudentReflectionsIndex({ reflections, courses }: Props) {
    const safeReflections = reflections ?? [];
    const safeCourses = courses ?? [];
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [expandedReflection, setExpandedReflection] = useState<string | null>(null);

    // Group reflections by type
    const sessionReflections = safeReflections.filter(r => r.type === 'session');
    const weeklyReflections = safeReflections.filter(r => r.type === 'weekly');

    const navItems = useStudentNav('reflections');

    const { data, setData, post, processing, errors, reset } = useForm({
        course_id: '',
        content: '',
        type: 'weekly' as 'weekly',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(student.reflections.store.url(), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
            },
        });
    };

    const formatDate = (date?: string) => {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return date;
        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const createdAtFor = (reflection: Reflection) => {
        // Accept both snake_case and camelCase date fields from different backends
        return (reflection as any).created_at ?? (reflection as any).createdAt ?? '';
    };

    return (
        <AppLayout title="Refleksi Saya" navItems={navItems}>
            <Head title="Refleksi Saya" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                            Refleksi Saya
                        </h2>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            Lacak perjalanan pembelajaran Anda melalui refleksi
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary inline-flex items-center gap-2 whitespace-nowrap"
                    >
                        <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="truncate">Refleksi Mingguan</span>
                    </button>
                </div>

                {/* Info Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card bg-accent-50 p-4 dark:bg-accent-900/20"
                >
                    <div className="flex items-start gap-3">
                        <svg className="h-5 w-5 flex-shrink-0 text-accent-600 dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <div>
                            <p className="font-medium text-accent-800 dark:text-accent-200">
                                Tentang Refleksi
                            </p>
                            <p className="mt-1 text-sm text-accent-700 dark:text-accent-300">
                                Refleksi reguler membantu Anda mengkonsolidasikan pembelajaran dan melacak kemajuan. Di sini Anda akan melihat <strong>refleksi sesi</strong> (dibuat saat sesi diskusi ditutup) dan <strong>refleksi mingguan</strong> yang Anda buat sendiri.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Reflections List */}
                {safeReflections.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="card flex flex-col items-center justify-center py-16 text-center"
                    >
                        <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
                            <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                            Belum ada refleksi
                        </h3>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            Mulai refleksi pertama Anda untuk melacak perjalanan pembelajaran
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary mt-4 inline-flex items-center gap-2 whitespace-nowrap"
                        >
                            <span className="truncate">Tulis Refleksi Mingguan</span>
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {/* Session Reflections */}
                        {sessionReflections.length > 0 && (
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                        <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                        Refleksi Sesi
                                    </h3>
                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                        {sessionReflections.length}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {sessionReflections.map((reflection, index) => (
                                        <motion.div
                                            key={reflection.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="card overflow-hidden"
                                        >
                                            <div
                                                className="flex cursor-pointer items-center justify-between p-4"
                                                onClick={() => setExpandedReflection(
                                                    expandedReflection === reflection.id ? null : reflection.id
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                        Sesi
                                                    </span>
                                                    <div>
                                                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                                            {reflection.chatSpace?.name || 'Sesi Diskusi'}
                                                        </p>
                                                        <p className="text-sm text-zinc-500">
                                                            {reflection.course?.name || 'Kelas Tidak Diketahui'} • {formatDate(createdAtFor(reflection))}
                                                        </p>
                                                    </div>
                                                </div>
                                                <motion.svg
                                                    animate={{ rotate: expandedReflection === reflection.id ? 180 : 0 }}
                                                    className="h-5 w-5 text-zinc-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </motion.svg>
                                            </div>
                                            <AnimatePresence>
                                                {expandedReflection === reflection.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="border-t border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                                                            <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                                                                {reflection.content}
                                                            </p>
                                                            {reflection.ai_feedback && (
                                                                <div className="mt-4 rounded-lg border border-accent-200 bg-accent-50 p-3 dark:border-accent-800 dark:bg-accent-900/20">
                                                                    <div className="mb-2 flex items-center gap-2">
                                                                        <svg className="h-4 w-4 text-accent-600 dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                                        </svg>
                                                                        <span className="text-sm font-medium text-accent-800 dark:text-accent-200">
                                                                            Umpan Balik AI
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-accent-700 dark:text-accent-300">
                                                                        {reflection.ai_feedback}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Weekly Reflections */}
                        {weeklyReflections.length > 0 && (
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                        <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                        Refleksi Mingguan
                                    </h3>
                                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                        {weeklyReflections.length}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {weeklyReflections.map((reflection, index) => (
                                        <motion.div
                                            key={reflection.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="card overflow-hidden"
                                        >
                                            <div
                                                className="flex cursor-pointer items-center justify-between p-4"
                                                onClick={() => setExpandedReflection(
                                                    expandedReflection === reflection.id ? null : reflection.id
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                        Mingguan
                                                    </span>
                                                    <div>
                                                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                                            {reflection.course?.name || 'Kelas Tidak Diketahui'}
                                                        </p>
                                                        <p className="text-sm text-zinc-500">
                                                            {formatDate(createdAtFor(reflection))}
                                                        </p>
                                                    </div>
                                                </div>
                                                <motion.svg
                                                    animate={{ rotate: expandedReflection === reflection.id ? 180 : 0 }}
                                                    className="h-5 w-5 text-zinc-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </motion.svg>
                                            </div>
                                            <AnimatePresence>
                                                {expandedReflection === reflection.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="border-t border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                                                            <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                                                                {reflection.content}
                                                            </p>
                                                            {reflection.ai_feedback && (
                                                                <div className="mt-4 rounded-lg border border-accent-200 bg-accent-50 p-3 dark:border-accent-800 dark:bg-accent-900/20">
                                                                    <div className="mb-2 flex items-center gap-2">
                                                                        <svg className="h-4 w-4 text-accent-600 dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                                        </svg>
                                                                        <span className="text-sm font-medium text-accent-800 dark:text-accent-200">
                                                                            Umpan Balik AI
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-accent-700 dark:text-accent-300">
                                                                        {reflection.ai_feedback}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Reflection Modal */}
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
                            <div className="card w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                    Refleksi Mingguan Baru
                                </h3>
                                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                                    Refleksikan pengalaman pembelajaran mingguan Anda
                                </p>
                                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                    <div>
                                        <InputLabel htmlFor="course_id" required>
                                            Kelas
                                        </InputLabel>
                                        <select
                                            id="course_id"
                                            value={data.course_id}
                                            onChange={(e) => setData('course_id', e.target.value)}
                                            className="input-field mt-1"
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
                                            className="input-field mt-1 min-h-[150px]"
                                            placeholder="Apa yang Anda pelajari hari ini? Tantangan apa yang Anda hadapi? Bagaimana Anda mengatasinya?"
                                            rows={5}
                                        />
                                        <InputError message={errors.content} />
                                        <p className="mt-1 text-xs text-zinc-500">
                                            {data.content.length}/1000 karakter
                                        </p>
                                    </div>

                                    {/* Prompts */}
                                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
                                        <p className="mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                            Prompt refleksi mingguan:
                                        </p>
                                        <ul className="space-y-1 text-xs text-zinc-500">
                                            <li>• Apa pencapaian pembelajaran terbesar minggu ini?</li>
                                            <li>• Konsep apa yang masih membingungkan?</li>
                                            <li>• Bagaimana kolaborasi dengan tim berkontribusi pada pemahaman saya?</li>
                                            <li>• Apa yang akan saya fokuskan minggu depan?</li>
                                        </ul>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="btn-secondary flex-1"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing || !data.content.trim() || !data.course_id}
                                            className="btn-primary flex-1"
                                        >
                                            {processing ? 'Menyimpan...' : 'Simpan Refleksi'}
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
