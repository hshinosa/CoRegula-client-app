import { useMemo } from 'react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

export interface TrendDataPoint {
    date: string;
    [key: string]: string | number;
}

interface TrendChartProps {
    data: TrendDataPoint[];
    lines: Array<{
        dataKey: string;
        color: string;
        label?: string;
    }>;
    title?: string;
    height?: number;
    yAxisLabel?: string;
    targetLine?: number;
    targetLabel?: string;
}

export default function TrendChart({
    data,
    lines,
    title,
    height = 300,
    yAxisLabel,
    targetLine,
    targetLabel = 'Target',
}: TrendChartProps) {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];
        return data;
    }, [data]);

    if (chartData.length === 0) {
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
                    className="mb-4 text-sm font-semibold"
                >
                    {title}
                </h3>
            )}
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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
                                ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#6B7280' } }
                                : undefined
                        }
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(255,255,255,0.95)',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '12px',
                            fontSize: 12,
                        }}
                    />
                    <Legend
                    />
                    {targetLine !== undefined && (
                        <Line
                            dataKey={() => targetLine}
                            stroke="#94a3b8"
                            strokeDasharray="6 4"
                            strokeWidth={1.5}
                            dot={false}
                            name={targetLabel}
                        />
                    )}
                    {lines.map((line) => (
                        <Line
                            key={line.dataKey}
                            type="monotone"
                            dataKey={line.dataKey}
                            stroke={line.color}
                            strokeWidth={2.5}
                            dot={{ r: 3, fill: line.color }}
                            activeDot={{ r: 5 }}
                            name={line.label ?? line.dataKey}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
