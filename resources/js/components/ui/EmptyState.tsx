import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className = '',
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={`flex flex-col items-center justify-center py-12 text-center ${className}`}
        >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10">
                <Icon className="h-6 w-6 text-[var(--color-brand-primary)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--dm-text)]">
                {title}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-[var(--dm-text-secondary)]">
                {description}
            </p>
            {action && <div className="mt-6">{action}</div>}
        </motion.div>
    );
}
