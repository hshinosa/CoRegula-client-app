import { motion } from 'framer-motion';
import { Bell, BookOpen, MessageSquare, Calendar, Megaphone } from 'lucide-react';
import { LiquidGlassCard } from '@/components/Welcome/utils/helpers';

interface NotificationPrefs {
    courses: boolean;
    discussions: boolean;
    reflections: boolean;
    deadlines: boolean;
    announcements: boolean;
}

interface NotificationTabProps {
    preferences: NotificationPrefs;
    onToggle: (key: keyof NotificationPrefs) => void;
}

export function NotificationTab({ preferences, onToggle }: NotificationTabProps) {
    const notificationTypes = [
        {
            key: 'courses' as const,
            label: 'Kursus Baru',
            description: 'Notifikasi saat ada kursus baru atau update materi',
            icon: BookOpen,
        },
        {
            key: 'discussions' as const,
            label: 'Aktivitas Diskusi',
            description: 'Notifikasi saat ada balasan atau mention di diskusi',
            icon: MessageSquare,
        },
        {
            key: 'reflections' as const,
            label: 'Pengingat Refleksi',
            description: 'Pengingat untuk mengisi refleksi pembelajaran',
            icon: Bell,
        },
        {
            key: 'deadlines' as const,
            label: 'Deadline Tugas',
            description: 'Pengingat deadline tugas dan aktivitas',
            icon: Calendar,
        },
        {
            key: 'announcements' as const,
            label: 'Pengumuman',
            description: 'Pengumuman penting dari dosen atau admin',
            icon: Megaphone,
        },
    ];

    return (
        <div className="space-y-6">
            <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                <h2 className="mb-6 text-lg font-semibold text-neutral-800">
                    Preferensi Notifikasi
                </h2>

                <div className="space-y-4">
                    {notificationTypes.map((type) => (
                        <motion.div
                            key={type.key}
                            className="flex items-start justify-between rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-primary-300"
                            whileHover={{ scale: 1.01 }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="rounded-lg bg-primary-50 p-2">
                                    <type.icon className="h-5 w-5 text-primary-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-neutral-800">{type.label}</p>
                                    <p className="text-sm text-neutral-500">{type.description}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => onToggle(type.key)}
                                className={`relative h-6 w-11 rounded-full transition-all ${
                                    preferences[type.key] ? 'bg-primary-600' : 'bg-neutral-300'
                                }`}
                            >
                                <motion.div
                                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"
                                    animate={{ left: preferences[type.key] ? '22px' : '2px' }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            </button>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-6 rounded-xl bg-primary-50 p-4">
                    <p className="text-sm text-primary-800">
                        <strong>Catatan:</strong> Perubahan preferensi notifikasi akan disimpan secara otomatis.
                    </p>
                </div>
            </LiquidGlassCard>
        </div>
    );
}
