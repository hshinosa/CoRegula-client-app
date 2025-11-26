import { Head, Link, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormEvent, useState } from 'react';

import { InputError } from '@/components/ui/input-error';
import { InputLabel } from '@/components/ui/input-label';
import AppLayout from '@/layouts/app-layout';
import { useStudentNav } from '@/components/navigation/student-nav';
import { Course } from '@/types';
import student from '@/routes/student';

interface Props {
    courses: Course[];
}

export default function StudentCoursesIndex({ courses }: Props) {
    const navItems = useStudentNav('courses');
    const [showJoinModal, setShowJoinModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        join_code: '',
    });

    const handleJoin = (e: FormEvent) => {
        e.preventDefault();
        post(student.courses.join.url(), {
            onSuccess: () => {
                setShowJoinModal(false);
                reset();
            },
        });
    };

    return (
        <AppLayout title="Mata Kuliah Saya" navItems={navItems}>
            <Head title="Mata Kuliah Saya" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                            Mata Kuliah Saya
                        </h2>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            Mata kuliah dan kelompok yang Anda ikuti
                        </p>
                    </div>
                    <button
                        onClick={() => setShowJoinModal(true)}
                        className="btn-primary"
                    >
                        Gabung Mata Kuliah
                    </button>
                </div>

                {/* Course Grid */}
                {courses.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="card flex flex-col items-center justify-center py-16 text-center"
                    >
                        <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
                            <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                            Belum ada mata kuliah
                        </h3>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            Gabung mata kuliah menggunakan kode dari dosen Anda
                        </p>
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="btn-primary mt-4"
                        >
                            Gabung Mata Kuliah
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    href={student.courses.show.url({ course: course.id })}
                                    className="card block p-6 transition-shadow hover:shadow-md"
                                >
                                    <div className="mb-4">
                                        <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                                            {course.code}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                        {course.name}
                                    </h3>
                                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                        {course.owner?.name || (course as any).ownerName || 'Dosen Tidak Diketahui'}
                                    </p>
                                    <div className="mt-4 flex items-center text-sm text-primary-600 dark:text-primary-400">
                                        Lihat Mata Kuliah
                                        <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Join Course Modal */}
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
                            <div className="card w-full max-w-md p-6">
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                    Gabung Mata Kuliah
                                </h3>
                                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                                    Masukkan kode gabung yang diberikan oleh dosen Anda
                                </p>
                                <form onSubmit={handleJoin} className="mt-4 space-y-4">
                                    <div>
                                        <InputLabel htmlFor="join_code" required>
                                            Kode Gabung
                                        </InputLabel>
                                        <input
                                            id="join_code"
                                            type="text"
                                            value={data.join_code}
                                            onChange={(e) => setData('join_code', e.target.value.toUpperCase())}
                                            className="input-field mt-1 text-center font-mono text-lg tracking-wider"
                                            placeholder="Masukkan kode"
                                            maxLength={20}
                                        />
                                        <InputError message={errors.join_code} />
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
                                            disabled={processing || data.join_code.length < 4}
                                            className="btn-primary flex-1"
                                        >
                                            {processing ? 'Menggabung...' : 'Gabung Mata Kuliah'}
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
