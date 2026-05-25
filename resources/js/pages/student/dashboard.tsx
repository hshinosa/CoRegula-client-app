import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { BookOpen, MessageSquare, Pencil, Sparkles, Users } from 'lucide-react';

import ActivityFeed from '@/components/dashboard/ActivityFeed';
import Breadcrumbs from '@/components/dashboard/Breadcrumbs';
import QuickActionsGrid from '@/components/dashboard/QuickActionsGrid';
import { useStudentNav } from '@/components/navigation/student-nav';
import { LiquidGlassCard, OrganicBlob } from '@/components/Welcome/utils/helpers';
import AppLayout from '@/layouts/app-layout';
import student from '@/routes/student';
import { SharedData } from '@/types';

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

    const statCards = [
        { label: 'Mata Kuliah', value: displayStats.enrolledCourses, icon: BookOpen, color: '#88161c' },
        { label: 'Grup Aktif', value: displayStats.activeGroups, icon: Users, color: '#4A4A4A' },
        { label: 'Refleksi', value: displayStats.reflections, icon: Pencil, color: '#6B7280' },
        { label: 'Pesan Obrolan', value: displayStats.chatMessages, icon: MessageSquare, color: '#88161c' },
    ];

    const quickActions = [
        {
            href: student.courses.index.url(),
            icon: Users,
            title: 'Gabung Mata Kuliah',
            desc: 'Gunakan kode gabung',
            color: '#88161c',
        },
        {
            href: student.courses.index.url(),
            icon: MessageSquare,
            title: 'Diskusi Grup',
            desc: 'Berkolaborasi sekarang',
            color: '#4A4A4A',
        },
        {
            href: student.reflections.index.url(),
            icon: Pencil,
            title: 'Tulis Refleksi',
            desc: 'Pantau pembelajaran Anda',
            color: '#6B7280',
        },
        {
            href: student.aiChat.index.url(),
            icon: Sparkles,
            title: 'Chat dengan AI',
            desc: 'Tanya apapun',
            color: '#88161c',
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
                                        <h1 className="text-2xl font-bold" style={{ color: '#4A4A4A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                            Selamat datang kembali, {auth.user?.name}!
                                        </h1>
                                        <p className="mt-2 text-[#6B7280]">Pantau progres belajar Anda dan berkolaborasi dengan tim</p>
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
                        {statCards.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
                            >
                                <LiquidGlassCard intensity="light" className="p-5" lightMode={true}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm text-[#6B7280]">{stat.label}</p>
                                            <p
                                                className="mt-2 text-3xl font-light"
                                                style={{ color: '#4A4A4A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                                            >
                                                {stat.value}
                                            </p>
                                        </div>
                                        <div
                                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                                            style={{
                                                background: `${stat.color}15`,
                                                border: `1px solid ${stat.color}25`,
                                            }}
                                        >
                                            <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                                        </div>
                                    </div>
                                </LiquidGlassCard>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <motion.div
                            className="lg:col-span-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                                <h2 className="mb-4 text-lg font-semibold" style={{ color: '#4A4A4A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                    Aksi Cepat
                                </h2>
                                <QuickActionsGrid actions={quickActions} />
                            </LiquidGlassCard>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                                <h2 className="mb-4 text-lg font-semibold" style={{ color: '#4A4A4A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                    Aktivitas Terbaru
                                </h2>
                                <ActivityFeed activities={recentActivity} maxItems={5} />
                            </LiquidGlassCard>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
