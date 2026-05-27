import { ActivitySummary, StudentActivity } from '@/types';
import { MessageSquare, TrendingUp, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { LiquidGlassCard } from '@/components/Welcome/utils/helpers';

const headingStyle = {
    color: '#4A4A4A',
} as const;

const bodyTextClass = 'text-sm text-brand-muted-dark';

const glassPanelStyle = {
    background: 'rgba(255,255,255,0.55)',
    border: '1px solid rgba(255,255,255,0.65)',
} as const;

type SortField = 'total_messages' | 'frequency' | 'last_activity';

interface AktivitasTabProps {
    students: StudentActivity[];
    summary: ActivitySummary;
    loading: boolean;
}

function ActivityIndicator({ value, max, color }: { value: number; max: number; color: string }) {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="h-2 w-full rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }}>
            <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%`, background: color }}
            />
        </div>
    );
}

export default function AktivitasTab({ students, summary, loading }: AktivitasTabProps) {
    const [sortField, setSortField] = useState<SortField>('total_messages');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [search, setSearch] = useState('');

    const maxMessages = useMemo(() => Math.max(...students.map((s) => s.total_messages), 1), [students]);

    const filtered = useMemo(() => {
        let result = [...students];

        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (s) => s.student.name.toLowerCase().includes(q) || s.student.email.toLowerCase().includes(q),
            );
        }

        result.sort((a, b) => {
            let cmp = 0;
            if (sortField === 'total_messages') cmp = a.total_messages - b.total_messages;
            else if (sortField === 'frequency') cmp = a.frequency - b.frequency;
            else if (sortField === 'last_activity') cmp = (a.last_activity || '').localeCompare(b.last_activity || '');
            return sortDir === 'desc' ? -cmp : cmp;
        });

        return result;
    }, [students, search, sortField, sortDir]);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
        } else {
            setSortField(field);
            setSortDir('desc');
        }
    };

    const formatDate = (v?: string | null) => {
        if (!v) return '—';
        return new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    { label: 'Total Pesan', value: summary.total_messages, icon: MessageSquare, color: '#88161c' },
                    { label: 'Mahasiswa Aktif', value: summary.active_students, icon: Users, color: '#166534' },
                    {
                        label: 'Total Mahasiswa',
                        value: summary.total_students,
                        icon: TrendingUp,
                        color: '#4A4A4A',
                    },
                ].map((stat, i) => (
                    <LiquidGlassCard key={stat.label} intensity="light" className="p-5" lightMode={true}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className={bodyTextClass}>{stat.label}</p>
                                <p className="mt-2 text-3xl font-light" style={headingStyle}>
                                    {stat.value}
                                </p>
                            </div>
                            <div
                                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                                style={{ background: `${stat.color}12`, border: `1px solid ${stat.color}20` }}
                            >
                                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                            </div>
                        </div>
                    </LiquidGlassCard>
                ))}
            </div>

            <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-semibold" style={headingStyle}>
                        Aktivitas per Mahasiswa
                    </h3>
                    <input
                        type="text"
                        placeholder="Cari mahasiswa..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-white/60 px-4 py-2 text-sm outline-none transition-colors focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/20"
                        style={{ ...headingStyle, maxWidth: '260px' }}
                    />
                </div>

                <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-[rgba(0,0,0,0.06)]">
                                <th className="pb-3 pr-4 font-medium text-brand-muted-dark">Mahasiswa</th>
                                <th
                                    className="cursor-pointer pb-3 pr-4 font-medium text-brand-muted-dark select-none"
                                    onClick={() => toggleSort('total_messages')}
                                >
                                    Total Pesan {sortField === 'total_messages' && (sortDir === 'desc' ? '↓' : '↑')}
                                </th>
                                <th className="pb-3 pr-4 font-medium text-brand-muted-dark">Frekuensi</th>
                                <th
                                    className="cursor-pointer pb-3 pr-4 font-medium text-brand-muted-dark select-none"
                                    onClick={() => toggleSort('last_activity')}
                                >
                                    Aktivitas Terakhir {sortField === 'last_activity' && (sortDir === 'desc' ? '↓' : '↑')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-brand-muted-dark">
                                        {search ? 'Tidak ada mahasiswa yang cocok.' : 'Belum ada data aktivitas.'}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((s) => (
                                    <tr key={s.student.id} className="border-b border-[rgba(0,0,0,0.04)]">
                                        <td className="py-3 pr-4">
                                            <p className="font-medium" style={{ color: '#4A4A4A' }}>
                                                {s.student.name}
                                            </p>
                                            <p className="text-xs text-brand-muted-dark">{s.student.email}</p>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold" style={{ color: '#4A4A4A' }}>
                                                    {s.total_messages}
                                                </span>
                                                <ActivityIndicator value={s.total_messages} max={maxMessages} color="#88161c" />
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" style={{
                                                background: s.frequency > 3 ? 'rgba(34,197,94,0.10)' : s.frequency > 0 ? 'rgba(245,158,11,0.10)' : 'rgba(107,114,128,0.10)',
                                                color: s.frequency > 3 ? '#166534' : s.frequency > 0 ? '#92400e' : '#4b5563',
                                                border: `1px solid ${s.frequency > 3 ? 'rgba(34,197,94,0.18)' : s.frequency > 0 ? 'rgba(245,158,11,0.18)' : 'rgba(107,114,128,0.18)'}`,
                                            }}>
                                                {s.frequency} hari/minggu
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4 text-brand-muted-dark">{formatDate(s.last_activity)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </LiquidGlassCard>
        </div>
    );
}
