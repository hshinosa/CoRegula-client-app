import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Lock, MessageCircle, MessageSquare, Pencil } from 'lucide-react';
import { LiquidGlassCard } from '@/components/Welcome/utils/helpers';
import { ActivityPreview } from './ActivityPreview';

interface ChatSpaceGoal {
    id: string;
    content: string;
    isValidated: boolean;
    createdBy: { id: string; name: string };
    createdAt: string;
}

export interface ChatSpaceItem {
    id: string;
    name: string;
    description?: string;
    isDefault: boolean;
    weekTitle?: string | null;
    weekIndex?: number | null;
    hasPreReadCompleted?: boolean;
    isClosed?: boolean;
    closedAt?: string;
    myGoal?: ChatSpaceGoal | null;
    createdAt?: string;
    lastMessage?: string | null;
    lastMessageAt?: string | null;
    lastMessageSender?: string | null;
    type?: 'Akademik' | 'Proyek' | 'Umum';
    status?: 'Aktif' | 'Tidak aktif';
}

function isClosed(space: ChatSpaceItem): boolean {
    return Boolean(space.isClosed || space.closedAt || (!space.isDefault && space.closedAt));
}

function formatDate(dateString?: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

interface SpaceCardProps {
    space: ChatSpaceItem;
    courseId: string;
    getChatSpaceUrl: (courseId: string, space: ChatSpaceItem) => string;
    index?: number;
}

export function SpaceCard({ space, courseId, getChatSpaceUrl, index = 0 }: SpaceCardProps) {
    const closed = isClosed(space);
    const dateSource = closed ? space.closedAt : space.createdAt;
    const formattedDate = formatDate(dateSource);
    const dateLabel = formattedDate ? `${closed ? 'Ditutup' : 'Dibuat'} ${formattedDate}` : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link
                href={getChatSpaceUrl(courseId, space)}
                className="group block"
            >
                <LiquidGlassCard
                    intensity="light"
                    className="p-5 transition-all duration-300 group-hover:shadow-lg"
                    lightMode={true}
                >
                    <div className="flex items-start gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{
                                background: closed ? 'rgba(107,114,128,0.08)' : 'rgba(136,22,28,0.08)',
                                border: closed ? '1px solid rgba(107,114,128,0.12)' : '1px solid rgba(136,22,28,0.12)',
                                color: closed ? '#6B7280' : '#88161c',
                            }}
                        >
                            {closed ? <Lock className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3
                                className="font-semibold truncate"
                                style={{ color: closed ? '#6B7280' : '#4A4A4A' }}
                            >
                                {space.name}
                            </h3>

                            {space.description && (
                                <p className="mt-0.5 text-xs text-brand-muted-dark line-clamp-2">
                                    {space.description}
                                </p>
                            )}

                            {space.weekTitle ? (
                                <p className="mt-1 text-xs font-medium" style={{ color: '#88161c' }}>
                                    {space.weekIndex != null ? `Minggu ${space.weekIndex}: ` : ''}
                                    {space.weekTitle}
                                </p>
                            ) : null}

                            <div className="mt-2">
                                <ActivityPreview
                                    lastMessage={space.lastMessage}
                                    lastMessageAt={space.lastMessageAt}
                                    lastMessageSender={space.lastMessageSender}
                                />
                            </div>

                            {dateLabel && (
                                <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand-muted-dark">
                                    {dateLabel}
                                </p>
                            )}

                            <div className="mt-2 flex items-center gap-2">
                                {closed ? (
                                    <span
                                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                                        style={{ background: 'rgba(107,114,128,0.08)', color: '#6B7280', border: '1px solid rgba(107,114,128,0.15)' }}
                                    >
                                        <Lock className="h-3 w-3" />
                                        Sesi Ditutup
                                    </span>
                                ) : space.myGoal ? (
                                    <span
                                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                                        style={{ background: 'rgba(136,22,28,0.08)', color: '#88161c', border: '1px solid rgba(136,22,28,0.15)' }}
                                    >
                                        <MessageCircle className="h-3 w-3" />
                                        Masuk Diskusi
                                    </span>
                                ) : (
                                    <span
                                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                                        style={{ background: 'rgba(245,158,11,0.08)', color: '#92400e', border: '1px solid rgba(245,158,11,0.15)' }}
                                    >
                                        <Pencil className="h-3 w-3" />
                                        Tetapkan Tujuan
                                    </span>
                                )}
                            </div>
                        </div>

                        <svg
                            className="h-5 w-5 flex-shrink-0 transition-transform group-hover:translate-x-1"
                            style={{ color: closed ? '#6B7280' : '#88161c' }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </LiquidGlassCard>
            </Link>
        </motion.div>
    );
}
