import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { ReflectionTemplate, TemplateCategory } from '@/types';

const CATEGORIES: TemplateCategory[] = ['Harian', 'Mingguan', 'Proyek', 'Evaluasi Diri'];

interface TemplateModalProps {
    template: ReflectionTemplate | null;
    onSave: (data: { title: string; description?: string; content_template: string; category?: string }) => Promise<void>;
    onClose: () => void;
}

export function TemplateModal({ template, onSave, onClose }: TemplateModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [contentTemplate, setContentTemplate] = useState('');
    const [category, setCategory] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (template) {
            setTitle(template.title);
            setDescription(template.description ?? '');
            setContentTemplate(template.content_template);
            setCategory(template.category ?? '');
        }
    }, [template]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !contentTemplate.trim()) {
            setError('Judul dan konten template wajib diisi');
            return;
        }

        setSaving(true);
        setError('');
        try {
            await onSave({
                title: title.trim(),
                description: description.trim() || undefined,
                content_template: contentTemplate.trim(),
                category: category || undefined,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menyimpan template');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div
                className="relative w-full max-w-lg rounded-2xl p-6 shadow-xl"
                style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#4A4A4A]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {template ? 'Edit Template' : 'Buat Template Baru'}
                    </h3>
                    <button type="button" onClick={onClose} className="text-[#6B7280] hover:text-[#4A4A4A]">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-[#4A4A4A]">Judul *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={200}
                            className="w-full rounded-lg border-0 bg-white/60 px-3 py-2 text-sm text-[#4A4A4A] ring-1 ring-inset ring-white/50 focus:ring-2 focus:ring-inset focus:ring-[#88161c]/30"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                            placeholder="Judul template"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-[#4A4A4A]">Deskripsi</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={500}
                            className="w-full rounded-lg border-0 bg-white/60 px-3 py-2 text-sm text-[#4A4A4A] ring-1 ring-inset ring-white/50 focus:ring-2 focus:ring-inset focus:ring-[#88161c]/30"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                            placeholder="Deskripsi singkat (opsional)"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-[#4A4A4A]">Kategori</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-lg border-0 bg-white/60 px-3 py-2 text-sm text-[#4A4A4A] ring-1 ring-inset ring-white/50 focus:ring-2 focus:ring-inset focus:ring-[#88161c]/30"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                            <option value="">Pilih kategori</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-[#4A4A4A]">Konten Template *</label>
                        <textarea
                            value={contentTemplate}
                            onChange={(e) => setContentTemplate(e.target.value)}
                            maxLength={10000}
                            rows={8}
                            className="w-full resize-none rounded-lg border-0 bg-white/60 px-3 py-2 text-sm text-[#4A4A4A] ring-1 ring-inset ring-white/50 focus:ring-2 focus:ring-inset focus:ring-[#88161c]/30"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                            placeholder="Tulis kerangka refleksi di sini..."
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-[#6B7280] transition-colors hover:bg-white/80"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-all disabled:opacity-50"
                            style={{ background: '#88161c' }}
                        >
                            {saving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
