import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Activity, BookOpen, Lightbulb, Users } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { useLecturerNav } from '@/components/navigation/lecturer-nav';
import { LiquidGlassCard, OrganicBlob } from '@/components/Welcome/utils/helpers';
import AppLayout from '@/layouts/app-layout';
import MetricsRadarChart from '@/components/MetricsRadarChart';

interface ClassMetrics {
    id: string;
    label: string;
    code: string;
    members: number;
    sessions: number;
    metrics: number[];
    note: string;
}

const METRIC_LABELS = [
    'Hot',
    'Lexical Variety',
    'Forethought',
    'Performance',
    'Collaboration',
    'Reflection',
];

const MOCK_CLASSES: ClassMetrics[] = [
    {
        id: 'cs401-2024',
        label: 'CS401 - HCI 2024',
        code: 'CS401',
        members: 28,
        sessions: 12,
        metrics: [7.8, 6.5, 8.2, 7.0, 8.5, 6.3],
        note: 'Kolaborasi tinggi, refleksi masih bisa ditingkatkan.',
    },
    {
        id: 'cs402-2024',
        label: 'CS402 - Software Engineering',
        code: 'CS402',
        members: 32,
        sessions: 9,
        metrics: [6.1, 7.2, 6.8, 7.8, 6.9, 5.4],
        note: 'Performance kuat, lexical variety stabil.',
    },
    {
        id: 'cs403-2024',
        label: 'CS403 - Pemrograman Web',
        code: 'CS403',
        members: 24,
        sessions: 14,
        metrics: [8.5, 8.0, 7.5, 8.3, 7.8, 7.6],
        note: 'Diskusi paling sehat semester ini.',
    },
];

const headingStyle = {
    color: '#4A4A4A',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
} as const;

const bodyTextClass = 'text-sm text-[#6B7280]';

const brandChipStyle = {
    background: 'rgba(136,22,28,0.08)',
    color: '#88161c',
    border: '1px solid rgba(136,22,28,0.15)',
} as const;

const neutralChipStyle = {
    background: 'rgba(74,74,74,0.08)',
    color: '#4A4A4A',
    border: '1px solid rgba(74,74,74,0.12)',
} as const;

const RadarChartPage: React.FC = () => {
    const navItems = useLecturerNav('dashboard');
    const [activeId, setActiveId] = useState<string>(MOCK_CLASSES[0].id);

    const activeClass = useMemo(
        () => MOCK_CLASSES.find((c) => c.id === activeId) ?? MOCK_CLASSES[0],
        [activeId],
    );

    const summaryCards = useMemo(
        () => [
            { icon: Users, label: 'Total Mahasiswa', value: activeClass.members },
            { icon: BookOpen, label: 'Sesi Diskusi', value: activeClass.sessions },
            {
                icon: Activity,
                label: 'Skor Rata-rata',
                value: (
                    activeClass.metrics.reduce((a, b) => a + b, 0) / activeClass.metrics.length
                ).toFixed(1),
            },
        ],
        [activeClass],
    );

    return (
        <AppLayout title="Radar Metrik Kelas" navItems={navItems}>
            <Head title="Radar Metrik Kelas" />

            <div className="relative">
                <OrganicBlob className="top-0 -left-20" delay={0} color="rgba(136, 22, 28, 0.04)" size={320} />
                <OrganicBlob className="top-32 -right-12" delay={-5} color="rgba(136, 22, 28, 0.03)" size={260} />

                <div className="relative space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <LiquidGlassCard intensity="medium" className="p-6 sm:p-8" lightMode={true}>
                            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                                <div className="max-w-3xl">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                            style={brandChipStyle}
                                        >
                                            Mock Preview
                                        </span>
                                        <span
                                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                            style={neutralChipStyle}
                                        >
                                            {MOCK_CLASSES.length} kelas
                                        </span>
                                    </div>

                                    <h1 className="mt-3 text-2xl font-bold sm:text-3xl" style={headingStyle}>
                                        Radar Metrik Kualitas Diskusi Kelas
                                    </h1>
                                    <p className={`mt-2 max-w-2xl ${bodyTextClass}`}>
                                        Visualisasi enam metrik SSRL agregat per kelas. Data berikut masih berupa mock untuk
                                        keperluan preview tampilan; integrasi dengan analytics pipeline menyusul.
                                    </p>
                                </div>
                            </div>
                        </LiquidGlassCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                    >
                        {summaryCards.map(({ icon: Icon, label, value }) => (
                            <LiquidGlassCard key={label} intensity="medium" className="p-4" lightMode={true}>
                                <div className="flex items-start gap-3">
                                    <div
                                        className="flex h-10 w-10 items-center justify-center rounded-2xl"
                                        style={brandChipStyle}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-[#6B7280]">{label}</p>
                                        <p className="mt-1 text-2xl font-semibold" style={headingStyle}>
                                            {value}
                                        </p>
                                    </div>
                                </div>
                            </LiquidGlassCard>
                        ))}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
                    >
                        <LiquidGlassCard intensity="medium" className="p-6 lg:col-span-1" lightMode={true}>
                            <h2 className="text-base font-semibold" style={headingStyle}>
                                Pilih Kelas
                            </h2>
                            <p className={`mt-1 ${bodyTextClass}`}>Klik salah satu kelas untuk lihat radar-nya.</p>

                            <div className="mt-4 space-y-2">
                                {MOCK_CLASSES.map((cls) => {
                                    const isActive = cls.id === activeId;
                                    return (
                                        <button
                                            key={cls.id}
                                            type="button"
                                            onClick={() => setActiveId(cls.id)}
                                            className="w-full rounded-2xl px-3 py-3 text-left transition"
                                            style={{
                                                background: isActive
                                                    ? 'rgba(136,22,28,0.08)'
                                                    : 'rgba(255,255,255,0.55)',
                                                border: isActive
                                                    ? '1px solid rgba(136,22,28,0.25)'
                                                    : '1px solid rgba(74,74,74,0.08)',
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className="text-sm font-semibold"
                                                    style={{ color: isActive ? '#88161c' : '#4A4A4A' }}
                                                >
                                                    {cls.code}
                                                </span>
                                                <span className="text-xs text-[#6B7280]">{cls.members} mhs</span>
                                            </div>
                                            <p className="mt-0.5 text-xs text-[#6B7280]">{cls.label}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </LiquidGlassCard>

                        <LiquidGlassCard intensity="medium" className="p-6 lg:col-span-2" lightMode={true}>
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <h2 className="text-base font-semibold" style={headingStyle}>
                                        {activeClass.label}
                                    </h2>
                                    <p className={`mt-1 ${bodyTextClass}`}>
                                        Skala 0–10 per metrik. Semakin lebar bidang radar, semakin sehat diskusi kelas.
                                    </p>
                                </div>
                            </div>

                            <div className="h-[420px] w-full">
                                <MetricsRadarChart data={activeClass.metrics} labels={METRIC_LABELS} />
                            </div>

                            <div
                                className="mt-4 rounded-2xl p-4"
                                style={{ background: 'rgba(255,255,255,0.45)' }}
                            >
                                <div className="flex items-start gap-3">
                                    <Lightbulb
                                        className="mt-0.5 h-4 w-4 flex-shrink-0"
                                        style={{ color: '#88161c' }}
                                    />
                                    <p className="text-sm leading-6 text-[#6B7280]">{activeClass.note}</p>
                                </div>
                            </div>
                        </LiquidGlassCard>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
};

export default RadarChartPage;
