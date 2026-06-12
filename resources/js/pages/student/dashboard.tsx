import { Head, usePage, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { BookOpen, MessageSquare, Pencil, Sparkles, Users } from 'lucide-react';

import ActivityFeed from '@/components/dashboard/ActivityFeed';
import Breadcrumbs from '@/components/dashboard/Breadcrumbs';
import { EnhancedStatCard } from '@/components/dashboard/EnhancedStatCard';
import QuickActionsGrid from '@/components/dashboard/QuickActionsGrid';
import { useStudentNav } from '@/components/navigation/student-nav';
import { SkeletonStatCard } from '@/components/ui/skeletons';
import { LiquidGlassCard, OrganicBlob } from '@/components/Welcome/utils/helpers';
import AppLayout from '@/layouts/app-layout';
import student from '@/routes/student';
import { SharedData } from '@/types';
import DataExportButton from '@/components/DataExportButton';

interface StudentStats {
    enrolledCourses: number;
    activeGroups: number;
    reflections: number;
    chatMessages: number;
}

interface ActivityItem {
    id: string;
    type?: string;
    senderName?: string;
    content?: string;
    description?: string;
    createdAt?: string;
    timestamp?: string;
    groupName?: string;
    courseName?: string;
}

interface Props {
    enrolledCourses?: unknown[];
    stats?: StudentStats;
    recentActivity?: ActivityItem[];
}

export default function StudentDashboard({ stats, recentActivity = [] }: Props) {
    const { auth } = usePage<SharedData>().props;
    const navItems = useStudentNav('courses');

    const displayStats = stats ?? { enrolledCourses: 0, activeGroups: 0, reflections: 0, chatMessages: 0 };

    const [period, setPeriod] = useState<'all' | '7d' | '30d'>('all');

    const filteredActivities = useMemo(() => {
        if (period === 'all') return recentActivity;
        const now = Date.now();
        const days = period === '7d' ? 7 : 30;
        const cutoff = now - days * 24 * 60 * 60 * 1000;
        return recentActivity.filter((a: ActivityItem) => {
            const ts = a.timestamp || a.createdAt;
            if (!ts) return true;
            return new Date(ts).getTime() >= cutoff;
        });
    }, [recentActivity, period]);

    const handleActivityClick = (item: ActivityItem) => {
        const type = (item.type || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        if (type.includes('reflection') || desc.includes('refleksi')) {
            router.visit(student.reflections.index.url());
        } else if (type.includes('course') || type.includes('book') || desc.includes('kursus') || desc.includes('mata kuliah') || desc.includes('kelas')) {
            router.visit(student.courses.index.url());
        } else if (type.includes('group') || type.includes('user') || desc.includes('grup')) {
            const groupsUrl = (student as any).groups?.index?.url?.() || student.courses.index.url();
            router.visit(groupsUrl);
        } else if (type.includes('chat') || type.includes('message') || type.includes('discussion') || desc.includes('diskusi') || desc.includes('chat')) {
            router.visit(student.aiChat.index.url());
        } else {
            router.visit(student.courses.index.url());
        }
    };

    const statCards = [
        { label: 'Kelas', value: displayStats.enrolledCourses, icon: BookOpen, color: 'var(--color-brand-primary)' },
        { label: 'Grup Aktif', value: displayStats.activeGroups, icon: Users, color: 'var(--color-brand-dark)' },
        { label: 'Refleksi', value: displayStats.reflections, icon: Pencil, color: 'var(--color-brand-muted)' },
        { label: 'Pesan Obrolan', value: displayStats.chatMessages, icon: MessageSquare, color: 'var(--color-brand-primary)' },
    ];

    const quickActions = [
        {
            href: student.courses.index.url(),
            icon: Users,
            title: 'Gabung Kelas',
            desc: 'Gunakan kode gabung',
            color: 'var(--color-brand-primary)',
        },
        {
            href: student.courses.index.url(),
            icon: MessageSquare,
            title: 'Diskusi Grup',
            desc: 'Berkolaborasi sekarang',
            color: 'var(--color-brand-dark)',
        },
        {
            href: student.reflections.index.url(),
            icon: Pencil,
            title: 'Tulis Refleksi',
            desc: 'Pantau pembelajaran Anda',
            color: 'var(--color-brand-muted)',
        },
        {
            href: student.aiChat.index.url(),
            icon: Sparkles,
            title: 'Chat dengan AI',
            desc: 'Tanya apapun',
            color: 'var(--color-brand-primary)',
        },
    ];

    return (
        <AppLayout title="Dasbor" navItems={navItems}>
            <Head title="Dasbor Mahasiswa" />

            <div className="relative">
                <OrganicBlob className="top-0 -left-20" delay={0} color="rgba(136, 22, 28, 0.04)" size={300} />
                <OrganicBlob className="top-40 -right-20" delay={-5} color="rgba(136, 22, 28, 0.03)" size={250} />

                <div className="relative space-y-6">
                    <Breadcrumbs items={[{ label: 'Dasbor' }]} />

                    <div className="flex items-center justify-between">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h1 className="text-2xl font-bold font-sans text-brand-dark">
                                            Selamat datang kembali, {auth.user?.name}!
                                        </h1>
                                        <p className="mt-2 text-brand-muted-dark">Pantau progres belajar Anda dan berkolaborasi dengan tim</p>
                                    </div>
                                    <div
                                        className="flex h-14 w-14 items-center justify-center rounded-2xl"
                                        style={{
                                            background: 'rgba(136,22,28,0.08)',
                                            border: '1px solid rgba(136,22,28,0.12)',
                                        }}
                                    >
                                        <span className="text-2xl">👋</span>
                                    </div>
                                </div>
                            </LiquidGlassCard>
                        </motion.div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {!stats ? (
                            Array.from({ length: 4 }).map((_, index) => (
                                <SkeletonStatCard key={index} />
                            ))
                        ) : (
                            statCards.map((stat, index) => (
                                <EnhancedStatCard
                                    key={stat.label}
                                    label={stat.label}
                                    value={stat.value}
                                    icon={stat.icon}
                                    color={stat.color}
                                    isPrimary={index === 0}
                                />
                            ))
                        )}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <motion.div
                            className="lg:col-span-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                                <h2 className="mb-4 text-lg font-semibold font-sans text-brand-dark">
                                    Aksi Cepat
                                </h2>
                                <QuickActionsGrid actions={quickActions} />
                            </LiquidGlassCard>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="space-y-6"
                        >
                            <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold font-sans text-brand-dark">
                                        Aktivitas Terbaru
                                    </h2>
                                    <select
                                        value={period}
                                        onChange={(e) => setPeriod(e.target.value as 'all' | '7d' | '30d')}
                                        className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-brand-muted-dark focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                        aria-label="Filter periode aktivitas"
                                    >
                                        <option value="all">Semua</option>
                                        <option value="7d">7 hari terakhir</option>
                                        <option value="30d">30 hari terakhir</option>
                                    </select>
                                </div>
                                <ActivityFeed
                                    activities={filteredActivities}
                                    maxItems={5}
                                    onActivityClick={handleActivityClick}
                                />
                            </LiquidGlassCard>

                            <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                                <h2 className="mb-4 text-lg font-semibold font-sans text-brand-dark">
                                    Data Pribadi
                                </h2>
                                <p className="mb-4 text-sm text-brand-muted-dark">
                                    Unduh semua data pribadi Anda dalam format JSON
                                </p>
                                <DataExportButton />
                            </LiquidGlassCard>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
