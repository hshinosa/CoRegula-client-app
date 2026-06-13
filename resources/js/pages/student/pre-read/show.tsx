import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, ChevronDown, FileText } from 'lucide-react';
import { FormEvent, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { useStudentNav } from '@/components/navigation/student-nav';
import { Course } from '@/types';
import student from '@/routes/student';
import { LiquidGlassCard, PrimaryButton } from '@/components/Welcome/utils/helpers';
import { DocumentViewerModal, type DocumentViewerTarget } from '@/components/course/DocumentViewerModal';

interface MaterialRow {
    week_index: number;
    week_id: string;
    week_title: string;
    material: {
        id: string;
        title: string;
        description?: string | null;
        file_name: string;
        file_type?: string | null;
        file_size?: number;
    };
}

interface Props {
    course: Course;
    chatSpace: {
        id: string;
        name: string;
        description?: string | null;
        weekId?: string | null;
        weekTitle?: string | null;
        weekIndex?: number | null;
        groupId?: string | null;
    };
    materials: {
        session_week: { id: string; week_index: number; title: string } | null;
        primary: MaterialRow[];
        earlier: MaterialRow[];
        message?: string | null;
    };
    isReview?: boolean;
}

const headingStyle = { color: 'var(--color-brand-dark)' } as const;

function formatSize(bytes?: number): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PreReadShow({ course, chatSpace, materials, isReview }: Props) {
    const navItems = useStudentNav('course-detail', { courseId: course.id });
    const [earlierOpen, setEarlierOpen] = useState(false);
    const [documentViewer, setDocumentViewer] = useState<DocumentViewerTarget | null>(null);
    const { post, processing, errors } = useForm({});
    const formErrors = errors as Record<string, string>;

    const handleContinue = (e: FormEvent) => {
        e.preventDefault();
        post(`/student/courses/${course.id}/chat-spaces/${chatSpace.id}/pre-read/complete`);
    };

    const weekLabel =
        chatSpace.weekTitle &&
        (chatSpace.weekIndex != null ? `Minggu ${chatSpace.weekIndex}: ${chatSpace.weekTitle}` : chatSpace.weekTitle);

    return (
        <AppLayout title={`Pre-read — ${chatSpace.name}`} navItems={navItems}>
            <Head title={`Pre-read — ${course.name}`} />

            <div className="relative mx-auto max-w-3xl px-4 py-8">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <Link
                        href={student.courses.show.url({ course: course.id })}
                        className="mb-4 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all"
                        style={{
                            background: 'rgba(255,255,255,0.6)',
                            border: '1px solid rgba(255,255,255,0.8)',
                            color: 'var(--color-brand-muted-dark)'
                        }}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Detail Kelas
                    </Link>
                    <div className="mb-6 flex items-center gap-3">
                        <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl"
                            style={{ background: 'rgba(136,22,28,0.08)', border: '1px solid rgba(136,22,28,0.12)' }}
                        >
                            <BookOpen className="h-6 w-6 text-brand-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold" style={headingStyle}>
                                Bacaan sebelum diskusi
                            </h1>
                            <p className="text-sm text-brand-muted-dark">
                                Sesi: <span className="font-medium text-brand-dark">{chatSpace.name}</span>
                            </p>
                            {weekLabel && (
                                <p className="text-sm font-medium text-brand-primary">{weekLabel}</p>
                            )}
                        </div>
                    </div>

                    <LiquidGlassCard intensity="light" className="mb-6 p-5" lightMode>
                        <p className="text-sm text-brand-muted-dark">
                            Tinjau materi minggu ini (dan minggu sebelumnya jika perlu) sebelum menetapkan tujuan
                            pembelajaran dan masuk ruang diskusi.
                        </p>
                    </LiquidGlassCard>

                    {materials.message && (
                        <p className="mb-4 text-sm text-amber-700">{materials.message}</p>
                    )}

                    {formErrors.pre_read && (
                        <p className="mb-4 text-sm text-red-600">{formErrors.pre_read}</p>
                    )}

                    <section className="mb-6">
                        <h2 className="mb-3 text-lg font-semibold" style={headingStyle}>
                            Materi minggu ini
                        </h2>
                        {materials.primary.length === 0 ? (
                            <p className="text-sm text-brand-muted-dark">Belum ada materi untuk minggu ini.</p>
                        ) : (
                            <ul className="space-y-2">
                                {materials.primary.map((row) => (
                                    <li key={row.material.id}>
                                        <MaterialCard
                                            courseId={course.id}
                                            chatSpaceId={chatSpace.id}
                                            row={row}
                                            onOpen={setDocumentViewer}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {materials.earlier.length > 0 && (
                        <section className="mb-8">
                            <button
                                type="button"
                                onClick={() => setEarlierOpen((o) => !o)}
                                className="flex w-full items-center justify-between rounded-xl border border-[rgba(136,22,28,0.12)] bg-white/60 px-4 py-3 text-left text-sm font-semibold text-brand-dark"
                            >
                                Minggu sebelumnya ({materials.earlier.length} materi)
                                <ChevronDown
                                    className={`h-4 w-4 transition-transform ${earlierOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {earlierOpen && (
                                <ul className="mt-2 space-y-2">
                                    {materials.earlier.map((row) => (
                                        <li key={`${row.week_id}-${row.material.id}`}>
                                            <MaterialCard
                                                courseId={course.id}
                                                chatSpaceId={chatSpace.id}
                                                row={row}
                                                onOpen={setDocumentViewer}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    )}

                    {isReview ? (
                        <div className="space-y-3">
                            <p className="text-sm text-brand-muted-dark">
                                Kamu sudah menyelesaikan pre-read untuk sesi ini.
                            </p>
                            <Link
                                href={student.goals.create.url({ course: course.id, chatSpace: chatSpace.id })}
                                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition-all"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(164,18,25,0.92) 0%, rgba(136,22,28,0.96) 100%)',
                                    boxShadow: '0 8px 32px rgba(136,22,28,0.35)',
                                }}
                            >
                                Lanjut ke penetapan tujuan
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleContinue}>
                            <PrimaryButton type="submit" disabled={processing} className="w-full sm:w-auto">
                                {processing ? 'Menyimpan...' : 'Lanjut ke tujuan pembelajaran'}
                            </PrimaryButton>
                        </form>
                    )}
                </motion.div>
            </div>

            <DocumentViewerModal
                open={documentViewer !== null}
                target={documentViewer}
                onClose={() => setDocumentViewer(null)}
            />
        </AppLayout>
    );
}

function MaterialCard({
    courseId,
    chatSpaceId,
    row,
    onOpen,
}: {
    courseId: string;
    chatSpaceId: string;
    row: MaterialRow;
    onOpen: (t: DocumentViewerTarget) => void;
}) {
    const streamUrl = `/student/courses/${courseId}/materials/${row.material.id}/stream?chatSpace=${encodeURIComponent(chatSpaceId)}`;

    return (
        <LiquidGlassCard intensity="light" className="p-4" lightMode>
            <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-primary" />
                <div className="min-w-0 flex-1">
                    <p className="font-medium text-brand-dark">{row.material.title}</p>
                    {row.material.description && (
                        <p className="mt-0.5 text-xs text-brand-muted-dark line-clamp-2">
                            {row.material.description}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-brand-muted-dark">
                        {row.material.file_name}
                        {row.material.file_size ? ` · ${formatSize(row.material.file_size)}` : ''}
                    </p>
                    <button
                        type="button"
                        onClick={() =>
                            onOpen({
                                title: row.material.title,
                                fileName: row.material.file_name,
                                streamUrl,
                                fileType: row.material.file_type,
                            })
                        }
                        className="mt-2 text-sm font-medium text-brand-primary hover:underline"
                    >
                        Buka materi
                    </button>
                </div>
            </div>
        </LiquidGlassCard>
    );
}