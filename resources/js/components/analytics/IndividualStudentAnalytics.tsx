import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, MessageSquare, TrendingUp, Zap } from 'lucide-react';
import InteractiveTrendChart, { type MetricOption, type TrendDataPoint } from './InteractiveTrendChart';

interface StudentDetailData {
    student: { id: string; name: string; email: string };
    qualityScore: number | null;
    hotPercentage: number;
    messageCount: number;
    engagementDistribution: Record<string, number>;
    trends: TrendDataPoint[];
    recommendations: string[];
}

interface IndividualStudentAnalyticsProps {
    courseId: string;
    studentId: string;
    onBack: () => void;
    startDate?: string;
    endDate?: string;
    preset?: string;
}

const METRIC_OPTIONS: MetricOption[] = [
    { value: 'quality_score', label: 'Skor Kualitas', color: '#88161c' },
    { value: 'hot_percentage', label: 'HOT %', color: '#334155' },
    { value: 'engagement', label: 'Engagement', color: '#166534' },
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

export default function IndividualStudentAnalytics({
    courseId,
    studentId,
    onBack,
    startDate,
    endDate,
    preset,
}: IndividualStudentAnalyticsProps) {
    const [data, setData] = useState<StudentDetailData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDetail = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (startDate) params.set('start_date', startDate);
            if (endDate) params.set('end_date', endDate);
            if (preset) params.set('preset', preset);

            const res = await fetch(
                `/lecturer/courses/${courseId}/analytics/students/${studentId}?${params.toString()}`,
            );
            const json = await res.json();
            setData(json.data ?? null);
        } catch {
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [courseId, studentId, startDate, endDate, preset]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-sm text-[#9CA3AF]">Memuat data mahasiswa...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center gap-3 py-16">
                <p className="text-sm text-[#9CA3AF]">Data mahasiswa tidak ditemukan</p>
                <button
                    type="button"
                    onClick={onBack}
                    className="text-xs font-medium text-[#88161c] hover:underline"
                >
                    Kembali
                </button>
            </div>
        );
    }

    const statCards = [
        {
            icon: TrendingUp,
            label: 'Quality Score',
            value: data.qualityScore !== null ? data.qualityScore.toFixed(1) : 'N/A',
            color: getQualityColor(data.qualityScore),
            detail: getQualityLabel(data.qualityScore),
        },
        {
            icon: Zap,
            label: 'HOT Thinking',
            value: `${data.hotPercentage.toFixed(1)}%`,
            color: '#334155',
            detail: 'Higher-Order Thinking',
        },
        {
            icon: MessageSquare,
            label: 'Total Pesan',
            value: data.messageCount,
            color: '#166534',
            detail: 'Pesan terkirim',
        },
    ];

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#F3F4F6]"
                >
                    <ArrowLeft className="h-4 w-4 text-[#6B7280]" />
                </button>
                <div>
                    <nav className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                        <button type="button" onClick={onBack} className="hover:text-[#4A4A4A] hover:underline">
                            Mahasiswa
                        </button>
                        <span>/</span>
                        <span className="text-[#4A4A4A]">{data.student.name}</span>
                    </nav>
                </div>
            </div>

            <div
                className="flex items-center gap-4 rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.65)' }}
            >
                <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{ background: getQualityColor(data.qualityScore) }}
                >
                    {data.student.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 className="text-base font-semibold text-[#1F2937]">{data.student.name}</h2>
                    <p className="text-sm text-[#6B7280]">{data.student.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="rounded-2xl p-4"
                        style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.65)' }}
                    >
                        <div className="flex items-center gap-2">
                            <card.icon className="h-4 w-4" style={{ color: card.color }} />
                            <span className="text-xs text-[#6B7280]">{card.label}</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold" style={{ color: card.color }}>
                            {card.value}
                        </p>
                        <p className="mt-0.5 text-xs text-[#9CA3AF]">{card.detail}</p>
                    </div>
                ))}
            </div>

            {data.trends && data.trends.length > 0 && (
                <InteractiveTrendChart
                    data={data.trends}
                    metrics={METRIC_OPTIONS}
                    title="Trend Perkembangan"
                    height={280}
                />
            )}

            {data.recommendations && data.recommendations.length > 0 && (
                <div
                    className="rounded-2xl p-4"
                    style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.65)' }}
                >
                    <h3
                        className="mb-3 text-sm font-semibold"
                        style={{ color: '#4A4A4A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        Rekomendasi
                    </h3>
                    <ul className="space-y-2">
                        {data.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-[#4A4A4A]">
                                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#88161c]" />
                                {rec}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
