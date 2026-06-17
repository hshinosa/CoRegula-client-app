import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormEvent, useState } from 'react';
import { Plus, X } from 'lucide-react';

import { InputError } from '@/components/ui/input-error';
import { FormModal } from '@/components/ui/FormModal';
import AppLayout from '@/layouts/app-layout';
import { useStudentNav } from '@/components/navigation/student-nav';
import student from '@/routes/student';
import { LiquidGlassCard, PrimaryButton, SecondaryButton } from '@/components/Welcome/utils/helpers';
import { CourseGridSkeleton } from '@/components/ui/skeletons';

import { SearchBar } from './components/SearchBar';
import { EmptyState } from './components/EmptyState';
import { useCourseFilters } from './hooks/useCourseFilters';
import { useCourses } from './hooks/useCourses';

export default function StudentCoursesIndex() {
    const navItems = useStudentNav('courses');
    const [showJoinModal, setShowJoinModal] = useState(false);
    const { serviceError } = usePage<{ serviceError?: string }>().props;

    const { filters, setQuery, setPage, resetFilters, hasActiveFilters } = useCourseFilters();
    const { courses, meta, isLoading, isError, isFetching, refetch } = useCourses({
        q: filters.q,
        status: filters.status,
        page: filters.page,
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        join_code: '',
    });

    const handleJoin = (e: FormEvent) => {
        e.preventDefault();
        post(student.courses.join.url(), {
            onSuccess: () => {
                setShowJoinModal(false);
                reset();
                refetch();
            },
        });
    };

    const handleJoinClick = () => {
        if (!data.join_code.trim()) return;
        post(student.courses.join.url(), {
            onSuccess: () => {
                setShowJoinModal(false);
                reset();
                refetch();
            },
        });
    };

    return (
        <AppLayout title="Kelas Saya" navItems={navItems}>
            <Head title="Kelas Saya" />

            <div className="space-y-6">
                {/* Header */}
                <LiquidGlassCard intensity="light" className="p-6" lightMode={true}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2
                                className="text-2xl font-bold font-sans text-brand-dark"
                            >
                                Kelas Saya
                            </h2>
                            <p className="mt-1 text-sm text-brand-muted-dark">
                                {meta.total > 0
                                    ? `${meta.total} kelas ditemukan`
                                    : 'Kelas dan kelompok yang Anda ikuti'
                                }
                            </p>
                        </div>
                        <PrimaryButton onClick={() => setShowJoinModal(true)}>
                            <Plus className="h-4 w-4" />
                            Gabung Kelas
                        </PrimaryButton>
                    </div>
                </LiquidGlassCard>

                {/* Search & Filters */}
                <LiquidGlassCard intensity="light" className="p-4" lightMode={true}>
                    <div className="space-y-3">
                        <SearchBar
                            value={filters.q}
                            onChange={setQuery}
                            placeholder="Cari kelas berdasarkan nama atau kode..."
                        />
                        {/* Filter chips (Berjalan / Belum Mulai / Selesai) hidden for now per request.
                            Status filtering via URL params may still apply if set directly.
                            Will restore later. */}
                    </div>
                </LiquidGlassCard>

                {/* Error State */}
                {(isError || serviceError) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center"
                    >
                        <p className="text-sm text-red-600">
                            {serviceError || 'Gagal memuat data kelas. Coba lagi nanti.'}
                        </p>
                        <button
                            onClick={() => refetch()}
                            className="mt-2 text-sm font-medium text-brand-primary hover:underline"
                        >
                            Coba Lagi
                        </button>
                    </motion.div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <CourseGridSkeleton count={6} />
                )}

                {/* Course Grid */}
                {!isLoading && !isError && !serviceError && (
                    courses.length === 0 ? (
                        <EmptyState
                            hasFilters={hasActiveFilters}
                            onResetFilters={hasActiveFilters ? resetFilters : undefined}
                            onJoinCourse={!hasActiveFilters ? () => setShowJoinModal(true) : undefined}
                        />
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {courses.map((course, index) => (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.4 }}
                                >
                                    <Link
                                        href={student.courses.show.url({ course: course.id })}
                                        className="group block"
                                    >
                                        <LiquidGlassCard
                                            intensity="light"
                                            className="p-6 transition-all duration-300 group-hover:shadow-lg"
                                            lightMode={true}
                                        >
                                            <div className="mb-3 flex items-center gap-2">
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
                                                {course.status && (
                                                    <StatusBadge status={course.status} />
                                                )}
                                            </div>
                                            <h3
                                                className="text-lg font-semibold font-sans text-brand-dark"
                                            >
                                                {course.name}
                                            </h3>
                                            <p className="mt-2 text-sm text-brand-muted-dark">
                                                {course.owner?.name || course.ownerName || 'Dosen Tidak Diketahui'}
                                            </p>
                                            {course.progress && (
                                                <div className="mt-3">
                                                    <div className="flex items-center justify-between text-xs text-brand-muted-dark">
                                                        <span>Progres</span>
                                                        <span>{course.progress.percentage}%</span>
                                                    </div>
                                                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${course.progress.percentage}%`,
                                                                backgroundColor: course.status === 'selesai'
                                                                    ? '#10B981'
                                                                    : course.status === 'aktif'
                                                                        ? '#3B82F6'
                                                                        : '#D1D5DB',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            <div
                                                className="mt-4 flex items-center text-sm font-medium text-brand-primary"
                                            >
                                                Lihat Kelas
                                                <svg
                                                    className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </LiquidGlassCard>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )
                )}

                {/* Pagination */}
                {!isLoading && meta.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <SecondaryButton
                            onClick={() => setPage(meta.current_page - 1)}
                            disabled={meta.current_page <= 1 || isFetching}
                        >
                            Sebelumnya
                        </SecondaryButton>
                        <span className="px-4 text-sm text-brand-muted-dark">
                            Halaman {meta.current_page} dari {meta.last_page}
                        </span>
                        <SecondaryButton
                            onClick={() => setPage(meta.current_page + 1)}
                            disabled={meta.current_page >= meta.last_page || isFetching}
                        >
                            Selanjutnya
                        </SecondaryButton>
                    </div>
                )}
            </div>

            {/* Join Course Modal */}
            <FormModal open={showJoinModal} title="Gabung Kelas" description="Masukkan kode gabung yang diberikan oleh dosen Anda" onClose={() => setShowJoinModal(false)} maxWidth="max-w-md">
                                <form onSubmit={handleJoin} className="space-y-4">
                                    <div>
                                        <input
                                            type="text"
                                            value={data.join_code}
                                            onChange={(e) => setData('join_code', e.target.value)}
                                            placeholder="Masukkan kode gabung"
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-sans text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                                            autoFocus
                                        />
                                        <InputError message={errors.join_code} className="mt-1.5" />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowJoinModal(false)}
                                            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium font-sans text-brand-dark transition-colors hover:bg-slate-50"
                                        >
                                            Batal
                                        </button>
                                        <PrimaryButton
                                            onClick={handleJoinClick}
                                            disabled={processing || !data.join_code.trim()}
                                            className="flex-1"
                                        >
                                            {processing ? 'Bergabung...' : 'Gabung'}
                                        </PrimaryButton>
                                    </div>
                                </form>
            </FormModal>
        </AppLayout>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config = {
        aktif: { label: 'Berjalan', bg: 'rgba(59,130,246,0.1)', color: '#3B82F6', border: 'rgba(59,130,246,0.2)' },
        selesai: { label: 'Selesai', bg: 'rgba(16,185,129,0.1)', color: '#10B981', border: 'rgba(16,185,129,0.2)' },
        belum_mulai: { label: 'Belum Mulai', bg: 'rgba(156,163,175,0.1)', color: 'var(--color-brand-muted-dark)', border: 'rgba(156,163,175,0.2)' },
    }[status] || { label: status, bg: 'rgba(156,163,175,0.1)', color: 'var(--color-brand-muted-dark)', border: 'rgba(156,163,175,0.2)' };

    return (
        <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}
        >
            {config.label}
        </span>
    );
}
