import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, Flame, PenTool } from 'lucide-react';
import StatCard from './StatCard';

interface StatsData {
    active_courses: number;
    completed_tasks: number;
    streak: number;
    total_reflections: number;
}

interface Props {
    stats: StatsData;
}

const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

export default function StatsSection({ stats: initial }: Props) {
    const [stats, setStats] = useState<StatsData>(initial);

    useEffect(() => {
        const poll = async () => {
            try {
                const res = await fetch('/student/profile/stats', {
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': csrfToken(),
                    },
                });
                if (res.ok) {
                    const json = await res.json();
                    if (json.data) setStats(json.data);
                }
            } catch {
            }
        };

        const interval = setInterval(poll, 30_000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
                label="Kursus Aktif"
                value={stats.active_courses}
                icon={BookOpen}
                color="from-blue-500 to-cyan-500"
                bgColor="bg-blue-50 dark:bg-blue-900/20"
                textColor="text-blue-600 dark:text-blue-400"
            />
            <StatCard
                label="Tugas Selesai"
                value={stats.completed_tasks}
                icon={CheckCircle}
                color="from-green-500 to-emerald-500"
                bgColor="bg-green-50 dark:bg-green-900/20"
                textColor="text-green-600 dark:text-green-400"
            />
            <StatCard
                label="Streak Aktif"
                value={stats.streak}
                icon={Flame}
                color="from-orange-500 to-red-500"
                bgColor="bg-orange-50 dark:bg-orange-900/20"
                textColor="text-orange-600 dark:text-orange-400"
                suffix=" hari"
            />
            <StatCard
                label="Total Refleksi"
                value={stats.total_reflections}
                icon={PenTool}
                color="from-purple-500 to-pink-500"
                bgColor="bg-purple-50 dark:bg-purple-900/20"
                textColor="text-purple-600 dark:text-purple-400"
            />
        </div>
    );
}