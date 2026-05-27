import { motion } from 'framer-motion';
import ReactLoadingSkeleton from 'react-loading-skeleton';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded bg-zinc-200 dark:bg-zinc-700 ${className}`}
        />
    );
}

const ShimmerBar = (props: { width?: number | string; height?: number | string; borderRadius?: string; className?: string }) => (
    <ReactLoadingSkeleton
        baseColor="#E8EDF8"
        highlightColor="#F5F7FC"
        width={typeof props.width === 'string' ? undefined : props.width}
        height={typeof props.height === 'string' ? undefined : props.height}
        borderRadius={props.borderRadius ?? '0.5rem'}
        className={props.className}
        style={{
            ...(typeof props.width === 'string' ? { width: props.width } : {}),
            ...(typeof props.height === 'string' ? { height: props.height } : {}),
        }}
    />
);

export function CardSkeleton() {
    return (
        <div className="card p-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="mt-4 h-8 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/2" />
            <div className="mt-4 flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
            </div>
        </div>
    );
}

export function CourseCardSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-6"
        >
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="mt-4 h-6 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/2" />
            <div className="mt-4">
                <Skeleton className="h-4 w-24" />
            </div>
        </motion.div>
    );
}

export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, index) => (
                <CourseCardSkeleton key={index} />
            ))}
        </div>
    );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
    return (
        <tr className="border-b border-zinc-200 dark:border-zinc-700">
            {Array.from({ length: columns }).map((_, index) => (
                <td key={index} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="card overflow-hidden">
            <table className="w-full">
                <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
                    <tr>
                        {Array.from({ length: columns }).map((_, index) => (
                            <th key={index} className="px-4 py-3 text-left">
                                <Skeleton className="h-4 w-24" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, index) => (
                        <TableRowSkeleton key={index} columns={columns} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function ChatMessageSkeleton({ isOwn = false }: { isOwn?: boolean }) {
    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] ${isOwn ? 'order-2' : ''}`}>
                {!isOwn && (
                    <div className="mb-1 flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                )}
                <Skeleton className={`h-16 w-48 rounded-2xl ${isOwn ? 'ml-auto' : ''}`} />
                <Skeleton className={`mt-1 h-3 w-12 ${isOwn ? 'ml-auto' : ''}`} />
            </div>
        </div>
    );
}

export function ChatSkeleton({ messageCount = 5 }: { messageCount?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: messageCount }).map((_, index) => (
                <ChatMessageSkeleton key={index} isOwn={index % 3 === 0} />
            ))}
        </div>
    );
}

export function FormSkeleton() {
    return (
        <div className="card p-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-72" />
            <div className="mt-6 space-y-4">
                <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-1 h-10 w-full" />
                </div>
                <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-1 h-10 w-full" />
                </div>
                <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-1 h-24 w-full" />
                </div>
                <div className="flex gap-3 pt-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                </div>
            </div>
        </div>
    );
}

export function StatCardSkeleton() {
    return (
        <div className="card p-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded" />
            </div>
            <Skeleton className="mt-2 h-8 w-16" />
            <Skeleton className="mt-1 h-3 w-20" />
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </div>
            {/* Content */}
            <div className="grid gap-6 lg:grid-cols-2">
                <CardSkeleton />
                <CardSkeleton />
            </div>
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="card p-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="mt-1 h-4 w-32" />
                </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-1 h-10 w-full" />
                </div>
                <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-1 h-10 w-full" />
                </div>
            </div>
        </div>
    );
}

const shimmerRadius = '1rem';
export function SkeletonDashboard() {
    return (
        <div className="space-y-6">
            <div
                className="rounded-3xl p-6"
                style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.6)' }}
            >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-3">
                        <ShimmerBar width={56} height={56} borderRadius="1rem" />
                        <div className="space-y-2">
                            <ShimmerBar width={260} height={28} />
                            <ShimmerBar width={360} height={16} />
                            <ShimmerBar width={180} height={14} borderRadius="9999px" />
                        </div>
                    </div>
                    <div className="hidden w-[280px] space-y-3 lg:block">
                        <ShimmerBar width="100%" height={48} borderRadius={shimmerRadius} />
                        <div className="flex gap-2">
                            <ShimmerBar width={60} height={28} borderRadius="9999px" />
                            <ShimmerBar width={60} height={28} borderRadius="9999px" />
                            <ShimmerBar width={60} height={28} borderRadius="9999px" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-2xl p-5"
                        style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.5)' }}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-3 flex-1">
                                <ShimmerBar width={80} height={14} />
                                <ShimmerBar width="60%" height={32} />
                            </div>
                            <ShimmerBar width={44} height={44} borderRadius="0.75rem" />
                        </div>
                        <div className="mt-4 space-y-2">
                            <ShimmerBar width="40%" height={14} />
                            <ShimmerBar width="80%" height={12} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-3xl p-6"
                        style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.6)' }}
                    >
                        <ShimmerBar width={180} height={20} />
                        <ShimmerBar width={140} height={14} className="mt-2" />
                        <ShimmerBar width="100%" height={220} borderRadius={shimmerRadius} className="mt-4" />
                    </div>
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                <div
                    className="rounded-3xl p-6"
                    style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.6)' }}
                >
                    <ShimmerBar width={120} height={20} borderRadius="9999px" />
                    <ShimmerBar width={220} height={24} className="mt-4" />
                    <ShimmerBar width="70%" height={14} className="mt-2" />
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <ShimmerBar key={i} width="100%" height={80} borderRadius="1.5rem" />
                        ))}
                    </div>
                </div>
                <div
                    className="space-y-3 rounded-3xl p-6"
                    style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.6)' }}
                >
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <ShimmerBar width={32} height={32} borderRadius="9999px" />
                            <div className="flex-1 space-y-1">
                                <ShimmerBar width={`${60 + (i % 3) * 10}%`} height={14} />
                                <ShimmerBar width="30%" height={10} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function SkeletonTable({ columns = 6, rows = 8 }: { columns?: number; rows?: number }) {
    return (
        <div className="space-y-6">
            <div
                className="rounded-3xl p-6"
                style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.6)' }}
            >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                        <ShimmerBar width={48} height={48} borderRadius="0.75rem" />
                        <div className="space-y-2">
                            <ShimmerBar width={220} height={28} />
                            <ShimmerBar width={300} height={16} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <ShimmerBar width={100} height={36} borderRadius="9999px" />
                        <ShimmerBar width={100} height={36} borderRadius="9999px" />
                        <ShimmerBar width={120} height={36} borderRadius="9999px" />
                    </div>
                </div>
            </div>

            <div
                className="space-y-4 rounded-3xl p-5 sm:p-6"
                style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.4)' }}
            >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <ShimmerBar width="100%" height={64} borderRadius={shimmerRadius} />
                        <ShimmerBar width="100%" height={64} borderRadius={shimmerRadius} />
                        <ShimmerBar width="100%" height={64} borderRadius={shimmerRadius} />
                    </div>
                    <div className="flex gap-2">
                        <ShimmerBar width={120} height={36} borderRadius="9999px" />
                    </div>
                </div>
            </div>

            <div
                className="overflow-hidden rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.5)' }}
            >
                <table className="min-w-full divide-y divide-white/70">
                    <thead className="bg-white/70">
                        <tr>
                            {Array.from({ length: columns }).map((_, i) => (
                                <th key={i} className="px-4 py-3 text-left">
                                    <ShimmerBar width={80} height={12} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/70">
                        {Array.from({ length: rows }).map((_, rowIdx) => (
                            <tr key={rowIdx} className="hover:bg-white/60">
                                {Array.from({ length: columns }).map((_, colIdx) => (
                                    <td key={colIdx} className="px-4 py-3.5">
                                        <ShimmerBar width={`${50 + ((rowIdx + colIdx) % 3) * 15}%`} height={14} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between">
                <ShimmerBar width={160} height={16} />
                <div className="flex gap-2">
                    <ShimmerBar width={80} height={32} borderRadius="9999px" />
                    <ShimmerBar width={80} height={32} borderRadius="9999px" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonCard({ cardCount = 4 }: { cardCount?: number }) {
    return (
        <div className="space-y-6">
            <div
                className="rounded-3xl p-6"
                style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.6)' }}
            >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                        <ShimmerBar width={48} height={48} borderRadius="0.75rem" />
                        <div className="space-y-2">
                            <ShimmerBar width={200} height={28} />
                            <ShimmerBar width={340} height={16} />
                        </div>
                    </div>
                    <ShimmerBar width={120} height={36} borderRadius="9999px" />
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-2xl border border-white/60 bg-white/70 p-4">
                            <ShimmerBar width={100} height={14} />
                            <ShimmerBar width="50%" height={24} className="mt-2" />
                        </div>
                    ))}
                </div>
            </div>

            <div
                className="overflow-hidden rounded-3xl"
                style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.5)' }}
            >
                <div className="border-b border-black/5 px-6 py-4">
                    <ShimmerBar width={140} height={20} />
                    <ShimmerBar width={280} height={14} className="mt-1" />
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: cardCount }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-2xl p-4"
                            style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.4)' }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1">
                                    <ShimmerBar width="60%" height={16} />
                                    <ShimmerBar width="40%" height={12} />
                                </div>
                                <ShimmerBar width={70} height={24} borderRadius="9999px" />
                            </div>
                            <div className="mt-4 space-y-2">
                                <ShimmerBar width="100%" height={12} />
                                <ShimmerBar width="70%" height={12} />
                                <ShimmerBar width="50%" height={12} />
                            </div>
                            <div className="mt-4 flex gap-2">
                                <ShimmerBar width={80} height={32} borderRadius="9999px" />
                                <ShimmerBar width={80} height={32} borderRadius="9999px" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Task 1.2: SkeletonStatCard - for dashboard stat cards
export function SkeletonStatCard() {
    return (
        <div className="card p-6">
            <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-8 w-24" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
        </div>
    );
}

// Task 1.3: SkeletonTableRow - configurable column count
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
    return (
        <tr className="border-b border-[var(--dm-border)]">
            {Array.from({ length: columns }).map((_, index) => (
                <td key={index} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
}

// Task 1.4: SkeletonChart - rectangular placeholder for charts
export function SkeletonChart({ height = "h-64" }: { height?: string }) {
    return (
        <div className={`card p-6 ${height}`}>
            <Skeleton className="h-full w-full rounded-lg" />
        </div>
    );
}

