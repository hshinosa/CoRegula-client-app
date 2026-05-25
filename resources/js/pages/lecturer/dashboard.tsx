import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Activity, BookOpen, Plus, Users, AlertTriangle, BarChart3, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import Breadcrumbs from '@/components/dashboard/Breadcrumbs';
import NotificationsBell from '@/components/dashboard/NotificationsBell';
import { useLecturerNav } from '@/components/navigation/lecturer-nav';
import { LiquidGlassCard, OrganicBlob } from '@/components/Welcome/utils/helpers';
import AppLayout from '@/layouts/app-layout';
import lecturer from '@/routes/lecturer';
import { Course, SharedData } from '@/types';
import { getAuthToken } from '@/lib/getAuthToken';

interface DashboardStats {
    totalCourses: number;
    totalStudents: number;
    totalGroups: number;
    coursesNeedingAttention: number;
}

interface ActivityItem {
    id: string;
    senderName: string;
    senderType?: string;
    content: string;
    createdAt: string;
    groupName?: string;
    courseName?: string;
}

interface ClassDistributionItem {
    name: string;
    code: string;
    groupCount: number;
    studentCount: number;
}

interface TrendDataPoint {
    week: string;
    messageCount: number;
    lexicalVariety: number;
    hotPercentage: number;
}

interface QualityTrendItem {
    courseName: string;
    courseCode: string;
    data: TrendDataPoint[];
}

interface ChartData {
    classDistribution: ClassDistributionItem[];
    qualityTrends: QualityTrendItem[];
}

interface Props {
    stats: DashboardStats;
    recentCourses: Course[];
    recentActivity: ActivityItem[];
    chartData: ChartData;
}

const COLORS = ['#88161c', '#4A4A4A', '#6B7280', '#92400e', '#166534', '#7c3aed', '#0369a1', '#be123c', '#854d0e', '#15803d', '#6d28d9', '#0e7490'];

export default function LecturerDashboard({ stats, recentActivity, chartData }: Props) {
    const { auth } = usePage<SharedData>().props;
    const navItems = useLecturerNav('dashboard');

    const [liveActivity, setLiveActivity] = useState<ActivityItem[]>(recentActivity);
    const [isConnected, setIsConnected] = useState(false);
    const [jwtToken, setJwtToken] = useState<string | null>(null);
    const maxLiveItems = 5;

    useEffect(() => {
        getAuthToken().then(setJwtToken).catch(() => {});
    }, []);

    useEffect(() => {
        if (!jwtToken) return;

        const apiUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const socket: Socket = io(apiUrl, {
            auth: { token: jwtToken },
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        socket.on('receive_message', (data: any) => {
            if (data.senderType === 'system' || data.isIntervention) return;
            const newItem: ActivityItem = {
                id: data.id || String(Date.now()),
                senderName: data.senderName || 'Unknown',
                senderType: data.senderType || 'student',
                content: (data.content || '').substring(0, 150),
                createdAt: data.createdAt || new Date().toISOString(),
                groupName: data.groupName || '',
                courseName: data.courseName || '',
            };
            setLiveActivity(prev => [newItem, ...prev].slice(0, maxLiveItems));
        });

        return () => { socket.disconnect(); };
    }, [jwtToken]);

    const statCards = [
        { label: 'Kelas Aktif', value: stats.totalCourses, icon: BookOpen, color: '#88161c' },
        { label: 'Total Mahasiswa', value: stats.totalStudents, icon: Users, color: '#4A4A4A' },
        { label: 'Grup Aktif', value: stats.totalGroups, icon: Activity, color: '#6B7280' },
        { label: 'Perlu Perhatian', value: stats.coursesNeedingAttention, icon: AlertTriangle, color: '#92400e' },
    ];

    const totalGroups = useMemo(
        () => chartData.classDistribution.reduce((sum, c) => sum + c.groupCount, 0),
        [chartData.classDistribution]
    );

    return (
        <AppLayout title="Dasbor" navItems={navItems}>
            <Head title="Dasbor Dosen" />

            <div className="relative">
                <OrganicBlob className="top-0 -left-20" delay={0} color="rgba(136, 22, 28, 0.04)" size={300} />
                <OrganicBlob className="top-40 -right-20" delay={-5} color="rgba(136, 22, 28, 0.03)" size={250} />

                <div className="relative space-y-6">
                    <Breadcrumbs items={[{ label: 'Dasbor' }]} />

                    <div className="flex items-center justify-between">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex-1">
                            <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold" style={{ color: '#4A4A4A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                        Selamat datang kembali, {auth.user?.name}!
                                    </h1>
                                    <p className="mt-2 text-[#6B7280]">Kelola kelas Anda dan pantau kolaborasi mahasiswa dari satu tempat.</p>
                                </div>
                                <div
                                    className="flex h-14 w-14 items-center justify-center rounded-2xl"
                                    style={{
                                        background: 'rgba(136,22,28,0.08)',
                                        border: '1px solid rgba(136,22,28,0.12)',
                                    }}
                                >
                                    <BookOpen className="h-7 w-7" style={{ color: '#88161c' }} />
                                </div>
                            </div>
                        </LiquidGlassCard>
                        </motion.div>
                        <NotificationsBell />
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
                                    <div className="flex items-start justify-between gap-3">
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

                    <div className="grid gap-6 lg:grid-cols-2">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
                            <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                                <div className="flex items-center gap-2 mb-4">
                                    <BarChart3 className="h-5 w-5 text-[#6B7280]" />
                                    <h2 className="text-lg font-semibold" style={{ color: '#4A4A4A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                        Distribusi Kelas
                                    </h2>
                                </div>

                                {chartData.classDistribution.length === 0 ? (
                                    <div className="text-center py-8">
                                        <BarChart3 className="mx-auto h-10 w-10 text-[#6B7280] opacity-50" />
                                        <p className="mt-3 text-sm text-[#6B7280]">Belum ada data</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {chartData.classDistribution.map((item, i) => {
                                            const pct = totalGroups > 0 ? (item.groupCount / totalGroups) * 100 : 0;
                                            return (
                                                <div key={item.code}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-medium text-[#374151]">{item.code}</span>
                                                        <span className="text-xs text-[#6B7280]">{item.groupCount} grup · {item.studentCount} mahasiswa</span>
                                                    </div>
                                                    <div className="h-2.5 w-full rounded-full bg-gray-100">
                                                        <div
                                                            className="h-2.5 rounded-full transition-all duration-700"
                                                            style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: COLORS[i % COLORS.length] }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </LiquidGlassCard>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
                            <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-[#6B7280]" />
                                        <h2 className="text-lg font-semibold" style={{ color: '#4A4A4A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                            Aktivitas Terbaru
                                        </h2>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {isConnected ? (
                                            <Wifi className="h-3.5 w-3.5 text-green-500" />
                                        ) : (
                                            <WifiOff className="h-3.5 w-3.5 text-gray-400" />
                                        )}
                                        <span className="text-[10px] text-[#6B7280]">{isConnected ? 'Live' : 'Offline'}</span>
                                    </div>
                                </div>

                                {liveActivity.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Activity className="mx-auto h-10 w-10 text-[#6B7280] opacity-50" />
                                        <p className="mt-3 text-sm text-[#6B7280]">Belum ada aktivitas</p>
                                        <p className="text-xs text-[#6B7280] mt-1">Aktivitas akan muncul saat mahasiswa berdiskusi</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {liveActivity.map((activity) => (
                                            <div key={activity.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium"
                                                        style={{ background: 'rgba(136,22,28,0.08)', color: '#88161c' }}
                                                    >
                                                        {activity.senderName?.charAt(0) || '?'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-[#1F2937] truncate">{activity.senderName}</p>
                                                        <p className="text-xs text-[#6B7280]">
                                                            {activity.courseName && `${activity.courseName} · `}
                                                            {activity.groupName}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-sm text-[#6B7280] line-clamp-2">{activity.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </LiquidGlassCard>
                        </motion.div>
                    </div>

                    {chartData.qualityTrends.length > 0 && chartData.qualityTrends.some(t => t.data.length > 0) && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
                            <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                                <div className="flex items-center gap-2 mb-4">
                                    <BarChart3 className="h-5 w-5 text-[#6B7280]" />
                                    <h2 className="text-lg font-semibold" style={{ color: '#4A4A4A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                        Tren Aktivitas Mingguan
                                    </h2>
                                </div>
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {chartData.qualityTrends.filter(t => t.data.length > 0).map((trend, ti) => {
                                        const maxMsg = Math.max(...trend.data.map(d => d.messageCount), 1);
                                        return (
                                            <div key={trend.courseCode} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                                <p className="text-sm font-medium text-[#1F2937]">{trend.courseCode}</p>
                                                <p className="text-xs text-[#6B7280] mb-3">{trend.courseName}</p>
                                                <div className="flex items-end gap-1 h-20">
                                                    {trend.data.map((d, di) => (
                                                        <div key={di} className="flex-1 flex flex-col items-center gap-1">
                                                            <div
                                                                className="w-full rounded-t transition-all duration-500"
                                                                style={{
                                                                    height: `${(d.messageCount / maxMsg) * 100}%`,
                                                                    minHeight: d.messageCount > 0 ? 4 : 0,
                                                                    backgroundColor: COLORS[ti % COLORS.length],
                                                                    opacity: 0.8,
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-[10px] text-[#6B7280]">
                                                        {trend.data.length} minggu
                                                    </span>
                                                    <span className="text-[10px] font-medium" style={{ color: COLORS[ti % COLORS.length] }}>
                                                        {trend.data.reduce((s, d) => s + d.messageCount, 0)} pesan
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </LiquidGlassCard>
                        </motion.div>
                    )}

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }}>
                        <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                            <h2 className="mb-4 text-lg font-semibold" style={{ color: '#4A4A4A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                Aksi Cepat
                            </h2>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <Link
                                    href={lecturer.courses.create.url()}
                                    className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'rgba(136,22,28,0.08)' }}>
                                        <Plus className="h-5 w-5" style={{ color: '#88161c' }} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#1F2937]">Buat Kelas Baru</p>
                                        <p className="text-xs text-[#6B7280]">Tambah kelas baru</p>
                                    </div>
                                </Link>

                                <Link
                                    href={lecturer.courses.index.url()}
                                    className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'rgba(74,74,74,0.08)' }}>
                                        <BookOpen className="h-5 w-5" style={{ color: '#4A4A4A' }} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#1F2937]">Kelola Kelas</p>
                                        <p className="text-xs text-[#6B7280]">Lihat semua kelas</p>
                                    </div>
                                </Link>

                                <Link
                                    href={lecturer.courses.index.url()}
                                    className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'rgba(107,114,128,0.08)' }}>
                                        <Users className="h-5 w-5" style={{ color: '#6B7280' }} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#1F2937]">Kelola Mahasiswa</p>
                                        <p className="text-xs text-[#6B7280]">Atur anggota grup</p>
                                    </div>
                                </Link>
                            </div>
                        </LiquidGlassCard>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}
