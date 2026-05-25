import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

import Breadcrumbs from '@/components/dashboard/Breadcrumbs';
import { useStudentNav } from '@/components/navigation/student-nav';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { Skeleton } from '@/components/ui/skeletons';

import AvatarSection from './components/AvatarSection';
import ProfileEditForm from './components/ProfileEditForm';
import PreferencesSection from './components/PreferencesSection';
import StatsSection from './components/StatsSection';

interface AvatarUrls {
    thumbnail: string | null;
    medium: string | null;
    large: string | null;
}

interface ProfileData {
    id: string;
    name: string;
    email: string;
    nim: string;
    role: string;
}

interface StatsData {
    active_courses: number;
    completed_tasks: number;
    streak: number;
    total_reflections: number;
}

interface PreferencesData {
    notifications: {
        email: boolean;
        push: boolean;
        tasks: boolean;
        chat: boolean;
        groups: boolean;
    };
    language: string;
    theme: string;
    font_size: string;
}

interface Props {
    profile: ProfileData;
    avatar: AvatarUrls | null;
    stats: StatsData;
    preferences: PreferencesData;
}

export default function StudentProfile({ profile, avatar, stats, preferences }: Props) {
    const { auth } = usePage<SharedData>().props;
    const navItems = useStudentNav('courses');
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsInitialLoading(false), 300);
        return () => clearTimeout(timer);
    }, []);

    const [currentAvatar, setCurrentAvatar] = useState<AvatarUrls | null>(avatar);
    const [currentProfile, setCurrentProfile] = useState<ProfileData>(profile);

    const breadcrumbs = [
        { label: 'Dashboard', href: '/student/dashboard' },
        { label: 'Profil Saya', href: '/student/profile' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    return (
        <AppLayout title="Profil Saya" navItems={navItems}>
            <Head title="Profil Saya" />

            {isInitialLoading ? (
                <div className="space-y-6 pb-8">
                    <Skeleton className="h-6 w-40" />
                    <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-xl sm:p-8">
                        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <div className="flex-1 text-center sm:text-left">
                                <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
                                <Skeleton className="mt-2 h-4 w-56 mx-auto sm:mx-0" />
                                <Skeleton className="mt-2 h-4 w-32 mx-auto sm:mx-0" />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="rounded-2xl border border-white/20 bg-white/80 p-4 shadow-lg backdrop-blur-xl">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="mt-2 h-8 w-16" />
                            </div>
                        ))}
                    </div>
                    <div className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-xl sm:p-8">
                        <Skeleton className="h-6 w-36" />
                        <Skeleton className="mt-4 h-10 w-full" />
                        <Skeleton className="mt-3 h-10 w-full" />
                        <Skeleton className="mt-3 h-10 w-full" />
                        <Skeleton className="mt-4 h-10 w-32" />
                    </div>
                    <div className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-xl sm:p-8">
                        <Skeleton className="h-6 w-36" />
                        <Skeleton className="mt-4 h-10 w-full" />
                        <Skeleton className="mt-3 h-10 w-full" />
                    </div>
                </div>
            ) : (
            <motion.div
                className="space-y-6 pb-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants}>
                    <Breadcrumbs items={breadcrumbs} />
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80 sm:p-8"
                >
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                        <AvatarSection
                            avatar={currentAvatar}
                            userName={currentProfile.name}
                            onAvatarChange={setCurrentAvatar}
                        />
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {currentProfile.name}
                            </h1>
                            <p className="mt-1 text-gray-500 dark:text-gray-400">
                                {currentProfile.email}
                            </p>
                            {currentProfile.nim && (
                                <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                                    NIM: {currentProfile.nim}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <StatsSection stats={stats} />
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80 sm:p-8"
                >
                    <ProfileEditForm
                        profile={currentProfile}
                        onProfileUpdate={setCurrentProfile}
                    />
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80 sm:p-8"
                >
                    <PreferencesSection preferences={preferences} />
                </motion.div>
            </motion.div>
            )}
        </AppLayout>
    );
}
