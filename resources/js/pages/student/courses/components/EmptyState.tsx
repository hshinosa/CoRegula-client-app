import { BookOpen, SearchX } from 'lucide-react';
import { EmptyState as SharedEmptyState } from '@/components/ui/EmptyState';
import { PrimaryButton } from '@/components/Welcome/utils/helpers';

interface EmptyStateProps {
    hasFilters: boolean;
    onResetFilters?: () => void;
    onJoinCourse?: () => void;
}

export function EmptyState({ hasFilters, onResetFilters, onJoinCourse }: EmptyStateProps) {
    if (hasFilters) {
        return (
            <SharedEmptyState
                icon={SearchX}
                title="Tidak ada kelas yang cocok"
                description="Coba kata kunci lain atau hapus filter"
                action={
                    onResetFilters && (
                        <button
                            onClick={onResetFilters}
                            className="rounded-xl px-4 py-2 text-sm font-medium text-brand-primary transition-colors hover:bg-brand-primary/5"
                        >
                            Hapus Semua Filter
                        </button>
                    )
                }
            />
        );
    }

    return (
        <SharedEmptyState
            icon={BookOpen}
title="Belum ada kelas"
description="Gunakan kode gabung untuk mendaftar ke kelas pertama Anda"
            action={
                onJoinCourse && (
                    <PrimaryButton onClick={onJoinCourse}>
                        Jelajahi Kursus
                    </PrimaryButton>
                )
            }
        />
    );
}
