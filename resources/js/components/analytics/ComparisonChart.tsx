import { Eye, EyeOff } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

export interface ComparisonItem {
    id: string;
    label: string;
    color: string;
    data: Record<string, number>;
}

interface ComparisonChartProps {
    items: ComparisonItem[];
    metrics: string[];
    metricLabels?: Record<string, string>;
    title?: string;
    height?: number;
}

const DEFAULT_COLORS = ['#88161c', '#2563eb', '#16a34a'];

export default function ComparisonChart({
    items,
    metrics,
    metricLabels,
    title,
    height = 300,
}: ComparisonChartProps) {
    const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());

    const toggleVisibility = useCallback((id: string) => {
        setHiddenItems((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const chartData = useMemo(() => {
        return metrics.map((metric) => {
            const row: Record<string, string | number> = {
                metric: metricLabels?.[metric] ?? metric,
            };
            items.forEach((item) => {
                if (!hiddenItems.has(item.id)) {
                    row[item.label] = item.data[metric] ?? 0;
                }
            });
            return row;
        });
    }, [items, metrics, metricLabels, hiddenItems]);

    const activeItems = items.filter((item) => !hiddenItems.has(item.id));

    if (items.length === 0) {
        return (
            <div
                className="flex items-center justify-center rounded-2xl p-8"
                style={{
                    background: 'rgba(255,255,255,0.55)',
                    border: '1px solid rgba(255,255,255,0.65)',
                    height,
                }}
            >
                <p className="text-sm text-brand-muted-dark">Pilih kelas untuk perbandingan</p>
            </div>
        );
    }

    return (
        <div
            className="rounded-2xl p-4"
            style={{
                background: 'rgba(255,255,255,0.55)',
                border: '1px solid rgba(255,255,255,0.65)',
            }}
        >
            {title && (
                <h3
                    className="mb-3 text-sm font-semibold"
                >
                    {title}
                </h3>
            )}

            <div className="mb-3 flex flex-wrap gap-2">
                {items.map((item, i) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleVisibility(item.id)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                        style={{
                            background: hiddenItems.has(item.id) ? 'rgba(0,0,0,0.04)' : `${item.color ?? DEFAULT_COLORS[i]}18`,
                            border: `1px solid ${hiddenItems.has(item.id) ? 'rgba(0,0,0,0.1)' : `${item.color ?? DEFAULT_COLORS[i]}40`}`,
                            color: hiddenItems.has(item.id) ? '#9ca3af' : (item.color ?? DEFAULT_COLORS[i]),
                        }}
                    >
                        {hiddenItems.has(item.id) ? (
                            <EyeOff className="h-3 w-3" />
                        ) : (
                            <Eye className="h-3 w-3" />
                        )}
                        {item.label}
                    </button>
                ))}
            </div>

            <ResponsiveContainer width="100%" height={height}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis
                        dataKey="metric"
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(255,255,255,0.95)',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '12px',
                            fontSize: 12,
                        }}
                    />
                    {activeItems.map((item, i) => (
                        <Bar
                            key={item.id}
                            dataKey={item.label}
                            fill={item.color ?? DEFAULT_COLORS[i]}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
