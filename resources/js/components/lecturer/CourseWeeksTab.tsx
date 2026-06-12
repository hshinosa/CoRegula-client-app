import { LiquidGlassCard } from '@/components/Welcome/utils/helpers';
import { BookOpen, GripVertical, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';

const bodyTextClass = 'text-sm text-brand-muted-dark';
const headingStyle = { color: '#4A4A4A' } as const;
const glassPanelStyle = { background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.65)' } as const;

interface CourseMaterialRow {
    id: string;
    title: string;
    description?: string | null;
    file_name?: string;
    view_count?: number;
}

interface CourseWeekRow {
    id: string;
    week_index: number;
    title: string;
    sort_order?: number;
    materials?: CourseMaterialRow[];
}

interface CourseWeeksTabProps {
    courseId: string;
}

export default function CourseWeeksTab({ courseId }: CourseWeeksTabProps) {
    const [weeks, setWeeks] = useState<CourseWeekRow[]>([]);
    const [pool, setPool] = useState<CourseMaterialRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [newWeek, setNewWeek] = useState({ week_index: '', title: '' });
    const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    const fetchWeeks = useCallback(async () => {
        try {
            const res = await fetch(`/lecturer/courses/${courseId}/weeks`);
            const data = await res.json();
            setWeeks(data.weeks || []);
            setPool(data.pool || []);
        } catch {
            setWeeks([]);
            setPool([]);
        }
    }, [courseId]);

    useEffect(() => {
        setLoading(true);
        fetchWeeks().finally(() => setLoading(false));
    }, [fetchWeeks]);

    const handleCreateWeek = async (e: FormEvent) => {
        e.preventDefault();
        const weekIndex = parseInt(newWeek.week_index, 10);
        if (!weekIndex || !newWeek.title.trim()) return;
        try {
            await fetch(`/lecturer/courses/${courseId}/weeks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({ week_index: weekIndex, title: newWeek.title.trim() }),
            });
            setNewWeek({ week_index: '', title: '' });
            fetchWeeks();
        } catch {
            /* */
        }
    };

    const handleDeleteWeek = async (weekId: string) => {
        if (!confirm('Hapus minggu ini? Materi kembali ke pool.')) return;
        try {
            await fetch(`/lecturer/courses/${courseId}/weeks/${weekId}`, {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': csrfToken },
            });
            fetchWeeks();
        } catch {
            /* */
        }
    };

    const handleAssign = async (weekId: string, materialId: string) => {
        try {
            await fetch(`/lecturer/courses/${courseId}/weeks/${weekId}/materials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({ course_material_id: materialId }),
            });
            fetchWeeks();
        } catch {
            /* */
        }
    };

    const handleUnassign = async (weekId: string, materialId: string) => {
        try {
            await fetch(`/lecturer/courses/${courseId}/weeks/${weekId}/materials/${materialId}`, {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': csrfToken },
            });
            fetchWeeks();
        } catch {
            /* */
        }
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl"
                        style={{ background: 'rgba(136,22,28,0.08)', border: '1px solid rgba(136,22,28,0.12)' }}
                    >
                        <BookOpen className="h-5 w-5" style={{ color: '#88161c' }} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold" style={headingStyle}>
                            Minggu Perkuliahan
                        </h3>
                        <p className={bodyTextClass}>
                            {weeks.length} minggu · {pool.length} materi di pool
                        </p>
                    </div>
                </div>
            </div>

            <LiquidGlassCard intensity="light" className="p-5" lightMode>
                <form onSubmit={handleCreateWeek} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-brand-dark">Indeks minggu</label>
                        <input
                            type="number"
                            min={1}
                            value={newWeek.week_index}
                            onChange={(e) => setNewWeek((p) => ({ ...p, week_index: e.target.value }))}
                            className="mt-1 w-full rounded-xl border-0 bg-white/60 px-3 py-2 text-sm ring-1 ring-inset ring-white/50"
                            placeholder="1"
                            required
                        />
                    </div>
                    <div className="flex-[2]">
                        <label className="block text-xs font-medium text-brand-dark">Judul minggu</label>
                        <input
                            type="text"
                            value={newWeek.title}
                            onChange={(e) => setNewWeek((p) => ({ ...p, title: e.target.value }))}
                            className="mt-1 w-full rounded-xl border-0 bg-white/60 px-3 py-2 text-sm ring-1 ring-inset ring-white/50"
                            placeholder="Contoh: Pengenalan & literasi digital"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white"
                        style={{ background: '#88161c' }}
                    >
                        <Plus className="h-4 w-4" /> Tambah minggu
                    </button>
                </form>
            </LiquidGlassCard>

            <div className="space-y-4">
                {weeks.map((week) => (
                    <LiquidGlassCard key={week.id} intensity="light" className="p-5" lightMode>
                        <div className="flex items-start justify-between gap-3">
                            <button
                                type="button"
                                className="flex min-w-0 flex-1 items-start gap-2 text-left"
                                onClick={() => setExpandedWeek(expandedWeek === week.id ? null : week.id)}
                            >
                                <GripVertical className="mt-1 h-4 w-4 shrink-0 text-brand-muted-dark" />
                                <div>
                                    <p className="font-semibold" style={headingStyle}>
                                        Minggu {week.week_index}: {week.title}
                                    </p>
                                    <p className={bodyTextClass}>{week.materials?.length ?? 0} materi</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeleteWeek(week.id)}
                                className="rounded-lg p-2 hover:bg-red-50"
                                title="Hapus minggu"
                            >
                                <Trash2 className="h-4 w-4 text-red-400" />
                            </button>
                        </div>

                        {expandedWeek === week.id && (
                            <div className="mt-4 space-y-2 border-t border-white/50 pt-4">
                                {(week.materials || []).map((m) => (
                                    <div key={m.id} className="flex items-center justify-between rounded-xl p-3" style={glassPanelStyle}>
                                        <span className="truncate text-sm">{m.title}</span>
                                        <button
                                            type="button"
                                            className="text-xs text-red-500"
                                            onClick={() => handleUnassign(week.id, m.id)}
                                        >
                                            Keluarkan
                                        </button>
                                    </div>
                                ))}
                                {pool.length > 0 && (
                                    <div className="mt-3">
                                        <p className="mb-2 text-xs font-medium text-brand-muted-dark">Tambah dari pool</p>
                                        <select
                                            className="w-full rounded-xl border-0 bg-white/60 px-3 py-2 text-sm ring-1 ring-inset ring-white/50"
                                            defaultValue=""
                                            onChange={(e) => {
                                                const id = e.target.value;
                                                if (id) {
                                                    handleAssign(week.id, id);
                                                    e.target.value = '';
                                                }
                                            }}
                                        >
                                            <option value="">Pilih materi…</option>
                                            {pool.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}
                    </LiquidGlassCard>
                ))}
            </div>

            {pool.length > 0 && (
                <LiquidGlassCard intensity="light" className="p-5" lightMode>
                    <h4 className="text-sm font-semibold" style={headingStyle}>
                        Pool materi (belum di minggu)
                    </h4>
                    <ul className="mt-3 space-y-2">
                        {pool.map((m) => (
                            <li key={m.id} className="rounded-xl px-3 py-2 text-sm" style={glassPanelStyle}>
                                {m.title}
                            </li>
                        ))}
                    </ul>
                    <p className="mt-2 text-xs text-brand-muted-dark">
                        Unggah file baru lewat tab Materials; lalu assign ke minggu di sini.
                    </p>
                </LiquidGlassCard>
            )}
        </div>
    );
}