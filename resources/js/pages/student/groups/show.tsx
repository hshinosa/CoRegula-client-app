import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { Users, Activity, Settings, ArrowLeft, Copy, Check, Loader2 } from 'lucide-react';
import axios from 'axios';

import AppLayout from '@/layouts/app-layout';
import { useStudentNav } from '@/components/navigation/student-nav';
import { LiquidGlassCard, PrimaryButton, SecondaryButton } from '@/components/Welcome/utils/helpers';
import { MemberSearch } from './components/MemberSearch';
import { ActivityFeed } from './components/ActivityFeed';
import { GroupSettingsForm } from './components/GroupSettings';
import { LeaveGroupButton } from './components/LeaveGroupButton';
import type { GroupMemberRole, GroupSettings as GroupSettingsType, UpdateGroupSettingsData } from '@/types';

type TabId = 'members' | 'activity' | 'settings';

interface GroupData {
    id: string;
    name: string;
    description?: string | null;
    access_policy?: string;
    join_code: string;
    course_id: string;
    course_name?: string;
    members_count?: number;
    current_user_role?: GroupMemberRole;
    owner_id?: string;
}

interface Props {
    group: GroupData;
}

const tabs: { id: TabId; label: string; icon: typeof Users }[] = [
    { id: 'members', label: 'Anggota', icon: Users },
    { id: 'activity', label: 'Aktivitas', icon: Activity },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
];

export default function StudentGroupShow({ group }: Props) {
    const [activeTab, setActiveTab] = useState<TabId>('members');
    const [copiedCode, setCopiedCode] = useState(false);
    const [settings, setSettings] = useState<GroupSettingsType | null>(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(false);

    const navItems = useStudentNav('groups', { courseId: group.course_id });
    const isOwner = group.current_user_role === 'owner';
    const isAdmin = group.current_user_role === 'admin' || isOwner;

    const copyJoinCode = useCallback(() => {
        navigator.clipboard.writeText(group.join_code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    }, [group.join_code]);

    const loadSettings = useCallback(async () => {
        if (settings) return;
        setIsLoadingSettings(true);
        try {
            const { data } = await axios.get(`/student/groups/${group.id}/settings`);
            setSettings(data.data);
        } catch {
        } finally {
            setIsLoadingSettings(false);
        }
    }, [group.id, settings]);

    const handleTabChange = useCallback((tab: TabId) => {
        setActiveTab(tab);
        if (tab === 'settings' && !settings) {
            loadSettings();
        }
    }, [settings, loadSettings]);

    const handleSaveSettings = useCallback(async (data: UpdateGroupSettingsData) => {
        const response = await axios.patch(`/student/groups/${group.id}/settings`, data);
        setSettings(response.data.data);
    }, [group.id]);

    const handleRoleChange = useCallback(async (memberId: string, newRole: GroupMemberRole) => {
        await axios.patch(`/student/groups/${group.id}/members/${memberId}`, { role: newRole });
        router.reload();
    }, [group.id]);

    const handleRemoveMember = useCallback(async (memberId: string) => {
        await axios.delete(`/student/groups/${group.id}/members/${memberId}`);
        router.reload();
    }, [group.id]);

    return (
        <AppLayout title={group.name} navItems={navItems}>
            <Head title={group.name} />

            <div className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <LiquidGlassCard intensity="light" className="p-6" lightMode={true}>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <button
                                    onClick={() => router.visit(`/student/courses/${group.course_id}/groups`)}
                                    className="mb-3 flex items-center gap-1.5 text-xs text-brand-muted-dark transition-colors hover:text-brand-dark"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    Kembali ke Daftar Grup
                                </button>
                                <div className="flex items-center gap-2">
                                    <span
                                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                        style={{
                                            background: 'rgba(136,22,28,0.08)',
                                            color: 'var(--color-brand-primary)',
                                            border: '1px solid rgba(136,22,28,0.15)',
                                        }}
                                    >
                                        {group.course_name ?? 'Kursus'}
                                    </span>
                                    {group.current_user_role && (
                                        <span
                                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                            style={{
                                                background: group.current_user_role === 'owner'
                                                    ? 'rgba(136,22,28,0.1)'
                                                    : group.current_user_role === 'admin'
                                                        ? 'rgba(37,99,235,0.1)'
                                                        : 'rgba(107,114,128,0.1)',
                                                color: group.current_user_role === 'owner'
                                                    ? 'var(--color-brand-primary)'
                                                    : group.current_user_role === 'admin'
                                                        ? '#2563EB'
                                                        : 'var(--color-brand-muted-dark)',
                                            }}
                                        >
                                            {group.current_user_role === 'owner' ? 'Pemilik' :
                                                group.current_user_role === 'admin' ? 'Admin' : 'Anggota'}
                                        </span>
                                    )}
                                </div>
                                <h2
                                    className="mt-3 text-2xl font-bold font-sans text-brand-dark"
                                >
                                    {group.name}
                                </h2>
                                {group.description && (
                                    <p className="mt-1 text-sm text-brand-muted-dark">
                                        {group.description}
                                    </p>
                                )}
                                <div className="mt-3 flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-brand-muted-dark" />
                                        <span className="text-sm text-brand-muted-dark">
                                            {group.members_count ?? 0} anggota
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-[var(--color-brand-muted-dark)]">Kode:</span>
                                        <code
                                            className="rounded px-2 py-0.5 font-mono text-xs"
                                            style={{
                                                background: 'rgba(136,22,28,0.08)',
                                                color: 'var(--color-brand-primary)',
                                            }}
                                        >
                                            {group.join_code}
                                        </code>
                                        <button
                                            onClick={copyJoinCode}
                                            className="rounded p-1 transition-colors hover:bg-gray-100"
                                        >
                                            {copiedCode ? (
                                                <Check className="h-3.5 w-3.5 text-green-500" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </LiquidGlassCard>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex gap-1 rounded-xl p-1" style={{ background: 'rgba(0,0,0,0.03)' }}>
                        {tabs.map((tab) => {
                            const TabIcon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
                                    style={{
                                        background: isActive ? 'white' : 'transparent',
                                        color: isActive ? 'var(--color-brand-primary)' : 'var(--color-brand-muted-dark)',
                                        boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                                    }}
                                >
                                    <TabIcon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <LiquidGlassCard intensity="light" className="p-6" lightMode={true}>
                        {activeTab === 'members' && (
                            <MemberSearch
                                groupId={group.id}
                                currentUserId={group.owner_id}
                                isOwner={isOwner}
                                onRoleChange={handleRoleChange}
                                onRemove={handleRemoveMember}
                            />
                        )}

                        {activeTab === 'activity' && (
                            <ActivityFeed groupId={group.id} />
                        )}

                        {activeTab === 'settings' && (
                            isLoadingSettings ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-primary)]" />
                                </div>
                            ) : settings ? (
                                <div className="space-y-8">
                                    <GroupSettingsForm
                                        settings={settings}
                                        isAdmin={isAdmin}
                                        onSave={handleSaveSettings}
                                    />
                                    <div
                                        className="border-t pt-6"
                                        style={{ borderColor: 'rgba(0,0,0,0.06)' }}
                                    >
                                        <h3
                                            className="mb-4 text-lg font-semibold font-sans text-brand-dark"
                                        >
                                            Keluar dari Grup
                                        </h3>
                                        <LeaveGroupButton
                                            groupId={group.id}
                                            isOwner={isOwner}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Settings className="mb-3 h-12 w-12 text-gray-300" />
                                    <p className="text-sm text-brand-muted-dark">Gagal memuat pengaturan</p>
                                </div>
                            )
                        )}
                    </LiquidGlassCard>
                </motion.div>
            </div>
        </AppLayout>
    );
}
