import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    Brush,
    CartesianGrid,
    Legend,
    Line,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { METRIC_LABEL_EXPLANATIONS, QUALITY_METRIC_EXPLANATIONS } from '@/lib/analytics-metric-explanations';
import { Info } from 'lucide-react';


export interface TrendDataPoint {
    date: string;
    [key: string]: string | number;
}

export interface MetricOption {
    value: string;
    label: string;
    color: string;
}

interface BenchmarkData {
    departmentAverage: number | null;
    sampleSize: number;
    metric: string;
}

interface InteractiveTrendChartProps {
    data: TrendDataPoint[];
    metrics: MetricOption[];
    title?: string;
    height?: number;
    chartType?: 'line' | 'bar';
    benchmark?: BenchmarkData | null;
    showBenchmark?: boolean;
    onBrushChange?: (startIndex: number, endIndex: number) => void;
    yAxisLabel?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
        <div
            className="rounded-xl border px-3 py-2 shadow-lg"
            style={{
                background: 'rgba(255,255,255,0.95)',
                borderColor: 'rgba(0,0,0,0.08)',
                backdropFilter: 'blur(8px)',
            }}
        >
            <p className="mb-1.5 text-xs font-medium text-brand-muted-dark">{label}</p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: entry.color }}
                    />
                    <span className="text-brand-dark">{entry.name}:</span>
                    <span className="font-semibold text-[#1F2937]">
                        {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default function InteractiveTrendChart({
    data,
    metrics,
    title,
    height = 350,
    chartType = 'line',
    benchmark,
    showBenchmark = false,
    onBrushChange,
    yAxisLabel,
}: InteractiveTrendChartProps) {
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>(
        metrics.map((m) => m.value),
    );

    const [activeChartType, setActiveChartType] = useState<'line' | 'bar'>(chartType);
    const [showMetricHint, setShowMetricHint] = useState(false);
    const metricHintRef = useRef<HTMLDivElement>(null);

    const toggleMetric = useCallback(
        (value: string) => {
            setSelectedMetrics((prev) => {
                if (prev.includes(value)) {
                    return prev.length > 1 ? prev.filter((m) => m !== value) : prev;
                }
                return [...prev, value];
            });
        },
        [],
    );

    const filteredMetrics = useMemo(
        () => metrics.filter((m) => selectedMetrics.includes(m.value)),
        [metrics, selectedMetrics],
    );

    const benchmarkValue = useMemo(() => {
        if (!showBenchmark || !benchmark?.departmentAverage) return null;
        return benchmark.departmentAverage;
    }, [showBenchmark, benchmark]);

    const handleBrushChange = useCallback(
        (range: any) => {
            if (range && onBrushChange) {
                onBrushChange(range.startIndex, range.endIndex);
            }
        },
        [onBrushChange],
    );
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (metricHintRef.current && !metricHintRef.current.contains(event.target as Node)) {
                setShowMetricHint(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!data || data.length === 0) {
        return (
            <div
                className="flex items-center justify-center rounded-2xl p-8"
                style={{
                    background: 'rgba(255,255,255,0.55)',
                    border: '1px solid rgba(255,255,255,0.65)',
                    height,
                }}
            >
                <p className="text-sm text-brand-muted-dark">Belum ada data trend</p>
            </div>
        );
    }

    const Chart = activeChartType === 'bar' ? BarChart : AreaChart;

    return (
        <div
            className="rounded-2xl p-4"
            style={{
                background: 'rgba(255,255,255,0.55)',
                border: '1px solid rgba(255,255,255,0.65)',
            }}
        >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    {title && (
                        <h3
                            className="text-sm font-semibold"
                        >
                            {title}
                        </h3>
                    )}
                    {benchmark?.sampleSize !== undefined && showBenchmark && (
                        <p className="mt-0.5 text-xs text-gray-600">
                            Benchmark: {benchmark.sampleSize} kelompok
                            {benchmark.sampleSize < 10 && (
                                <span className="ml-1 text-amber-500">(sampel kecil)</span>
                            )}
                        </p>
                    )}
                </div>

                <div className="relative flex items-center gap-2" ref={metricHintRef}>
                    <button
                        type="button"
                        onClick={() => setShowMetricHint((current) => !current)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors"
                        style={{
                            background: showMetricHint ? 'rgba(136,22,28,0.10)' : 'rgba(255,255,255,0.92)',
                            color: showMetricHint ? 'var(--color-brand-primary)' : '#6B7280',
                            borderColor: showMetricHint ? 'rgba(136,22,28,0.22)' : 'rgba(0,0,0,0.08)',
                        }}
                        aria-label="Tampilkan penjelasan metrik"
                        title="Penjelasan metrik"
                    >
                        <Info className="h-4 w-4" />
                    </button>
                    {showMetricHint ? (
                        <div
                            className="absolute right-full top-1/2 z-20 mr-3 w-[min(28rem,calc(100vw-4rem))] -translate-y-1/2 rounded-2xl border border-brand-primary/10 bg-white/96 p-4 shadow-2xl"
                            style={{ backdropFilter: 'blur(16px)' }}
                        >
                            <div className="grid gap-3 sm:grid-cols-2">
                                {metrics
                                    .filter((metric) => selectedMetrics.includes(metric.value))
                                    .map((metric) => {
                                        const explanation =
                                            metric.label === 'HOT %'
                                                ? QUALITY_METRIC_EXPLANATIONS['HOT Thinking']
                                                : metric.label === 'Skor Kualitas'
                                                  ? QUALITY_METRIC_EXPLANATIONS['Quality Score']
                                                  : metric.label === 'Engagement'
                                                    ? METRIC_LABEL_EXPLANATIONS.Engagement
                                                    : QUALITY_METRIC_EXPLANATIONS[metric.label] ?? `${metric.label} menunjukkan perubahan nilai metrik ini dari waktu ke waktu.`;

                                        return (
                                            <div key={`${metric.value}-explanation`}>
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: metric.color }} />
                                                    <p className="text-xs font-semibold" style={{ color: metric.color }}>{metric.label}</p>
                                                </div>
                                                <p className="mt-1 text-xs leading-5 text-brand-muted-dark">{explanation}</p>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    ) : null}
                    <div className="flex items-center gap-1 rounded-lg border border-brand-primary/10 bg-brand-primary/[0.04] p-0.5">
                        <button
                            type="button"
                            onClick={() => setActiveChartType('line')}
                            className="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors"
                            style={{
                                background: activeChartType === 'line' ? 'var(--color-brand-primary)' : 'transparent',
                                color: activeChartType === 'line' ? '#fff' : '#6B7280',
                                boxShadow: activeChartType === 'line' ? '0 8px 20px rgba(136,22,28,0.18)' : 'none',
                            }}
                        >
                            Line
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveChartType('bar')}
                            className="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors"
                            style={{
                                background: activeChartType === 'bar' ? 'var(--color-brand-primary)' : 'transparent',
                                color: activeChartType === 'bar' ? '#fff' : '#6B7280',
                                boxShadow: activeChartType === 'bar' ? '0 8px 20px rgba(136,22,28,0.18)' : 'none',
                            }}
                        >
                            Bar
                        </button>
                    </div>
                </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
                {metrics.map((metric) => {
                    const isActive = selectedMetrics.includes(metric.value);
                    return (
                        <button
                            key={metric.value}
                            type="button"
                            onClick={() => toggleMetric(metric.value)}
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all"
                            style={{
                                background: isActive
                                    ? `${metric.color}18`
                                    : 'rgba(0,0,0,0.03)',
                                color: isActive ? metric.color : '#9CA3AF',
                                border: `1px solid ${isActive ? `${metric.color}4D` : 'rgba(0,0,0,0.06)'}`,
                                boxShadow: isActive ? `0 6px 16px ${metric.color}1A` : 'none',
                            }}
                        >
                            <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ background: isActive ? metric.color : '#D1D5DB' }}
                            />
                            {metric.label}
                        </button>
                    );
                })}
            </div>

            

            <ResponsiveContainer width="100%" height={height}>
                <Chart data={data} margin={{ top: 5, right: 20, bottom: 30, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        tickLine={false}
                        axisLine={false}
                        label={
                            yAxisLabel
                                ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9CA3AF' } }
                                : undefined
                        }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                        iconType="circle"
                        iconSize={8}
                    />

                    {benchmarkValue !== null && (
                        <ReferenceLine
                            y={benchmarkValue}
                            stroke="#F59E0B"
                            strokeDasharray="6 4"
                            strokeWidth={1.5}
                            label={{
                                value: `Dept Avg: ${benchmarkValue.toFixed(1)}`,
                                position: 'right',
                                style: { fontSize: 10, fill: '#D97706' },
                            }}
                        />
                    )}

                    {filteredMetrics.map((metric) =>
                        activeChartType === 'line' ? (
                            <Area
                                key={metric.value}
                                type="monotone"
                                dataKey={metric.value}
                                name={metric.label}
                                stroke={metric.color}
                                strokeWidth={2}
                                fill={metric.color}
                                fillOpacity={0.1}
                                dot={{ r: 3, fill: metric.color }}
                                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                            />
                        ) : (
                            <Bar
                                key={metric.value}
                                dataKey={metric.value}
                                name={metric.label}
                                fill={metric.color}
                                radius={[4, 4, 0, 0]}
                                opacity={0.85}
                            />
                        ),
                    )}

                    <Brush
                        dataKey="date"
                        height={28}
                        stroke="rgba(136,22,28,0.3)"
                        fill="rgba(255,255,255,0.8)"
                        onChange={handleBrushChange}
                        tickFormatter={(value: string) => {
                            const d = new Date(value);
                            return `${d.getDate()}/${d.getMonth() + 1}`;
                        }}
                    />
                </Chart>
            </ResponsiveContainer>
        </div>
    );
}
