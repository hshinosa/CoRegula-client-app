import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Calendar, TrendingUp, Tag as TagIcon } from 'lucide-react';
import type { ReflectionAnalytics, TagCount } from '@/types';
import { FrequencyChart } from './FrequencyChart';
import { LengthChart } from './LengthChart';
import { StreakIndicator } from './StreakIndicator';

type Period = 'week' | 'month' | 'year';

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
    { value: 'week', label: 'Minggu' },
    { value: 'month', label: 'Bulan' },
    { value: 'year', label: 'Tahun' },
];

interface AnalyticsPanelProps {
    className?: string;
}

export function AnalyticsPanel({ className = '' }: AnalyticsPanelProps) {
    const [analytics, setAnalytics] = useState<ReflectionAnalytics | null>(null);
    const [period, setPeriod] = useState<Period>('month');
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/student/reflections/analytics?period=${period}`, {
                headers: { 'Accept': 'application/json' },
            });
            if (response.ok) {
                const data = await response.json();
                setAnalytics(data.data);
            }
        } catch (_) {
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    return (
        <div className={`space-y-5 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-brand-primary" />
                    <h3 className="text-lg font-semibold text-brand-dark dark:text-gray-100">
                        Analitik Refleksi
                    </h3>
                </div>
                <div className="flex gap-1">
                    {PERIOD_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setPeriod(opt.value)}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                            style={{
                                background: period === opt.value ? 'rgba(136,22,28,0.12)' : 'transparent',
                                color: period === opt.value ? '#88161c' : '#6B7280',
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
                </div>
            ) : !analytics ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BarChart3 className="mb-2 h-8 w-8 text-brand-muted-dark" />
                    <p className="text-sm text-brand-muted-dark">Gagal memuat analitik</p>
                </div>
            ) : (
                <>
                    <motion.div
                        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <MetricCard
                            label="Total Refleksi"
                            value={analytics.totalReflections}
                            icon={<Calendar className="h-4 w-4" />}
                            narrative={`${period === 'week' ? 'minggu' : period === 'year' ? 'tahun' : 'bulan'} ini`}
                        />
                        <MetricCard
                            label="Streak Saat Ini"
                            value={analytics.streak.current}
                            unit="hari"
                            icon={<TrendingUp className="h-4 w-4" />}
                            narrative={analytics.streak.hasReflectionToday ? 'sudah menulis hari ini' : 'belum menulis hari ini'}
                        />
                        <MetricCard
                            label="Streak Terbaik"
                            value={analytics.streak.longest}
                            unit="hari"
                            icon={<TrendingUp className="h-4 w-4" />}
                            narrative="rekor pribadi"
                        />
                        <MetricCard
                            label="Tag Terpopuler"
                            value={analytics.topTags.length > 0 ? analytics.topTags[0].tag : '-'}
                            icon={<TagIcon className="h-4 w-4" />}
                            narrative={analytics.topTags.length > 0 ? `digunakan ${analytics.topTags[0].count}x` : 'belum ada tag'}
                            isText
                        />
                    </motion.div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div
                            className="rounded-xl p-4"
                            style={{
                                background: 'rgba(255,255,255,0.7)',
                                border: '1px solid rgba(255,255,255,0.5)',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <FrequencyChart data={analytics.frequency} period={period} />
                        </div>
                        <div
                            className="rounded-xl p-4"
                            style={{
                                background: 'rgba(255,255,255,0.7)',
                                border: '1px solid rgba(255,255,255,0.5)',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <LengthChart data={analytics.averageLength} period={period} />
                        </div>
                    </div>

                    <div
                        className="rounded-xl p-4"
                        style={{
                            background: 'rgba(255,255,255,0.7)',
                            border: '1px solid rgba(255,255,255,0.5)',
                            backdropFilter: 'blur(8px)',
                        }}
                    >
                        <StreakIndicator streak={analytics.streak} />
                    </div>

                    {analytics.topTags.length > 0 && (
                        <div
                            className="rounded-xl p-4"
                            style={{
                                background: 'rgba(255,255,255,0.7)',
                                border: '1px solid rgba(255,255,255,0.5)',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <p className="mb-2 text-xs font-medium text-brand-dark">Tag Terpopuler</p>
                            <div className="flex flex-wrap gap-2">
                                {analytics.topTags.map((tag: TagCount) => (
                                    <span
                                        key={tag.tag}
                                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                                        style={{
                                            background: getTagColor(tag.count, analytics.topTags[0]?.count ?? 1),
                                            color: '#4A4A4A',
                                        }}
                                    >
                                        {tag.tag}
                                        <span className="text-[10px] opacity-70">{tag.count}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function MetricCard({
    label,
    value,
    unit,
    icon,
    narrative,
    isText = false,
}: {
    label: string;
    value: number | string;
    unit?: string;
    icon: React.ReactNode;
    narrative: string;
    isText?: boolean;
}) {
    return (
        <div
            className="rounded-xl p-3"
            style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.5)',
                backdropFilter: 'blur(8px)',
            }}
        >
            <div className="mb-1 flex items-center gap-1.5 text-brand-muted-dark">
                {icon}
                <span className="text-[10px] font-medium">{label}</span>
            </div>
            <p
                className={`font-bold ${isText ? 'text-sm' : 'text-xl'} text-brand-dark`}
            >
                {value}{unit ? ` ${unit}` : ''}
            </p>
            <p className="mt-0.5 text-[10px] text-brand-muted-dark">{narrative}</p>
        </div>
    );
}

function getTagColor(count: number, maxCount: number): string {
    const intensity = Math.min(count / maxCount, 1);
    const alpha = 0.05 + intensity * 0.15;
    return `rgba(136,22,28,${alpha})`;
}
