import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface EnhancedStatCardProps {
    label: string;
    value: number;
    icon: LucideIcon;
    color: string;
    isPrimary?: boolean;
    className?: string;
}

/**
 * Enhanced stat card with:
 * - Hover micro-interaction (translate-y, shadow, border)
 * - Gradient border accent for primary cards
 * - Count-up animation on first render
 * - Standardized icon background treatment
 */
export function EnhancedStatCard({
    label,
    value,
    icon: Icon,
    color,
    isPrimary = false,
    className = '',
}: EnhancedStatCardProps) {
    const [hasAnimated, setHasAnimated] = useState(false);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, { duration: 800, bounce: 0 });
    const displayValue = useTransform(springValue, (latest) => Math.round(latest));

    // Count-up animation on first render
    useEffect(() => {
        if (!hasAnimated) {
            motionValue.set(value);
            setHasAnimated(true);
        }
    }, [value, hasAnimated, motionValue]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
                y: -2,
                transition: { duration: 0.2 },
            }}
            className={`group relative ${className}`}
        >
            {/* Gradient border for primary cards */}
            {isPrimary && (
                <div
                    className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                        background: `linear-gradient(135deg, ${color} 0%, transparent 100%)`,
                        padding: '1px',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                    }}
                />
            )}

            <div
                className="relative h-full rounded-2xl border border-zinc-200/50 bg-white/80 p-5 backdrop-blur-sm transition-all duration-300 dark:border-zinc-700/50 dark:bg-zinc-900/80 group-hover:border-brand-primary/20 group-hover:shadow-lg"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-brand-muted-dark dark:text-zinc-400">
                            {label}
                        </p>
                        <motion.p className="mt-2 font-sans text-3xl font-light text-brand-dark dark:text-white">
                            {displayValue}
                        </motion.p>
                    </div>

                    {/* Standardized icon background */}
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                        style={{
                            backgroundColor: `${color}10`,
                        }}
                    >
                        <Icon className="h-5 w-5" style={{ color }} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
