import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertTriangle, BarChart3, Users } from 'lucide-react';

import { useLecturerNav } from '@/components/navigation/lecturer-nav';
import { LiquidGlassCard, OrganicBlob } from '@/components/Welcome/utils/helpers';
import AppLayout from '@/layouts/app-layout';
import lecturer from '@/routes/lecturer';

interface CourseOverview {
    courseId: string;
    courseName: string;
    courseCode: string;
    studentsCount: number;
    groupsCount: number;
    avgQualityScore: number | null;
    needsAttention: boolean;
    lastActivity: string | null;
}

interface Props {
    courses: CourseOverview[];
}

function QualityBadge({ score }: { score: number | null }) {
    if (score === null) {
        return (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                Belum ada data
            </span>
        );
    }
    const color = score >= 70 ? 'bg-green-100 text-green-700' : score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
            {score}/100
        </span>
    );
}

function formatLastActivity(lastActivity: string | null): string {
    if (!lastActivity) return 'Belum ada aktivitas';
    const diff = Date.now() - new Date(lastActivity).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hari ini';
    if (days === 1) return 'Kemarin';
    if (days < 7) return `${days} hari lalu`;
    if (days < 30) return `${Math.floor(days / 7)} minggu lalu`;
    return `${Math.floor(days / 30)} bulan lalu`;
}

export default function AnalyticsOverview({ courses }: Props) {
    const navItems = useLecturerNav('analytics-overview');

    return (
        <AppLayout title="Analitik" navItems={navItems}>
            <Head title="Ringkasan Analitik" />

            <div className="relative space-y-6">
                <OrganicBlob
                    size={400}
                    color="rgba(136,22,28,0.04)"
                    style={{ position: 'absolute', top: -100, right: -100, zIndex: 0 }}
                />

                <LiquidGlassCard intensity="light" className="p-6" lightMode={true}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-xl"
                                style={{ background: 'rgba(136,22,28,0.08)' }}
                            >
                                <BarChart3 className="h-5 w-5 text-brand-primary" />
                            </div>
                            <div>
                                <h2
                                    className="text-2xl font-bold font-sans text-brand-dark"
                                >
                                    Analitik
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {courses.length} kelas · ringkasan kualitas diskusi
                                </p>
                            </div>
                        </div>
                    </div>
                </LiquidGlassCard>

                {courses.length === 0 ? (
                    <LiquidGlassCard intensity="light" className="p-12 text-center" lightMode={true}>
                        <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                        <p className="text-gray-500">Belum ada kelas. Buat kelas terlebih dahulu untuk melihat analitik.</p>
                    </LiquidGlassCard>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course, i) => (
                            <motion.div
                                key={course.courseId}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Link href={lecturer.analytics.detail.url({ course: course.courseId })} className="group block">
                                    <LiquidGlassCard
                                        intensity="light"
                                        className="p-6 transition-all duration-300 group-hover:shadow-lg"
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
                                                {course.courseCode}
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-xs text-brand-muted-dark">
                                                <Users className="h-3.5 w-3.5" />
                                                {course.studentsCount} siswa
                                            </span>
                                        </div>

                                        <h3
                                            className="text-lg font-semibold font-sans text-brand-dark"
                                        >
                                            {course.courseName}
                                        </h3>

                                        <p className="mt-2 text-sm text-brand-muted-dark">
                                            Skor kualitas: <QualityBadge score={course.avgQualityScore} />
                                            {course.needsAttention && (
                                                <span className="ml-2 inline-flex items-center gap-1 text-red-600">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Perlu Perhatian
                                                </span>
                                            )}
                                        </p>

                                        <div className="mt-4 flex items-center justify-between gap-3">
                                            <p className="text-sm text-brand-muted-dark">{course.groupsCount} kelompok</p>
                                            <div className="flex items-center text-sm font-medium text-brand-primary">
                                                Lihat analitik
                                                <svg
                                                    className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </LiquidGlassCard>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
