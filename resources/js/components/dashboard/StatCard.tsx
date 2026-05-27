import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { LiquidGlassCard } from '@/components/Welcome/utils/helpers';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    accent: {
        bg: string;
        border: string;
        text: string;
    };
    helper: string;
    subtext: string;
    isPrimary?: boolean;
    lightMode?: boolean;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    accent,
    helper,
    subtext,
    isPrimary = false,
    lightMode = true,
}: StatCardProps) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (hasAnimated.current) return;
        const numericValue = typeof value === 'number' ? value : parseInt(value.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(numericValue) && numericValue > 0) {
            hasAnimated.current = true;
            const controls = animate(count, numericValue, {
                duration: 0.8,
                ease: 'easeOut',
            });
            return controls.stop;
        }
    }, [value, count]);

    const displayValue = typeof value === 'number' ? rounded : value;

    return (
        <motion.div
            whileHover={{
                y: -2,
                transition: { duration: 0.2, ease: 'easeOut' },
            }}
            className="h-full"
        >
            <LiquidGlassCard
                intensity="light"
                className={`h-full p-5 transition-all duration-200 ${
                    isPrimary
                        ? 'border-2 border-transparent bg-gradient-to-br from-[var(--color-brand-primary)]/10 to-transparent hover:border-[var(--color-brand-primary)]/20 hover:shadow-brand-md'
                        : 'hover:border-[var(--dm-border-strong)] hover:shadow-brand-sm'
                }`}
                lightMode={lightMode}
            >
                <div className="flex h-full flex-col justify-between gap-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-[var(--dm-text-secondary)]">{title}</p>
                            <motion.h2
                                className="mt-3 text-3xl font-bold tracking-tight text-[var(--dm-text)]"
                            >
                                {typeof displayValue === 'number' ? (
                                    <motion.span>{displayValue}</motion.span>
                                ) : (
                                    displayValue
                                )}
                            </motion.h2>
                        </div>
                        {/* Task 3.4: Standardized icon background */}
                        <div
                            className="flex h-11 w-11 items-center justify-center rounded-lg"
                            style={{
                                background: `${accent.bg}`,
                                border: `1px solid ${accent.border}`,
                            }}
                        >
                            <Icon className="h-5 w-5" style={{ color: accent.text }} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium" style={{ color: accent.text }}>
                            {helper}
                        </p>
                        <p className="text-sm leading-6 text-[var(--dm-text-secondary)]">{subtext}</p>
                    </div>
                </div>
            </LiquidGlassCard>
        </motion.div>
    );
}
