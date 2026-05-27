import { motion } from 'framer-motion';
import { Flame, Calendar, TrendingUp } from 'lucide-react';
import type { StreakData } from '@/types';

interface StreakIndicatorProps {
    streak: StreakData;
}

export function StreakIndicator({ streak }: StreakIndicatorProps) {
    return (
        <div className="flex flex-col items-center gap-3">
            <motion.div
                className="relative flex h-20 w-20 items-center justify-center rounded-2xl"
                style={{
                    background: streak.current > 0
                        ? 'linear-gradient(135deg, rgba(136,22,28,0.15) 0%, rgba(136,22,28,0.05) 100%)'
                        : 'rgba(74,74,74,0.05)',
                    border: streak.current > 0
                        ? '2px solid rgba(136,22,28,0.2)'
                        : '2px solid rgba(74,74,74,0.1)',
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
            >
                <Flame
                    className="h-8 w-8"
                    style={{ color: streak.current > 0 ? '#88161c' : '#6B7280' }}
                />
                <span
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: streak.current > 0 ? '#88161c' : '#6B7280' }}
                >
                    {streak.current}
                </span>
            </motion.div>

            <div className="text-center">
                    {streak.current > 0 ? `${streak.current} Hari Beruntun` : 'Mulai Streak!'}
                </p>
                <p className="text-xs text-brand-muted-dark">
                    {streak.hasReflectionToday ? 'Sudah menulis hari ini' : 'Belum menulis hari ini'}
                </p>
            </div>

            <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-xs text-brand-muted-dark">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Terbaik: {streak.longest} hari</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-brand-muted-dark">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Sekarang: {streak.current} hari</span>
                </div>
            </div>
        </div>
    );
}
