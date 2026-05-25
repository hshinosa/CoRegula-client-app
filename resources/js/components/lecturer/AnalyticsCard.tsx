import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useCounter } from '@/components/Welcome/utils/helpers';

interface AnalyticsCardProps {
    icon: LucideIcon;
    label: string;
    value: number;
    suffix?: string;
    index?: number;
}

export function AnalyticsCard({ icon: Icon, label, value, suffix = '', index = 0 }: AnalyticsCardProps) {
    const { count, ref } = useCounter(value, 1500);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
            className="flex items-center gap-4 rounded-2xl p-4"
            style={{
                background: 'rgba(136,22,28,0.06)',
                border: '1px solid rgba(136,22,28,0.1)',
            }}
        >
            <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{
                    background: 'rgba(136,22,28,0.1)',
                    border: '1px solid rgba(136,22,28,0.15)',
                }}
            >
                <Icon className="h-5 w-5" style={{ color: '#88161c' }} />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-[#6B7280]">{label}</p>
                <p
                    ref={ref as React.Ref<HTMLParagraphElement>}
                    className="text-xl font-bold tabular-nums"
                    style={{ color: '#4A4A4A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                    {count}
                    {suffix && <span className="ml-0.5 text-sm font-medium text-[#6B7280]">{suffix}</span>}
                </p>
            </div>
        </motion.div>
    );
}
