import { motion } from 'framer-motion';
import type { AnalyticsDataPoint } from '@/types';

interface FrequencyChartProps {
    data: AnalyticsDataPoint[];
    period: string;
}

export function FrequencyChart({ data, period }: FrequencyChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center text-sm text-[#6B7280]">
                Belum ada data frekuensi
            </div>
        );
    }

    const maxCount = Math.max(...data.map((d) => d.count), 1);
    const barWidth = Math.min(32, Math.max(8, 300 / data.length));

    const narrativeLabel = period === 'week'
        ? 'Refleksi per hari minggu ini'
        : period === 'year'
            ? 'Refleksi per bulan tahun ini'
            : 'Refleksi per hari bulan ini';

    return (
        <div>
            <p className="mb-3 text-xs text-[#6B7280]">{narrativeLabel}</p>
            <div className="flex items-end justify-center gap-1" style={{ height: 160 }}>
                {data.map((point, i) => (
                    <motion.div
                        key={point.label}
                        className="flex flex-col items-center gap-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                    >
                        <span className="text-[10px] font-medium text-[#4A4A4A]">{point.count}</span>
                        <div
                            className="rounded-t-sm transition-all"
                            style={{
                                width: barWidth,
                                height: `${(point.count / maxCount) * 120}px`,
                                minHeight: 4,
                                background: 'rgba(136,22,28,0.7)',
                            }}
                            title={`${point.label}: ${point.count} refleksi`}
                        />
                        <span className="text-[9px] text-[#6B7280] truncate" style={{ maxWidth: barWidth + 8 }}>
                            {formatLabel(point.label, period)}
                        </span>
                    </motion.div>
                ))}
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
