import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { MessageSquare, TrendingUp, Users } from 'lucide-react';

interface ChatSpace {
    id: string;
    name: string;
    courseId: string;
    courseName: string;
    groupId: string;
    groupName: string;
    activeMembers: number;
    totalMessages: number;
    relevantMessages: number;
    hasGoal: boolean;
    healthScore: number;
}

export const DiscussionHealthWidget: React.FC = () => {
    const [chatSpaces, setChatSpaces] = useState<ChatSpace[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchChatSpaces();
    }, []);

    const fetchChatSpaces = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/lecturer/discussion-health', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
            });

            if (!response.ok) {
                throw new Error('Gagal memuat data diskusi');
            }

            const data = await response.json();
            setChatSpaces(data.chatSpaces || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-white/50 bg-white/80 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10">
                        <TrendingUp className="h-5 w-5 text-brand-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-brand-dark">Kesehatan Diskusi</h3>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-primary"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-white/50 bg-white/80 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10">
                        <TrendingUp className="h-5 w-5 text-brand-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-brand-dark">Kesehatan Diskusi</h3>
                </div>
                <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/50 bg-white/80 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10">
                        <TrendingUp className="h-5 w-5 text-brand-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-brand-dark">Kesehatan Diskusi</h3>
                </div>
                {chatSpaces.length > 0 && (
                    <span className="text-sm text-gray-600">
                        {chatSpaces.length} diskusi aktif
                    </span>
                )}
            </div>

            {chatSpaces.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12">
                    <MessageSquare className="h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-sm font-medium text-gray-600">Tidak ada diskusi aktif</p>
                    <p className="mt-1 text-xs text-gray-500">Diskusi dengan tujuan pembelajaran akan muncul di sini</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {chatSpaces.map((space) => {
                        const healthScore = space.healthScore ?? 0;
                        return (
                            <Link
                                key={space.id}
                                href={`/lecturer/courses/${space.courseId}/groups`}
                                className="block"
                            >
                                <div className="group rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-brand-primary/30 hover:shadow-md">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-semibold text-brand-dark group-hover:text-brand-primary transition-colors">
                                                {space.groupName}
                                            </h4>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {space.courseName}
                                            </p>
                                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <MessageSquare className="h-3.5 w-3.5" />
                                                    {space.totalMessages} pesan
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3.5 w-3.5" />
                                                    {space.activeMembers} aktif
                                                </span>
                                                {space.hasGoal && (
                                                    <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-brand-primary">
                                                        Ada tujuan
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <div className="text-right">
                                                <div className={`text-2xl font-bold ${
                                                    healthScore >= 70 
                                                        ? 'text-green-600' 
                                                        : healthScore >= 40 
                                                        ? 'text-yellow-600' 
                                                        : 'text-red-600'
                                                }`}>
                                                    {healthScore}
                                                </div>
                                                <div className="text-xs text-gray-500">skor</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                                            <div
                                                className={`h-full transition-all duration-300 ${
                                                    healthScore >= 70 
                                                        ? 'bg-green-500' 
                                                        : healthScore >= 40 
                                                        ? 'bg-yellow-500' 
                                                        : 'bg-red-500'
                                                }`}
                                                style={{ width: `${Math.min(healthScore, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DiscussionHealthWidget;
