import { motion } from 'framer-motion';

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
