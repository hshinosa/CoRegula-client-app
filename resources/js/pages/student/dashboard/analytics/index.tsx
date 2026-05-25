import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Activity, Calendar, MessageSquare, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

import MetricsRadarChart from '@/components/MetricsRadarChart';
import Breadcrumbs from '@/components/dashboard/Breadcrumbs';
import NotificationsBell from '@/components/dashboard/NotificationsBell';
import { useStudentNav } from '@/components/navigation/student-nav';
import { LiquidGlassCard } from '@/components/Welcome/utils/helpers';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';

interface AnalyticsData {
    weeksActive: number;
    sessionsJoined: number;
    participationTrend: 'up' | 'down' | 'stable';
    radarMetrics: {
        consistency: number;
        participation: number;
        reflection: number;
        weeklyEngagement: number;
    };
    recentActivities: Array<{
        id: string;
        type: 'session_joined' | 'week_opened' | 'week_completed';
        description: string;
        timestamp: string;
    }>;
}

interface Props {
    analytics?: AnalyticsData;
}

export default function StudentAnalytics({ analytics }: Props) {
    const { auth } = usePage<SharedData>().props;
    const navItems = useStudentNav('courses');

    const data = analytics ?? {
        weeksActive: 0,
        sessionsJoined: 0,
        participationTrend: 'stable' as const,
        radarMetrics: {
            consistency: 0,
            participation: 0,
            reflection: 0,
            weeklyEngagement: 0,
        },
        recentActivities: [],
    };

    const radarData = useMemo(
        () => [
            data.radarMetrics.consistency,
            data.radarMetrics.participation,
            data.radarMetrics.reflection,
            data.radarMetrics.weeklyEngagement,
        ],
        [data.radarMetrics]
    );

    const radarLabels = ['Konsistensi', 'Partisipasi Diskusi', 'Refleksi', 'Keterlibatan Mingguan'];

    const getTrendIcon = () => {
        switch (data.participationTrend) {
            case 'up':
                return <TrendingUp className="h-5 w-5 text-green-600" />;
            case 'down':
                return <TrendingDown className="h-5 w-5 text-red-600" />;
            default:
                return <span className="text-gray-600">─</span>;
        }
    };

    const getTrendText = () => {
        switch (data.participationTrend) {
            case 'up':
                return 'Meningkat';
            case 'down':
                return 'Menurun';
            default:
                return 'Stabil';
        }
    };

    const getTrendColor = () => {
        switch (data.participationTrend) {
            case 'up':
                return 'text-green-600';
            case 'down':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} menit lalu`;
        if (diffHours < 24) return `${diffHours} jam lalu`;
        if (diffDays < 7) return `${diffDays} hari lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'session_joined':
                return <MessageSquare className="h-4 w-4" />;
            case 'week_opened':
                return <Calendar className="h-4 w-4" />;
            case 'week_completed':
                return <Activity className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    return (
        <AppLayout navItems={navItems}>
            <Head title="Analitik Aktivitas" />

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <Breadcrumbs
                            items={[
                                { label: 'Dashboard', href: '/student/dashboard' },
                                { label: 'Analitik', href: '/student/dashboard/analytics' },
                            ]}
                        />
                        <h1 className="mt-2 text-3xl font-bold text-gray-900">Analitik Aktivitas</h1>
                        <p className="mt-1 text-sm text-gray-600">Pantau perkembangan dan partisipasi Anda</p>
                    </div>
                    <NotificationsBell />
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <LiquidGlassCard className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Minggu Aktif</p>
                                    <p className="mt-2 text-3xl font-bold text-gray-900">{data.weeksActive}</p>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3">
                                    <Calendar className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </LiquidGlassCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <LiquidGlassCard className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Sesi Diikuti</p>
                                    <p className="mt-2 text-3xl font-bold text-gray-900">{data.sessionsJoined}</p>
                                </div>
                                <div className="rounded-full bg-green-100 p-3">
                                    <MessageSquare className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </LiquidGlassCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <LiquidGlassCard className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Tren Partisipasi</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        {getTrendIcon()}
                                        <p className={`text-xl font-bold ${getTrendColor()}`}>{getTrendText()}</p>
                                    </div>
                                </div>
                                <div className="rounded-full bg-purple-100 p-3">
                                    <Activity className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </LiquidGlassCard>
                    </motion.div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                    >
                        <LiquidGlassCard className="p-6">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Profil Aktivitas</h2>
                            {data.radarMetrics.consistency === 0 &&
                            data.radarMetrics.participation === 0 &&
                            data.radarMetrics.reflection === 0 &&
                            data.radarMetrics.weeklyEngagement === 0 ? (
                                <div className="flex h-64 items-center justify-center text-gray-500">
                                    <p>Belum ada data aktivitas</p>
                                </div>
                            ) : (
                                <div className="h-64">
                                    <MetricsRadarChart
                                        data={radarData}
                                        labels={radarLabels}
                                        primaryLabel="Aktivitas Anda"
                                        showLegend={false}
                                    />
                                </div>
                            )}
                        </LiquidGlassCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                    >
                        <LiquidGlassCard className="p-6">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Aktivitas Terakhir</h2>
                            {data.recentActivities.length === 0 ? (
                                <div className="flex h-64 items-center justify-center text-gray-500">
                                    <p>Belum ada aktivitas</p>
                                </div>
                            ) : (
                                <div className="space-y-4 overflow-y-auto" style={{ maxHeight: '16rem' }}>
                                    {data.recentActivities.map((activity, index) => (
                                        <motion.div
                                            key={activity.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2, delay: index * 0.05 }}
                                            className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                                        >
                                            <div className="mt-1 rounded-full bg-gray-100 p-2">
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {activity.description}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {formatTimestamp(activity.timestamp)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </LiquidGlassCard>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}
