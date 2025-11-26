import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

import AppLayout from '@/layouts/app-layout';
import { useStudentNav } from '@/components/navigation/student-nav';
import { SharedData } from '@/types';
import student from '@/routes/student';

export default function StudentDashboard() {
    const { auth } = usePage<SharedData>().props;
    const navItems = useStudentNav('courses');

    return (
        <AppLayout title="Dasbor" navItems={navItems}>
            <Head title="Dasbor Mahasiswa" />

            <div className="space-y-6">
                {/* Welcome Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card bg-gradient-to-r from-accent-600 to-accent-700 p-6 text-white"
                >
                    <h1 className="text-2xl font-bold">
                        Selamat datang kembali, {auth.user?.name}!
                    </h1>
                    <p className="mt-1 text-accent-100">
                        Pantau progres belajar Anda dan berkolaborasi dengan tim
                    </p>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: 'Mata Kuliah Terdaftar', value: '—', icon: '📚' },
                        { label: 'Tujuan Aktif', value: '—', icon: '🎯' },
                        { label: 'Refleksi', value: '—', icon: '📝' },
                        { label: 'Minggu Ini', value: '—', icon: '📊' },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * (index + 1) }}
                            className="card p-4"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    {stat.label}
                                </p>
                                <span className="text-xl">{stat.icon}</span>
                            </div>
                            <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                {stat.value}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="card p-6"
                >
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        Aksi Cepat
                    </h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <a
                            href={student.courses.index.url()}
                            className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-accent-300 hover:bg-accent-50 dark:border-zinc-700 dark:hover:border-accent-700 dark:hover:bg-accent-900/10"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100 dark:bg-accent-900/30">
                                <svg className="h-5 w-5 text-accent-600 dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                    Gabung Mata Kuliah
                                </p>
                                <p className="text-sm text-zinc-500">
                                    Gunakan kode gabung
                                </p>
                            </div>
                        </a>
                        <a
                            href={student.courses.index.url()}
                            className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-accent-300 hover:bg-accent-50 dark:border-zinc-700 dark:hover:border-accent-700 dark:hover:bg-accent-900/10"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                                <svg className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                    Diskusi Grup
                                </p>
                                <p className="text-sm text-zinc-500">
                                    Berkolaborasi sekarang
                                </p>
                            </div>
                        </a>
                        <a
                            href={student.reflections.index.url()}
                            className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-accent-300 hover:bg-accent-50 dark:border-zinc-700 dark:hover:border-accent-700 dark:hover:bg-accent-900/10"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                    Tulis Refleksi
                                </p>
                                <p className="text-sm text-zinc-500">
                                    Pantau pembelajaran Anda
                                </p>
                            </div>
                        </a>
                        <a
                            href={student.aiChat.index.url()}
                            className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-violet-300 hover:bg-violet-50 dark:border-zinc-700 dark:hover:border-violet-700 dark:hover:bg-violet-900/10"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                <svg className="h-5 w-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                    Chat dengan AI
                                </p>
                                <p className="text-sm text-zinc-500">
                                    Tanya apapun
                                </p>
                            </div>
                        </a>
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}
