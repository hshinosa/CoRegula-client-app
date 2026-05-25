import { useCallback, useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    Brush,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

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
            <p className="mb-1.5 text-xs font-medium text-[#6B7280]">{label}</p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: entry.color }}
                    />
                    <span className="text-[#4A4A4A]">{entry.name}:</span>
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
                <p className="text-sm text-[#6B7280]">Belum ada data trend</p>
            </div>
        );
    }

    const Chart = activeChartType === 'bar' ? BarChart : LineChart;

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
                            style={{ color: '#4A4A4A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                            {title}
                        </h3>
                    )}
                    {benchmark?.sampleSize !== undefined && showBenchmark && (
                        <p className="mt-0.5 text-xs text-[#9CA3AF]">
                            Benchmark: {benchmark.sampleSize} kelompok
                            {benchmark.sampleSize < 10 && (
                                <span className="ml-1 text-amber-500">(sampel kecil)</span>
                            )}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: 'rgba(0,0,0,0.04)' }}>
                    <button
                        type="button"
                        onClick={() => setActiveChartType('line')}
                        className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                        style={{
                            background: activeChartType === 'line' ? '#fff' : 'transparent',
                            color: activeChartType === 'line' ? '#4A4A4A' : '#9CA3AF',
                            boxShadow: activeChartType === 'line' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        }}
                    >
                        Line
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveChartType('bar')}
                        className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                        style={{
                            background: activeChartType === 'bar' ? '#fff' : 'transparent',
                            color: activeChartType === 'bar' ? '#4A4A4A' : '#9CA3AF',
                            boxShadow: activeChartType === 'bar' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        }}
                    >
                        Bar
                    </button>
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
                                    ? `${metric.color}15`
                                    : 'rgba(0,0,0,0.03)',
                                color: isActive ? metric.color : '#9CA3AF',
                                border: `1px solid ${isActive ? `${metric.color}30` : 'rgba(0,0,0,0.06)'}`,
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
                            <Line
                                key={metric.value}
                                type="monotone"
                                dataKey={metric.value}
                                name={metric.label}
                                stroke={metric.color}
                                strokeWidth={2}
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

            <p className="mt-2 text-center text-[10px] text-[#9CA3AF]">
                Geser brush di bawah chart untuk zoom area tertentu
            </p>
        </div>
    );
}
