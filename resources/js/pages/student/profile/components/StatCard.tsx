import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState, type ComponentType } from 'react';

interface StatCardProps {
    label: string;
    value: number;
    icon: ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    textColor: string;
    suffix?: string;
    animate?: boolean;
}

function AnimatedCounter({ end, duration = 1.5 }: { end: number; duration?: number }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    useEffect(() => {
        if (!isInView) return;
        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [isInView, end, duration]);

    return <span ref={ref}>{count}</span>;
}

export default function StatCard({
    label,
    value,
    icon: Icon,
    color,
    bgColor,
    textColor,
    suffix = '',
    animate = true,
}: StatCardProps) {
    return (
        <motion.div
            className={`rounded-2xl border border-white/20 p-4 shadow-lg backdrop-blur-xl transition-all duration-200 hover:shadow-xl ${bgColor}`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color}`}
                >
                    <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                        {label}
                    </p>
                    <p className={`text-2xl font-bold ${textColor}`}>
                        {animate ? (
                            <AnimatedCounter end={value} />
                        ) : (
                            value
                        )}
                        {suffix && (
                            <span className="ml-1 text-sm font-normal text-gray-400">
                                {suffix}
                            </span>
                        )}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}