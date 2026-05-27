import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Search, X } from 'lucide-react';
import type { ReflectionTemplate, TemplateCategory } from '@/types';
import { TemplateCard } from './TemplateCard';
import { TemplateModal } from './TemplateModal';

const CATEGORIES: (TemplateCategory | 'Semua')[] = ['Semua', 'Harian', 'Mingguan', 'Proyek', 'Evaluasi Diri'];

interface TemplatePanelProps {
    onSelect: (template: ReflectionTemplate) => void;
    maxPersonalTemplates?: number;
}

export function TemplatePanel({ onSelect, maxPersonalTemplates = 30 }: TemplatePanelProps) {
    const [templates, setTemplates] = useState<ReflectionTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState<TemplateCategory | 'Semua'>('Semua');
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ReflectionTemplate | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const params = category !== 'Semua' ? `?category=${encodeURIComponent(category)}` : '';
            const response = await fetch(`/student/reflections/templates${params}`, {
                headers: { 'Accept': 'application/json' },
            });
            if (response.ok) {
                const data = await response.json();
                setTemplates(data.data ?? []);
            }
        } catch (_) {
        } finally {
            setLoading(false);
        }
    }, [category]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleSave = async (templateData: { title: string; description?: string; content_template: string; category?: string }) => {
        const url = editingTemplate
            ? `/student/reflections/templates/${editingTemplate.id}`
            : '/student/reflections/templates';
        const method = editingTemplate ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(templateData),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error ?? 'Gagal menyimpan template');
        }

        setShowModal(false);
        setEditingTemplate(null);
        fetchTemplates();
    };

    const handleDelete = async (template: ReflectionTemplate) => {
        if (template.is_global) return;
        if (!confirm('Hapus template ini?')) return;

        await fetch(`/student/reflections/templates/${template.id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' },
        });
        fetchTemplates();
    };

    const handleEdit = (template: ReflectionTemplate) => {
        setEditingTemplate(template);
        setShowModal(true);
    };

    const filteredTemplates = templates.filter((t) =>
        searchQuery ? t.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
    );

    const personalCount = templates.filter((t) => !t.is_global).length;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-brand-dark dark:text-gray-100">
                    Template Refleksi
                </h3>
                <button
                    type="button"
                    onClick={() => { setEditingTemplate(null); setShowModal(true); }}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-all"
                    style={{ background: '#88161c' }}
                >
                    <Plus className="h-3.5 w-3.5" />
                    Buat Template
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                        style={{
                            background: category === cat ? 'rgba(136,22,28,0.12)' : 'rgba(255,255,255,0.6)',
                            color: category === cat ? '#88161c' : '#6B7280',
                            border: category === cat ? '1px solid rgba(136,22,28,0.2)' : '1px solid rgba(255,255,255,0.5)',
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted-dark" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari template..."
                    className="w-full rounded-lg border-0 bg-white/60 py-2 pl-10 pr-8 text-sm text-brand-dark ring-1 ring-inset ring-white/50 placeholder:text-[#9ca3af] focus:ring-2 focus:ring-inset focus:ring-brand-primary/30"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted-dark hover:text-brand-dark"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileText className="mb-2 h-8 w-8 text-brand-muted-dark" />
                    <p className="text-sm text-brand-muted-dark">Belum ada template</p>
                </div>
            ) : (
                <AnimatePresence mode="popLayout">
                    <div className="grid gap-3 sm:grid-cols-2">
                        {filteredTemplates.map((template) => (
                            <motion.div
                                key={template.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                <TemplateCard
                                    template={template}
                                    onUse={() => onSelect(template)}
                                    onEdit={() => handleEdit(template)}
                                    onDelete={() => handleDelete(template)}
                                />
                            </motion.div>
                        ))}
                    </div>
                </AnimatePresence>
            )}

            <p className="text-xs text-brand-muted-dark">
                {personalCount}/{maxPersonalTemplates} template personal
            </p>

            {showModal && (
                <TemplateModal
                    template={editingTemplate}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setEditingTemplate(null); }}
                />
            )}
        </div>
    );
}
