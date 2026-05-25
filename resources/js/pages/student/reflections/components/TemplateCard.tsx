import { Edit, Trash2, FileText } from 'lucide-react';
import type { ReflectionTemplate } from '@/types';

interface TemplateCardProps {
    template: ReflectionTemplate;
    onUse: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function TemplateCard({ template, onUse, onEdit, onDelete }: TemplateCardProps) {
    return (
        <div
            className="group relative cursor-pointer rounded-xl p-4 transition-all hover:shadow-md"
            style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.5)',
                backdropFilter: 'blur(8px)',
            }}
            onClick={onUse}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onUse(); }}
        >
            <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#88161c]" />
                    <h4 className="text-sm font-semibold text-[#4A4A4A]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {template.title}
                    </h4>
                </div>
                {template.is_global && (
                    <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{
                            background: 'rgba(136,22,28,0.08)',
                            color: '#88161c',
                            border: '1px solid rgba(136,22,28,0.15)',
                        }}
                    >
                        Template umum
                    </span>
                )}
            </div>

            {template.description && (
                <p className="mb-2 text-xs text-[#6B7280] line-clamp-2">{template.description}</p>
            )}

            {template.category && (
                <span
                    className="mb-3 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                        background: 'rgba(74,74,74,0.08)',
                        color: '#4A4A4A',
                        border: '1px solid rgba(74,74,74,0.15)',
                    }}
                >
                    {template.category}
                </span>
            )}

            <div className="mt-2 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                {!template.is_global && (
                    <>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#4A4A4A] transition-colors hover:bg-white/80"
                        >
                            <Edit className="h-3 w-3" />
                            Edit
                        </button>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                            <Trash2 className="h-3 w-3" />
                            Hapus
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
