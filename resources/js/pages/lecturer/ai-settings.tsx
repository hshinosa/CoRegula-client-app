import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Archive,
    BarChart3,
    Beaker,
    ChevronDown,
    ChevronUp,
    Clock,
    Copy,
    Download,
    Edit3,
    Eye,
    FileText,
    FlaskConical,
    Globe,
    Loader2,
    Play,
    Plus,
    Search,
    Share2,
    Sliders,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { LiquidGlassCard, PrimaryButton, SecondaryButton } from '@/components/Welcome/utils/helpers';
import { toast } from '@/components/ui/toaster';
import { SkeletonCard } from '@/components/ui/skeletons';
import AppLayout from '@/layouts/app-layout';
import { useLecturerNav } from '@/components/navigation/lecturer-nav';

const headingStyle = {
    color: 'rgb(var(--color-brand-dark))',
} as const;

const inputClassName =
    'mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-brand-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2';

const buttonSpinner = <Loader2 className="h-4 w-4 animate-spin" />;

type Tab = 'preview' | 'presets' | 'history' | 'ab-testing';

interface AiPreset {
    id: number;
    user_id: string;
    name: string;
    description: string | null;
    department: string | null;
    system_prompt: string;
    temperature: number;
    max_tokens: number;
    model: string | null;
    course_ids: string[] | null;
    is_shared: boolean;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

interface Course {
    id: string;
    code: string;
    name: string;
}

interface PreviewResult {
    response: string;
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    latencyMs: number;
    estimatedCost: number;
}

interface HistoryRecord {
    id: string;
    userId: string;
    courseId: string | null;
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
    latencyMs: number;
    createdAt: string;
}

interface HistoryMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface AbTest {
    id: string;
    name: string;
    description: string | null;
    courseId: string;
    status: 'draft' | 'active' | 'paused' | 'completed';
    variantA: { systemPrompt: string; temperature: number; maxTokens: number; model?: string };
    variantB: { systemPrompt: string; temperature: number; maxTokens: number; model?: string };
    createdAt: string;
    _count?: { results: number };
}

interface AbTestStats {
    testId: string;
    name: string;
    status: string;
    totalResults: number;
    variantA: { count: number; avgLatency: number; avgTokens: number; avgCost: number };
    variantB: { count: number; avgLatency: number; avgTokens: number; avgCost: number };
    minResultsPerVariant: number;
    readyForAnalysis: boolean;
}

interface PageProps {
    presets: AiPreset[];
    courses: Course[];
    department: string | null;
}

function formatDate(date?: string | null) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function extractErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        const payload = error.response?.data as Record<string, unknown> | undefined;
        if (payload?.message && typeof payload.message === 'string') return payload.message;
        const err = payload?.error as Record<string, unknown> | undefined;
        if (err?.message && typeof err.message === 'string') return err.message;
    }
    return fallback;
}

const TabButton = ({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
            active ? 'bg-brand-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
        }`}
    >
        {icon}
        {label}
    </button>
);

const Modal = ({ open, title, onClose, children, maxWidth = 'max-w-2xl' }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode; maxWidth?: string }) => {
    if (!open) return null;
    return (
        <AnimatePresence>
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black" onClick={onClose} />
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl`}>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold" style={headingStyle}>{title}</h3>
                            <button onClick={onClose} className="rounded-full p-1 hover:bg-slate-100"><X className="h-5 w-5" /></button>
                        </div>
                        {children}
                    </div>
                </motion.div>
            </>
        </AnimatePresence>
    );
};

const previewRateInfo = { max: 10, windowMinutes: 5, remaining: null as number | null };

function PreviewTab({ courses }: { courses: Course[] }) {
    const [prompt, setPrompt] = useState('');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [courseId, setCourseId] = useState('');
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(1024);
    const [result, setResult] = useState<PreviewResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [rateRemaining, setRateRemaining] = useState<number | null>(null);

    const handlePreview = async (e: FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        setLoading(true);
        setResult(null);
        try {
            const { data } = await axios.post('/lecturer/ai-settings/preview', {
                prompt,
                system_prompt: systemPrompt || undefined,
                course_id: courseId || undefined,
                temperature,
                max_tokens: maxTokens,
            });
            setResult(data.data);
            const remaining = data.headers?.['x-ratelimit-remaining'];
            if (remaining) setRateRemaining(parseInt(remaining));
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 429) {
                toast.error('Rate limit exceeded. Please wait before testing again.');
            } else {
                toast.error(extractErrorMessage(error, 'Preview failed'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <LiquidGlassCard className="p-6">
                <form onSubmit={handlePreview} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">System Prompt</label>
                        <textarea
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            placeholder="e.g., You are a helpful teaching assistant for Web Programming course..."
                            rows={3}
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">User Prompt</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., Explain the difference between GET and POST HTTP methods..."
                            rows={4}
                            className={inputClassName}
                            required
                        />
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="min-w-[200px] flex-1">
                            <label className="block text-sm font-medium text-slate-700">Course Context</label>
                            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={inputClassName}>
                                <option value="">No course context</option>
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
                        <Sliders className="h-4 w-4" />
                        Advanced Settings
                        {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {showAdvanced && (
                        <div className="flex flex-wrap gap-4 rounded-xl bg-slate-50 p-4">
                            <div className="min-w-[150px] flex-1">
                                <label className="block text-sm font-medium text-slate-700">Temperature: {temperature}</label>
                                <input type="range" min="0" max="2" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="mt-2 w-full" />
                            </div>
                            <div className="min-w-[150px] flex-1">
                                <label className="block text-sm font-medium text-slate-700">Max Tokens</label>
                                <input type="number" min={1} max={4096} value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value))} className={inputClassName} />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-400">
                            Rate limit: {previewRateInfo.max} requests per {previewRateInfo.windowMinutes} min
                            {rateRemaining !== null && ` (${rateRemaining} remaining)`}
                        </div>
                        <PrimaryButton disabled={loading || !prompt.trim()}>
                            {loading ? buttonSpinner : <Play className="h-4 w-4" />}
                            {loading ? 'Testing...' : 'Test Preview'}
                        </PrimaryButton>
                    </div>
                </form>
            </LiquidGlassCard>

            {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <LiquidGlassCard className="p-6">
                        <div className="mb-3 flex items-center justify-between">
                            <h4 className="font-semibold" style={headingStyle}>AI Response</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span>{result.provider}</span>
                                <span>•</span>
                                <span>{result.model}</span>
                                <span>•</span>
                                <span>{result.latencyMs}ms</span>
                            </div>
                        </div>
                        <div className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{result.response}</div>
                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                            <span>Prompt tokens: {result.promptTokens}</span>
                            <span>Completion tokens: {result.completionTokens}</span>
                            <span>Total: {result.totalTokens}</span>
                            <span>Cost: ${result.estimatedCost.toFixed(6)}</span>
                        </div>
                    </LiquidGlassCard>
                </motion.div>
            )}
        </div>
    );
}

function PresetsTab({ presets: initialPresets, courses, department }: { presets: AiPreset[]; courses: Course[]; department: string | null }) {
    const [presets, setPresets] = useState(initialPresets);
    const [showEditor, setShowEditor] = useState(false);
    const [editingPreset, setEditingPreset] = useState<AiPreset | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showImport, setShowImport] = useState(false);
    const [importData, setImportData] = useState('');

    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formSystemPrompt, setFormSystemPrompt] = useState('');
    const [formTemperature, setFormTemperature] = useState(0.7);
    const [formMaxTokens, setFormMaxTokens] = useState(1024);
    const [formModel, setFormModel] = useState('');
    const [formIsShared, setFormIsShared] = useState(false);
    const [formIsDefault, setFormIsDefault] = useState(false);
    const [saving, setSaving] = useState(false);

    const filtered = useMemo(() => {
        if (!searchQuery.trim()) return presets;
        const q = searchQuery.toLowerCase();
        return presets.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }, [presets, searchQuery]);

    const openCreate = () => {
        setEditingPreset(null);
        setFormName('');
        setFormDescription('');
        setFormSystemPrompt('');
        setFormTemperature(0.7);
        setFormMaxTokens(1024);
        setFormModel('');
        setFormIsShared(false);
        setFormIsDefault(false);
        setShowEditor(true);
    };

    const openEdit = (preset: AiPreset) => {
        setEditingPreset(preset);
        setFormName(preset.name);
        setFormDescription(preset.description ?? '');
        setFormSystemPrompt(preset.system_prompt);
        setFormTemperature(preset.temperature);
        setFormMaxTokens(preset.max_tokens);
        setFormModel(preset.model ?? '');
        setFormIsShared(preset.is_shared);
        setFormIsDefault(preset.is_default);
        setShowEditor(true);
    };

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name: formName,
                description: formDescription || null,
                system_prompt: formSystemPrompt,
                temperature: formTemperature,
                max_tokens: formMaxTokens,
                model: formModel || null,
                is_shared: formIsShared,
                is_default: formIsDefault,
            };

            if (editingPreset) {
                const { data } = await axios.put(`/lecturer/ai-settings/presets/${editingPreset.id}`, payload);
                setPresets((prev) => prev.map((p) => (p.id === editingPreset.id ? data.data : p)));
                toast.success('Preset updated');
            } else {
                const { data } = await axios.post('/lecturer/ai-settings/presets', payload);
                setPresets((prev) => [data.data, ...prev]);
                toast.success('Preset created');
            }
            setShowEditor(false);
        } catch (error) {
            toast.error(extractErrorMessage(error, 'Failed to save preset'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this preset?')) return;
        try {
            await axios.delete(`/lecturer/ai-settings/presets/${id}`);
            setPresets((prev) => prev.filter((p) => p.id !== id));
            toast.success('Preset deleted');
        } catch (error) {
            toast.error(extractErrorMessage(error, 'Failed to delete preset'));
        }
    };

    const handleExport = async (id: number) => {
        try {
            const { data } = await axios.get(`/lecturer/ai-settings/presets/${id}/export`);
            navigator.clipboard.writeText(JSON.stringify(data.data, null, 2));
            toast.success('Preset copied to clipboard as JSON');
        } catch (error) {
            toast.error(extractErrorMessage(error, 'Export failed'));
        }
    };

    const handleImport = async () => {
        try {
            const parsed = JSON.parse(importData);
            const { data } = await axios.post('/lecturer/ai-settings/presets/import', parsed);
            setPresets((prev) => [data.data, ...prev]);
            setShowImport(false);
            setImportData('');
            toast.success('Preset imported');
        } catch (error) {
            toast.error(extractErrorMessage(error, 'Invalid JSON or import failed'));
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search presets..."
                        className={`${inputClassName} pl-10`}
                    />
                </div>
                <div className="flex gap-2">
                    <SecondaryButton onClick={() => setShowImport(true)}>
                        <Upload className="h-4 w-4" /> Import
                    </SecondaryButton>
                    <PrimaryButton onClick={openCreate}>
                        <Plus className="h-4 w-4" /> New Preset
                    </PrimaryButton>
                </div>
            </div>

            {filtered.length === 0 ? (
                <LiquidGlassCard className="p-8 text-center">
                    <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    <p className="text-slate-500">{searchQuery ? 'No presets match your search' : 'No presets yet. Create one to get started!'}</p>
                </LiquidGlassCard>
            ) : (
                <div className="space-y-3">
                    {filtered.map((preset) => (
                        <LiquidGlassCard key={preset.id} className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-slate-800 truncate">{preset.name}</h4>
                                        {preset.is_default && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">Default</span>}
                                        {preset.is_shared && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 flex items-center gap-1"><Globe className="h-3 w-3" />Shared</span>}
                                    </div>
                                    {preset.description && <p className="mt-1 text-sm text-slate-500 truncate">{preset.description}</p>}
                                    <p className="mt-2 text-xs text-slate-400 truncate max-w-lg">{preset.system_prompt}</p>
                                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                                        <span>T: {preset.temperature}</span>
                                        <span>Tokens: {preset.max_tokens}</span>
                                        {preset.model && <span>Model: {preset.model}</span>}
                                        <span>Updated: {formatDate(preset.updated_at)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 ml-3">
                                    <button onClick={() => openEdit(preset)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="Edit">
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleExport(preset.id)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="Export">
                                        <Download className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleDelete(preset.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500" title="Delete">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </LiquidGlassCard>
                    ))}
                </div>
            )}

            <Modal open={showEditor} title={editingPreset ? 'Edit Preset' : 'Create Preset'} onClose={() => setShowEditor(false)}>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Name</label>
                        <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required maxLength={200} className={inputClassName} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Description</label>
                        <input type="text" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} maxLength={1000} className={inputClassName} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">System Prompt</label>
                        <textarea value={formSystemPrompt} onChange={(e) => setFormSystemPrompt(e.target.value)} required rows={4} maxLength={5000} className={inputClassName} />
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="min-w-[150px] flex-1">
                            <label className="block text-sm font-medium text-slate-700">Temperature: {formTemperature}</label>
                            <input type="range" min="0" max="2" step="0.1" value={formTemperature} onChange={(e) => setFormTemperature(parseFloat(e.target.value))} className="mt-2 w-full" />
                        </div>
                        <div className="min-w-[150px] flex-1">
                            <label className="block text-sm font-medium text-slate-700">Max Tokens</label>
                            <input type="number" min={1} max={4096} value={formMaxTokens} onChange={(e) => setFormMaxTokens(parseInt(e.target.value))} className={inputClassName} />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="min-w-[150px] flex-1">
                            <label className="block text-sm font-medium text-slate-700">Model (optional)</label>
                            <input type="text" value={formModel} onChange={(e) => setFormModel(e.target.value)} placeholder="e.g., gpt-4o" className={inputClassName} />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={formIsShared} onChange={(e) => setFormIsShared(e.target.checked)} className="rounded" />
                            <Share2 className="h-4 w-4" /> Share with department
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={formIsDefault} onChange={(e) => setFormIsDefault(e.target.checked)} className="rounded" />
                            Set as default
                        </label>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <SecondaryButton onClick={() => setShowEditor(false)}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={saving}>
                            {saving ? buttonSpinner : null}
                            {saving ? 'Saving...' : editingPreset ? 'Update' : 'Create'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal open={showImport} title="Import Preset" onClose={() => { setShowImport(false); setImportData(''); }}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Paste JSON</label>
                        <textarea
                            value={importData}
                            onChange={(e) => setImportData(e.target.value)}
                            rows={8}
                            placeholder='{"name": "...", "system_prompt": "...", ...}'
                            className={inputClassName}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <SecondaryButton onClick={() => { setShowImport(false); setImportData(''); }}>Cancel</SecondaryButton>
                        <PrimaryButton onClick={handleImport} disabled={!importData.trim()}>Import</PrimaryButton>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

function HistoryTab({ courses }: { courses: Course[] }) {
    const [records, setRecords] = useState<HistoryRecord[]>([]);
    const [meta, setMeta] = useState<HistoryMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filterCourse, setFilterCourse] = useState('');
    const [filterStudent, setFilterStudent] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = { page: String(page), limit: '20' };
            if (filterCourse) params.courseId = filterCourse;
            if (filterStudent) params.studentId = filterStudent;
            if (filterStartDate) params.startDate = new Date(filterStartDate).toISOString();
            if (filterEndDate) params.endDate = new Date(filterEndDate).toISOString();

            const { data } = await axios.get('/lecturer/ai-settings/history', { params });
            setRecords(data.data);
            setMeta(data.meta);
        } catch (error) {
            toast.error(extractErrorMessage(error, 'Failed to fetch history'));
        } finally {
            setLoading(false);
        }
    }, [page, filterCourse, filterStudent, filterStartDate, filterEndDate]);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    const handleArchive = async () => {
        if (!confirm('Archive AI interaction data older than 90 days? This identifies records for archival.')) return;
        try {
            const { data } = await axios.post('/lecturer/ai-settings/history/archive');
            toast.success(`${data.data.archivedCount} records identified for archival`);
        } catch (error) {
            toast.error(extractErrorMessage(error, 'Archive failed'));
        }
    };

    return (
        <div className="space-y-4">
            <LiquidGlassCard className="p-4">
                <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[150px] flex-1">
                        <label className="block text-xs font-medium text-slate-500">Course</label>
                        <select value={filterCourse} onChange={(e) => { setFilterCourse(e.target.value); setPage(1); }} className={inputClassName}>
                            <option value="">All courses</option>
                            {courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
                        </select>
                    </div>
                    <div className="min-w-[150px] flex-1">
                        <label className="block text-xs font-medium text-slate-500">Student ID</label>
                        <input type="text" value={filterStudent} onChange={(e) => { setFilterStudent(e.target.value); setPage(1); }} placeholder="UUID..." className={inputClassName} />
                    </div>
                    <div className="min-w-[140px]">
                        <label className="block text-xs font-medium text-slate-500">Start Date</label>
                        <input type="date" value={filterStartDate} onChange={(e) => { setFilterStartDate(e.target.value); setPage(1); }} className={inputClassName} />
                    </div>
                    <div className="min-w-[140px]">
                        <label className="block text-xs font-medium text-slate-500">End Date</label>
                        <input type="date" value={filterEndDate} onChange={(e) => { setFilterEndDate(e.target.value); setPage(1); }} className={inputClassName} />
                    </div>
                    <SecondaryButton onClick={handleArchive}>
                        <Archive className="h-4 w-4" /> Archive Old Data
                    </SecondaryButton>
                </div>
            </LiquidGlassCard>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-primary" /></div>
            ) : records.length === 0 ? (
                <LiquidGlassCard className="p-8 text-center">
                    <Clock className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    <p className="text-slate-500">No AI interaction history found</p>
                </LiquidGlassCard>
            ) : (
                <>
                    <div className="space-y-2">
                        {records.map((record) => (
                            <LiquidGlassCard key={record.id} className="p-4">
                                <button
                                    onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                                    className="flex w-full items-center justify-between text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-slate-100 p-2">
                                            <BarChart3 className="h-4 w-4 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{record.provider} — {record.model}</p>
                                            <p className="text-xs text-slate-400">{formatDate(record.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                        <span>{record.totalTokens} tokens</span>
                                        <span>${record.estimatedCost.toFixed(4)}</span>
                                        {expandedId === record.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </div>
                                </button>
                                {expandedId === record.id && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3 border-t border-slate-100 pt-3">
                                        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                                            <div><span className="text-slate-400">Prompt Tokens:</span> <span className="font-medium">{record.promptTokens}</span></div>
                                            <div><span className="text-slate-400">Completion:</span> <span className="font-medium">{record.completionTokens}</span></div>
                                            <div><span className="text-slate-400">Latency:</span> <span className="font-medium">{record.latencyMs}ms</span></div>
                                            <div><span className="text-slate-400">Cost:</span> <span className="font-medium">${record.estimatedCost.toFixed(6)}</span></div>
                                            <div><span className="text-slate-400">User ID:</span> <span className="font-medium font-mono text-xs">{record.userId}</span></div>
                                            <div><span className="text-slate-400">Course ID:</span> <span className="font-medium font-mono text-xs">{record.courseId ?? '-'}</span></div>
                                        </div>
                                    </motion.div>
                                )}
                            </LiquidGlassCard>
                        ))}
                    </div>
                    {meta && meta.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <SecondaryButton onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Previous</SecondaryButton>
                            <span className="text-sm text-slate-500">Page {meta.page} of {meta.totalPages}</span>
                            <SecondaryButton onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages}>Next</SecondaryButton>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function ABTestingTab({ courses }: { courses: Course[] }) {
    const [tests, setTests] = useState<AbTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreator, setShowCreator] = useState(false);
    const [selectedTest, setSelectedTest] = useState<string | null>(null);
    const [stats, setStats] = useState<AbTestStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formCourseId, setFormCourseId] = useState('');
    const [formVariantASystemPrompt, setFormVariantASystemPrompt] = useState('');
    const [formVariantATemperature, setFormVariantATemperature] = useState(0.7);
    const [formVariantBSystemPrompt, setFormVariantBSystemPrompt] = useState('');
    const [formVariantBTemperature, setFormVariantBTemperature] = useState(0.7);
    const [saving, setSaving] = useState(false);

    const fetchTests = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/lecturer/ai-settings/ab-tests');
            setTests(data.data);
        } catch (error) {
            toast.error(extractErrorMessage(error, 'Failed to fetch A/B tests'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTests(); }, [fetchTests]);

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        if (!formCourseId) { toast.error('Select a course'); return; }
        setSaving(true);
        try {
            await axios.post('/lecturer/ai-settings/ab-tests', {
                name: formName,
                description: formDescription || undefined,
                courseId: formCourseId,
                variantA: { systemPrompt: formVariantASystemPrompt, temperature: formVariantATemperature, maxTokens: 1024 },
                variantB: { systemPrompt: formVariantBSystemPrompt, temperature: formVariantBTemperature, maxTokens: 1024 },
            });
            toast.success('A/B test created');
            setShowCreator(false);
            setFormName('');
            setFormDescription('');
            setFormCourseId('');
            setFormVariantASystemPrompt('');
            setFormVariantBSystemPrompt('');
            fetchTests();
        } catch (error) {
            toast.error(extractErrorMessage(error, 'Failed to create A/B test'));
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await axios.put(`/lecturer/ai-settings/ab-tests/${id}`, { status });
            fetchTests();
            toast.success('Status updated');
        } catch (error) {
            toast.error(extractErrorMessage(error, 'Failed to update status'));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this A/B test?')) return;
        try {
            await axios.delete(`/lecturer/ai-settings/ab-tests/${id}`);
            setTests((prev) => prev.filter((t) => t.id !== id));
            toast.success('A/B test deleted');
        } catch (error) {
            toast.error(extractErrorMessage(error, 'Failed to delete'));
        }
    };

    const handleViewStats = async (id: string) => {
        setSelectedTest(id);
        setStatsLoading(true);
        setStats(null);
        try {
            const { data } = await axios.get(`/lecturer/ai-settings/ab-tests/${id}/stats`);
            setStats(data.data);
        } catch (error) {
            toast.error(extractErrorMessage(error, 'Failed to fetch stats'));
        } finally {
            setStatsLoading(false);
        }
    };

    const statusColors: Record<string, string> = {
        draft: 'bg-slate-100 text-slate-600',
        active: 'bg-green-100 text-green-700',
        paused: 'bg-amber-100 text-amber-700',
        completed: 'bg-blue-100 text-blue-700',
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Compare prompt variants to optimize AI responses</p>
                <PrimaryButton onClick={() => setShowCreator(true)}>
                    <Plus className="h-4 w-4" /> New A/B Test
                </PrimaryButton>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-primary" /></div>
            ) : tests.length === 0 ? (
                <LiquidGlassCard className="p-8 text-center">
                    <FlaskConical className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    <p className="text-slate-500">No A/B tests yet. Create one to start comparing prompt variants!</p>
                </LiquidGlassCard>
            ) : (
                <div className="space-y-3">
                    {tests.map((test) => (
                        <LiquidGlassCard key={test.id} className="p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-slate-800">{test.name}</h4>
                                        <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[test.status]}`}>{test.status}</span>
                                    </div>
                                    {test.description && <p className="mt-1 text-sm text-slate-500">{test.description}</p>}
                                    <p className="mt-1 text-xs text-slate-400">Results: {test._count?.results ?? 0} • Created: {formatDate(test.createdAt)}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    {test.status === 'draft' && (
                                        <button onClick={() => handleUpdateStatus(test.id, 'active')} className="rounded-lg p-2 text-green-500 hover:bg-green-50" title="Activate">
                                            <Play className="h-4 w-4" />
                                        </button>
                                    )}
                                    {test.status === 'active' && (
                                        <button onClick={() => handleUpdateStatus(test.id, 'paused')} className="rounded-lg p-2 text-amber-500 hover:bg-amber-50" title="Pause">
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    )}
                                    {test.status === 'paused' && (
                                        <button onClick={() => handleUpdateStatus(test.id, 'active')} className="rounded-lg p-2 text-green-500 hover:bg-green-50" title="Resume">
                                            <Play className="h-4 w-4" />
                                        </button>
                                    )}
                                    {test.status !== 'completed' && (
                                        <button onClick={() => handleUpdateStatus(test.id, 'completed')} className="rounded-lg p-2 text-blue-500 hover:bg-blue-50" title="Complete">
                                            <BarChart3 className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button onClick={() => handleViewStats(test.id)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" title="View Stats">
                                        <Beaker className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleDelete(test.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500" title="Delete">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </LiquidGlassCard>
                    ))}
                </div>
            )}

            {selectedTest && stats && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <LiquidGlassCard className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h4 className="font-semibold" style={headingStyle}>A/B Test Results: {stats.name}</h4>
                            <button onClick={() => { setSelectedTest(null); setStats(null); }} className="rounded-full p-1 hover:bg-slate-100"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="mb-4 flex items-center gap-4">
                            <span className={`rounded-full px-3 py-1 text-sm ${statusColors[stats.status]}`}>{stats.status}</span>
                            <span className="text-sm text-slate-500">Total results: {stats.totalResults}</span>
                            {stats.readyForAnalysis ? (
                                <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">Ready for analysis</span>
                            ) : (
                                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-700">Need {stats.minResultsPerVariant} per variant</span>
                            )}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {[
                                { label: 'Variant A', data: stats.variantA, color: 'border-blue-200 bg-blue-50' },
                                { label: 'Variant B', data: stats.variantB, color: 'border-green-200 bg-green-50' },
                            ].map(({ label, data: vd, color }) => (
                                <div key={label} className={`rounded-xl border p-4 ${color}`}>
                                    <h5 className="mb-3 font-semibold">{label}</h5>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="text-slate-500">Responses:</span><span className="font-medium">{vd.count}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Avg Latency:</span><span className="font-medium">{vd.avgLatency}ms</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Avg Tokens:</span><span className="font-medium">{vd.avgTokens}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Avg Cost:</span><span className="font-medium">${vd.avgCost.toFixed(6)}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </LiquidGlassCard>
                </motion.div>
            )}

            {selectedTest && statsLoading && (
                <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-brand-primary" /></div>
            )}

            <Modal open={showCreator} title="Create A/B Test" onClose={() => setShowCreator(false)} maxWidth="max-w-3xl">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="min-w-[200px] flex-1">
                            <label className="block text-sm font-medium text-slate-700">Test Name</label>
                            <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required maxLength={200} className={inputClassName} />
                        </div>
                        <div className="min-w-[200px] flex-1">
                            <label className="block text-sm font-medium text-slate-700">Course</label>
                            <select value={formCourseId} onChange={(e) => setFormCourseId(e.target.value)} required className={inputClassName}>
                                <option value="">Select course</option>
                                {courses.map((c) => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Description</label>
                        <input type="text" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} maxLength={1000} className={inputClassName} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                            <h5 className="mb-2 font-semibold text-blue-800">Variant A</h5>
                            <label className="block text-sm font-medium text-slate-700">System Prompt</label>
                            <textarea value={formVariantASystemPrompt} onChange={(e) => setFormVariantASystemPrompt(e.target.value)} required rows={4} maxLength={5000} className={inputClassName} />
                            <label className="mt-2 block text-sm font-medium text-slate-700">Temperature: {formVariantATemperature}</label>
                            <input type="range" min="0" max="2" step="0.1" value={formVariantATemperature} onChange={(e) => setFormVariantATemperature(parseFloat(e.target.value))} className="mt-1 w-full" />
                        </div>
                        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                            <h5 className="mb-2 font-semibold text-green-800">Variant B</h5>
                            <label className="block text-sm font-medium text-slate-700">System Prompt</label>
                            <textarea value={formVariantBSystemPrompt} onChange={(e) => setFormVariantBSystemPrompt(e.target.value)} required rows={4} maxLength={5000} className={inputClassName} />
                            <label className="mt-2 block text-sm font-medium text-slate-700">Temperature: {formVariantBTemperature}</label>
                            <input type="range" min="0" max="2" step="0.1" value={formVariantBTemperature} onChange={(e) => setFormVariantBTemperature(parseFloat(e.target.value))} className="mt-1 w-full" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <SecondaryButton onClick={() => setShowCreator(false)}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={saving}>
                            {saving ? buttonSpinner : null}
                            {saving ? 'Creating...' : 'Create Test'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default function LecturerAISettings({ presets, courses, department }: PageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('preview');
    const navItems = useLecturerNav('ai-settings');

    useEffect(() => {
        setIsLoading(false);
    }, []);

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: 'preview', label: 'Preview & Test', icon: <Play className="h-4 w-4" /> },
        { key: 'presets', label: 'Presets', icon: <FileText className="h-4 w-4" /> },
        { key: 'history', label: 'History', icon: <Clock className="h-4 w-4" /> },
        { key: 'ab-testing', label: 'A/B Testing', icon: <FlaskConical className="h-4 w-4" /> },
    ];

    return (
        <AppLayout>
            <Head title="AI Settings" />

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                {isLoading ? (
                    <SkeletonCard cardCount={4} />
                ) : (
                    <>
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold" style={headingStyle}>AI Settings</h1>
                            <p className="mt-1 text-sm text-slate-500">Manage AI prompts, presets, interaction history, and A/B tests</p>
                        </div>

                        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl bg-white/50 p-1.5 shadow-brand-sm backdrop-blur-sm">
                            {tabs.map((tab) => (
                                <TabButton key={tab.key} label={tab.label} icon={tab.icon} active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)} />
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                {activeTab === 'preview' && <PreviewTab courses={courses} />}
                                {activeTab === 'presets' && <PresetsTab presets={presets} courses={courses} department={department} />}
                                {activeTab === 'history' && <HistoryTab courses={courses} />}
                                {activeTab === 'ab-testing' && <ABTestingTab courses={courses} />}
                            </motion.div>
                        </AnimatePresence>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
