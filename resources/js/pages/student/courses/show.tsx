import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { MessageSquare, ChevronRight, CheckCircle2, Circle } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { useStudentNav } from '@/components/navigation/student-nav';
import { Course, Group, ChatSpace } from '@/types';
import student from '@/routes/student';
import { LiquidGlassCard, OrganicBlob } from '@/components/Welcome/utils/helpers';

interface Props {
    course: Course & {
        groups?: (Group & {
            chat_spaces?: ChatSpace[];
        })[];
    };
}

export default function StudentCourseShow({ course }: Props) {
    const navItems = useStudentNav('course-detail', { courseId: course.id });

    const getParticipationStatus = (chatSpace: ChatSpace) => {
        return (chatSpace.messages_count ?? 0) > 0;
    };

    const calculateGroupProgress = (group: Group & { chat_spaces?: ChatSpace[] }) => {
        if (!group.chat_spaces || group.chat_spaces.length === 0) {
            return { completed: 0, total: 0, percentage: 0 };
        }
        const completed = group.chat_spaces.filter(cs => getParticipationStatus(cs)).length;
        const total = group.chat_spaces.length;
        const percentage = Math.round((completed / total) * 100);
        return { completed, total, percentage };
    };

    return (
        <AppLayout title={course.name} navItems={navItems}>
            <Head title={course.name} />

            <div className="relative">
                <OrganicBlob className="top-0 -left-20" delay={0} color="rgba(136, 22, 28, 0.04)" size={300} />
                <OrganicBlob className="top-40 -right-20" delay={-5} color="rgba(136, 22, 28, 0.03)" size={250} />

                <div className="relative space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                            <div className="flex items-center gap-2">
                                <span 
                                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                    style={{ 
                                        background: 'rgba(136,22,28,0.10)', 
                                        color: 'var(--color-brand-primary)',
                                        border: '1px solid rgba(136,22,28,0.15)'
                                    }}
                                >
                                    {course.code}
                                </span>
                            </div>
                            <h2 
                                className="mt-3 text-2xl font-bold font-sans text-brand-dark"
                            >
                                {course.name}
                            </h2>
                            {course.owner && (
                                <p className="mt-2 text-sm text-brand-muted-dark">
                                    Dosen: {course.owner.name}
                                </p>
                            )}
                        </LiquidGlassCard>
                    </motion.div>

                    {!course.groups || course.groups.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <LiquidGlassCard intensity="medium" className="p-8 text-center" lightMode={true}>
                                <MessageSquare className="mx-auto h-12 w-12 mb-3" style={{ color: '#9CA3AF' }} />
                                <p className="text-sm text-brand-muted-dark">
                                    Belum ada minggu pembelajaran tersedia
                                </p>
                            </LiquidGlassCard>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            {course.groups.map((group, index) => {
                                const progress = calculateGroupProgress(group);
                                
                                return (
                                    <motion.div
                                        key={group.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + index * 0.05 }}
                                    >
                                        <LiquidGlassCard intensity="medium" className="p-5" lightMode={true}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 
                                                        className="text-lg font-semibold font-sans text-gray-800"
                                                    >
                                                        {group.name}
                                                    </h3>
                                                    {group.chat_spaces && group.chat_spaces.length > 0 && (
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${progress.percentage}%` }}
                                                                    transition={{ duration: 0.6, delay: 0.2 + index * 0.05 }}
                                                                    className="h-full rounded-full"
                                                                    style={{ 
                                                                        background: progress.percentage === 100 
                                                                            ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                                                                            : 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)'
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-medium text-brand-muted-dark">
                                                                {progress.completed}/{progress.total} sesi
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {!group.chat_spaces || group.chat_spaces.length === 0 ? (
                                                <div className="text-center py-4">
                                                    <p className="text-sm" style={{ color: '#9CA3AF' }}>
                                                        Belum ada sesi diskusi
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {group.chat_spaces.map((chatSpace) => {
                                                        const hasParticipated = getParticipationStatus(chatSpace);
                                                        
                                                        return (
                                                            <Link
                                                                key={chatSpace.id}
                                                                href={`/student/courses/${course.id}/chat/${chatSpace.id}`}
                                                                className="block"
                                                            >
                                                                <motion.div
                                                                    whileHover={{ scale: 1.01 }}
                                                                    whileTap={{ scale: 0.99 }}
                                                                    className="flex items-center justify-between p-3 rounded-lg transition-all"
                                                                    style={{
                                                                        background: hasParticipated 
                                                                            ? 'rgba(34, 197, 94, 0.08)'
                                                                            : 'rgba(156, 163, 175, 0.08)',
                                                                        border: hasParticipated
                                                                            ? '1px solid rgba(34, 197, 94, 0.2)'
                                                                            : '1px solid rgba(156, 163, 175, 0.15)'
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-3 flex-1">
                                                                        {hasParticipated ? (
                                                                            <CheckCircle2 
                                                                                className="h-5 w-5 flex-shrink-0" 
                                                                                style={{ color: '#22c55e' }}
                                                                            />
                                                                        ) : (
                                                                            <Circle 
                                                                                className="h-5 w-5 flex-shrink-0" 
                                                                                style={{ color: '#9CA3AF' }}
                                                                            />
                                                                        )}
                                                                        <div className="flex-1 min-w-0">
                                                                            <p 
                                                                                className="text-sm font-medium truncate text-gray-800"
                                                                            >
                                                                                {chatSpace.name}
                                                                            </p>
                                                                            <p className="text-xs mt-0.5 text-brand-muted-dark">
                                                                                {hasParticipated 
                                                                                    ? `${chatSpace.messages_count ?? 0} pesan`
                                                                                    : 'Belum berpartisipasi'
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <ChevronRight 
                                                                        className="h-5 w-5 flex-shrink-0" 
                                                                        style={{ color: '#9CA3AF' }}
                                                                    />
                                                                </motion.div>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </LiquidGlassCard>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
