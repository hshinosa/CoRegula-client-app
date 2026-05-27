import { MessageSquare, SearchX, Filter, Plus, X } from 'lucide-react';
import { EmptyState as SharedEmptyState } from '@/components/ui/EmptyState';
import { PrimaryButton, SecondaryButton } from '@/components/Welcome/utils/helpers';

type EmptyStateVariant = 'no-spaces' | 'no-filter-results' | 'no-search-results';

interface EmptyStateProps {
    variant: EmptyStateVariant;
    onCreateNew?: () => void;
    onClearFilters?: () => void;
    onClearSearch?: () => void;
    searchQuery?: string;
}

export function EmptyState({
    variant,
    onCreateNew,
    onClearFilters,
    onClearSearch,
    searchQuery,
}: EmptyStateProps) {
    if (variant === 'no-spaces') {
        return (
            <SharedEmptyState
                icon={MessageSquare}
                title="Belum ada sesi chat"
                description="Buat sesi chat pertama Anda untuk mulai berdiskusi dengan kelompok"
                action={
                    onCreateNew && (
                        <PrimaryButton onClick={onCreateNew}>
                            <Plus className="mr-2 h-4 w-4" />
                            Buat Sesi
                        </PrimaryButton>
                    )
                }
            />
        );
    }

    if (variant === 'no-filter-results') {
        return (
            <SharedEmptyState
                icon={Filter}
                title="Tidak ada ruang dengan filter ini"
                description="Tidak ditemukan ruang yang sesuai dengan filter yang dipilih"
                action={
                    onClearFilters && (
                        <SecondaryButton onClick={onClearFilters}>
                            <X className="mr-2 h-4 w-4" />
                            Hapus Semua Filter
                        </SecondaryButton>
                    )
                }
            />
        );
    }

    return (
        <SharedEmptyState
            icon={SearchX}
            title="Tidak ada ruang yang cocok"
            description={`Tidak ditemukan ruang dengan kata kunci "${searchQuery}"`}
            action={
                onClearSearch && (
                    <SecondaryButton onClick={onClearSearch}>
                        <X className="mr-2 h-4 w-4" />
                        Hapus Pencarian
                    </SecondaryButton>
                )
            }
        />
    );
}
