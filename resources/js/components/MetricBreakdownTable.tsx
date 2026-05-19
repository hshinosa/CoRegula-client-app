import React from 'react';

interface MetricBreakdownTableProps {
    metrics: number[];
    labels: string[];
    classAverage: number[];
    primaryLabel: string;
    comparisonMetrics?: number[];
    comparisonLabel?: string;
    metricDefinitions?: Record<string, string>;
}

const formatScore = (n: number) => n.toFixed(1);

const formatDelta = (delta: number) => {
    const prefix = delta > 0 ? '+' : '';
    return `${prefix}${delta.toFixed(1)}`;
};

const deltaTone = (delta: number): { color: string; background: string } => {
    if (delta >= 0.5) return { color: '#166534', background: 'rgba(34,197,94,0.10)' };
    if (delta <= -0.5) return { color: '#b91c1c', background: 'rgba(239,68,68,0.10)' };
    return { color: '#6B7280', background: 'rgba(74,74,74,0.06)' };
};

export const MetricBreakdownTable: React.FC<MetricBreakdownTableProps> = ({
    metrics,
    labels,
    classAverage,
    primaryLabel,
    comparisonMetrics,
    comparisonLabel,
    metricDefinitions,
}) => {
    const showComparison = comparisonMetrics && comparisonMetrics.length === metrics.length;

    return (
        <div className="overflow-x-auto rounded-2xl" style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(74,74,74,0.08)' }}>
            <table className="w-full text-sm">
                <thead>
                    <tr style={{ borderBottom: '1px solid rgba(74,74,74,0.10)' }}>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                            Metrik
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#88161c]">
                            {primaryLabel}
                        </th>
                        {showComparison && (
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>
                                {comparisonLabel ?? 'Pembanding'}
                            </th>
                        )}
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                            Δ vs Kelas
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {labels.map((label, idx) => {
                        const value = metrics[idx];
                        const compValue = showComparison ? comparisonMetrics[idx] : null;
                        const delta = value - (classAverage[idx] ?? 0);
                        const tone = deltaTone(delta);

                        return (
                            <tr key={label} style={{ borderBottom: idx === labels.length - 1 ? 'none' : '1px solid rgba(74,74,74,0.06)' }}>
                                <td className="px-4 py-3 font-medium text-[#4A4A4A]">
                                    {metricDefinitions?.[label] ? (
                                        <span title={metricDefinitions[label]} className="cursor-help border-b border-dashed border-[#9CA3AF]">
                                            {label}
                                        </span>
                                    ) : (
                                        label
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-[#88161c]">
                                    {formatScore(value)}
                                </td>
                                {showComparison && compValue !== null && (
                                    <td className="px-4 py-3 text-right font-semibold" style={{ color: '#475569' }}>
                                        {formatScore(compValue)}
                                    </td>
                                )}
                                <td className="px-4 py-3 text-right">
                                    <span
                                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                                        style={{ color: tone.color, background: tone.background }}
                                    >
                                        {formatDelta(delta)}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default MetricBreakdownTable;
