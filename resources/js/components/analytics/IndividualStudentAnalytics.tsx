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
                <div className="text-sm text-gray-600">Memuat data mahasiswa...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center gap-3 py-16">
                <p className="text-sm text-gray-600">Data mahasiswa tidak ditemukan</p>
                <button
                    type="button"
                    onClick={onBack}
                    className="text-xs font-medium text-brand-primary hover:underline"
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
            explanation:
                'Skor Kualitas adalah ringkasan mutu kontribusi mahasiswa secara keseluruhan. Angka ini tidak berdiri sendiri: penilaiannya merangkum beberapa sinyal analitik yang lebih luas, terutama HOT Thinking, kualitas keterlibatan kognitif, dan keragaman bahasa. Jadi meskipun di tampilan ringkas ini metrik utama yang ditonjolkan hanya beberapa, skor ini tetap merefleksikan penilaian yang lebih kaya daripada sekadar jumlah pesan atau satu indikator tunggal.',
        },
        {
            icon: Zap,
            label: 'HOT Thinking',
            value: `${data.hotPercentage.toFixed(1)}%`,
            color: '#334155',
            detail: 'Higher-Order Thinking',
            explanation:
                'HOT Thinking menunjukkan seberapa sering pesan mahasiswa berisi analisis, evaluasi, perbandingan, penyusunan argumen, atau pengembangan ide. Metrik ini adalah salah satu komponen penting dalam penilaian, tetapi bukan satu-satunya. Karena itu, HOT tinggi biasanya membantu Quality Score, namun tetap dibaca bersama kualitas engagement dan keragaman bahasa.',
        },
        {
            icon: MessageSquare,
            label: 'Total Pesan',
            value: data.messageCount,
            color: '#166534',
            detail: 'Pesan terkirim',
            explanation:
                'Total pesan menunjukkan volume kontribusi mahasiswa, bukan mutu diskusi secara langsung. Jumlah pesan yang tinggi bisa berarti aktif, tetapi belum tentu berkualitas jika isinya repetitif atau dangkal. Karena itu metrik ini dipakai sebagai konteks pendukung dan tetap perlu dibaca bersama HOT Thinking serta Skor Kualitas yang merangkum penilaian lebih luas.',
        },
    ];

    return (
        <div className="space-y-5">
            <div
                className="flex items-center gap-4 rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.65)' }}
            >
                <button
                    type="button"
                    onClick={onBack}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-white/70"
                    aria-label="Kembali"
                >
                    <ArrowLeft className="h-4 w-4 text-brand-muted-dark" />
                </button>
                <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{ background: getQualityColor(data.qualityScore) }}
                >
                    {data.student.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 className="text-base font-semibold text-[#1F2937]">{data.student.name}</h2>
                    <p className="text-sm text-brand-muted-dark">{data.student.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="rounded-2xl p-4"
                        style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.65)' }}
                    >
                        <div className="flex items-center gap-2">
                            <card.icon className="h-4 w-4" style={{ color: card.color }} />
                            <span className="text-xs text-brand-muted-dark">{card.label}</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold" style={{ color: card.color }}>
                            {card.value}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-600">{card.detail}</p>
                        <p className="mt-2 text-sm leading-6 text-brand-muted-dark">{card.explanation}</p>
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
                    >
                        Rekomendasi
                    </h3>
                    <ul className="space-y-2">
                        {data.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-brand-dark">
                                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-primary" />
                                {rec}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
