import { AttendanceSession, AttendanceStatus, AttendanceStudentRecord, AttendanceStudentSummary } from '@/types';
import { LiquidGlassCard } from '@/components/Welcome/utils/helpers';
import { CalendarCheck, CheckCircle2, Download, Minus, Plus, XCircle, X, Clock } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const headingStyle = {
    color: '#4A4A4A',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
} as const;

const bodyTextClass = 'text-sm text-[#6B7280]';

const glassPanelStyle = {
    background: 'rgba(255,255,255,0.55)',
    border: '1px solid rgba(255,255,255,0.65)',
} as const;

const statusConfig: Record<AttendanceStatus, { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle2 }> = {
    present: { label: 'Hadir', color: '#166534', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.18)', icon: CheckCircle2 },
    absent: { label: 'Tidak Hadir', color: '#b91c1c', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.18)', icon: XCircle },
    late: { label: 'Terlambat', color: '#92400e', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.18)', icon: Clock },
    excused: { label: 'Izin', color: '#4b5563', bg: 'rgba(107,114,128,0.10)', border: 'rgba(107,114,128,0.18)', icon: Minus },
};

type ViewMode = 'sessions' | 'summary' | 'marking';

interface AttendanceTabProps {
    courseId: string;
}

export default function AttendanceTab({ courseId }: AttendanceTabProps) {
    const [sessions, setSessions] = useState<AttendanceSession[]>([]);
    const [summary, setSummary] = useState<AttendanceStudentSummary[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('sessions');
    const [loading, setLoading] = useState(true);
    const [markingSession, setMarkingSession] = useState<string | null>(null);
    const [markingRecords, setMarkingRecords] = useState<AttendanceStudentRecord[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newSession, setNewSession] = useState({ title: '', session_date: '', session_number: '', notes: '' });

    const fetchSessions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/lecturer/courses/${courseId}/attendance`);
            const data = await res.json();
            setSessions(data.data || []);
        } catch {
            setSessions([]);
        }
        setLoading(false);
    }, [courseId]);

    const fetchSummary = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/lecturer/courses/${courseId}/attendance/summary`);
            const data = await res.json();
            setSummary(data.data || []);
        } catch {
            setSummary([]);
        }
        setLoading(false);
    }, [courseId]);

    useEffect(() => {
        if (viewMode === 'sessions' || viewMode === 'marking') fetchSessions();
        else if (viewMode === 'summary') fetchSummary();
    }, [viewMode, fetchSessions, fetchSummary]);

    const handleCreateSession = async () => {
        if (!newSession.title || !newSession.session_date) return;
        try {
            const res = await fetch(`/lecturer/courses/${courseId}/attendance/sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
                body: JSON.stringify({
                    title: newSession.title,
                    session_date: newSession.session_date,
                    session_number: newSession.session_number ? parseInt(newSession.session_number) : null,
                    notes: newSession.notes || null,
                }),
            });
            if (res.ok) {
                setShowCreateForm(false);
                setNewSession({ title: '', session_date: '', session_number: '', notes: '' });
                fetchSessions();
            }
        } catch {}
    };

    const startMarking = async (sessionId: string) => {
        try {
            const res = await fetch(`/lecturer/courses/${courseId}/attendance/sessions/${sessionId}`);
            const data = await res.json();
            setMarkingRecords(data.students || []);
            setMarkingSession(sessionId);
            setViewMode('marking');
        } catch {}
    };

    const toggleStatus = (studentId: string) => {
        setMarkingRecords((prev) =>
            prev.map((r) => {
                if (r.student_id !== studentId) return r;
                const order: AttendanceStatus[] = ['absent', 'present', 'late', 'excused'];
                const idx = order.indexOf(r.status);
                return { ...r, status: order[(idx + 1) % order.length] };
            }),
        );
    };

    const saveAttendance = async () => {
        if (!markingSession) return;
        try {
            const res = await fetch(`/lecturer/courses/${courseId}/attendance/sessions/${markingSession}/mark`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
                body: JSON.stringify({
                    records: markingRecords.map((r) => ({ student_id: r.student_id, status: r.status, notes: r.notes })),
                }),
            });
            if (res.ok) {
                setViewMode('sessions');
                setMarkingSession(null);
                fetchSessions();
            }
        } catch {}
    };

    const deleteSession = async (sessionId: string) => {
        if (!confirm('Hapus sesi kehadiran ini?')) return;
        try {
            await fetch(`/lecturer/courses/${courseId}/attendance/sessions/${sessionId}`, {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
            });
            fetchSessions();
        } catch {}
    };

    const handleExport = () => {
        window.open(`/lecturer/courses/${courseId}/attendance/export`, '_blank');
    };

    const formatDate = (v?: string | null) => {
        if (!v) return '—';
        return new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#88161c] border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-1 rounded-2xl p-1" style={{ background: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.5)' }}>
                    {(['sessions', 'summary'] as const).map((mode) => (
                        <button
                            key={mode}
                            type="button"
                            onClick={() => setViewMode(mode)}
                            className="rounded-xl px-4 py-2 text-sm font-medium transition-all"
                            style={
                                viewMode === mode
                                    ? { background: 'rgba(136,22,28,0.10)', color: '#88161c', border: '1px solid rgba(136,22,28,0.15)' }
                                    : { background: 'transparent', color: '#6B7280', border: '1px solid transparent' }
                            }
                        >
                            {mode === 'sessions' ? 'Pertemuan' : 'Rekapitulasi'}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleExport}
                        className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all"
                        style={{ ...glassPanelStyle, color: '#4A4A4A' }}
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </button>
                    {viewMode === 'sessions' && (
                        <button
                            type="button"
                            onClick={() => setShowCreateForm(true)}
                            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all"
                            style={{ background: 'rgba(136,22,28,0.10)', color: '#88161c', border: '1px solid rgba(136,22,28,0.15)' }}
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Pertemuan
                        </button>
                    )}
                </div>
            </div>

            {showCreateForm && (
                <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                    <h3 className="mb-4 text-lg font-semibold" style={headingStyle}>Buat Pertemuan Baru</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium" style={{ color: '#4A4A4A' }}>Judul</label>
                            <input
                                type="text"
                                value={newSession.title}
                                onChange={(e) => setNewSession((p) => ({ ...p, title: e.target.value }))}
                                placeholder="Contoh: Pertemuan 1"
                                className="w-full rounded-xl border border-[rgba(0,0,0,0.08)] bg-white/60 px-4 py-2.5 text-sm outline-none focus:border-[#88161c]/30 focus:ring-1 focus:ring-[#88161c]/20"
                                style={headingStyle}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium" style={{ color: '#4A4A4A' }}>Tanggal</label>
                            <input
                                type="date"
                                value={newSession.session_date}
                                onChange={(e) => setNewSession((p) => ({ ...p, session_date: e.target.value }))}
                                className="w-full rounded-xl border border-[rgba(0,0,0,0.08)] bg-white/60 px-4 py-2.5 text-sm outline-none focus:border-[#88161c]/30 focus:ring-1 focus:ring-[#88161c]/20"
                                style={headingStyle}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium" style={{ color: '#4A4A4A' }}>Nomor Pertemuan</label>
                            <input
                                type="number"
                                min="1"
                                value={newSession.session_number}
                                onChange={(e) => setNewSession((p) => ({ ...p, session_number: e.target.value }))}
                                placeholder="Opsional"
                                className="w-full rounded-xl border border-[rgba(0,0,0,0.08)] bg-white/60 px-4 py-2.5 text-sm outline-none focus:border-[#88161c]/30 focus:ring-1 focus:ring-[#88161c]/20"
                                style={headingStyle}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium" style={{ color: '#4A4A4A' }}>Catatan</label>
                            <input
                                type="text"
                                value={newSession.notes}
                                onChange={(e) => setNewSession((p) => ({ ...p, notes: e.target.value }))}
                                placeholder="Opsional"
                                className="w-full rounded-xl border border-[rgba(0,0,0,0.08)] bg-white/60 px-4 py-2.5 text-sm outline-none focus:border-[#88161c]/30 focus:ring-1 focus:ring-[#88161c]/20"
                                style={headingStyle}
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setShowCreateForm(false)}
                            className="rounded-xl px-4 py-2 text-sm font-medium transition-all"
                            style={{ ...glassPanelStyle, color: '#4A4A4A' }}
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateSession}
                            disabled={!newSession.title || !newSession.session_date}
                            className="rounded-xl px-5 py-2 text-sm font-medium text-white transition-all disabled:opacity-50"
                            style={{ background: '#88161c' }}
                        >
                            Simpan
                        </button>
                    </div>
                </LiquidGlassCard>
            )}

            {viewMode === 'marking' && markingRecords.length > 0 && (
                <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold" style={headingStyle}>Tandai Kehadiran</h3>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => { setViewMode('sessions'); setMarkingSession(null); }}
                                className="rounded-xl px-4 py-2 text-sm font-medium transition-all"
                                style={{ ...glassPanelStyle, color: '#4A4A4A' }}
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={saveAttendance}
                                className="rounded-xl px-5 py-2 text-sm font-medium text-white transition-all"
                                style={{ background: '#88161c' }}
                            >
                                Simpan Kehadiran
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 space-y-2">
                        {markingRecords.map((record) => {
                            const cfg = statusConfig[record.status];
                            return (
                                <div
                                    key={record.student_id}
                                    className="flex items-center justify-between rounded-xl p-4 transition-all"
                                    style={glassPanelStyle}
                                >
                                    <div>
                                        <p className="font-medium" style={{ color: '#4A4A4A' }}>{record.student_name}</p>
                                        <p className="text-xs text-[#6B7280]">{record.student_email}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => toggleStatus(record.student_id)}
                                        className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all"
                                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                                    >
                                        <cfg.icon className="h-4 w-4" />
                                        {cfg.label}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </LiquidGlassCard>
            )}

            {viewMode === 'sessions' && !showCreateForm && (
                <div className="space-y-3">
                    {sessions.length === 0 ? (
                        <LiquidGlassCard intensity="light" className="p-10 text-center" lightMode={true}>
                            <CalendarCheck className="mx-auto h-12 w-12 text-[#6B7280]/40" />
                            <h4 className="mt-4 text-lg font-semibold" style={headingStyle}>Belum ada pertemuan</h4>
                            <p className={`mt-2 ${bodyTextClass}`}>Buat pertemuan pertama untuk mulai mencatat kehadiran.</p>
                        </LiquidGlassCard>
                    ) : (
                        sessions.map((session) => (
                            <LiquidGlassCard key={session.id} intensity="light" className="p-5" lightMode={true}>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold" style={{ color: '#4A4A4A' }}>{session.title}</h4>
                                            {session.session_number && (
                                                <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: 'rgba(136,22,28,0.08)', color: '#88161c', border: '1px solid rgba(136,22,28,0.15)' }}>
                                                    #{session.session_number}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`mt-1 ${bodyTextClass}`}>{formatDate(session.session_date)}</p>
                                        {session.notes && <p className="mt-1 text-xs text-[#6B7280]">{session.notes}</p>}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm font-semibold" style={{ color: session.attendance_rate >= 75 ? '#166534' : session.attendance_rate >= 50 ? '#92400e' : '#b91c1c' }}>
                                                {session.attendance_rate}%
                                            </p>
                                            <p className="text-xs text-[#6B7280]">
                                                {session.present_count}/{session.total_students} hadir
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => startMarking(session.id)}
                                                className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                                                style={{ background: 'rgba(136,22,28,0.10)', color: '#88161c', border: '1px solid rgba(136,22,28,0.15)' }}
                                            >
                                                Tandai
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteSession(session.id)}
                                                className="rounded-lg px-2 py-1.5 text-xs font-medium transition-all"
                                                style={{ background: 'rgba(239,68,68,0.10)', color: '#b91c1c', border: '1px solid rgba(239,68,68,0.18)' }}
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </LiquidGlassCard>
                        ))
                    )}
                </div>
            )}

            {viewMode === 'summary' && (
                <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                    <h3 className="mb-4 text-lg font-semibold" style={headingStyle}>Rekapitulasi Kehadiran</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-[rgba(0,0,0,0.06)]">
                                    <th className="pb-3 pr-4 font-medium text-[#6B7280]">Mahasiswa</th>
                                    <th className="pb-3 pr-4 font-medium text-[#6B7280]">Hadir</th>
                                    <th className="pb-3 pr-4 font-medium text-[#6B7280]">Terlambat</th>
                                    <th className="pb-3 pr-4 font-medium text-[#6B7280]">Izin</th>
                                    <th className="pb-3 pr-4 font-medium text-[#6B7280]">Absen</th>
                                    <th className="pb-3 pr-4 font-medium text-[#6B7280]">Persentase</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-[#6B7280]">Belum ada data kehadiran.</td>
                                    </tr>
                                ) : (
                                    summary.map((s) => (
                                        <tr key={s.student_id} className="border-b border-[rgba(0,0,0,0.04)]">
                                            <td className="py-3 pr-4">
                                                <p className="font-medium" style={{ color: '#4A4A4A' }}>{s.student_name}</p>
                                                <p className="text-xs text-[#6B7280]">{s.student_email}</p>
                                            </td>
                                            <td className="py-3 pr-4 font-medium" style={{ color: '#166534' }}>{s.present}</td>
                                            <td className="py-3 pr-4 font-medium" style={{ color: '#92400e' }}>{s.late}</td>
                                            <td className="py-3 pr-4 font-medium" style={{ color: '#4b5563' }}>{s.excused}</td>
                                            <td className="py-3 pr-4 font-medium" style={{ color: '#b91c1c' }}>{s.absent}</td>
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-16 rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }}>
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{
                                                                width: `${s.attendance_percentage}%`,
                                                                background: s.attendance_percentage >= 75 ? '#166534' : s.attendance_percentage >= 50 ? '#92400e' : '#b91c1c',
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="font-semibold" style={{ color: s.attendance_percentage >= 75 ? '#166534' : s.attendance_percentage >= 50 ? '#92400e' : '#b91c1c' }}>
                                                        {s.attendance_percentage}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </LiquidGlassCard>
            )}
        </div>
    );
}
