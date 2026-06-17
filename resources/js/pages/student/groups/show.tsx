import { Head, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { Users, Copy, Check, Crown, UserMinus, AlertTriangle, Loader2 } from 'lucide-react';
import axios from 'axios';

import AppLayout from '@/layouts/app-layout';
import { useStudentNav } from '@/components/navigation/student-nav';
import { LiquidGlassCard } from '@/components/Welcome/utils/helpers';
import Breadcrumbs from '@/components/dashboard/Breadcrumbs';
import { EmptyState } from '@/components/ui/EmptyState';
import student from '@/routes/student';
import { LeaveGroupButton } from './components/LeaveGroupButton';
import type { SharedData, User } from '@/types';

interface GroupData {
    id: string;
    name: string;
    joinCode: string;
    course: {
        id: string;
        code: string;
        name: string;
    };
    members?: User[];
    members_count?: number;
    creator?: User | null;
}

interface Props {
    group: GroupData;
}

export default function StudentGroupShow({ group }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [copiedCode, setCopiedCode] = useState(false);
    const [kickingMemberId, setKickingMemberId] = useState<string | null>(null);
    const [confirmKickId, setConfirmKickId] = useState<string | null>(null);
    const [kickError, setKickError] = useState('');

    const navItems = useStudentNav('groups', { courseId: group.course.id, groupId: group.id });
    const isOwner = group.creator?.id === auth.user?.id;
    const members = group.members ?? [];

    const copyJoinCode = useCallback(() => {
        navigator.clipboard.writeText(group.joinCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    }, [group.joinCode]);

    const handleKick = useCallback(async (memberId: string) => {
        setKickingMemberId(memberId);
        setKickError('');
        try {
            await axios.delete(`/student/groups/${group.id}/members/${memberId}`);
            router.reload();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setKickError(axiosErr.response?.data?.message ?? 'Gagal mengeluarkan anggota');
            setKickingMemberId(null);
        }
    }, [group.id]);

    const breadcrumbItems = [
        { label: 'Kelas', href: student.courses.index.url() },
        { label: group.course.name, href: student.courses.show.url(group.course.id) },
        { label: group.name },
    ];

    return (
        <AppLayout title={group.name} navItems={navItems}>
            <Head title={group.name} />
            <Breadcrumbs items={breadcrumbItems} />

            <div className="space-y-6">
                {/* Group Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <LiquidGlassCard intensity="light" className="p-6" lightMode={true}>
                        <div className="flex items-center gap-2">
                            <span
                                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                style={{
                                    background: 'rgba(136,22,28,0.08)',
                                    color: 'var(--color-brand-primary)',
                                    border: '1px solid rgba(136,22,28,0.15)',
                                }}
                            >
                                {group.course.name}
                            </span>
                            {isOwner && (
                                <span
                                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                                    style={{
                                        background: 'rgba(136,22,28,0.1)',
                                        color: 'var(--color-brand-primary)',
                                    }}
                                >
                                    <Crown className="h-3 w-3" />
                                    Ketua
                                </span>
                            )}
                        </div>

                        <h2 className="mt-3 text-2xl font-bold font-sans text-brand-dark">
                            {group.name}
                        </h2>
                        {group.creator && (
                            <p className="mt-1 text-sm text-brand-muted-dark">
                                Ketua: {group.creator.name}
                            </p>
                        )}

                        <div className="mt-3 flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-brand-muted-dark" />
                                <span className="text-sm text-brand-muted-dark">
                                    {group.members_count ?? members.length} anggota
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-brand-muted-dark">Kode:</span>
                                <code
                                    className="rounded px-2 py-0.5 font-mono text-xs"
                                    style={{
                                        background: 'rgba(136,22,28,0.08)',
                                        color: 'var(--color-brand-primary)',
                                    }}
                                >
                                    {group.joinCode}
                                </code>
                                <button
                                    onClick={copyJoinCode}
                                    className="rounded p-1 transition-colors hover:bg-gray-100"
                                >
                                    {copiedCode ? (
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5 text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </LiquidGlassCard>
                </motion.div>

                {/* Member List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                >
                    <LiquidGlassCard intensity="light" className="p-6" lightMode={true}>
                        <h3 className="text-lg font-semibold font-sans text-brand-dark mb-4">
                            Anggota
                        </h3>

                        {members.length === 0 ? (
                            <EmptyState
                                icon={Users}
                                title="Belum ada anggota"
                                description="Anggota grup akan muncul setelah bergabung melalui kode undangan."
                            />
                        ) : (
                            <div className="space-y-2">
                                {members.map((member) => {
                                    const isCreator = group.creator?.id === member.id;
                                    const isCurrentUser = auth.user?.id === member.id;
                                    const canKick = isOwner && !isCurrentUser && !isCreator;
                                    const isKicking = kickingMemberId === member.id;
                                    const showKickConfirm = confirmKickId === member.id;
                                    return (
                                        <div
                                            key={member.id}
                                            className="rounded-xl p-3"
                                            style={{
                                                background: isCurrentUser
                                                    ? 'rgba(136,22,28,0.04)'
                                                    : 'rgba(255,255,255,0.5)',
                                                border: '1px solid rgba(255,255,255,0.6)',
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
                                                    style={{
                                                        background: isCreator
                                                            ? 'rgba(136,22,28,0.12)'
                                                            : 'rgba(0,0,0,0.05)',
                                                        color: isCreator
                                                            ? 'var(--color-brand-primary)'
                                                            : '#6B7280',
                                                    }}
                                                >
                                                    {member.name?.charAt(0).toUpperCase() ?? '?'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-brand-dark truncate">
                                                        {member.name}
                                                        {isCurrentUser && (
                                                            <span className="ml-1.5 text-xs text-brand-muted-dark">(Anda)</span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-brand-muted-dark truncate">
                                                        {member.email}
                                                    </p>
                                                </div>
                                                {isCreator && (
                                                    <span
                                                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                                                        style={{
                                                            background: 'rgba(136,22,28,0.08)',
                                                            color: 'var(--color-brand-primary)',
                                                        }}
                                                    >
                                                        <Crown className="h-3 w-3" />
                                                        Ketua
                                                    </span>
                                                )}
                                                {canKick && (
                                                    <button
                                                        onClick={() => setConfirmKickId(member.id)}
                                                        className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-500"
                                                        title="Keluarkan anggota"
                                                    >
                                                        <UserMinus className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <AnimatePresence>
                                                {showKickConfirm && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-3 overflow-hidden rounded-lg p-3"
                                                        style={{
                                                            background: 'rgba(220,38,38,0.05)',
                                                            border: '1px solid rgba(220,38,38,0.15)',
                                                        }}
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <AlertTriangle className="mt-0.5 h-4 w-4 text-red-500 flex-shrink-0" />
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-red-800">
                                                                    Keluarkan {member.name}?
                                                                </p>
                                                                <p className="mt-0.5 text-xs text-red-600">
                                                                    Anggota yang dikeluarkan tidak bisa mengakses diskusi grup ini lagi.
                                                                </p>
                                                                {kickError && (
                                                                    <p className="mt-1 text-xs font-medium text-red-700">
                                                                        {kickError}
                                                                    </p>
                                                                )}
                                                                <div className="mt-2 flex gap-2">
                                                                    <button
                                                                        onClick={() => handleKick(member.id)}
                                                                        disabled={isKicking}
                                                                        className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                                                                    >
                                                                        {isKicking ? (
                                                                            <>
                                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                                                Mengeluarkan...
                                                                            </>
                                                                        ) : (
                                                                            'Ya, Keluarkan'
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setConfirmKickId(null)}
                                                                        disabled={isKicking}
                                                                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
                                                                    >
                                                                        Batal
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </LiquidGlassCard>
                </motion.div>

                {/* Leave Group */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <LiquidGlassCard intensity="light" className="p-6" lightMode={true}>
                        <LeaveGroupButton
                            groupId={group.id}
                            isOwner={isOwner}
                        />
                    </LiquidGlassCard>
                </motion.div>
            </div>
        </AppLayout>
    );
}
