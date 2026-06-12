import { LiquidGlassCard } from '@/components/Welcome/utils/helpers';
import { CourseMaterial, CourseWeek, VectorStatus } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, BookOpen, ChevronDown, ChevronUp, GripVertical, Plus, RefreshCw, Trash2, Upload, X } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

const bodyTextClass = 'text-sm text-brand-muted-dark';
const headingStyle = { color: '#4A4A4A' } as const;
const glassPanelStyle = { background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.65)' } as const;

const STATUS_LABELS: Record<VectorStatus, string> = {
    pending: 'Menunggu indeks',
    processing: 'Memproses',
    ready: 'Siap',
    failed: 'Gagal',
    skipped: 'Tidak diindeks',
};

const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return '-';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / 1024 ** index;
    return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${sizes[index]}`;
};

interface KbMaterialStatus {
    vector_status: VectorStatus;
    knowledge_base_id?: string | null;
    error_message?: string | null;
}

interface MaterialsHubResponse {
    materials: CourseMaterial[];
    pool: CourseMaterial[];
    weeks: CourseWeek[];
    kb_by_material_id: Record<string, KbMaterialStatus>;
    ai_index_configured: boolean;
}

interface UnifiedMaterialsTabProps {
    courseId: string;
    onHubStats?: (stats: { total: number; ready: number; processing: number; failed: number }) => void;
}

export default function UnifiedMaterialsTab({ courseId, onHubStats }: UnifiedMaterialsTabProps) {
    const [hub, setHub] = useState<MaterialsHubResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, 'pending' | 'uploading' | 'done' | 'error'>>({});
    const [uploading, setUploading] = useState(false);
    const [extractImages, setExtractImages] = useState(true);
    const [performOcr, setPerformOcr] = useState(true);
    const [newWeek, setNewWeek] = useState({ title: '' });
    const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
    const [dragWeekId, setDragWeekId] = useState<string | null>(null);
    const [weekOrder, setWeekOrder] = useState<CourseWeek[]>([]);
    const [reorderingWeeks, setReorderingWeeks] = useState(false);
    const [reindexingId, setReindexingId] = useState<string | null>(null);
    const [poolPickerWeekId, setPoolPickerWeekId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    const fetchHub = useCallback(async () => {
        try {
            const res = await fetch(`/lecturer/courses/${courseId}/materials-hub`, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            if (!res.ok) {
                return;
            }
            const data = (await res.json()) as MaterialsHubResponse;
            setHub({
                materials: data.materials ?? [],
                pool: data.pool ?? [],
                weeks: data.weeks ?? [],
                kb_by_material_id: data.kb_by_material_id ?? {},
                ai_index_configured: Boolean(data.ai_index_configured),
            });
        } catch {
            setHub(null);
        }
    }, [courseId]);

    useEffect(() => {
        setLoading(true);
        fetchHub().finally(() => setLoading(false));
    }, [fetchHub]);

    const kbByMaterial = hub?.kb_by_material_id ?? {};

    const hasKbInFlight = useMemo(() => {
        return Object.values(kbByMaterial).some(
            (s) => s.vector_status === 'pending' || s.vector_status === 'processing'
        );
    }, [kbByMaterial]);

    useEffect(() => {
        if (!hasKbInFlight) {
            return;
        }
        void fetchHub();
        const id = window.setInterval(() => void fetchHub(), 3000);
        return () => window.clearInterval(id);
    }, [hasKbInFlight, fetchHub]);

    const stats = useMemo(() => {
        const materials = hub?.materials ?? [];
        let ready = 0;
        let processing = 0;
        let failed = 0;
        for (const m of materials) {
            const st = kbByMaterial[m.id]?.vector_status;
            if (st === 'ready') ready += 1;
            else if (st === 'pending' || st === 'processing') processing += 1;
            else if (st === 'failed') failed += 1;
        }
        return { total: materials.length, ready, processing, failed };
    }, [hub?.materials, kbByMaterial]);

    useEffect(() => {
        onHubStats?.(stats);
    }, [stats, onHubStats]);

    useEffect(() => {
        if (hub?.weeks) {
            setWeekOrder(hub.weeks);
        }
    }, [hub?.weeks]);

    const persistWeekOrder = async (ordered: CourseWeek[]) => {
        setReorderingWeeks(true);
        const order = ordered.map((w, i) => ({ id: w.id, sort_order: i }));
        try {
            const res = await fetch(`/lecturer/courses/${courseId}/weeks/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({ order }),
            });
            if (!res.ok) {
                await fetchHub();
                return;
            }
            await fetchHub();
        } catch {
            await fetchHub();
        } finally {
            setReorderingWeeks(false);
        }
    };

    const moveWeekInOrder = (fromId: string, toId: string) => {
        if (fromId === toId) return;
        const prev = weekOrder.length > 0 ? weekOrder : (hub?.weeks ?? []);
        const fromIdx = prev.findIndex((w) => w.id === fromId);
        const toIdx = prev.findIndex((w) => w.id === toId);
        if (fromIdx < 0 || toIdx < 0) return;
        const next = [...prev];
        const [item] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, item);
        setWeekOrder(next);
        void persistWeekOrder(next);
    };

    const addUploadFiles = useCallback((incoming: FileList | File[]) => {
        const arr = Array.from(incoming);
        setUploadFiles((prev) => {
            const names = new Set(prev.map((f) => `${f.name}:${f.size}`));
            const unique = arr.filter((f) => !names.has(`${f.name}:${f.size}`));
            return [...prev, ...unique];
        });
    }, []);

    const removeUploadFile = useCallback((idx: number) => {
        setUploadFiles((prev) => prev.filter((_, i) => i !== idx));
    }, []);

    const closeUploadModal = useCallback(() => {
        if (uploading) return;
        setShowUploadModal(false);
        setDragOver(false);
        setUploadFiles([]);
        setUploadProgress({});
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [uploading]);

    useEffect(() => {
        if (!showUploadModal) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeUploadModal();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showUploadModal, closeUploadModal]);

    const moveWeekByStep = (weekId: string, delta: -1 | 1) => {
        const prev = weekOrder.length > 0 ? weekOrder : (hub?.weeks ?? []);
        const idx = prev.findIndex((w) => w.id === weekId);
        const targetIdx = idx + delta;
        if (idx < 0 || targetIdx < 0 || targetIdx >= prev.length) return;
        moveWeekInOrder(weekId, prev[targetIdx].id);
    };

    const handleUpload = async (e: FormEvent) => {
        e.preventDefault();
        if (uploadFiles.length === 0) return;
        setUploading(true);
        const initial: Record<string, 'pending' | 'uploading' | 'done' | 'error'> = {};
        uploadFiles.forEach((f, i) => { initial[`${f.name}:${f.size}:${i}`] = 'pending'; });
        setUploadProgress(initial);
        let anySuccess = false;
        let anyError = false;
        for (let i = 0; i < uploadFiles.length; i++) {
            const f = uploadFiles[i];
            const key = `${f.name}:${f.size}:${i}`;
            setUploadProgress((p) => ({ ...p, [key]: 'uploading' }));
            const formData = new FormData();
            formData.append('file', f);
            if (extractImages) formData.append('extract_images', '1');
            if (performOcr) formData.append('perform_ocr', '1');
            try {
                const res = await fetch(`/lecturer/courses/${courseId}/materials`, {
                    method: 'POST',
                    headers: { 'X-CSRF-TOKEN': csrfToken },
                    body: formData,
                });
                if (res.ok) {
                    setUploadProgress((p) => ({ ...p, [key]: 'done' }));
                    anySuccess = true;
                } else {
                    setUploadProgress((p) => ({ ...p, [key]: 'error' }));
                    anyError = true;
                }
            } catch {
                setUploadProgress((p) => ({ ...p, [key]: 'error' }));
                anyError = true;
            }
        }
        if (anySuccess) await fetchHub();
        setUploading(false);
        if (anySuccess && !anyError) {
            setUploadFiles([]);
            setUploadProgress({});
            setShowUploadModal(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteMaterial = async (materialId: string) => {
        if (!confirm('Hapus materi ini? Entri basis pengetahuan terkait juga dihapus.')) return;
        try {
            await fetch(`/lecturer/courses/${courseId}/materials/${materialId}`, {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': csrfToken },
            });
            await fetchHub();
        } catch {
            /* */
        }
    };

    const handleReindex = async (materialId: string) => {
        setReindexingId(materialId);
        try {
            await fetch(`/lecturer/courses/${courseId}/materials/${materialId}/reindex`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken },
            });
            await fetchHub();
        } catch {
            /* */
        } finally {
            setReindexingId(null);
        }
    };

    const handleCreateWeek = async (e: FormEvent) => {
        e.preventDefault();
        if (!newWeek.title.trim()) return;
        try {
            await fetch(`/lecturer/courses/${courseId}/weeks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({ title: newWeek.title.trim() }),
            });
            setNewWeek({ title: '' });
            await fetchHub();
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
            await fetchHub();
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
            await fetchHub();
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
            await fetchHub();
        } catch {
            /* */
        }
    };

    const renderVectorBadge = (materialId: string) => {
        const kb = kbByMaterial[materialId];
        if (!hub?.ai_index_configured) {
            return (
                <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ background: 'rgba(245,158,11,0.12)', color: '#92400e', border: '1px solid rgba(245,158,11,0.2)' }}
                    title="CORE_API_INTERNAL_SECRET tidak diset — indeks AI tidak dijalankan"
                >
                    Indeks nonaktif
                </span>
            );
        }
        if (!kb) {
            return (
                <span className="shrink-0 rounded-full px-2 py-0.5 text-xs text-brand-muted-dark" style={glassPanelStyle}>
                    Belum diindeks
                </span>
            );
        }
        const status = kb.vector_status;
        const color =
            status === 'ready'
                ? { bg: 'rgba(34,197,94,0.10)', fg: '#166534', border: 'rgba(34,197,94,0.18)' }
                : status === 'failed'
                  ? { bg: 'rgba(239,68,68,0.10)', fg: '#b91c1c', border: 'rgba(239,68,68,0.18)' }
                  : { bg: 'rgba(245,158,11,0.10)', fg: '#92400e', border: 'rgba(245,158,11,0.18)' };
        return (
            <span
                className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ background: color.bg, color: color.fg, border: `1px solid ${color.border}` }}
                title={kb.error_message ?? undefined}
            >
                {STATUS_LABELS[status]}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
            </div>
        );
    }

    const weeks = weekOrder.length > 0 ? weekOrder : (hub?.weeks ?? []);
    const pool = hub?.pool ?? [];
    const materials = hub?.materials ?? [];

    return (
        <div className="space-y-6">
            {hub && hub.ai_index_configured === false && (
                <LiquidGlassCard intensity="light" className="p-4" lightMode>
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                        <div>
                            <p className="text-sm font-medium text-brand-dark">Konfigurasi indeks AI tidak aktif</p>
                            <p className={`mt-1 ${bodyTextClass}`}>
                                Upload materi tetap berhasil, tetapi indeks vektor tidak diantri karena Laravel belum punya secret
                                internal. Set <code className="text-xs">CORE_API_INTERNAL_SECRET</code> di{' '}
                                <code className="text-xs">Kolabri-client-app/.env</code> sama persis dengan{' '}
                                <code className="text-xs">CORE_API_INTERNAL_SECRET</code> atau{' '}
                                <code className="text-xs">AI_ENGINE_SECRET</code> di core-api, lalu restart{' '}
                                <code className="text-xs">php artisan serve</code>.
                            </p>
                        </div>
                    </div>
                </LiquidGlassCard>
            )}

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
                            Materi &amp; minggu
                        </h3>
                        <p className={bodyTextClass}>
                            {materials.length} materi · {weeks.length} minggu · {pool.length} di pool
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white"
                    style={{ background: '#88161c' }}
                >
                    <Upload className="h-4 w-4" />
                    Upload materi
                </button>
            </div>

            <AnimatePresence>
                {showUploadModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                            onClick={closeUploadModal}
                            aria-hidden
                        />
                        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="upload-material-title"
                                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                                className="pointer-events-auto w-full max-w-lg rounded-2xl p-6"
                                style={{
                                    background: 'rgba(255,255,255,0.98)',
                                    backdropFilter: 'blur(20px) saturate(180%)',
                                    border: '1px solid rgba(136,22,28,0.12)',
                                    boxShadow: '0 25px 60px rgba(0,0,0,0.15), 0 10px 24px rgba(0,0,0,0.08)',
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="mb-5 flex items-start justify-between gap-3">
                                    <div>
                                        <h3 id="upload-material-title" className="text-lg font-semibold" style={headingStyle}>
                                            Upload materi
                                        </h3>
                                        <p className={`mt-1 ${bodyTextClass}`}>File masuk pool kelas dan diindeks untuk AI.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={closeUploadModal}
                                        disabled={uploading}
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-brand-muted-dark transition-colors hover:bg-[rgba(136,22,28,0.08)] hover:text-brand-primary disabled:opacity-40"
                                        aria-label="Tutup"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <form onSubmit={handleUpload} className="flex flex-col gap-4">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept=".pdf,.docx,.pptx,.txt,.md,.png,.jpg,.jpeg,.gif,.webp,.zip"
                                        onChange={(e) => { if (e.target.files?.length) addUploadFiles(e.target.files); e.target.value = ''; }}
                                        className="sr-only"
                                        tabIndex={-1}
                                        aria-hidden
                                    />

                                    {uploadFiles.length > 0 && (
                                        <div className="max-h-52 space-y-2 overflow-y-auto rounded-xl p-1" style={glassPanelStyle}>
                                            {uploadFiles.map((f, i) => {
                                                const key = `${f.name}:${f.size}:${i}`;
                                                const st = uploadProgress[key];
                                                return (
                                                    <div key={key} className="flex items-center gap-3 rounded-lg bg-white/60 px-3 py-2">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-medium text-brand-dark">{f.name}</p>
                                                            <p className="text-xs text-brand-muted-dark">{formatFileSize(f.size)}</p>
                                                        </div>
                                                        {st === 'uploading' && (
                                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
                                                        )}
                                                        {st === 'done' && <span className="text-xs font-medium text-green-600">Selesai</span>}
                                                        {st === 'error' && <span className="text-xs font-medium text-red-500">Gagal</span>}
                                                        {!st && (
                                                            <button
                                                                type="button"
                                                                disabled={uploading}
                                                                onClick={() => removeUploadFile(i)}
                                                                className="shrink-0 rounded-md p-1 text-brand-muted-dark hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                                                                aria-label={`Hapus ${f.name}`}
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => !uploading && fileInputRef.current?.click()}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!uploading) fileInputRef.current?.click(); } }}
                                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'copy'; setDragOver(true); }}
                                        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
                                        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDragOver(false);
                                            if (e.dataTransfer.files?.length) addUploadFiles(e.dataTransfer.files);
                                        }}
                                        className={`flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-sm transition-colors ${
                                            dragOver
                                                ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                                                : 'border-brand-primary/35 bg-white/70 text-brand-primary'
                                        }`}
                                    >
                                        <Upload className={`h-5 w-5 ${dragOver ? 'text-brand-primary' : 'text-brand-primary/60'}`} />
                                        <span className="font-medium">
                                            {uploadFiles.length > 0 ? 'Tambah file lagi' : 'Seret file ke sini atau klik untuk memilih'}
                                        </span>
                                        <span className="text-xs text-brand-muted-dark">PDF, DOCX, PPTX, TXT, gambar, ZIP (maks 50MB per file)</span>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-brand-dark">
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" checked={extractImages} onChange={(e) => setExtractImages(e.target.checked)} />
                                            Ekstrak gambar dari PDF
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" checked={performOcr} onChange={(e) => setPerformOcr(e.target.checked)} />
                                            OCR halaman minim teks
                                        </label>
                                    </div>

                                    <div className="flex flex-wrap justify-end gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={closeUploadModal}
                                            disabled={uploading}
                                            className="rounded-xl px-5 py-2.5 text-sm disabled:opacity-50"
                                            style={glassPanelStyle}
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={uploading || uploadFiles.length === 0}
                                            className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                                        >
                                            {uploading ? 'Mengunggah…' : `Upload ${uploadFiles.length > 1 ? `${uploadFiles.length} file` : 'ke pool'}`}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            <LiquidGlassCard intensity="light" className="p-5" lightMode>
                <h4 className="text-sm font-semibold" style={headingStyle}>
                    Semua materi kelas
                </h4>
                <ul className="mt-3 space-y-2">
                    {materials.length === 0 ? (
                        <li className={`${bodyTextClass} py-4 text-center`}>Belum ada materi. Upload untuk memulai.</li>
                    ) : (
                        materials.map((m) => {
                            const kb = kbByMaterial[m.id];
                            const needsReindex = !kb || kb.vector_status === 'failed';
                            return (
                            <li key={m.id} className="flex items-center gap-3 rounded-xl p-3" style={glassPanelStyle}>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-brand-dark">{m.title}</p>
                                    <p className="text-xs text-brand-muted-dark">
                                        {m.file_name} · {formatFileSize(m.file_size)}
                                    </p>
                                </div>
                                {renderVectorBadge(m.id)}
                                {needsReindex && hub?.ai_index_configured && (
                                    <button
                                        type="button"
                                        disabled={reindexingId === m.id}
                                        onClick={() => handleReindex(m.id)}
                                        className="rounded-lg p-1.5 text-brand-primary hover:bg-brand-primary/10 disabled:opacity-40"
                                        title="Kirim ulang ke antrian indeks"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${reindexingId === m.id ? 'animate-spin' : ''}`} />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleDeleteMaterial(m.id)}
                                    className="rounded-lg p-1.5 hover:bg-red-50"
                                    title="Hapus"
                                >
                                    <Trash2 className="h-4 w-4 text-red-400" />
                                </button>
                            </li>
                            );
                        })
                    )}
                </ul>
            </LiquidGlassCard>

            <LiquidGlassCard intensity="light" className="p-5" lightMode>
                <form onSubmit={handleCreateWeek} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-brand-dark">Judul minggu</label>
                        <input
                            type="text"
                            value={newWeek.title}
                            onChange={(e) => setNewWeek((p) => ({ ...p, title: e.target.value }))}
                            className="mt-1 w-full rounded-xl border-0 bg-white/60 px-3 py-2 text-sm ring-1 ring-inset ring-white/50"
                            required
                        />
                    </div>
                    <button type="submit" className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white" style={{ background: '#88161c' }}>
                        <Plus className="h-4 w-4" /> Tambah minggu
                    </button>
                </form>
            </LiquidGlassCard>

            {weeks.length > 1 && (
                <p className={`text-xs text-brand-muted-dark ${reorderingWeeks ? 'opacity-70' : ''}`}>
                    Urutkan minggu dengan tombol naik/turun atau seret lewat ikon grip (nomor minggu menyesuaikan otomatis).
                </p>
            )}
            <div className="space-y-4">
                {weeks.map((week, weekIdx) => (
                    <LiquidGlassCard
                        key={week.id}
                        data-week-card={week.id}
                        intensity="light"
                        className={`p-5 transition-opacity ${dragWeekId === week.id ? 'opacity-50 ring-2 ring-brand-primary/25' : ''} ${reorderingWeeks ? 'pointer-events-none opacity-80' : ''}`}
                        lightMode
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            const fromId = e.dataTransfer.getData('text/week-id');
                            if (fromId) moveWeekInOrder(fromId, week.id);
                            setDragWeekId(null);
                        }}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 flex-1 items-start gap-2">
                                <span
                                    role="button"
                                    tabIndex={0}
                                    draggable={weeks.length > 1 && !reorderingWeeks}
                                    onDragStart={(e) => {
                                        const card = (e.currentTarget.closest('[data-week-card]') as HTMLElement | null);
                                        if (card) {
                                            const cardRect = card.getBoundingClientRect();
                                            const handleRect = e.currentTarget.getBoundingClientRect();
                                            const offsetX = handleRect.left - cardRect.left + handleRect.width / 2;
                                            const offsetY = handleRect.top - cardRect.top + handleRect.height / 2;
                                            e.dataTransfer.setDragImage(card, offsetX, offsetY);
                                        }
                                        e.dataTransfer.setData('text/week-id', week.id);
                                        e.dataTransfer.effectAllowed = 'move';
                                        setDragWeekId(week.id);
                                    }}
                                    onDragEnd={() => setDragWeekId(null)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
                                    }}
                                    className="mt-1 shrink-0 cursor-grab rounded p-1 active:cursor-grabbing touch-none select-none"
                                    title="Seret untuk mengurutkan"
                                    aria-label="Seret untuk mengurutkan minggu"
                                >
                                    <GripVertical className="h-4 w-4 text-brand-muted-dark pointer-events-none" />
                                </span>
                                {weeks.length > 1 && (
                                    <div className="mt-0.5 flex shrink-0 flex-col gap-0.5">
                                        <button
                                            type="button"
                                            disabled={reorderingWeeks || weekIdx === 0}
                                            onClick={() => moveWeekByStep(week.id, -1)}
                                            className="rounded-md p-0.5 hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-30"
                                            title="Naikkan minggu"
                                            aria-label="Naikkan minggu"
                                        >
                                            <ChevronUp className="h-4 w-4 text-brand-muted-dark" />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={reorderingWeeks || weekIdx === weeks.length - 1}
                                            onClick={() => moveWeekByStep(week.id, 1)}
                                            className="rounded-md p-0.5 hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-30"
                                            title="Turunkan minggu"
                                            aria-label="Turunkan minggu"
                                        >
                                            <ChevronDown className="h-4 w-4 text-brand-muted-dark" />
                                        </button>
                                    </div>
                                )}
                            <button
                                type="button"
                                className="min-w-0 flex-1 text-left"
                                onClick={() => setExpandedWeek(expandedWeek === week.id ? null : week.id)}
                            >
                                <div>
                                    <p className="font-semibold" style={headingStyle}>
                                        Minggu {week.week_index}: {week.title}
                                    </p>
                                    <p className={bodyTextClass}>{week.materials?.length ?? 0} materi</p>
                                </div>
                            </button>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPoolPickerWeekId(poolPickerWeekId === week.id ? null : week.id)}
                                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                                    style={{ background: '#88161c' }}
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah Materi
                                </button>
                                <button type="button" onClick={() => handleDeleteWeek(week.id)} className="rounded-lg p-2 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4 text-red-400" />
                                </button>
                            </div>
                        </div>
                        {poolPickerWeekId === week.id && (
                            <div className="mt-3 space-y-1 rounded-xl p-3" style={glassPanelStyle}>
                                <p className="text-xs font-medium text-brand-dark mb-2">Pilih dari pool:</p>
                                {pool.length === 0 ? (
                                    <p className="text-xs text-brand-muted-dark py-2 text-center">
                                        Semua materi sudah ditugaskan ke minggu. Upload materi baru untuk menambah ke pool.
                                    </p>
                                ) : (
                                    pool.map((m) => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={async () => { await handleAssign(week.id, m.id); setPoolPickerWeekId(null); }}
                                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-white/80"
                                        >
                                            <span className="truncate">{m.title}</span>
                                            <span className="shrink-0 text-xs text-brand-muted-dark">{formatFileSize(m.file_size)}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                        {expandedWeek === week.id && (
                            <div className="mt-4 space-y-2 border-t border-white/50 pt-4">
                                {(week.materials || []).map((m) => (
                                    <div key={m.id} className="flex items-center justify-between rounded-xl p-3" style={glassPanelStyle}>
                                        <span className="truncate text-sm">{m.title}</span>
                                        <button type="button" className="text-xs text-red-500" onClick={() => handleUnassign(week.id, m.id)}>
                                            Keluarkan
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setPoolPickerWeekId(poolPickerWeekId === week.id ? null : week.id)}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-primary/30 bg-white/40 px-3 py-2.5 text-sm font-medium text-brand-primary transition-colors hover:border-brand-primary/50 hover:bg-white/60"
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah dari pool
                                </button>
                            </div>
                        )}
                    </LiquidGlassCard>
                ))}
            </div>

            {pool.length > 0 && (
                <LiquidGlassCard intensity="light" className="p-5" lightMode>
                    <h4 className="text-sm font-semibold" style={headingStyle}>
                        Pool (belum di minggu)
                    </h4>
                    <ul className="mt-3 space-y-2">
                        {pool.map((m) => (
                            <li key={m.id} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm" style={glassPanelStyle}>
                                <span>{m.title}</span>
                                {renderVectorBadge(m.id)}
                            </li>
                        ))}
                    </ul>
                </LiquidGlassCard>
            )}
        </div>
    );
}