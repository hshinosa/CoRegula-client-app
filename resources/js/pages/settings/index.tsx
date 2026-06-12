import { Head, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Palette, Shield, ShieldCheck, Database, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

import Breadcrumbs from '@/components/dashboard/Breadcrumbs';
import { useStudentNav } from '@/components/navigation/student-nav';
import { useLecturerNav } from '@/components/navigation/lecturer-nav';
import { LiquidGlassCard, OrganicBlob } from '@/components/Welcome/utils/helpers';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';

import { ProfileTab } from './components/ProfileTab';
import { NotificationTab } from './components/NotificationTab';
import { AppearanceTab } from './components/AppearanceTab';
import { SecurityTab } from './components/SecurityTab';
import { PrivacyTab } from './components/PrivacyTab';
import { RetentionPolicyTab } from './components/RetentionPolicyTab';

interface NotificationPrefs {
    courses: boolean;
    discussions: boolean;
    reflections: boolean;
    deadlines: boolean;
    announcements: boolean;
}

interface Preferences {
    theme: string;
    language: string;
    notifications: NotificationPrefs;
}

interface Profile {
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
}

interface Props {
    profile: Profile;
    preferences: Preferences;
}

type TabId = 'profile' | 'notifications' | 'appearance' | 'security' | 'privacy';

export default function SettingsPage({ profile, preferences }: Props) {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth.user?.role ?? 'student';

    const navItems = userRole === 'lecturer'
        ? useLecturerNav('courses')
        : userRole === 'student'
            ? useStudentNav('courses')
            : undefined;

    const [activeTab, setActiveTab] = useState<TabId>('profile');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [theme, setTheme] = useState(preferences.theme);
    const [language, setLanguage] = useState(preferences.language);
    const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(preferences.notifications);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab && ['profile', 'notifications', 'appearance', 'security', 'privacy', 'retensi-data'].includes(tab)) {
            setActiveTab(tab as TabId);
        }
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4000);
    };

    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
    };

    const handleProfileSave = async (data: { name: string; email: string; avatar?: File }) => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('email', data.email);
            if (data.avatar) {
                formData.append('avatar', data.avatar);
            }

            const res = await fetch('/settings/profile', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: formData,
            });

            const result = await res.json();
            if (res.ok) {
                showMessage('success', result.message ?? 'Profil berhasil diperbarui');
                setHasUnsavedChanges(false);
            } else {
                showMessage('error', result.message ?? 'Gagal memperbarui profil');
            }
        } catch {
            showMessage('error', 'Terjadi kesalahan jaringan');
        } finally {
            setSaving(false);
        }
    };

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.style.backgroundColor = '#0a0a0f';
            localStorage.setItem('kolabri_theme', 'dark');
        } else if (newTheme === 'light') {
            document.documentElement.classList.remove('dark');
            document.body.style.backgroundColor = '#E8EDF8';
            localStorage.setItem('kolabri_theme', 'light');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', prefersDark);
            document.body.style.backgroundColor = prefersDark ? '#0a0a0f' : '#E8EDF8';
            localStorage.removeItem('kolabri_theme');
        }

        handlePreferencesSave({ theme: newTheme });
    };

    const handleLanguageChange = (newLang: string) => {
        setLanguage(newLang);
        handlePreferencesSave({ language: newLang });
    };

    const handleNotifToggle = (key: keyof NotificationPrefs) => {
        const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
        setNotifPrefs(updated);
        handlePreferencesSave({ notifications: updated });
    };

    const handlePreferencesSave = async (prefs: Partial<Preferences>) => {
        try {
            const res = await fetch('/settings/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify(prefs),
            });

            const result = await res.json();
            if (res.ok) {
                showMessage('success', result.message ?? 'Preferensi berhasil disimpan');
            } else {
                showMessage('error', result.message ?? 'Gagal menyimpan preferensi');
            }
        } catch {
            showMessage('error', 'Terjadi kesalahan jaringan');
        }
    };

    const handlePasswordChange = async (data: {
        current_password: string;
        password: string;
        password_confirmation: string;
    }) => {
        setSaving(true);
        try {
            const res = await fetch('/settings/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (res.ok) {
                showMessage('success', result.message ?? 'Password berhasil diubah');
            } else {
                showMessage('error', result.message ?? 'Gagal mengubah password');
            }
        } catch {
            showMessage('error', 'Terjadi kesalahan jaringan');
        } finally {
            setSaving(false);
        }
    };

    const handleAccountDelete = async (data: { password: string; confirmation: string }) => {
        setSaving(true);
        try {
            const res = await fetch('/settings/account', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (res.ok) {
                window.location.href = result.redirect ?? '/';
            } else {
                showMessage('error', result.message ?? 'Gagal menghapus akun');
            }
        } catch {
            showMessage('error', 'Terjadi kesalahan jaringan');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'profile' as const, label: 'Profil', icon: User },
        { id: 'notifications' as const, label: 'Notifikasi', icon: Bell },
        { id: 'appearance' as const, label: 'Tampilan', icon: Palette },
        { id: 'security' as const, label: 'Keamanan', icon: Shield },
        { id: 'privacy' as const, label: 'Privasi', icon: ShieldCheck },
        ...(userRole === 'admin' ? [{ id: 'retensi-data' as const, label: 'Retensi Data', icon: Database }] : []),
    ];

    return (
        <AppLayout title="Pengaturan" navItems={navItems}>
            <Head title="Pengaturan" />

            <div className="relative">
                <OrganicBlob className="top-0 -left-20" delay={0} color="rgba(136, 22, 28, 0.04)" size={300} />
                <OrganicBlob className="top-40 -right-20" delay={-5} color="rgba(136, 22, 28, 0.03)" size={250} />

                <div className="relative space-y-6">
                    <Breadcrumbs items={[{ label: 'Pengaturan' }]} />

                    <h1 className="font-heading text-3xl font-bold text-neutral-800">
                        Pengaturan
                    </h1>

                    <AnimatePresence mode="wait">
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`rounded-xl px-4 py-3 text-sm font-medium ${
                                    message.type === 'success'
                                        ? 'bg-success-50 text-success-800 border border-success-200'
                                        : 'bg-warning-50 text-warning-800 border border-warning-200'
                                }`}
                            >
                                {message.text}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid gap-6 lg:grid-cols-4">
                        <div className="lg:col-span-1">
                            <LiquidGlassCard intensity="light" className="p-3" lightMode={true}>
                                <nav className="space-y-1">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                                                activeTab === tab.id
                                                    ? 'bg-primary-50 text-primary-700'
                                                    : 'text-neutral-600 hover:bg-neutral-50'
                                            }`}
                                        >
                                            <tab.icon className="h-5 w-5" />
                                            {tab.label}
                                            {activeTab === tab.id && <ChevronRight className="ml-auto h-4 w-4" />}
                                        </button>
                                    ))}
                                </nav>
                            </LiquidGlassCard>
                        </div>

                        <div className="lg:col-span-3">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {activeTab === 'profile' && (
                                        <ProfileTab
                                            profile={profile}
                                            onSave={handleProfileSave}
                                            saving={saving}
                                        />
                                    )}

                                    {activeTab === 'notifications' && (
                                        <NotificationTab
                                            preferences={notifPrefs}
                                            onToggle={handleNotifToggle}
                                        />
                                    )}

                                    {activeTab === 'appearance' && (
                                        <AppearanceTab
                                            theme={theme}
                                            language={language}
                                            onThemeChange={handleThemeChange}
                                            onLanguageChange={handleLanguageChange}
                                        />
                                    )}

                                    {activeTab === 'security' && (
                                        <SecurityTab
                                            onPasswordChange={handlePasswordChange}
                                            onAccountDelete={handleAccountDelete}
                                            saving={saving}
                                        />
                                    )}

                                    {activeTab === 'privacy' && <PrivacyTab />}

                                    {activeTab === 'retensi-data' && <RetentionPolicyTab />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
