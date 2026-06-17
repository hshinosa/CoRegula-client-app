import { useState, useEffect, useCallback } from 'react';
import { Bookmark, X, Trash2, ExternalLink, Loader2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidGlassCard } from '@/components/Welcome/utils/helpers';
import { toast } from '@/components/ui/toaster';

interface SavedMaterialItem {
    id: string;
    course_material_id: string;
    course_id: string;
    course_name?: string;
    material_title?: string;
    file_name?: string;
    note: string | null;
    created_at: string;
}

interface SavedMaterialsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SavedMaterialsPanel({ isOpen, onClose }: SavedMaterialsPanelProps) {
    const [materials, setMaterials] = useState<SavedMaterialItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchMaterials();
        }
    }, [isOpen]);

    const fetchMaterials = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/student/ai-chat/saved-materials', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setMaterials(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch saved materials:', error);
            toast.error('Gagal memuat materi tersimpan');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (materialId: string) => {
        setDeletingId(materialId);
        try {
            const response = await fetch(`/student/ai-chat/saved-materials/${materialId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (response.ok) {
                setMaterials((prev) => prev.filter((m) => m.id !== materialId));
            }
        } catch (error) {
            console.error('Failed to delete saved material:', error);
            toast.error('Gagal menghapus materi');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
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
                    <motion.aside
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col"
                    >
                        <LiquidGlassCard intensity="heavy" className="flex h-full flex-col rounded-l-2xl" lightMode={true}>
                            <div className="flex items-center justify-between border-b border-[#E5E7EB]/50 p-4">
                                <div className="flex items-center gap-2">
                                    <Bookmark className="h-5 w-5 text-brand-primary" />
                                    <h2 className="text-base font-semibold text-brand-dark">Materi Tersimpan</h2>
                                    <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-brand-primary">
                                        {materials.length}
                                    </span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="rounded-lg p-1.5 text-brand-muted-dark transition-colors hover:bg-[#F3F4F6] hover:text-brand-dark"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-6 w-6 text-brand-primary animate-spin" />
                                    </div>
                                ) : materials.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Bookmark className="h-12 w-12 text-[#E5E7EB]" />
                                        <p className="mt-4 text-sm font-medium text-brand-dark">Belum ada materi tersimpan</p>
                                        <p className="mt-1 text-xs text-gray-600">
                                            Simpan materi penting dari sitasi AI chat dengan menekan ikon bookmark
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {materials.map((material) => {
                                            const docUrl = `/courses/${material.course_id}/materials/${material.course_material_id}/stream`;
                                            return (
                                                <motion.div
                                                    key={material.id}
                                                    layout
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="group rounded-xl border border-[#E5E7EB]/50 bg-white/50 p-3 transition-all hover:border-brand-primary/20 hover:bg-white/80"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <FileText className="h-3.5 w-3.5 text-brand-primary" />
                                                                <p className="text-xs font-medium text-brand-dark truncate">
                                                                    {material.material_title || material.file_name || 'Materi'}
                                                                </p>
                                                            </div>
                                                            {material.course_name && (
                                                                <p className="mt-0.5 text-[10px] text-gray-600 truncate">
                                                                    {material.course_name}
                                                                </p>
                                                            )}
                                                            {material.note && (
                                                                <p className="mt-1 text-sm text-brand-dark line-clamp-2">
                                                                    {material.note}
                                                                </p>
                                                            )}
                                                            <p className="mt-1 text-[10px] text-gray-600">
                                                                {formatDate(material.created_at)}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                            <a
                                                                href={docUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="rounded-lg p-1.5 text-brand-muted-dark transition-colors hover:bg-[#F3F4F6] hover:text-brand-primary"
                                                                title="Buka dokumen"
                                                            >
                                                                <ExternalLink className="h-3.5 w-3.5" />
                                                            </a>
                                                            <button
                                                                onClick={() => handleDelete(material.id)}
                                                                disabled={deletingId === material.id}
                                                                className="rounded-lg p-1.5 text-brand-muted-dark transition-colors hover:bg-red-50 hover:text-red-600"
                                                                title="Hapus dari simpanan"
                                                            >
                                                                {deletingId === material.id ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </LiquidGlassCard>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
