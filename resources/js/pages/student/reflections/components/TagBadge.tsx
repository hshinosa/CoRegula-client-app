import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface TagBadgeProps {
    tag: string;
    count?: number;
    maxCount?: number;
    onRemove?: () => void;
    onClick?: () => void;
    active?: boolean;
    size?: 'sm' | 'md';
}

export function TagBadge({
    tag,
    count,
    maxCount = 1,
    onRemove,
    onClick,
    active = false,
    size = 'sm',
}: TagBadgeProps) {
    const intensity = count !== undefined ? Math.min(count / maxCount, 1) : 0;
    const bgAlpha = active ? 0.15 : 0.05 + intensity * 0.12;

    const Component = onClick ? motion.button : motion.span;

    return (
        <Component
            type={onClick ? 'button' : undefined}
            onClick={onClick}
            whileTap={onClick ? { scale: 0.95 } : undefined}
            className={`inline-flex items-center gap-1 rounded-full font-medium transition-all ${
                size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
            }`}
            style={{
                background: `rgba(136,22,28,${bgAlpha})`,
                color: active ? '#88161c' : '#4A4A4A',
                border: active ? '1px solid rgba(136,22,28,0.25)' : '1px solid rgba(136,22,28,0.1)',
                cursor: onClick ? 'pointer' : 'default',
            }}
            aria-pressed={active}
        >
            {tag}
            {count !== undefined && (
                <span className="opacity-60">{count}</span>
            )}
            {onRemove && (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="ml-0.5 opacity-60 hover:opacity-100"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </Component>
    );
}
