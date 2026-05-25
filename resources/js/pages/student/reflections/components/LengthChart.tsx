import { motion } from 'framer-motion';
import type { AnalyticsDataPoint } from '@/types';

interface LengthChartProps {
    data: AnalyticsDataPoint[];
    period: string;
}

export function LengthChart({ data, period }: LengthChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center text-sm text-[#6B7280]">
                Belum ada data panjang refleksi
            </div>
        );
    }

    const maxAvg = Math.max(...data.map((d) => d.average ?? 0), 1);
    const width = 400;
    const height = 140;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = data.map((d, i) => ({
        x: padding + (i / Math.max(data.length - 1, 1)) * chartWidth,
        y: padding + chartHeight - ((d.average ?? 0) / maxAvg) * chartHeight,
    }));

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    const narrativeLabel = period === 'week'
        ? 'Rata-rata kata per refleksi minggu ini'
        : period === 'year'
            ? 'Rata-rata kata per refleksi tahun ini'
            : 'Rata-rata kata per refleksi bulan ini';

    return (
        <div>
            <p className="mb-3 text-xs text-[#6B7280]">{narrativeLabel}</p>
            <motion.svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(136,22,28,0.3)" />
                        <stop offset="100%" stopColor="rgba(136,22,28,0.02)" />
                    </linearGradient>
                </defs>

                <motion.path
                    d={areaPath}
                    fill="url(#areaGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                />

                <motion.path
                    d={linePath}
                    fill="none"
                    stroke="#88161c"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1 }}
                />

                {points.map((p, i) => (
                    <motion.circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={3}
                        fill="#88161c"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.05 }}
                    />
                ))}

                <line
                    x1={padding}
                    y1={height - padding}
                    x2={width - padding}
                    y2={height - padding}
                    stroke="rgba(107,114,128,0.2)"
                    strokeWidth={1}
                />
            </motion.svg>

            <div className="mt-1 flex justify-between text-[9px] text-[#6B7280]">
                {data.length > 0 && <span>{formatLabel(data[0].label, period)}</span>}
                {data.length > 2 && <span>{formatLabel(data[Math.floor(data.length / 2)].label, period)}</span>}
                {data.length > 1 && <span>{formatLabel(data[data.length - 1].label, period)}</span>}
            </div>
        </div>
    );
}

function formatLabel(label: string, period: string): string {
    if (period === 'year') {
        const parts = label.split('-');
        if (parts.length === 2) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
            return months[parseInt(parts[1], 10) - 1] ?? label;
        }
    }
    const parts = label.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}`;
    }
    return label;
}
