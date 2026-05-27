import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    ChevronRight,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import {
    BenchmarkToggle,
    DateRangePicker,
    InteractiveTrendChart,
    type MetricOption,
    SectionExportMenu,
    ShareLinkGenerator,
    StudentBreakdownList,
    IndividualStudentAnalytics,
} from '@/components/analytics';
import type { DateRange } from '@/components/analytics';
import { LiquidGlassCard, OrganicBlob } from '@/components/Welcome/utils/helpers';
import { useLecturerNav } from '@/components/navigation/lecturer-nav';
import AppLayout from '@/layouts/app-layout';
import { Course } from '@/types';

interface TrendDataPoint {
    date: string;
    [key: string]: string | number;
}

interface AnalyticsSummary {
    totalGroups: number;
    averageQualityScore: number | null;
    totalMessages: number;
    groupsNeedingAttention: number;
}

interface AnalyticsData {
    summary: AnalyticsSummary;
    groups: Array<{ id: string; name: string; qualityScore: number | null; memberCount: number }>;
    trends: TrendDataPoint[] | null;
}

interface Props {
    course: Course;
    analytics: AnalyticsData;
    socketUrl?: string;
}

const headingStyle = { color: 'rgb(var(--color-brand-dark))' } as const;
const bodyTextClass = 'text-sm text-brand-muted-dark font-sans';

const TREND_METRICS: MetricOption[] = [
    { value: 'quality_score', label: 'Skor Kualitas', color: 'rgb(var(--color-brand-primary))' },
    { value: 'hot_percentage', label: 'HOT %', color: '#334155' },
    { value: 'engagement', label: 'Engagement', color: '#166534' },
    { value: 'lexical_variety', label: 'Lexical Variety', color: '#92400e' },
];

const getQualityColor = (score: number | null) => {
    if (score === null) return '#9CA3AF';
    if (score >= 70) return '#166534';
    if (score >= 50) return '#92400e';
    return '#b91c1c';
};

const getQualityLabel = (score: number | null) => {
    if (score === null) return 'Belum Ada Data';
    if (score >= 70) return 'Baik';
    if (score >= 50) return 'Perlu Perhatian';
    return 'Butuh Intervensi';
};

export default function AnalyticsDetail({ course, analytics }: Props) {
    useLecturerNav('analytics');

    const [dateRange, setDateRange] = useState<DateRange>({ startDate: '', endDate: '' });
    const [preset, setPreset] = useState<string>('');
    const [benchmarkEnabled, setBenchmarkEnabled] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    const safeAnalytics = useMemo(() => analytics ?? { summary: { totalGroups: 0, averageQualityScore: null, totalMessages: 0, groupsNeedingAttention: 0 }, groups: [], trends: null }, [analytics]);
    const summary = safeAnalytics.summary;

    const handleDateChange = useCallback((range: DateRange, newPreset?: string) => {
        setDateRange(range);
        setPreset(newPreset ?? '');
    }, []);

    const handleBrushChange = useCallback((_startIndex: number, _endIndex: number) => {}, []);

    const statCards = [
        {
            icon: TrendingUp,
            label: 'Rata-rata Skor',
            value: summary.averageQualityScore !== null ? summary.averageQualityScore.toFixed(1) : 'N/A',
            color: getQualityColor(summary.averageQualityScore),
            detail: getQualityLabel(summary.averageQualityScore),
        },
        {
            icon: Users,
            label: 'Total Grup',
            value: summary.totalGroups,
            color: '#334155',
            detail: 'Grup diskusi aktif',
        },
        {
            icon: BarChart3,
            label: 'Total Pesan',
            value: summary.totalMessages.toLocaleString(),
            color: '#166534',
            detail: 'Pesan terkirim',
        },
    ];

    return (
        <AppLayout>
            <Head title={`Analytics Detail - ${course.name}`} />

            <div className="relative min-h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #FAFBFC 0%, #F5F0EB 50%, #FFF8F5 100%)' }}>
                <OrganicBlob className="absolute -right-32 -top-32 h-96 w-96 opacity-30" color="rgba(136,22,28,0.08)" />
                <OrganicBlob className="absolute -bottom-24 -left-24 h-72 w-72 opacity-20" color="rgba(71,85,105,0.06)" />

                <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6">
                    <nav className="mb-6 flex items-center gap-1.5 text-sm text-[#9CA3AF]">
                        <Link href="/lecturer/courses" className="transition-colors hover:text-brand-dark">
                            Kelas
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <Link href={`/lecturer/courses/${course.id}`} className="transition-colors hover:text-brand-dark">
                            {course.code}
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="font-medium text-brand-dark">Analytics Detail</span>
                    </nav>

                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <span className="mb-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ background: 'rgba(136,22,28,0.08)', color: '#88161c', border: '1px solid rgba(136,22,28,0.15)' }}>
                                    Analytics Detail
                                </span>
                                <h1 className="mt-2 text-2xl font-bold sm:text-3xl" style={headingStyle}>
                                    {course.code} — {course.name}
                                </h1>
                                <p className={`mt-2 ${bodyTextClass}`}>
                                    Analisis mendalam performa diskusi dan engagement mahasiswa.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <DateRangePicker value={dateRange} preset={preset} onChange={handleDateChange} />
                                <SectionExportMenu
                                    courseId={course.id}
                                    section="overview"
                                    startDate={dateRange.startDate}
                                    endDate={dateRange.endDate}
                                    preset={preset}
                                />
                                <ShareLinkGenerator
                                    courseId={course.id}
                                    section="overview"
                                    startDate={dateRange.startDate}
                                    endDate={dateRange.endDate}
                                />
                            </div>
                        </div>
                    </motion.div>

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {statCards.map((card, i) => (
                            <motion.div
                                key={card.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.08 * i }}
                            >
                                <LiquidGlassCard intensity="light" className="p-4" lightMode>
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${card.color}12` }}>
                                            <card.icon className="h-4 w-4" style={{ color: card.color }} />
                                        </div>
                                        <span className="text-xs text-brand-muted-dark">{card.label}</span>
                                    </div>
                                    <p className="mt-3 text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
                                    <p className="mt-0.5 text-xs text-[#9CA3AF]">{card.detail}</p>
                                </LiquidGlassCard>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-6">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-base font-semibold" style={headingStyle}>Trend Performa</h2>
                            <BenchmarkToggle
                                courseId={course.id}
                                startDate={dateRange.startDate}
                                endDate={dateRange.endDate}
                                preset={preset}
                                enabled={benchmarkEnabled}
                                onToggle={setBenchmarkEnabled}
                            />
                        </div>
                        {safeAnalytics.trends && safeAnalytics.trends.length > 0 ? (
                            <InteractiveTrendChart
                                data={safeAnalytics.trends}
                                metrics={TREND_METRICS}
                                title="Trend per Metrik"
                                height={350}
                                showBenchmark={benchmarkEnabled}
                                onBrushChange={handleBrushChange}
                            />
                        ) : (
                            <div
                                className="flex h-48 items-center justify-center rounded-2xl"
                                style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.65)' }}
                            >
                                <p className="text-sm text-[#9CA3AF]">Belum ada data trend. Data akan muncul setelah ada aktivitas diskusi.</p>
                            </div>
                        )}
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-6">
                        {selectedStudentId ? (
                            <IndividualStudentAnalytics
                                courseId={course.id}
                                studentId={selectedStudentId}
                                onBack={() => setSelectedStudentId(null)}
                                startDate={dateRange.startDate}
                                endDate={dateRange.endDate}
                                preset={preset}
                            />
                        ) : (
                            <StudentBreakdownList
                                courseId={course.id}
                                startDate={dateRange.startDate}
                                endDate={dateRange.endDate}
                                preset={preset}
                                onSelectStudent={setSelectedStudentId}
                            />
                        )}
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}
