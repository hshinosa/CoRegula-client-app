import { useState, useEffect } from 'react';
import { FileText, X, Plus, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidGlassCard, PrimaryButton } from '@/components/Welcome/utils/helpers';
import { TemplateCard } from './TemplateCard';
import { TemplateManager } from './TemplateManager';

interface Template {
    id: string;
    title: string;
    description: string | null;
    prompt_body: string;
    category: string | null;
    is_global: boolean;
}

interface TemplateFormData {
    id?: string;
    title: string;
    description: string;
    prompt_body: string;
    category: string;
}

interface TemplatePanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (promptBody: string) => void;
    onTemplateCreated?: (templateId: string) => void;
    onTemplateUpdated?: (templateId: string) => void;
    onTemplateDeleted?: (templateId: string) => void;
}

export function TemplatePanel({ isOpen, onClose, onSelectTemplate, onTemplateCreated, onTemplateUpdated, onTemplateDeleted }: TemplatePanelProps) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [showManager, setShowManager] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
            fetchCategories();
        }
    }, [isOpen]);

    useEffect(() => {
        let result = [...templates];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (t) =>
                    t.title.toLowerCase().includes(query) ||
                    (t.description && t.description.toLowerCase().includes(query)) ||
                    t.prompt_body.toLowerCase().includes(query)
            );
        }

        if (selectedCategory) {
            result = result.filter((t) => t.category === selectedCategory);
        }

        setFilteredTemplates(result);
    }, [templates, searchQuery, selectedCategory]);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/ai-chat/templates', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setTemplates(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/ai-chat/templates/categories', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setCategories(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleSave = async (templateData: TemplateFormData) => {
        const url = templateData.id ? `/ai-chat/templates/${templateData.id}` : '/ai-chat/templates';
        const method = templateData.id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify(templateData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Gagal menyimpan template');
        }

        const data = await response.json();
        if (templateData.id) {
            onTemplateUpdated?.(templateData.id);
        } else if (data.data?.id) {
            onTemplateCreated?.(data.data.id);
        }

        await fetchTemplates();
        await fetchCategories();
    };

    const handleDelete = async (templateId: string) => {
        setDeletingId(templateId);
        try {
            const response = await fetch(`/ai-chat/templates/${templateId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (response.ok) {
                setTemplates((prev) => prev.filter((t) => t.id !== templateId));
                onTemplateDeleted?.(templateId);
            }
        } catch (error) {
            console.error('Failed to delete template:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (template: Template) => {
        setEditingTemplate(template);
        setShowManager(true);
    };

    const handleUse = (template: Template) => {
        onSelectTemplate(template.prompt_body);
        onClose();
    };

    return (
        <>
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
                        <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col"
                        >
                            <LiquidGlassCard intensity="heavy" className="flex h-full flex-col rounded-l-2xl" lightMode={true}>
                                <div className="flex items-center justify-between border-b border-[#E5E7EB]/50 p-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-brand-primary" />
                                        <h2 className="text-base font-semibold text-brand-dark">Template Prompt</h2>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingTemplate(null);
                                                setShowManager(true);
                                            }}
                                            className="flex items-center gap-1.5 rounded-lg bg-brand-primary/10 px-3 py-1.5 text-xs font-medium text-brand-primary transition-colors hover:bg-brand-primary/20"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Baru
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="rounded-lg p-1.5 text-brand-muted-dark transition-colors hover:bg-[#F3F4F6]"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="border-b border-[#E5E7EB]/50 p-4 space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Cari template..."
                                            className="w-full rounded-xl border border-[#E5E7EB] bg-white/80 py-2 pl-10 pr-4 text-sm text-brand-dark placeholder-[#9CA3AF] backdrop-blur-sm focus:border-brand-primary/30 focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                                        />
                                    </div>

                                    {categories.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => setSelectedCategory(null)}
                                                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                                    selectedCategory === null
                                                        ? 'bg-brand-primary text-white'
                                                        : 'bg-[#F3F4F6] text-brand-muted-dark hover:bg-[#E5E7EB]'
                                                }`}
                                            >
                                                Semua
                                            </button>
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                                                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                                        selectedCategory === cat
                                                            ? 'bg-brand-primary text-white'
                                                            : 'bg-[#F3F4F6] text-brand-muted-dark hover:bg-[#E5E7EB]'
                                                    }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto p-4">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="h-6 w-6 text-brand-primary animate-spin" />
                                        </div>
                                    ) : filteredTemplates.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <FileText className="h-12 w-12 text-[#E5E7EB]" />
                                            <p className="mt-4 text-sm font-medium text-brand-dark">
                                                {searchQuery || selectedCategory ? 'Template tidak ditemukan' : 'Belum ada template'}
                                            </p>
                                            <p className="mt-1 text-xs text-[#9CA3AF]">
                                                {searchQuery || selectedCategory
                                                    ? 'Coba kata kunci atau kategori lain'
                                                    : 'Buat template pertama Anda'}
                                            </p>
                                        </div>
                                    ) : (
                                        <AnimatePresence mode="popLayout">
                                            <div className="space-y-3">
                                                {filteredTemplates.map((template) => (
                                                    <TemplateCard
                                                        key={template.id}
                                                        template={template}
                                                        onUse={handleUse}
                                                        onEdit={handleEdit}
                                                        onDelete={handleDelete}
                                                        isDeleting={deletingId === template.id}
                                                    />
                                                ))}
                                            </div>
                                        </AnimatePresence>
                                    )}
                                </div>
                            </LiquidGlassCard>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <TemplateManager
                isOpen={showManager}
                onClose={() => {
                    setShowManager(false);
                    setEditingTemplate(null);
                }}
                onSave={handleSave}
                editingTemplate={editingTemplate ? {
                    id: editingTemplate.id,
                    title: editingTemplate.title,
                    description: editingTemplate.description || '',
                    prompt_body: editingTemplate.prompt_body,
                    category: editingTemplate.category || '',
                } : null}
            />
        </>
    );
}
