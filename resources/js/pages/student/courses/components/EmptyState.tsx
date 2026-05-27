import { motion } from 'framer-motion';
import { BookOpen, SearchX } from 'lucide-react';
import { PrimaryButton } from '@/components/Welcome/utils/helpers';

interface EmptyStateProps {
    hasFilters: boolean;
    onResetFilters?: () => void;
    onJoinCourse?: () => void;
}

export function EmptyState({ hasFilters, onResetFilters, onJoinCourse }: EmptyStateProps) {
    if (hasFilters) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div
                    className="flex flex-col items-center justify-center rounded-3xl py-12 text-center"
                    style={{
                        background: 'rgba(255,255,255,0.7)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255,255,255,0.6)',
                    }}
                >
                    <div
                        className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                        style={{
                            background: 'rgba(107,114,128,0.08)',
                            border: '1px solid rgba(107,114,128,0.12)',
                        }}
                    >
                        <SearchX className="h-7 w-7 text-[#9CA3AF]" />
                    </div>
                    <h3
                        className="text-lg font-semibold"
                    >
                        Tidak ada mata kuliah yang cocok
                    </h3>
                    <p className="mt-1.5 max-w-sm text-sm text-brand-muted-dark">
                        Coba kata kunci lain atau hapus filter
                    </p>
                    {onResetFilters && (
                        <div className="mt-5">
                            <button
                                onClick={onResetFilters}
                                className="rounded-xl px-4 py-2 text-sm font-medium text-brand-primary transition-colors hover:bg-brand-primary/5"
                            >
                                Hapus Semua Filter
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div
                className="flex flex-col items-center justify-center rounded-3xl py-12 text-center"
                style={{
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.6)',
                }}
            >
                <div
                    className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{
                        background: 'rgba(136,22,28,0.08)',
                        border: '1px solid rgba(136,22,28,0.12)',
                    }}
                >
                    <BookOpen className="h-7 w-7" style={{ color: '#88161c' }} />
                </div>
                <h3
                    className="text-lg font-semibold"
                >
                    Belum ada mata kuliah
                </h3>
                <p className="mt-1.5 max-w-sm text-sm text-brand-muted-dark">
                    Gabung mata kuliah menggunakan kode dari dosen Anda untuk memulai pembelajaran kolaboratif
                </p>
                {onJoinCourse && (
                    <div className="mt-5">
                        <PrimaryButton onClick={onJoinCourse}>
                            <BookOpen className="h-4 w-4" />
                            Gabung Mata Kuliah
                        </PrimaryButton>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
