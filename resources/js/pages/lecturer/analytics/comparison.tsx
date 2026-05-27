import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { BarChart3, GitCompareArrows } from 'lucide-react';
import { useCallback, useState } from 'react';

import {
    ComparisonChart,
    ComparisonSelector,
    DateRangePicker,
    type ComparisonItem,
    type SelectableCourse,
} from '@/components/analytics';
import { LiquidGlassCard, OrganicBlob } from '@/components/Welcome/utils/helpers';
import { useLecturerNav } from '@/components/navigation/lecturer-nav';
import AppLayout from '@/layouts/app-layout';
import lecturer from '@/routes/lecturer';

interface ComparisonCourseData {
    id: string;
    name: string;
    code: string;
    metrics: Record<string, number>;
}

interface FiltersState {
    startDate?: string;
    endDate?: string;
    preset?: string;
}

interface Props {
    comparisonData: ComparisonCourseData[];
    allCourses?: SelectableCourse[];
    selectedCourses: string[];
    filters?: FiltersState;
}

const COMPARISON_COLORS = ['#88161c', '#2563eb', '#16a34a'];

const METRIC_LABELS: Record<string, string> = {
    qualityScore: 'Skor Kualitas',
    engagement: 'Engagement',
    completion: 'Completion',
    attendance: 'Attendance',
    messages: 'Total Pesan',
    activeGroups: 'Grup Aktif',
};

export default function AnalyticsComparison({ comparisonData, allCourses = [], selectedCourses, filters }: Props) {
    const navItems = useLecturerNav('analytics-overview');

    const [selected, setSelected] = useState<string[]>(selectedCourses);
    const [activePreset, setActivePreset] = useState<string | undefined>(filters?.preset);
    const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | undefined>(
        filters?.startDate && filters?.endDate
            ? { startDate: filters.startDate, endDate: filters.endDate }
            : undefined,
    );

    const handleDateChange = useCallback(
        (range: { startDate: string; endDate: string }, preset?: string) => {
            setDateRange(range);
            setActivePreset(preset);
        },
        [],
    );

    const handleSelectionChange = useCallback((newSelected: string[]) => {
        setSelected(newSelected);
    }, []);

    const handleCompare = useCallback(() => {
        if (selected.length < 2) return;

        const params: Record<string, string | string[]> = { course_ids: selected };
        if (activePreset) {
            params.preset = activePreset;
        } else if (dateRange) {
            params.start_date = dateRange.startDate;
            params.end_date = dateRange.endDate;
        }

        router.get(lecturer.analytics.comparison.url(), params as Record<string, string>, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [selected, activePreset, dateRange]);

    const comparisonItems: ComparisonItem[] = comparisonData.map((item, i) => ({
        id: item.id,
        label: `${item.code} - ${item.name}`,
        color: COMPARISON_COLORS[i] ?? '#6B7280',
        data: item.metrics,
    }));

    const metrics = comparisonData.length > 0 ? Object.keys(comparisonData[0].metrics) : [];

    return (
        <AppLayout title="Perbandingan Analytics" navItems={navItems}>
            <Head title="Perbandingan Analytics" />

            <div className="relative">
                <OrganicBlob className="top-0 -left-20" delay={0} color="rgba(136, 22, 28, 0.04)" size={320} />

                <div className="relative space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <LiquidGlassCard intensity="medium" className="p-6 sm:p-8" lightMode={true}>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex items-start gap-4">
                                    <div
                                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                                        style={{ background: 'rgba(136,22,28,0.08)', border: '1px solid rgba(136,22,28,0.12)' }}
                                    >
                                        <GitCompareArrows className="h-6 w-6 text-brand-primary" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold font-sans text-brand-dark">
                                            Perbandingan Analytics
                                        </h1>
                                        <p className="mt-1 text-sm text-brand-muted-dark">
                                            Bandingkan metrik antar kelas (maks 3)
                                        </p>
                                    </div>
                                </div>
                                <DateRangePicker
                                    value={dateRange}
                                    preset={activePreset}
                                    onChange={handleDateChange}
                                />
                            </div>
                        </LiquidGlassCard>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <LiquidGlassCard intensity="light" className="p-6" lightMode={true}>
                            <h2 className="mb-3 text-sm font-semibold font-sans text-brand-dark">Pilih Kelas untuk Dibandingkan</h2>
                            <ComparisonSelector
                                courses={allCourses}
                                selected={selected}
                                onChange={handleSelectionChange}
                                maxItems={3}
                            />
                            <button
                                type="button"
                                onClick={handleCompare}
                                disabled={selected.length < 2}
                                className="mt-4 rounded-xl bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-40"
                            >
                                Bandingkan ({selected.length}/3)
                            </button>
                        </LiquidGlassCard>
                    </motion.div>

                    {comparisonData.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <LiquidGlassCard intensity="light" className="p-6" lightMode={true}>
                                <div className="mb-4 flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-brand-primary" />
                                    <h2 className="text-lg font-semibold font-sans text-brand-dark">
                                        Hasil Perbandingan
                                    </h2>
                                </div>
                                <ComparisonChart
                                    items={comparisonItems}
                                    metrics={metrics}
                                    metricLabels={METRIC_LABELS}
                                    title="Metrik per Kelas"
                                    height={350}
                                />
                            </LiquidGlassCard>
                        </motion.div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
