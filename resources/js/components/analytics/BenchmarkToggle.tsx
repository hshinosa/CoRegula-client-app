import { useCallback, useEffect, useState } from 'react';
import { BarChart3, ToggleLeft, ToggleRight } from 'lucide-react';

interface BenchmarkData {
    departmentAverage: number | null;
    sampleSize: number;
    percentileRank: number | null;
    metric: string;
}

interface BenchmarkToggleProps {
    courseId: string;
    metric?: string;
    startDate?: string;
    endDate?: string;
    preset?: string;
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    onBenchmarkLoaded?: (data: BenchmarkData) => void;
    className?: string;
}

export default function BenchmarkToggle({
    courseId,
    metric = 'quality_score',
    startDate,
    endDate,
    preset,
    enabled,
    onToggle,
    onBenchmarkLoaded,
    className = '',
}: BenchmarkToggleProps) {
    const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchBenchmark = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ metric });
            if (startDate) params.set('start_date', startDate);
            if (endDate) params.set('end_date', endDate);
            if (preset) params.set('preset', preset);

            const res = await fetch(`/lecturer/courses/${courseId}/analytics/benchmark?${params.toString()}`);
            const json = await res.json();
            const data: BenchmarkData = json.data ?? {
                departmentAverage: null,
                sampleSize: 0,
                percentileRank: null,
                metric,
            };
            setBenchmark(data);
            onBenchmarkLoaded?.(data);
        } catch {
            setBenchmark(null);
        } finally {
            setLoading(false);
        }
    }, [courseId, metric, startDate, endDate, preset, onBenchmarkLoaded]);

    useEffect(() => {
        if (enabled && !benchmark) {
            fetchBenchmark();
        }
    }, [enabled, benchmark, fetchBenchmark]);

    return (
        <div
            className={`inline-flex items-center gap-3 rounded-xl px-3 py-2 ${className}`}
            style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.65)' }}
        >
            <button
                type="button"
                onClick={() => onToggle(!enabled)}
                className="flex items-center gap-2"
            >
                {enabled ? (
                    <ToggleRight className="h-5 w-5 text-brand-primary" />
                ) : (
                    <ToggleLeft className="h-5 w-5 text-[#9CA3AF]" />
                )}
                <span className="text-xs font-medium" style={{ color: enabled ? '#4A4A4A' : '#9CA3AF' }}>
                    Benchmark
                </span>
            </button>

            {enabled && benchmark && (
                <div className="flex items-center gap-3 border-l border-[#E5E7EB] pl-3">
                    {benchmark.departmentAverage !== null && (
                        <div className="flex items-center gap-1.5">
                            <BarChart3 className="h-3.5 w-3.5 text-[#D97706]" />
                            <span className="text-xs text-brand-dark">
                                Rata-rata Dept: <span className="font-semibold">{benchmark.departmentAverage.toFixed(1)}</span>
                            </span>
                        </div>
                    )}
                    {benchmark.sampleSize < 10 && benchmark.sampleSize > 0 && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                            Sampel kecil ({benchmark.sampleSize})
                        </span>
                    )}
                    {benchmark.percentileRank !== null && (
                        <span className="text-xs text-brand-muted-dark">
                            Persentil: {benchmark.percentileRank}
                        </span>
                    )}
                </div>
            )}

            {enabled && loading && (
                <span className="text-xs text-[#9CA3AF]">Memuat benchmark...</span>
            )}
        </div>
    );
}
