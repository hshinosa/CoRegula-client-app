import { Pencil, Trash2, Copy, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Template {
    id: string;
    title: string;
    description: string | null;
    prompt_body: string;
    category: string | null;
    is_global: boolean;
}

interface TemplateCardProps {
    template: Template;
    onUse: (template: Template) => void;
    onEdit: (template: Template) => void;
    onDelete: (templateId: string) => void;
    isDeleting?: boolean;
}

export function TemplateCard({ template, onUse, onEdit, onDelete, isDeleting }: TemplateCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="group rounded-xl border border-[#E5E7EB]/50 bg-white/50 p-4 transition-all hover:border-brand-primary/20 hover:bg-white/80"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-brand-dark truncate">{template.title}</h3>
                        {template.is_global && (
                            <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-medium text-brand-primary">
                                Global
                            </span>
                        )}
                        {template.category && (
                            <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-medium text-brand-muted-dark">
                                {template.category}
                            </span>
                        )}
                    </div>
                    {template.description && (
                        <p className="mt-1 text-xs text-brand-muted-dark line-clamp-2">{template.description}</p>
                    )}
                    <p className="mt-2 text-xs text-[#9CA3AF] line-clamp-3">{template.prompt_body}</p>
                </div>
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-[#F3F4F6] pt-3">
                <button
                    onClick={() => onUse(template)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-primary/10 px-3 py-2 text-xs font-medium text-brand-primary transition-colors hover:bg-brand-primary/20"
                >
                    <Copy className="h-3.5 w-3.5" />
                    Gunakan
                </button>
                {!template.is_global && (
                    <>
                        <button
                            onClick={() => onEdit(template)}
                            className="rounded-lg p-2 text-brand-muted-dark transition-colors hover:bg-[#F3F4F6] hover:text-brand-dark"
                            title="Edit template"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => onDelete(template.id)}
                            disabled={isDeleting}
                            className="rounded-lg p-2 text-brand-muted-dark transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Hapus template"
                        >
                            {isDeleting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                            )}
                        </button>
                    </>
                )}
            </div>
        </motion.div>
    );
}
