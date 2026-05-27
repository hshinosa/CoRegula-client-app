import { motion } from 'framer-motion';
import { MessageSquare, SearchX, Filter, Plus, X } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/Welcome/utils/helpers';

type EmptyStateVariant = 'no-spaces' | 'no-filter-results' | 'no-search-results';

interface EmptyStateProps {
    variant: EmptyStateVariant;
    onCreateNew?: () => void;
    onClearFilters?: () => void;
    onClearSearch?: () => void;
    searchQuery?: string;
}

const headingStyle = {
    color: '#4A4A4A',
} as const;

interface ActionConfig {
    label: string;
    onClick?: () => void;
    icon: React.ReactNode;
    primary?: boolean;
}

interface EmptyStateConfig {
    icon: React.ReactNode;
    iconBg: string;
    iconBorder: string;
    title: string;
    description: string;
    actions: ActionConfig[];
}

function getConfig(
    variant: EmptyStateVariant,
    searchQuery?: string,
    onCreateNew?: () => void,
    onClearFilters?: () => void,
    onClearSearch?: () => void
): EmptyStateConfig {
    switch (variant) {
        case 'no-spaces':
            return {
                icon: <MessageSquare className="h-8 w-8" style={{ color: '#88161c' }} />,
                iconBg: 'rgba(136,22,28,0.08)',
                iconBorder: '1px solid rgba(136,22,28,0.12)',
                title: 'Belum Ada Ruang Diskusi',
                description: 'Anda belum memiliki ruang diskusi. Buat ruang baru atau gabung ruang yang sudah ada.',
                actions: [
                    { label: 'Buat Ruang Baru', onClick: onCreateNew, icon: <Plus className="h-4 w-4" />, primary: true },
                ],
            };

        case 'no-filter-results':
            return {
                icon: <Filter className="h-8 w-8" style={{ color: '#6B7280' }} />,
                iconBg: 'rgba(107,114,128,0.08)',
                iconBorder: '1px solid rgba(107,114,128,0.12)',
                title: 'Tidak Ada Ruang dengan Filter Ini',
                description: 'Tidak ditemukan ruang yang sesuai dengan filter yang dipilih. Coba hapus atau ubah filter.',
                actions: [
                    { label: 'Hapus Semua Filter', onClick: onClearFilters, icon: <X className="h-4 w-4" /> },
                ],
            };

        case 'no-search-results':
            return {
                icon: <SearchX className="h-8 w-8" style={{ color: '#6B7280' }} />,
                iconBg: 'rgba(107,114,128,0.08)',
                iconBorder: '1px solid rgba(107,114,128,0.12)',
                title: 'Tidak Ada Ruang yang Cocok',
                description: searchQuery
                    ? `Tidak ditemukan ruang untuk "${searchQuery}". Coba kata kunci lain atau hapus pencarian.`
                    : 'Tidak ditemukan ruang yang cocok. Coba kata kunci lain atau hapus pencarian.',
                actions: [
                    { label: 'Hapus Pencarian', onClick: onClearSearch, icon: <X className="h-4 w-4" /> },
                ],
            };
    }
}

export function EmptyState({
    variant,
    onCreateNew,
    onClearFilters,
    onClearSearch,
    searchQuery,
}: EmptyStateProps) {
    const config = getConfig(variant, searchQuery, onCreateNew, onClearFilters, onClearSearch);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center rounded-2xl py-16 text-center"
            style={{
                background: 'rgba(255,255,255,0.4)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.5)',
            }}
        >
            <div
                className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ background: config.iconBg, border: config.iconBorder }}
            >
                {config.icon}
            </div>

            <h3 className="text-lg font-semibold" style={headingStyle}>
                {config.title}
            </h3>

            <p className="mt-2 max-w-sm text-sm text-brand-muted-dark leading-6">
                {config.description}
            </p>

            <div className="mt-6 flex items-center gap-3">
                {config.actions.map((action, i) =>
                    action.primary ? (
                        <PrimaryButton key={i} onClick={action.onClick}>
                            {action.icon}
                            {action.label}
                        </PrimaryButton>
                    ) : (
                        <SecondaryButton key={i} onClick={action.onClick}>
                            {action.icon}
                            {action.label}
                        </SecondaryButton>
                    )
                )}
            </div>
        </motion.div>
    );
}
