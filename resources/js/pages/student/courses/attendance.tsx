import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CalendarCheck, CheckCircle2, XCircle, Minus, Clock, MessageSquare, Flame } from 'lucide-react';
import { useMemo } from 'react';

import AppLayout from '@/layouts/app-layout';
import { useStudentNav } from '@/components/navigation/student-nav';
import { Course } from '@/types';
import Breadcrumbs from '@/components/dashboard/Breadcrumbs';
import { LiquidGlassCard } from '@/components/Welcome/utils/helpers';
import { EmptyState } from '@/components/ui/EmptyState';

const headingStyle = {
    color: '#4A4A4A',
} as const;

const bodyTextClass = 'text-sm text-brand-muted-dark';

const glassPanelStyle = {
    background: 'rgba(255,255,255,0.55)',
    border: '1px solid rgba(255,255,255,0.65)',
} as const;

type AttendanceStatus = 'present' | 'absent' | 'excused' | 'pending';

interface SessionRecord {
    id: string;
    title: string;
    session_date: string | null;
    session_number: number | null;
    week_id: string | null;
    auto_generated: boolean;
    attendance_method: string | null;
    notes: string | null;
    status: AttendanceStatus;
    message_count: number;
    hot_count: number;
    marked_at: string | null;
    created_at: string;
}

interface OpenSession {
    id: string;
    name: string;
    description?: string;
    weekTitle?: string | null;
    weekIndex?: number | null;
    createdAt?: string;
}

interface AttendanceSummary {
    present: number;
    absent: number;
    excused: number;
    total: number;
    percentage: number;
}

interface GroupInfo {
    id: string;
    name: string;
    joinCode: string;
}

interface Props {
    course: Course;
    myGroup: GroupInfo | null;
    sessions: SessionRecord[];
    openSessions: OpenSession[];
    summary: AttendanceSummary;
}

const statusConfig: Record<AttendanceStatus, { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle2 }> = {
    present: { label: 'Hadir', color: '#166534', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.18)', icon: CheckCircle2 },
    absent: { label: 'Tidak Hadir', color: '#b91c1c', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.18)', icon: XCircle },
    excused: { label: 'Izin', color: '#4b5563', bg: 'rgba(107,114,128,0.10)', border: 'rgba(107,114,128,0.18)', icon: Minus },
    pending: { label: 'Pending', color: '#92400e', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.18)', icon: Clock },
};

export default function StudentAttendance({ course, myGroup, sessions, openSessions, summary }: Props) {
    const navItems = useStudentNav('course-detail', { courseId: course.id, groupId: myGroup?.id });

    const breadcrumbItems = [
        { label: 'Kelas Saya', href: '/student/courses' },
        { label: course.name, href: `/student/courses/${course.id}` },
        { label: 'Kehadiran' },
    ];

    // Group sessions by category
    const groupedSessions = useMemo(() => {
        const perMinggu: SessionRecord[] = [];
        const lainnya: SessionRecord[] = [];

        sessions.forEach((session) => {
            if (session.week_id) {
                perMinggu.push(session);
            } else {
                lainnya.push(session);
            }
        });

        return { perMinggu, lainnya };
    }, [sessions]);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
    };

    // If no group, show message
    if (!myGroup) {
        return (
            <AppLayout title="Kehadiran" navItems={navItems}>
                <Head title={`Kehadiran - ${course.name}`} />
                
                <div className="min-h-screen pb-32 pt-32 px-6">
                    <div className="mx-auto max-w-5xl">
                        <Breadcrumbs items={breadcrumbItems} />

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="mb-2 text-4xl font-bold tracking-tight" style={headingStyle}>
                                Kehadiran
                            </h1>
                            <p className={bodyTextClass}>
                                Lihat rekap kehadiran Anda di kelas {course.name}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="mt-8"
                        >
                            <EmptyState
                                icon={CalendarCheck}
                                title="Belum Bergabung di Kelompok"
                                description="Anda perlu bergabung ke kelompok terlebih dahulu untuk melihat data kehadiran."
                            />
                        </motion.div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Kehadiran" navItems={navItems}>
            <Head title={`Kehadiran - ${course.name}`} />
            
            <div className="min-h-screen pb-32 pt-32 px-6">
                <div className="mx-auto max-w-5xl">
                    <Breadcrumbs items={breadcrumbItems} />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="mb-2 text-4xl font-bold tracking-tight" style={headingStyle}>
                            Kehadiran
                        </h1>
                        <p className={bodyTextClass}>
                            Rekap kehadiran Anda di kelas {course.name} - {myGroup.name}
                        </p>
                    </motion.div>

                    {/* Summary Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="mt-8"
                    >
                        <LiquidGlassCard className="p-6">
                            <h2 className="mb-4 text-lg font-semibold" style={headingStyle}>
                                Rekap Kehadiran
                            </h2>
                            
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <div className="text-2xl font-bold" style={{ color: statusConfig.present.color }}>
                                        {summary.present}
                                    </div>
                                    <div className="text-xs text-brand-muted-dark">Hadir</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold" style={{ color: statusConfig.excused.color }}>
                                        {summary.excused}
                                    </div>
                                    <div className="text-xs text-brand-muted-dark">Izin</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold" style={{ color: statusConfig.absent.color }}>
                                        {summary.absent}
                                    </div>
                                    <div className="text-xs text-brand-muted-dark">Tidak Hadir</div>
                                </div>
                            </div>

                            {summary.total > 0 && (
                                <>
                                    <div className="mb-2 flex items-center justify-between text-sm">
                                        <span className="text-brand-muted-dark">Persentase Kehadiran</span>
                                        <span className="font-semibold" style={headingStyle}>
                                            {summary.percentage}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-gray-200">
                                        <div
                                            className="h-2 rounded-full bg-green-600 transition-all duration-500"
                                            style={{ width: `${summary.percentage}%` }}
                                        />
                                    </div>
                                </>
                            )}
                        </LiquidGlassCard>
                    </motion.div>

                    {/* Sesi per Minggu */}
                    {groupedSessions.perMinggu.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="mt-8"
                        >
                            <h2 className="mb-4 text-xl font-semibold" style={headingStyle}>
                                Sesi per Minggu
                            </h2>
                            
                            <div className="space-y-3">
                                {groupedSessions.perMinggu.map((session, idx) => {
                                    const config = statusConfig[session.status];
                                    const Icon = config.icon;

                                    return (
                                        <motion.div
                                            key={session.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.05 * idx, duration: 0.3 }}
                                        >
                                            <LiquidGlassCard className="p-5">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="mb-2 flex items-center gap-2">
                                                            <span
                                                                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                                                                style={{
                                                                    color: config.color,
                                                                    background: config.bg,
                                                                    border: `1px solid ${config.border}`,
                                                                }}
                                                            >
                                                                <Icon className="h-3 w-3" />
                                                                {config.label}
                                                            </span>
                                                            {session.auto_generated && (
                                                                <span
                                                                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs"
                                                                    style={{
                                                                        color: '#1e40af',
                                                                        background: 'rgba(59,130,246,0.10)',
                                                                        border: '1px solid rgba(59,130,246,0.18)',
                                                                    }}
                                                                >
                                                                    Auto ✓
                                                                </span>
                                                            )}
                                                        </div>

                                                        <h3 className="mb-1 text-base font-semibold" style={headingStyle}>
                                                            {session.title}
                                                        </h3>

                                                        <div className="flex items-center gap-4 text-xs text-brand-muted-dark">
                                                            <span className="flex items-center gap-1">
                                                                <CalendarCheck className="h-3 w-3" />
                                                                {formatDate(session.session_date)}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <MessageSquare className="h-3 w-3" />
                                                                {session.message_count} pesan
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Flame className="h-3 w-3" />
                                                                {session.hot_count} HOT
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </LiquidGlassCard>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* Sesi Lainnya */}
                    {groupedSessions.lainnya.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="mt-8"
                        >
                            <h2 className="mb-4 text-xl font-semibold" style={headingStyle}>
                                Sesi Lainnya
                            </h2>
                            
                            <div className="space-y-3">
                                {groupedSessions.lainnya.map((session, idx) => {
                                    const config = statusConfig[session.status];
                                    const Icon = config.icon;

                                    return (
                                        <motion.div
                                            key={session.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.05 * idx, duration: 0.3 }}
                                        >
                                            <LiquidGlassCard className="p-5">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="mb-2 flex items-center gap-2">
                                                            <span
                                                                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                                                                style={{
                                                                    color: config.color,
                                                                    background: config.bg,
                                                                    border: `1px solid ${config.border}`,
                                                                }}
                                                            >
                                                                <Icon className="h-3 w-3" />
                                                                {config.label}
                                                            </span>
                                                            {session.auto_generated && (
                                                                <span
                                                                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs"
                                                                    style={{
                                                                        color: '#1e40af',
                                                                        background: 'rgba(59,130,246,0.10)',
                                                                        border: '1px solid rgba(59,130,246,0.18)',
                                                                    }}
                                                                >
                                                                    Auto ✓
                                                                </span>
                                                            )}
                                                        </div>

                                                        <h3 className="mb-1 text-base font-semibold" style={headingStyle}>
                                                            {session.title}
                                                        </h3>

                                                        <div className="flex items-center gap-4 text-xs text-brand-muted-dark">
                                                            <span className="flex items-center gap-1">
                                                                <CalendarCheck className="h-3 w-3" />
                                                                {formatDate(session.session_date)}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <MessageSquare className="h-3 w-3" />
                                                                {session.message_count} pesan
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Flame className="h-3 w-3" />
                                                                {session.hot_count} HOT
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </LiquidGlassCard>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* Sedang Berjalan */}
                    {openSessions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="mt-8"
                        >
                            <h2 className="mb-4 text-xl font-semibold" style={headingStyle}>
                                Sedang Berjalan
                            </h2>
                            
                            <div className="space-y-3">
                                {openSessions.map((session, idx) => (
                                    <motion.div
                                        key={session.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.05 * idx, duration: 0.3 }}
                                    >
                                        <LiquidGlassCard className="p-5">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="mb-2">
                                                        <span
                                                            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                                                            style={{
                                                                color: '#92400e',
                                                                background: 'rgba(245,158,11,0.10)',
                                                                border: '1px solid rgba(245,158,11,0.18)',
                                                            }}
                                                        >
                                                            <Clock className="h-3 w-3" />
                                                            Sedang Berjalan
                                                        </span>
                                                    </div>

                                                    <h3 className="mb-1 text-base font-semibold" style={headingStyle}>
                                                        {session.name}
                                                    </h3>

                                                    {session.weekTitle && (
                                                        <p className="text-xs text-brand-muted-dark mb-2">
                                                            {session.weekTitle}
                                                        </p>
                                                    )}

                                                    <p className="text-sm text-brand-muted-dark italic">
                                                        Kehadiran akan dihitung setelah sesi ditutup
                                                    </p>
                                                </div>
                                            </div>
                                        </LiquidGlassCard>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Empty State */}
                    {groupedSessions.perMinggu.length === 0 && 
                     groupedSessions.lainnya.length === 0 && 
                     openSessions.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="mt-8"
                        >
                            <EmptyState
                                icon={CalendarCheck}
                                title="Belum Ada Data Kehadiran"
                                description="Data kehadiran akan muncul setelah sesi diskusi ditutup."
                            />
                        </motion.div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
