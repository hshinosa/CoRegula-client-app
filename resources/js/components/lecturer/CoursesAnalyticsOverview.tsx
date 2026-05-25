import { Activity, BookOpen, GraduationCap, Users } from 'lucide-react';
import { CourseAnalytics } from '@/types';
import { AnalyticsCard } from './AnalyticsCard';

interface CoursesAnalyticsOverviewProps {
    analytics: CourseAnalytics;
}

export function CoursesAnalyticsOverview({ analytics }: CoursesAnalyticsOverviewProps) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <AnalyticsCard
                icon={BookOpen}
                label="Total Kelas"
                value={analytics.total_courses}
                index={0}
            />
            <AnalyticsCard
                icon={Users}
                label="Total Mahasiswa"
                value={analytics.total_students}
                index={1}
            />
            <AnalyticsCard
                icon={GraduationCap}
                label="Rata-rata/Kelas"
                value={analytics.avg_students_per_course}
                suffix="mhs"
                index={2}
            />
            <AnalyticsCard
                icon={Activity}
                label="Rata-rata Engagement"
                value={analytics.avg_engagement}
                index={3}
            />
        </div>
    );
}
