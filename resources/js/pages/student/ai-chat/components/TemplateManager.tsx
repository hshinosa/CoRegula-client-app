import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidGlassCard } from '@/components/Welcome/utils/helpers';

interface Template {
    id?: string;
    title: string;
    description: string;
    prompt_body: string;
    category: string;
}

interface TemplateManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (template: Template) => Promise<void>;
    editingTemplate?: Template | null;
}

export function TemplateManager({ isOpen, onClose, onSave, editingTemplate }: TemplateManagerProps) {
    const [form, setForm] = useState<Template>({
        title: '',
        description: '',
        prompt_body: '',
        category: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (editingTemplate) {
            setForm({
                id: editingTemplate.id,
                title: editingTemplate.title,
                description: editingTemplate.description || '',
                prompt_body: editingTemplate.prompt_body,
                category: editingTemplate.category || '',
            });
        } else {
            setForm({ title: '', description: '', prompt_body: '', category: '' });
        }
        setErrors({});
    }, [editingTemplate, isOpen]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!form.title.trim()) {
            newErrors.title = 'Judul wajib diisi';
        } else if (form.title.length > 200) {
            newErrors.title = 'Judul maksimal 200 karakter';
        }

        if (!form.prompt_body.trim()) {
            newErrors.prompt_body = 'Prompt wajib diisi';
        } else if (form.prompt_body.length > 10000) {
            newErrors.prompt_body = 'Prompt maksimal 10.000 karakter';
        }

        if (form.description.length > 500) {
            newErrors.description = 'Deskripsi maksimal 500 karakter';
        }

        if (form.category.length > 100) {
            newErrors.category = 'Kategori maksimal 100 karakter';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSaving(true);
        try {
            await onSave(form);
            onClose();
        } catch (error) {
            console.error('Failed to save template:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <LiquidGlassCard intensity="heavy" className="w-full max-w-lg" lightMode={true}>
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-lg font-semibold text-brand-dark">
                                        {editingTemplate ? 'Edit Template' : 'Buat Template Baru'}
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="rounded-lg p-1.5 text-brand-muted-dark transition-colors hover:bg-[#F3F4F6]"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-brand-dark mb-1.5">
                                            Judul <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            placeholder="Contoh: Ringkasan Materi"
                                            className={`w-full rounded-xl border ${
                                                errors.title ? 'border-red-300' : 'border-[#E5E7EB]'
                                            } bg-white/80 px-4 py-2.5 text-sm text-brand-dark placeholder-[#9CA3AF] backdrop-blur-sm transition-all focus:border-brand-primary/30 focus:outline-none focus:ring-2 focus:ring-brand-primary/10`}
                                        />
                                        {errors.title && (
                                            <p className="mt-1 text-xs text-red-500">{errors.title}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-brand-dark mb-1.5">
                                            Deskripsi
                                        </label>
                                        <input
                                            type="text"
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            placeholder="Deskripsi singkat tentang template ini"
                                            className={`w-full rounded-xl border ${
                                                errors.description ? 'border-red-300' : 'border-[#E5E7EB]'
                                            } bg-white/80 px-4 py-2.5 text-sm text-brand-dark placeholder-[#9CA3AF] backdrop-blur-sm transition-all focus:border-brand-primary/30 focus:outline-none focus:ring-2 focus:ring-brand-primary/10`}
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-brand-dark mb-1.5">
                                            Kategori
                                        </label>
                                        <input
                                            type="text"
                                            value={form.category}
                                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                                            placeholder="Contoh: Akademik, Penelitian, Umum"
                                            className={`w-full rounded-xl border ${
                                                errors.category ? 'border-red-300' : 'border-[#E5E7EB]'
                                            } bg-white/80 px-4 py-2.5 text-sm text-brand-dark placeholder-[#9CA3AF] backdrop-blur-sm transition-all focus:border-brand-primary/30 focus:outline-none focus:ring-2 focus:ring-brand-primary/10`}
                                        />
                                        {errors.category && (
                                            <p className="mt-1 text-xs text-red-500">{errors.category}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-brand-dark mb-1.5">
                                            Prompt <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={form.prompt_body}
                                            onChange={(e) => setForm({ ...form, prompt_body: e.target.value })}
                                            placeholder="Tulis prompt yang akan digunakan..."
                                            rows={5}
                                            className={`w-full rounded-xl border ${
                                                errors.prompt_body ? 'border-red-300' : 'border-[#E5E7EB]'
                                            } bg-white/80 px-4 py-2.5 text-sm text-brand-dark placeholder-[#9CA3AF] backdrop-blur-sm transition-all focus:border-brand-primary/30 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 resize-none`}
                                        />
                                        <div className="mt-1 flex items-center justify-between">
                                            {errors.prompt_body && (
                                                <p className="text-xs text-red-500">{errors.prompt_body}</p>
                                            )}
                                            <p className="ml-auto text-xs text-[#9CA3AF]">
                                                {form.prompt_body.length}/10.000
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 rounded-full border border-[#E5E7EB] bg-white/80 px-4 py-2.5 text-sm font-medium text-brand-dark transition-colors hover:bg-[#F3F4F6]"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 rounded-full bg-brand-primary px-4 py-2.5 text-sm font-medium text-white shadow-[0_12px_28px_rgba(136,22,28,0.28)] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                                    >
                                        {isSaving ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Menyimpan...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <Save className="h-4 w-4" />
                                                {editingTemplate ? 'Update' : 'Simpan'}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </LiquidGlassCard>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
