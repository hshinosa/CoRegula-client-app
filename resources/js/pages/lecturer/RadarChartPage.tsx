import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Activity, BookOpen, Lightbulb, Users } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { useLecturerNav } from '@/components/navigation/lecturer-nav';
import { LiquidGlassCard, OrganicBlob } from '@/components/Welcome/utils/helpers';
import AppLayout from '@/layouts/app-layout';
import MetricsRadarChart from '@/components/MetricsRadarChart';

type Scope = 'class' | 'group' | 'student' | 'session';

interface RadarEntry {
    id: string;
    label: string;
    sublabel: string;
    metrics: number[];
    note: string;
}

interface ClassEntity extends RadarEntry {
    members: number;
    sessions: number;
    groups: GroupEntity[];
    sessionEntries: RadarEntry[];
}

interface GroupEntity extends RadarEntry {
    students: RadarEntry[];
}

const METRIC_LABELS = [
    'Hot',
    'Lexical Variety',
    'Forethought',
    'Performance',
    'Collaboration',
    'Reflection',
];

const MOCK_CLASSES: ClassEntity[] = [
    {
        id: 'cs401-2024',
        label: 'CS401 - HCI 2024',
        sublabel: '28 mahasiswa · 12 sesi',
        members: 28,
        sessions: 12,
        metrics: [7.8, 6.5, 8.2, 7.0, 8.5, 6.3],
        note: 'Kolaborasi tinggi, refleksi masih bisa ditingkatkan.',
        groups: [
            {
                id: 'cs401-g1',
                label: 'Kelompok A',
                sublabel: '5 anggota',
                metrics: [8.4, 7.0, 8.6, 7.5, 9.0, 7.2],
                note: 'Kelompok paling aktif. Pertahankan momentum.',
                students: [
                    { id: 'cs401-g1-s1', label: 'Andi Pratama', sublabel: 'andi.pratama@kolabri.edu', metrics: [8.8, 7.5, 9.0, 7.9, 9.4, 7.8], note: 'Konsisten memimpin diskusi reflektif.' },
                    { id: 'cs401-g1-s2', label: 'Bella Kusuma', sublabel: 'bella.kusuma@kolabri.edu', metrics: [7.9, 6.8, 8.4, 7.2, 8.6, 6.9], note: 'Performa tinggi, refleksi mulai konsisten.' },
                    { id: 'cs401-g1-s3', label: 'Cahya Adi', sublabel: 'cahya.adi@kolabri.edu', metrics: [8.5, 7.4, 8.6, 7.6, 9.0, 7.4], note: 'Kontribusi seimbang di semua dimensi.' },
                ],
            },
            {
                id: 'cs401-g2',
                label: 'Kelompok B',
                sublabel: '6 anggota',
                metrics: [7.2, 6.0, 7.8, 6.4, 8.0, 5.6],
                note: 'Refleksi rendah. Dorong sesi reflektif eksplisit.',
                students: [
                    { id: 'cs401-g2-s1', label: 'Dimas Surya', sublabel: 'dimas.surya@kolabri.edu', metrics: [7.5, 6.2, 8.0, 6.6, 8.2, 5.8], note: 'Stabil, perlu dorongan refleksi.' },
                    { id: 'cs401-g2-s2', label: 'Eka Lestari', sublabel: 'eka.lestari@kolabri.edu', metrics: [6.9, 5.8, 7.4, 6.0, 7.8, 5.2], note: 'Refleksi minimal, butuh prompt eksplisit.' },
                ],
            },
            {
                id: 'cs401-g3',
                label: 'Kelompok C',
                sublabel: '5 anggota',
                metrics: [7.6, 6.4, 8.0, 6.8, 8.2, 6.0],
                note: 'Tengah-tengah; ada potensi untuk meningkat.',
                students: [
                    { id: 'cs401-g3-s1', label: 'Farel Nugraha', sublabel: 'farel.nugraha@kolabri.edu', metrics: [7.8, 6.6, 8.2, 7.0, 8.4, 6.2], note: 'Konsisten di semua dimensi.' },
                    { id: 'cs401-g3-s2', label: 'Gita Anjali', sublabel: 'gita.anjali@kolabri.edu', metrics: [7.4, 6.2, 7.8, 6.6, 8.0, 5.8], note: 'Lexical variety perlu didorong.' },
                ],
            },
        ],
        sessionEntries: [
            { id: 'cs401-sess1', label: 'Sesi 1 — User Research Basics', sublabel: '4 Maret 2026 · 47 pesan', metrics: [6.8, 5.8, 7.5, 6.4, 7.8, 5.5], note: 'Pembukaan sesi cenderung pasif.' },
            { id: 'cs401-sess2', label: 'Sesi 2 — Persona & Empathy Map', sublabel: '11 Maret 2026 · 82 pesan', metrics: [7.6, 6.4, 8.0, 6.8, 8.4, 6.2], note: 'Diskusi mulai mendalam, ada momen refleksi.' },
            { id: 'cs401-sess3', label: 'Sesi 3 — Wireframing Sprint', sublabel: '18 Maret 2026 · 119 pesan', metrics: [8.4, 7.0, 8.6, 7.6, 9.0, 7.0], note: 'Sesi paling produktif sejauh ini.' },
            { id: 'cs401-sess4', label: 'Sesi 4 — Heuristic Evaluation', sublabel: '25 Maret 2026 · 96 pesan', metrics: [7.8, 6.6, 8.2, 7.2, 8.4, 6.4], note: 'Performa stabil, kolaborasi tetap kuat.' },
        ],
    },
    {
        id: 'cs402-2024',
        label: 'CS402 - Software Engineering',
        sublabel: '32 mahasiswa · 9 sesi',
        members: 32,
        sessions: 9,
        metrics: [6.1, 7.2, 6.8, 7.8, 6.9, 5.4],
        note: 'Performance kuat, lexical variety stabil.',
        groups: [
            {
                id: 'cs402-g1',
                label: 'Kelompok 1',
                sublabel: '8 anggota',
                metrics: [6.4, 7.6, 7.0, 8.0, 7.2, 5.6],
                note: 'Diskusi teknis solid, refleksi lemah.',
                students: [
                    { id: 'cs402-g1-s1', label: 'Hadi Wijaya', sublabel: 'hadi.wijaya@kolabri.edu', metrics: [6.8, 7.8, 7.2, 8.4, 7.6, 5.8], note: 'Tech lead grup, diskusi cenderung dominan.' },
                    { id: 'cs402-g1-s2', label: 'Indra Maulana', sublabel: 'indra.maulana@kolabri.edu', metrics: [6.0, 7.2, 6.8, 7.6, 6.8, 5.4], note: 'Stabil, butuh dorongan refleksi.' },
                ],
            },
            {
                id: 'cs402-g2',
                label: 'Kelompok 2',
                sublabel: '8 anggota',
                metrics: [5.8, 6.8, 6.6, 7.6, 6.6, 5.2],
                note: 'Refleksi paling rendah; perlu intervensi.',
                students: [
                    { id: 'cs402-g2-s1', label: 'Joko Saputra', sublabel: 'joko.saputra@kolabri.edu', metrics: [5.6, 6.6, 6.4, 7.4, 6.4, 5.0], note: 'Pasif, jarang mengelaborasi.' },
                ],
            },
        ],
        sessionEntries: [
            { id: 'cs402-sess1', label: 'Sesi 1 — Agile Foundations', sublabel: '5 Maret 2026 · 38 pesan', metrics: [5.4, 6.8, 6.2, 7.4, 6.4, 5.0], note: 'Sesi orientasi, partisipasi cukup.' },
            { id: 'cs402-sess2', label: 'Sesi 2 — User Stories', sublabel: '12 Maret 2026 · 64 pesan', metrics: [6.0, 7.2, 6.6, 7.8, 6.8, 5.2], note: 'Diskusi mulai konstruktif.' },
            { id: 'cs402-sess3', label: 'Sesi 3 — Sprint Planning', sublabel: '19 Maret 2026 · 78 pesan', metrics: [6.4, 7.6, 7.2, 8.2, 7.0, 5.6], note: 'Tertinggi, performa tim solid.' },
        ],
    },
    {
        id: 'cs403-2024',
        label: 'CS403 - Pemrograman Web',
        sublabel: '24 mahasiswa · 14 sesi',
        members: 24,
        sessions: 14,
        metrics: [8.5, 8.0, 7.5, 8.3, 7.8, 7.6],
        note: 'Diskusi paling sehat semester ini.',
        groups: [
            {
                id: 'cs403-g1',
                label: 'Frontend Squad',
                sublabel: '6 anggota',
                metrics: [8.8, 8.2, 7.8, 8.6, 8.0, 7.8],
                note: 'Kolaborasi sangat baik, refleksi konsisten.',
                students: [
                    { id: 'cs403-g1-s1', label: 'Kirana Putri', sublabel: 'kirana.putri@kolabri.edu', metrics: [9.0, 8.4, 8.0, 8.8, 8.2, 8.0], note: 'Top performer kelas ini.' },
                ],
            },
            {
                id: 'cs403-g2',
                label: 'Backend Squad',
                sublabel: '6 anggota',
                metrics: [8.2, 7.8, 7.2, 8.0, 7.6, 7.4],
                note: 'Stabil di seluruh dimensi.',
                students: [
                    { id: 'cs403-g2-s1', label: 'Lukman Hakim', sublabel: 'lukman.hakim@kolabri.edu', metrics: [8.4, 8.0, 7.4, 8.2, 7.8, 7.6], note: 'Konsisten teknikal & reflektif.' },
                ],
            },
        ],
        sessionEntries: [
            { id: 'cs403-sess1', label: 'Sesi 1 — HTML/CSS Refresher', sublabel: '6 Maret 2026 · 52 pesan', metrics: [7.8, 7.4, 7.0, 7.8, 7.2, 7.0], note: 'Pembukaan ringan, partisipasi luas.' },
            { id: 'cs403-sess2', label: 'Sesi 2 — Component Patterns', sublabel: '13 Maret 2026 · 88 pesan', metrics: [8.6, 8.2, 7.6, 8.4, 7.8, 7.6], note: 'Diskusi mendalam, banyak code review.' },
        ],
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

const SCOPE_TABS: Array<{ key: Scope; label: string }> = [
    { key: 'class', label: 'Kelas' },
    { key: 'group', label: 'Kelompok' },
    { key: 'student', label: 'Mahasiswa' },
    { key: 'session', label: 'Sesi' },
];

const RadarChartPage: React.FC = () => {
    const navItems = useLecturerNav('dashboard');
    const [activeClassId, setActiveClassId] = useState<string>(MOCK_CLASSES[0].id);
    const [scope, setScope] = useState<Scope>('class');
    const [activeGroupId, setActiveGroupId] = useState<string>(MOCK_CLASSES[0].groups[0].id);
    const [activeStudentId, setActiveStudentId] = useState<string>(MOCK_CLASSES[0].groups[0].students[0].id);
    const [activeSessionId, setActiveSessionId] = useState<string>(MOCK_CLASSES[0].sessionEntries[0].id);

    const activeClass = useMemo(
        () => MOCK_CLASSES.find((c) => c.id === activeClassId) ?? MOCK_CLASSES[0],
        [activeClassId],
    );

    const activeEntity: RadarEntry = useMemo(() => {
        switch (scope) {
            case 'group': {
                const g = activeClass.groups.find((x) => x.id === activeGroupId) ?? activeClass.groups[0];
                return g;
            }
            case 'student': {
                const allStudents = activeClass.groups.flatMap((g) => g.students);
                return allStudents.find((s) => s.id === activeStudentId) ?? allStudents[0];
            }
            case 'session': {
                return (
                    activeClass.sessionEntries.find((s) => s.id === activeSessionId) ??
                    activeClass.sessionEntries[0]
                );
            }
            default:
                return activeClass;
        }
    }, [scope, activeClass, activeGroupId, activeStudentId, activeSessionId]);

    const handleClassChange = (classId: string) => {
        const cls = MOCK_CLASSES.find((c) => c.id === classId);
        if (!cls) return;
        setActiveClassId(classId);
        setActiveGroupId(cls.groups[0]?.id ?? '');
        setActiveStudentId(cls.groups[0]?.students[0]?.id ?? '');
        setActiveSessionId(cls.sessionEntries[0]?.id ?? '');
    };

    const summaryCards = useMemo(
        () => [
            { icon: Users, label: 'Total Mahasiswa', value: activeClass.members },
            { icon: BookOpen, label: 'Sesi Diskusi', value: activeClass.sessions },
            {
                icon: Activity,
                label: 'Skor Rata-rata',
                value: (
                    activeEntity.metrics.reduce((a, b) => a + b, 0) / activeEntity.metrics.length
                ).toFixed(1),
            },
        ],
        [activeClass, activeEntity],
    );

    const selectorItems = useMemo(() => {
        switch (scope) {
            case 'group':
                return activeClass.groups.map((g) => ({
                    id: g.id,
                    title: g.label,
                    subtitle: g.sublabel,
                    activeId: activeGroupId,
                    onClick: () => setActiveGroupId(g.id),
                }));
            case 'student':
                return activeClass.groups.flatMap((g) =>
                    g.students.map((s) => ({
                        id: s.id,
                        title: s.label,
                        subtitle: `${g.label} · ${s.sublabel}`,
                        activeId: activeStudentId,
                        onClick: () => setActiveStudentId(s.id),
                    })),
                );
            case 'session':
                return activeClass.sessionEntries.map((s) => ({
                    id: s.id,
                    title: s.label,
                    subtitle: s.sublabel,
                    activeId: activeSessionId,
                    onClick: () => setActiveSessionId(s.id),
                }));
            default:
                return MOCK_CLASSES.map((c) => ({
                    id: c.id,
                    title: c.label,
                    subtitle: c.sublabel,
                    activeId: activeClassId,
                    onClick: () => handleClassChange(c.id),
                }));
        }
    }, [scope, activeClass, activeClassId, activeGroupId, activeStudentId, activeSessionId]);

    const selectorTitle = useMemo(() => {
        switch (scope) {
            case 'group': return 'Pilih Kelompok';
            case 'student': return 'Pilih Mahasiswa';
            case 'session': return 'Pilih Sesi';
            default: return 'Pilih Kelas';
        }
    }, [scope]);

    return (
        <AppLayout title="Radar Metrik" navItems={navItems}>
            <Head title="Radar Metrik" />

            <div className="relative">
                <OrganicBlob className="top-0 -left-20" delay={0} color="rgba(136, 22, 28, 0.04)" size={320} />
                <OrganicBlob className="top-32 -right-12" delay={-5} color="rgba(136, 22, 28, 0.03)" size={260} />

                <div className="relative space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <LiquidGlassCard intensity="medium" className="p-6 sm:p-8" lightMode={true}>
                            <div className="flex flex-col gap-4">
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
                                        {activeClass.label}
                                    </span>
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold sm:text-3xl" style={headingStyle}>
                                        Radar Metrik Diskusi
                                    </h1>
                                    <p className={`mt-2 max-w-2xl ${bodyTextClass}`}>
                                        Lihat enam metrik SSRL pada empat tingkat agregasi: kelas, kelompok, mahasiswa
                                        individual, atau sesi diskusi tertentu. Data berikut masih mock untuk preview tampilan.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <label className="text-xs uppercase tracking-wider text-[#6B7280]">
                                        Kelas:
                                    </label>
                                    <select
                                        value={activeClassId}
                                        onChange={(e) => handleClassChange(e.target.value)}
                                        className="rounded-xl border px-3 py-2 text-sm"
                                        style={{
                                            background: 'rgba(255,255,255,0.55)',
                                            borderColor: 'rgba(74,74,74,0.18)',
                                            color: '#4A4A4A',
                                        }}
                                    >
                                        {MOCK_CLASSES.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
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
                    >
                        <LiquidGlassCard intensity="medium" className="p-3" lightMode={true}>
                            <div className="flex flex-wrap items-center gap-1">
                                {SCOPE_TABS.map((tab) => {
                                    const isActive = tab.key === scope;
                                    return (
                                        <button
                                            key={tab.key}
                                            type="button"
                                            onClick={() => setScope(tab.key)}
                                            className="rounded-full px-4 py-1.5 text-sm font-medium transition"
                                            style={{
                                                background: isActive
                                                    ? 'rgba(136,22,28,0.12)'
                                                    : 'transparent',
                                                color: isActive ? '#88161c' : '#6B7280',
                                                border: isActive
                                                    ? '1px solid rgba(136,22,28,0.25)'
                                                    : '1px solid transparent',
                                            }}
                                        >
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </LiquidGlassCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
                    >
                        <LiquidGlassCard intensity="medium" className="p-6 lg:col-span-1" lightMode={true}>
                            <h2 className="text-base font-semibold" style={headingStyle}>
                                {selectorTitle}
                            </h2>
                            <p className={`mt-1 ${bodyTextClass}`}>
                                {selectorItems.length} item tersedia.
                            </p>

                            <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
                                {selectorItems.map((item) => {
                                    const isActive = item.id === item.activeId;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={item.onClick}
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
                                            <p
                                                className="text-sm font-semibold"
                                                style={{ color: isActive ? '#88161c' : '#4A4A4A' }}
                                            >
                                                {item.title}
                                            </p>
                                            <p className="mt-0.5 text-xs text-[#6B7280]">{item.subtitle}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </LiquidGlassCard>

                        <LiquidGlassCard intensity="medium" className="p-6 lg:col-span-2" lightMode={true}>
                            <div className="mb-4">
                                <h2 className="text-base font-semibold" style={headingStyle}>
                                    {activeEntity.label}
                                </h2>
                                <p className={`mt-1 ${bodyTextClass}`}>{activeEntity.sublabel}</p>
                            </div>

                            <div className="h-[420px] w-full">
                                <MetricsRadarChart data={activeEntity.metrics} labels={METRIC_LABELS} />
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
                                    <p className="text-sm leading-6 text-[#6B7280]">{activeEntity.note}</p>
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
