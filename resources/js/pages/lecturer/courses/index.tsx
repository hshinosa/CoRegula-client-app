import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { BookOpen, CheckSquare, Plus, Square, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useLecturerNav } from '@/components/navigation/lecturer-nav';
import { CourseGridSkeleton } from '@/components/ui/skeletons';
import { LiquidGlassCard, PrimaryButton } from '@/components/Welcome/utils/helpers';
import { BulkActionBar } from '@/components/lecturer/BulkActionBar';
import { CourseFilters } from '@/components/lecturer/CourseFilters';
import { CourseSearchBar } from '@/components/lecturer/CourseSearchBar';
import { CoursesAnalyticsOverview } from '@/components/lecturer/CoursesAnalyticsOverview';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox';
import { toast } from '@/components/ui/toaster';
import { useDebounce } from '@/hooks/useDebounce';
import AppLayout from '@/layouts/app-layout';
import lecturer from '@/routes/lecturer';
import { Course, CourseAnalytics, CourseStatus } from '@/types';

interface Props {
    courses: Course[];
    analytics: CourseAnalytics;
}

function readUrlParams() {
    if (typeof window === 'undefined') return { q: '', status: null as CourseStatus | null, semester: null as string | null };
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    const status = params.get('status') as CourseStatus | null;
    const semester = params.get('semester');
    return {
        q,
        status: status && ['aktif', 'selesai', 'belum_mulai'].includes(status) ? status : null,
        semester: semester || null,
    };
}

function writeUrlParams(q: string, status: CourseStatus | null, semester: string | null) {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (status) params.set('status', status);
    if (semester) params.set('semester', semester);
    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', url);
}

export default function LecturerCoursesIndex({ courses, analytics }: Props) {
    const navItems = useLecturerNav('courses');
    const [isLoading, setIsLoading] = useState(true);

    const initial = readUrlParams();
    const [searchQuery, setSearchQuery] = useState(initial.q);
    const [activeStatus, setActiveStatus] = useState<CourseStatus | null>(initial.status);
    const [activeSemester, setActiveSemester] = useState<string | null>(initial.semester);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isProcessing, setIsProcessing] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const debouncedQuery = useDebounce(searchQuery, 250);

    useEffect(() => {
        setIsLoading(false);
    }, []);

    useEffect(() => {
        writeUrlParams(debouncedQuery, activeStatus, activeSemester);
    }, [debouncedQuery, activeStatus, activeSemester]);

    const filteredCourses = useMemo(() => {
        let result = courses;

        if (debouncedQuery.trim()) {
            const q = debouncedQuery.toLowerCase();
            result = result.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.code.toLowerCase().includes(q),
            );
        }

        if (activeStatus) {
            const effectiveStatus = (c: Course): CourseStatus => c.status || 'belum_mulai';
            result = result.filter((c) => effectiveStatus(c) === activeStatus);
        }

        if (activeSemester) {
            result = result.filter((c) => {
                const key = c.semester && c.academic_year
                    ? `${c.semester} ${c.academic_year}`
                    : null;
                return key === activeSemester;
            });
        }

        return result;
    }, [courses, debouncedQuery, activeStatus, activeSemester]);

    const toggleSelection = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const selectAll = useCallback(() => {
        setSelectedIds(new Set(filteredCourses.map((c) => c.id)));
    }, [filteredCourses]);

    const deselectAll = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const handleBulkArchiveClick = useCallback(() => {
        if (selectedIds.size === 0) return;
        setShowConfirmDialog(true);
    }, [selectedIds]);

    const handleBulkArchiveConfirm = useCallback(async () => {
        setIsProcessing(true);
        const loadingToast = toast.loading(`Mengarsipkan ${selectedIds.size} kelas...`);

        try {
            const response = await fetch('/lecturer/courses/bulk-archive', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ course_ids: Array.from(selectedIds) }),
            });

            const data = await response.json();
            toast.dismiss(loadingToast);

            if (response.ok) {
                toast.success(data.message);
                setSelectedIds(new Set());
                setShowConfirmDialog(false);
                router.reload({ only: ['courses', 'analytics'] });
            } else {
                toast.error(data.message || 'Gagal mengarsipkan kelas.');
            }
        } catch {
            toast.dismiss(loadingToast);
            toast.error('Terjadi kesalahan jaringan. Silakan coba lagi.');
        } finally {
            setIsProcessing(false);
        }
    }, [selectedIds]);

    const handleResetFilters = useCallback(() => {
        setActiveStatus(null);
        setActiveSemester(null);
        setSearchQuery('');
    }, []);

    const isSelectionMode = selectedIds.size > 0;

    return (
        <AppLayout title="Kelas Saya" navItems={navItems}>
            <Head title="Kelas Saya" />

            {isLoading ? (
                <CourseGridSkeleton count={6} />
            ) : (
                <div className="space-y-6">
                    <LiquidGlassCard intensity="light" className="p-6" lightMode={true}>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2
                                    className="text-2xl font-bold font-sans text-brand-dark"
                                >
                                    Kelas Saya
                                </h2>
                                <p className="mt-1 text-sm text-brand-muted-dark">Kelola kelas dan grup siswa Anda</p>
                            </div>
                            <PrimaryButton href={lecturer.courses.create.url()}>
                                <Plus className="h-4 w-4" />
                                Buat Kelas
                            </PrimaryButton>
                        </div>
                    </LiquidGlassCard>

                    <CoursesAnalyticsOverview analytics={analytics} />

                    <div className="space-y-3">
                        <CourseSearchBar value={searchQuery} onChange={setSearchQuery} />
                        <CourseFilters
                            activeStatus={activeStatus}
                            onStatusChange={setActiveStatus}
                            statusCounts={analytics.status_counts}
                            activeSemester={activeSemester}
                            onSemesterChange={setActiveSemester}
                            semesterCounts={analytics.semester_counts}
                            hasActiveFilters={!!activeStatus || !!activeSemester || !!searchQuery.trim()}
                            onResetFilters={handleResetFilters}
                        />
                    </div>

                    {filteredCourses.length === 0 && (debouncedQuery.trim() || activeStatus || activeSemester) ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
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
                                    <BookOpen className="h-8 w-8 text-brand-primary" />
                                </div>
                                <h3
                                    className="text-lg font-semibold font-sans text-brand-dark"
                                >
                                    Tidak ada kelas ditemukan
                                </h3>
                                <p className="mt-2 max-w-sm text-sm text-brand-muted-dark">
                                    Coba ubah kata kunci atau filter yang digunakan.
                                </p>
                                <button
                                    onClick={handleResetFilters}
                                    className="mt-4 text-sm font-medium text-brand-primary transition-colors"
                                >
                                    Reset Filter
                                </button>
                            </LiquidGlassCard>
                        </motion.div>
                    ) : courses.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
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
                                    <BookOpen className="h-8 w-8 text-brand-primary" />
                                </div>
                                <h3
                                    className="text-lg font-semibold font-sans text-brand-dark"
                                >
                                    Belum ada kelas
                                </h3>
                                <p className="mt-2 max-w-sm text-sm text-brand-muted-dark">
                                    Buat kelas pertama Anda untuk mulai mengelola pembelajaran dan kolaborasi mahasiswa.
                                </p>
                                <div className="mt-6">
                                    <PrimaryButton href={lecturer.courses.create.url()}>
                                        <Plus className="h-4 w-4" />
                                        Buat Kelas
                                    </PrimaryButton>
                                </div>
                            </LiquidGlassCard>
                        </motion.div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-brand-muted-dark">
                                    {filteredCourses.length} kelas
                                    {(debouncedQuery.trim() || activeStatus || activeSemester)
                                        ? ` (difilter dari ${courses.length})`
                                        : ''}
                                </p>
                                <button
                                    onClick={isSelectionMode ? deselectAll : selectAll}
                                    className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
                                    style={{ color: '#88161c' }}
                                >
                                    {isSelectionMode ? (
                                        <>
                                            <CheckSquare className="h-3.5 w-3.5" />
                                            Batal Pilih
                                        </>
                                    ) : (
                                        <>
                                            <Square className="h-3.5 w-3.5" />
                                            Pilih Semua
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredCourses.map((course, index) => {
                                    const isSelected = selectedIds.has(course.id);

                                    return (
                                        <motion.div
                                            key={course.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.04, duration: 0.4 }}
                                            className="relative"
                                        >
                                            {isSelectionMode && (
                                                <div className="absolute left-3 top-3 z-10">
                                                    <CustomCheckbox
                                                        checked={isSelected}
                                                        onChange={() => toggleSelection(course.id)}
                                                        lightMode={true}
                                                    />
                                                </div>
                                            )}
                                            <Link
                                                href={lecturer.courses.show.url({ course: course.id })}
                                                className="group block"
                                                onClick={(e) => {
                                                    if (isSelectionMode) {
                                                        e.preventDefault();
                                                        toggleSelection(course.id);
                                                    }
                                                }}
                                            >
                                                <LiquidGlassCard
                                                    intensity="light"
                                                    className={`p-6 transition-all duration-300 group-hover:shadow-lg ${
                                                        isSelected ? 'ring-2 ring-[#88161c]/30' : ''
                                                    } ${isSelectionMode ? 'pl-11' : ''}`}
                                                    lightMode={true}
                                                >
                                                    <div className="mb-4 flex items-center justify-between gap-3">
                                                        <span
                                                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                                            style={{
                                                                background: 'rgba(136,22,28,0.08)',
                                                                color: '#88161c',
                                                                border: '1px solid rgba(136,22,28,0.15)',
                                                            }}
                                                        >
                                                        {course.code}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-xs text-brand-muted-dark">
                                                        <Users className="h-3.5 w-3.5" />
                                                        {course.students_count || 0} siswa
                                                    </span>
                                                </div>

                                                <h3
                                                    className="text-lg font-semibold font-sans text-brand-dark"
                                                >
                                                    {course.name}
                                                </h3>

                                                {course.semester && course.academic_year && (
                                                    <p className="mt-1 text-xs text-brand-muted-dark">
                                                        {course.semester} {course.academic_year}
                                                    </p>
                                                )}

                                                <p className="mt-2 text-sm text-brand-muted-dark">
                                                    Dosen: {course.owner?.name || 'Tidak Diketahui'}
                                                </p>
                                                <div className="mt-4 flex items-center justify-between gap-3">
                                                    <p className="text-sm text-brand-muted-dark">{course.groups_count || 0} grup</p>
                                                        <div className="flex items-center text-sm font-medium" style={{ color: '#88161c' }}>
                                                            Lihat Detail
                                                            <svg
                                                                className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M9 5l7 7-7 7"
                                                                />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </LiquidGlassCard>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            )}

            <BulkActionBar
                selectedCount={selectedIds.size}
                totalCount={filteredCourses.length}
                onSelectAll={selectAll}
                onDeselectAll={deselectAll}
                onBulkArchive={handleBulkArchiveClick}
                isProcessing={isProcessing}
            />

            <ConfirmDialog
                open={showConfirmDialog}
                title="Arsipkan Kelas"
                message={`Anda akan mengarsipkan ${selectedIds.size} kelas. Kelas yang diarsipkan akan berstatus "Selesai".`}
                confirmLabel="Arsipkan"
                variant="danger"
                isProcessing={isProcessing}
                onConfirm={handleBulkArchiveConfirm}
                onCancel={() => setShowConfirmDialog(false)}
            />
        </AppLayout>
    );
}
