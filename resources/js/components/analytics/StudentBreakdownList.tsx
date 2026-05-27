import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Search, Users } from 'lucide-react';
import { Pagination } from '@/components/chat-spaces/Pagination';

export interface StudentMetric {
    id: string;
    name: string;
    email: string;
    qualityScore: number | null;
    hotPercentage: number;
    messageCount: number;
    engagementScore: number;
    lastActive: string | null;
}

interface StudentBreakdownListProps {
    courseId: string;
    startDate?: string;
    endDate?: string;
    preset?: string;
    onSelectStudent?: (studentId: string) => void;
}

type SortField = 'quality_score' | 'hot_percentage' | 'message_count' | 'name';
type SortDir = 'asc' | 'desc';

const getQualityColor = (score: number | null) => {
    if (score === null) return '#9CA3AF';
    if (score >= 70) return '#166534';
    if (score >= 50) return '#92400e';
    return '#b91c1c';
};

const getQualityBg = (score: number | null) => {
    if (score === null) return 'rgba(156,163,175,0.10)';
    if (score >= 70) return 'rgba(34,197,94,0.10)';
    if (score >= 50) return 'rgba(245,158,11,0.10)';
    return 'rgba(239,68,68,0.10)';
};

export default function StudentBreakdownList({
    courseId,
    startDate,
    endDate,
    preset,
    onSelectStudent,
}: StudentBreakdownListProps) {
    const [students, setStudents] = useState<StudentMetric[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<SortField>('quality_score');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ total: 0, perPage: 15, currentPage: 1, lastPage: 1 });
    const [scoreFilter, setScoreFilter] = useState<{ min?: number; max?: number }>({});

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                per_page: String(meta.perPage),
                sort_by: sortField,
                sort_dir: sortDir,
            });
            if (search) params.set('search', search);
            if (startDate) params.set('start_date', startDate);
            if (endDate) params.set('end_date', endDate);
            if (preset) params.set('preset', preset);
            if (scoreFilter.min !== undefined) params.set('min_score', String(scoreFilter.min));
            if (scoreFilter.max !== undefined) params.set('max_score', String(scoreFilter.max));

            const res = await fetch(`/lecturer/courses/${courseId}/analytics/students?${params.toString()}`);
            const data = await res.json();

            setStudents(data.data ?? []);
            setMeta({
                total: data.meta?.total ?? 0,
                perPage: data.meta?.per_page ?? 15,
                currentPage: data.meta?.current_page ?? 1,
                lastPage: data.meta?.last_page ?? 1,
            });
        } catch {
            setStudents([]);
        } finally {
            setLoading(false);
        }
    }, [courseId, page, sortField, sortDir, search, startDate, endDate, preset, scoreFilter, meta.perPage]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const handleSort = useCallback(
        (field: SortField) => {
            if (sortField === field) {
                setSortDir((p) => (p === 'desc' ? 'asc' : 'desc'));
            } else {
                setSortField(field);
                setSortDir('desc');
            }
            setPage(1);
        },
        [sortField],
    );

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return null;
        return sortDir === 'desc' ? <ChevronDown className="inline h-3 w-3" /> : <ChevronUp className="inline h-3 w-3" />;
    };

    const th = 'px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-brand-muted-dark';

    return (
        <div
            className="overflow-hidden rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.65)' }}
        >
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-brand-muted-dark" />
                    <h3 className="text-sm font-semibold text-brand-dark dark:text-gray-100">
                        Breakdown per Mahasiswa
                    </h3>
                    <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs text-brand-muted-dark">{meta.total}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                        <input
                            type="text"
                            placeholder="Cari mahasiswa..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="rounded-lg border border-[#E5E7EB] bg-white py-1.5 pl-8 pr-3 text-xs text-brand-dark placeholder-[#9CA3AF] focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20"
                        />
                    </div>
                    <select
                        value={`${scoreFilter.min ?? ''}-${scoreFilter.max ?? ''}`}
                        onChange={(e) => {
                            const v = e.target.value;
                            if (v === '-') setScoreFilter({});
                            else if (v === '0-49') setScoreFilter({ min: 0, max: 49 });
                            else if (v === '50-69') setScoreFilter({ min: 50, max: 69 });
                            else if (v === '70-100') setScoreFilter({ min: 70, max: 100 });
                            setPage(1);
                        }}
                        className="rounded-lg border border-[#E5E7EB] bg-white px-2 py-1.5 text-xs text-brand-dark focus:border-brand-primary focus:outline-none"
                    >
                        <option value="-">Semua Skor</option>
                        <option value="70-100">Baik (&#8805;70)</option>
                        <option value="50-69">Perhatian (50-69)</option>
                        <option value="0-49">Intervensi (&lt;50)</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                            <th className={`${th} cursor-pointer`} onClick={() => handleSort('name')}>
                                Mahasiswa <SortIcon field="name" />
                            </th>
                            <th className={`${th} cursor-pointer text-center`} onClick={() => handleSort('quality_score')}>
                                Skor <SortIcon field="quality_score" />
                            </th>
                            <th className={`${th} cursor-pointer text-center`} onClick={() => handleSort('hot_percentage')}>
                                HOT % <SortIcon field="hot_percentage" />
                            </th>
                            <th className={`${th} cursor-pointer text-center`} onClick={() => handleSort('message_count')}>
                                Pesan <SortIcon field="message_count" />
                            </th>
                            <th className={`${th} text-center`}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#9CA3AF]">
                                    Memuat data...
                                </td>
                            </tr>
                        ) : students.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#9CA3AF]">
                                    Tidak ada data mahasiswa
                                </td>
                            </tr>
                        ) : (
                            students.map((s) => (
                                <tr
                                    key={s.id}
                                    className="border-t border-[#F3F4F6] transition-colors hover:bg-[#FAFAFA]"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                                                style={{ background: getQualityColor(s.qualityScore) }}
                                            >
                                                {s.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[#1F2937]">{s.name}</p>
                                                <p className="text-xs text-[#9CA3AF]">{s.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
                                            style={{ background: getQualityBg(s.qualityScore), color: getQualityColor(s.qualityScore) }}
                                        >
                                            {s.qualityScore !== null ? s.qualityScore.toFixed(0) : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-brand-dark">
                                        {s.hotPercentage.toFixed(1)}%
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-brand-dark">
                                        {s.messageCount}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            type="button"
                                            onClick={() => onSelectStudent?.(s.id)}
                                            className="rounded-lg px-3 py-1 text-xs font-medium transition-colors"
                                            style={{ background: 'rgba(136,22,28,0.08)', color: '#88161c', border: '1px solid rgba(136,22,28,0.15)' }}
                                        >
                                            Detail
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {meta.lastPage > 1 && (
                <div className="border-t border-[#F3F4F6] px-4 py-3">
                    <Pagination
                        currentPage={meta.currentPage}
                        totalPages={meta.lastPage}
                        totalItems={meta.total}
                        perPage={meta.perPage}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </div>
    );
}
