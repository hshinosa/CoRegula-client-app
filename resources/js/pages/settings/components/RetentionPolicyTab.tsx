import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Trash2, Edit2, Check, X, AlertTriangle } from 'lucide-react';
import { LiquidGlassCard } from '@/components/Welcome/utils/helpers';

interface RetentionPolicy {
    id: string;
    dataType: string;
    retentionDays: number;
    archiveAfterDays: number;
    autoPurge: boolean;
}

const dataTypeLabels: Record<string, string> = {
    USER: 'Pengguna',
    COURSE: 'Kursus',
    GROUP: 'Grup',
    SESSION_DISCUSSION: 'Ruang Diskusi',
    KNOWLEDGE_BASE: 'Basis Pengetahuan',
    CHAT_LOG: 'Log Chat',
};

export function RetentionPolicyTab() {
    const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<RetentionPolicy>>({});
    const [saving, setSaving] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
    };

    const fetchPolicies = async () => {
        try {
            const res = await fetch('/admin/api/retention-policies', {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            if (!res.ok) throw new Error('Gagal memuat kebijakan retensi');
            const result = await res.json();
            setPolicies(result.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    const startEdit = (policy: RetentionPolicy) => {
        setEditingId(policy.id);
        setEditForm({
            retentionDays: policy.retentionDays,
            archiveAfterDays: policy.archiveAfterDays,
            autoPurge: policy.autoPurge,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEdit = async (id: string) => {
        setSaving(true);
        try {
            const res = await fetch(`/admin/api/retention-policies/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify(editForm),
            });
            const result = await res.json();
            if (res.ok) {
                setPolicies((prev) =>
                    prev.map((p) => (p.id === id ? { ...p, ...editForm } : p))
                );
                setEditingId(null);
            } else {
                setError(result.message || 'Gagal menyimpan perubahan');
            }
        } catch {
            setError('Terjadi kesalahan jaringan');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/admin/api/retention-policies/${id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });
            if (res.ok) {
                setPolicies((prev) => prev.filter((p) => p.id !== id));
                setDeleteConfirmId(null);
            } else {
                const result = await res.json();
                setError(result.message || 'Gagal menghapus kebijakan');
            }
        } catch {
            setError('Terjadi kesalahan jaringan');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(136,22,28,0.08)' }}>
                        <Database className="h-5 w-5 text-brand-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-brand-dark">
                            Kebijakan Retensi Data
                        </h2>
                        <p className="text-sm text-brand-muted">
                            Kelola berapa lama data disimpan sebelum diarsipkan atau dihapus otomatis.
                        </p>
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 rounded-xl bg-warning-50 px-4 py-3 text-sm text-warning-800 border border-warning-200"
                    >
                        {error}
                    </motion.div>
                )}

                <div className="overflow-hidden rounded-xl border border-neutral-200">
                    <table className="w-full text-sm">
                        <thead className="bg-[rgba(136,22,28,0.04)]">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-brand-muted-dark">
                                    Tipe Data
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-brand-muted-dark">
                                    Retensi (hari)
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-brand-muted-dark">
                                    Arsip Setelah (hari)
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-brand-muted-dark">
                                    Auto Purge
                                </th>
                                <th className="px-4 py-3 text-right font-medium text-brand-muted-dark">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                            {policies.map((policy) => (
                                <tr key={policy.id} className="bg-white hover:bg-[rgba(136,22,28,0.04)]">
                                    <td className="px-4 py-3 font-medium text-brand-dark">
                                        {dataTypeLabels[policy.dataType] || policy.dataType}
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingId === policy.id ? (
                                            <input
                                                type="number"
                                                min={1}
                                                value={editForm.retentionDays ?? policy.retentionDays}
                                                onChange={(e) =>
                                                    setEditForm((prev) => ({
                                                        ...prev,
                                                        retentionDays: parseInt(e.target.value, 10),
                                                    }))
                                                }
                                                className="w-20 rounded-lg border border-neutral-300 px-2 py-1 text-sm focus:border-brand-primary focus:outline-none"
                                            />
                                        ) : (
                                            <span className="text-brand-muted-dark">{policy.retentionDays} hari</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingId === policy.id ? (
                                            <input
                                                type="number"
                                                min={1}
                                                value={editForm.archiveAfterDays ?? policy.archiveAfterDays}
                                                onChange={(e) =>
                                                    setEditForm((prev) => ({
                                                        ...prev,
                                                        archiveAfterDays: parseInt(e.target.value, 10),
                                                    }))
                                                }
                                                className="w-20 rounded-lg border border-neutral-300 px-2 py-1 text-sm focus:border-brand-primary focus:outline-none"
                                            />
                                        ) : (
                                            <span className="text-brand-muted-dark">{policy.archiveAfterDays} hari</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingId === policy.id ? (
                                            <button
                                                onClick={() =>
                                                    setEditForm((prev) => ({
                                                        ...prev,
                                                        autoPurge: !prev.autoPurge,
                                                    }))
                                                }
                                                className={`relative h-6 w-11 rounded-full transition-all ${
                                                    editForm.autoPurge ? 'bg-brand-primary' : 'bg-neutral-300'
                                                }`}
                                            >
                                                <motion.div
                                                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"
                                                    animate={{ left: editForm.autoPurge ? '22px' : '2px' }}
                                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                />
                                            </button>
                                        ) : (
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    policy.autoPurge
                                                        ? 'bg-success-50 text-success-700'
                                                        : 'bg-neutral-100 text-neutral-600'
                                                }`}
                                            >
                                                {policy.autoPurge ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {editingId === policy.id ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => saveEdit(policy.id)}
                                                    disabled={saving}
                                                    className="rounded-lg p-1.5 text-success-600 hover:bg-success-50 disabled:opacity-50"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="rounded-lg p-1.5 text-brand-muted hover:bg-[rgba(136,22,28,0.04)]"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : deleteConfirmId === policy.id ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-xs text-warning-600">Yakin?</span>
                                                <button
                                                    onClick={() => handleDelete(policy.id)}
                                                    className="rounded-lg p-1.5 text-danger-600 hover:bg-danger-50"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmId(null)}
                                                    className="rounded-lg p-1.5 text-brand-muted hover:bg-[rgba(136,22,28,0.04)]"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => startEdit(policy)}
                                                    className="rounded-lg p-1.5 text-brand-primary hover:bg-[rgba(136,22,28,0.08)]"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmId(policy.id)}
                                                    className="rounded-lg p-1.5 text-danger-600 hover:bg-danger-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {policies.length === 0 && !loading && (
                    <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 py-12">
                        <Database className="h-10 w-10 text-neutral-300" />
                        <p className="mt-3 text-sm text-brand-muted">Belum ada kebijakan retensi data</p>
                    </div>
                )}

                <div className="mt-6 rounded-xl p-4" style={{ backgroundColor: 'rgba(136,22,28,0.08)' }}>
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 text-brand-primary" />
                        <div className="text-sm text-brand-dark">
                            <p className="font-medium">Catatan Penting</p>
                            <p className="mt-1">
                                Data yang sudah melewati masa retensi akan dihapus secara permanen jika <strong>Auto Purge</strong> aktif.
                                Pastikan kebijakan ini sesuai dengan regulasi yang berlaku.
                            </p>
                        </div>
                    </div>
                </div>
            </LiquidGlassCard>
        </div>
    );
}
