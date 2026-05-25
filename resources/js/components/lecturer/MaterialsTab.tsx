import { CourseMaterial, MaterialModule } from '@/types';
import { LiquidGlassCard } from '@/components/Welcome/utils/helpers';
import { BookOpen, Download, Eye, FileText, FolderPlus, GripVertical, Plus, Trash2, Upload } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

const headingStyle = { color: '#4A4A4A', fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;
const bodyTextClass = 'text-sm text-[#6B7280]';
const glassPanelStyle = { background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.65)' } as const;

const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return '-';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / 1024 ** index;
    return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${sizes[index]}`;
};

const FILE_ICONS: Record<string, string> = {
    'application/pdf': '📄',
    'image/png': '🖼️',
    'image/jpeg': '🖼️',
    'text/plain': '📝',
    'application/zip': '📦',
};

interface MaterialsTabProps {
    courseId: string;
}

export default function MaterialsTab({ courseId }: MaterialsTabProps) {
    const [modules, setModules] = useState<MaterialModule[]>([]);
    const [unassigned, setUnassigned] = useState<CourseMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [showModuleForm, setShowModuleForm] = useState(false);
    const [expandedModule, setExpandedModule] = useState<string | null>(null);

    const [newModule, setNewModule] = useState({ title: '' });
    const [uploadForm, setUploadForm] = useState({ title: '', description: '', module_id: '' });
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    const fetchMaterials = useCallback(async () => {
        try {
            const res = await fetch(`/lecturer/courses/${courseId}/materials`);
            const data = await res.json();
            setModules(data.modules || []);
            setUnassigned(data.unassigned || []);
        } catch {
            setModules([]);
            setUnassigned([]);
        }
    }, [courseId]);

    useEffect(() => {
        setLoading(true);
        fetchMaterials().finally(() => setLoading(false));
    }, [fetchMaterials]);

    const handleCreateModule = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await fetch(`/lecturer/courses/${courseId}/materials/modules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({ title: newModule.title }),
            });
            setNewModule({ title: '' });
            setShowModuleForm(false);
            fetchMaterials();
        } catch { /* */ }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm('Hapus modul ini? Materi di dalamnya akan menjadi "Tidak Bermodul".')) return;
        try {
            await fetch(`/lecturer/courses/${courseId}/materials/modules/${moduleId}`, {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': csrfToken },
            });
            fetchMaterials();
        } catch {
            /* */
        }
    };

    const handleUpload = async (e: FormEvent) => {
        e.preventDefault();
        if (!uploadFile) return;
        setUploading(true);

        const formData = new FormData();
        formData.append('title', uploadForm.title);
        if (uploadForm.description) formData.append('description', uploadForm.description);
        if (uploadForm.module_id) formData.append('module_id', uploadForm.module_id);
        formData.append('file', uploadFile);

        try {
            await fetch(`/lecturer/courses/${courseId}/materials`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken },
                body: formData,
            });
            setUploadForm({ title: '', description: '', module_id: '' });
            setUploadFile(null);
            setShowUploadForm(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchMaterials();
        } catch {
            /* */
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteMaterial = async (materialId: string) => {
        if (!confirm('Hapus materi ini?')) return;
        try {
            await fetch(`/lecturer/courses/${courseId}/materials/${materialId}`, {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': csrfToken },
            });
            fetchMaterials();
        } catch {
            /* */
        }
    };

    const renderMaterial = (material: CourseMaterial) => (
        <div key={material.id} className="flex items-center gap-3 rounded-xl p-3" style={glassPanelStyle}>
            <span className="text-lg">{FILE_ICONS[material.file_type || ''] || '📄'}</span>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" style={{ color: '#4A4A4A' }}>{material.title}</p>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-[#6B7280]">
                    <span>{material.file_name}</span>
                    <span>{formatFileSize(material.file_size)}</span>
                    <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {material.view_count}
                    </span>
                </div>
            </div>
            <div className="flex gap-1">
                <button
                    type="button"
                    onClick={() => handleDeleteMaterial(material.id)}
                    className="rounded-lg p-1.5 transition-colors hover:bg-red-50"
                    title="Hapus"
                >
                    <Trash2 className="h-4 w-4 text-red-400" />
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#88161c] border-t-transparent" />
            </div>
        );
    }

    const totalMaterials = modules.reduce((sum, m) => sum + (m.materials?.length || 0), 0) + unassigned.length;
    const totalViews = modules.reduce(
        (sum, m) => sum + (m.materials?.reduce((s, mat) => s + mat.view_count, 0) || 0),
        0,
    ) + unassigned.reduce((s, m) => s + m.view_count, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: 'rgba(136,22,28,0.08)', border: '1px solid rgba(136,22,28,0.12)' }}>
                        <BookOpen className="h-5 w-5" style={{ color: '#88161c' }} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold" style={headingStyle}>Materi Perkuliahan</h3>
                        <p className={bodyTextClass}>{totalMaterials} materi · {totalViews} total views</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setShowModuleForm(!showModuleForm)}
                        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
                        style={{ ...glassPanelStyle, color: '#4A4A4A' }}
                    >
                        <FolderPlus className="h-4 w-4" /> Tambah Modul
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowUploadForm(!showUploadForm)}
                        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all"
                        style={{ background: '#88161c' }}
                    >
                        <Upload className="h-4 w-4" /> Upload Materi
                    </button>
                </div>
            </div>

            {showModuleForm && (
                <LiquidGlassCard intensity="light" className="p-5" lightMode={true}>
                    <form onSubmit={handleCreateModule} className="flex gap-3">
                        <input
                            type="text"
                            required
                            value={newModule.title}
                            onChange={(e) => setNewModule({ title: e.target.value })}
                            placeholder="Nama modul (contoh: Minggu 1 - Pendahuluan)"
                            className="flex-1 rounded-xl border border-[rgba(0,0,0,0.08)] bg-white/60 px-4 py-2.5 text-sm outline-none focus:border-[#88161c]/30"
                        />
                        <button type="submit" className="rounded-xl bg-[#88161c] px-5 py-2.5 text-sm font-medium text-white">
                            Simpan
                        </button>
                        <button type="button" onClick={() => setShowModuleForm(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium" style={glassPanelStyle}>
                            Batal
                        </button>
                    </form>
                </LiquidGlassCard>
            )}

            {showUploadForm && (
                <LiquidGlassCard intensity="light" className="p-6" lightMode={true}>
                    <form onSubmit={handleUpload} className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium" style={{ color: '#4A4A4A' }}>Judul Materi</label>
                            <input
                                type="text"
                                required
                                value={uploadForm.title}
                                onChange={(e) => setUploadForm((p) => ({ ...p, title: e.target.value }))}
                                className="w-full rounded-xl border border-[rgba(0,0,0,0.08)] bg-white/60 px-4 py-2.5 text-sm outline-none focus:border-[#88161c]/30"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium" style={{ color: '#4A4A4A' }}>Modul</label>
                            <select
                                value={uploadForm.module_id}
                                onChange={(e) => setUploadForm((p) => ({ ...p, module_id: e.target.value }))}
                                className="w-full rounded-xl border border-[rgba(0,0,0,0.08)] bg-white/60 px-4 py-2.5 text-sm outline-none focus:border-[#88161c]/30"
                            >
                                <option value="">Tidak Bermodul</option>
                                {modules.map((m) => (
                                    <option key={m.id} value={m.id}>{m.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-sm font-medium" style={{ color: '#4A4A4A' }}>Deskripsi</label>
                            <input
                                type="text"
                                value={uploadForm.description}
                                onChange={(e) => setUploadForm((p) => ({ ...p, description: e.target.value }))}
                                placeholder="Opsional"
                                className="w-full rounded-xl border border-[rgba(0,0,0,0.08)] bg-white/60 px-4 py-2.5 text-sm outline-none focus:border-[#88161c]/30"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-sm font-medium" style={{ color: '#4A4A4A' }}>File</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                required
                                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                className="w-full rounded-xl border border-[rgba(0,0,0,0.08)] bg-white/60 px-4 py-2.5 text-sm outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-[#88161c]/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#88161c]"
                            />
                        </div>
                        <div className="flex gap-2 sm:col-span-2">
                            <button type="submit" disabled={uploading} className="rounded-xl bg-[#88161c] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">
                                {uploading ? 'Mengunggah...' : 'Upload'}
                            </button>
                            <button type="button" onClick={() => setShowUploadForm(false)} className="rounded-xl px-5 py-2.5 text-sm font-medium" style={glassPanelStyle}>
                                Batal
                            </button>
                        </div>
                    </form>
                </LiquidGlassCard>
            )}

            {modules.map((module) => (
                <LiquidGlassCard key={module.id} intensity="medium" className="p-5" lightMode={true}>
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                            className="flex items-center gap-3"
                        >
                            <FolderPlus className="h-5 w-5" style={{ color: '#88161c' }} />
                            <div className="text-left">
                                <h4 className="text-sm font-semibold" style={headingStyle}>{module.title}</h4>
                                <p className="text-xs text-[#6B7280]">{module.materials?.length || 0} materi</p>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDeleteModule(module.id)}
                            className="rounded-lg p-2 transition-colors hover:bg-red-50"
                            title="Hapus modul"
                        >
                            <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                    </div>
                    {(expandedModule === module.id || !expandedModule) && module.materials && module.materials.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {module.materials.map(renderMaterial)}
                        </div>
                    )}
                </LiquidGlassCard>
            ))}

            {unassigned.length > 0 && (
                <LiquidGlassCard intensity="medium" className="p-5" lightMode={true}>
                    <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5" style={{ color: '#6B7280' }} />
                        <h4 className="text-sm font-semibold" style={headingStyle}>Tidak Bermodul</h4>
                        <span className="text-xs text-[#6B7280]">{unassigned.length} materi</span>
                    </div>
                    <div className="mt-4 space-y-2">
                        {unassigned.map(renderMaterial)}
                    </div>
                </LiquidGlassCard>
            )}

            {totalMaterials === 0 && (
                <div className="flex flex-col items-center justify-center rounded-[28px] py-16" style={glassPanelStyle}>
                    <BookOpen className="h-10 w-10 text-[#6B7280] opacity-40" />
                    <p className={`mt-3 ${bodyTextClass}`}>Belum ada materi. Upload materi atau buat modul untuk memulai.</p>
                </div>
            )}
        </div>
    );
}
