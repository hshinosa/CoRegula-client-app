import { motion } from 'framer-motion';

interface SkeletonCardProps {
    index?: number;
}

export function SkeletonCard({ index = 0 }: SkeletonCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl p-5"
            style={{
                background: 'rgba(255,255,255,0.4)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.5)',
            }}
        >
            <div className="flex items-start gap-3">
                <div
                    className="h-10 w-10 rounded-xl animate-pulse"
                    style={{ background: 'rgba(107,114,128,0.08)' }}
                />

                <div className="min-w-0 flex-1 space-y-3">
                    <div
                        className="h-4 w-3/4 rounded-lg animate-pulse"
                        style={{ background: 'rgba(107,114,128,0.08)' }}
                    />

                    <div
                        className="h-3 w-1/2 rounded-lg animate-pulse"
                        style={{ background: 'rgba(107,114,128,0.06)' }}
                    />

                    <div className="space-y-1.5 pt-1">
                        <div
                            className="h-3 w-full rounded-lg animate-pulse"
                            style={{ background: 'rgba(107,114,128,0.06)' }}
                        />
                        <div
                            className="h-3 w-2/3 rounded-lg animate-pulse"
                            style={{ background: 'rgba(107,114,128,0.05)' }}
                        />
                    </div>

                    <div
                        className="h-5 w-20 rounded-full animate-pulse"
                        style={{ background: 'rgba(107,114,128,0.06)' }}
                    />
                </div>
            </div>
        </motion.div>
    );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} index={i} />
            ))}
        </div>
    );
}
