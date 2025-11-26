import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

import AppLayout from '@/layouts/app-layout';
import { useStudentNav } from '@/components/navigation/student-nav';
import { Course, LearningGoal } from '@/types';
import student from '@/routes/student';

interface Group {
    id: string;
    name: string;
    joinCode: string;
}

interface Props {
    course: Course;
    group: Group | null;
    goal: LearningGoal | null;
    hasGroup: boolean;
    hasGoal: boolean;
}

export default function StudentCourseShow({ course, group, goal, hasGroup, hasGoal }: Props) {
    const navItems = useStudentNav('course-detail', { courseId: course.id });

    return (
        <AppLayout title={course.name} navItems={navItems}>
            <Head title={course.name} />

            <div className="space-y-6">
                {/* Course Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6"
                >
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-sm font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                            {course.code}
                        </span>
                    </div>
                    <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        {course.name}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Dosen: {course.owner?.name || 'Tidak Diketahui'}
                    </p>
                </motion.div>

                {/* Group Status */}
                {!hasGroup ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                                    Belum Bergabung dengan Grup
                                </h3>
                                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                    Anda belum tergabung dalam grup diskusi. Bergabung dengan grup untuk mulai berdiskusi dengan tim Anda.
                                </p>
                                <Link
                                    href={student.groups.index.url({ course: course.id })}
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Cari atau Buat Grup
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <>
                        {/* Group Info Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="card p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
                                        <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                            {group?.name}
                                        </h3>
                                        <p className="text-sm text-zinc-500">Grup Anda</p>
                                    </div>
                                </div>
                                <Link
                                    href={student.courses.chatSpaces.url({ course: course.id })}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Buka Diskusi
                                </Link>
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="grid gap-4 sm:grid-cols-2"
                        >
                            <Link
                                href={student.reflections.index.url()}
                                className="card group flex items-center gap-4 p-4 transition-all hover:border-primary-300 hover:shadow-md dark:hover:border-primary-700"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 transition-colors group-hover:bg-purple-200 dark:bg-purple-900/30 dark:group-hover:bg-purple-900/50">
                                    <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Refleksi</h4>
                                    <p className="text-sm text-zinc-500">Catat refleksi belajar Anda</p>
                                </div>
                            </Link>

                            <Link
                                href={student.aiChat.index.url()}
                                className="card group flex items-center gap-4 p-4 transition-all hover:border-primary-300 hover:shadow-md dark:hover:border-primary-700"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100 transition-colors group-hover:bg-accent-200 dark:bg-accent-900/30 dark:group-hover:bg-accent-900/50">
                                    <svg className="h-6 w-6 text-accent-600 dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Asisten AI</h4>
                                    <p className="text-sm text-zinc-500">Tanya jawab dengan AI</p>
                                </div>
                            </Link>
                        </motion.div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
