import { Head, Link, useForm, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { FormEvent, useState, useMemo } from 'react';

import { InputError } from '@/components/ui/input-error';
import { InputLabel } from '@/components/ui/input-label';
import AppLayout from '@/layouts/app-layout';
import { useStudentNav } from '@/components/navigation/student-nav';
import { Course, Group } from '@/types';
import student from '@/routes/student';
import { room as chatRoom } from '@/routes/student/courses/chat';

interface ChatSpace {
    id: string;
    name: string;
    description?: string;
    isDefault: boolean;
}

interface Props {
    course: Course;
    group: Group | null;
    chatSpace: ChatSpace | null;
}

// Taksonomi Bloom - Kata kerja aksi berdasarkan tingkat (Bahasa Indonesia)
const ACTION_VERBS = {
    mengingat: ['mendefinisikan', 'mengidentifikasi', 'menyebutkan', 'mengenali', 'mengingat', 'menghafal', 'mendeskripsikan', 'menyatakan'],
    memahami: ['menjelaskan', 'merangkum', 'menafsirkan', 'mengklasifikasi', 'membandingkan', 'membedakan', 'mendiskusikan', 'mencontohkan'],
    menerapkan: ['menerapkan', 'mendemonstrasikan', 'mengimplementasikan', 'menyelesaikan', 'menggunakan', 'melaksanakan', 'mengilustrasikan', 'mempraktikkan'],
    menganalisis: ['menganalisis', 'membedakan', 'memeriksa', 'menguraikan', 'menyelidiki', 'mengorganisasi', 'menghubungkan', 'mengkritisi'],
    mengevaluasi: ['mengevaluasi', 'menilai', 'mengkritik', 'memutuskan', 'membenarkan', 'merekomendasikan', 'menyimpulkan', 'mempertahankan'],
    mencipta: ['menciptakan', 'merancang', 'mengembangkan', 'membangun', 'memproduksi', 'merencanakan', 'menyusun', 'menghasilkan'],
};

const LEVEL_LABELS = {
    mengingat: 'Mengingat',
    memahami: 'Memahami',
    menerapkan: 'Menerapkan',
    menganalisis: 'Menganalisis',
    mengevaluasi: 'Mengevaluasi',
    mencipta: 'Mencipta',
};

const LEVEL_COLORS = {
    mengingat: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    memahami: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    menerapkan: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    menganalisis: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    mengevaluasi: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    mencipta: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

export default function StudentGoalCreate({ course, group, chatSpace }: Props) {
    const [selectedVerb, setSelectedVerb] = useState<string | null>(null);

    const navItems = useStudentNav('goals', { courseId: course.id });

    const { data, setData, post, processing, errors } = useForm({
        chat_space_id: chatSpace?.id || '',
        content: '',
    });

    // Detect Bloom's level from goal content
    const detectedLevel = useMemo(() => {
        const content = data.content.toLowerCase();
        for (const [level, verbs] of Object.entries(ACTION_VERBS)) {
            for (const verb of verbs) {
                if (content.includes(verb)) {
                    return level as keyof typeof ACTION_VERBS;
                }
            }
        }
        return null;
    }, [data.content]);

    const handleVerbClick = (verb: string) => {
        setSelectedVerb(verb);
        const capitalizedVerb = verb.charAt(0).toUpperCase() + verb.slice(1);
        if (!data.content) {
            setData('content', `${capitalizedVerb} `);
        } else {
            // Replace first word if it's a verb
            const words = data.content.split(' ');
            const allVerbs = Object.values(ACTION_VERBS).flat();
            if (allVerbs.includes(words[0].toLowerCase())) {
                words[0] = capitalizedVerb;
                setData('content', words.join(' '));
            } else {
                setData('content', `${capitalizedVerb} ${data.content}`);
            }
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(student.goals.store.url(), {
            onSuccess: () => {
                // Redirect langsung ke chat room setelah set goal
                if (chatSpace) {
                    router.visit(chatRoom.url({ course: course.id, chatSpace: chatSpace.id }));
                } else {
                    router.visit(student.courses.chatSpaces.url({ course: course.id }));
                }
            },
        });
    };

    // Check if student has a group
    if (!group) {
        return (
            <AppLayout title="Tetapkan Tujuan Pembelajaran" navItems={navItems}>
                <Head title="Tetapkan Tujuan Pembelajaran" />
                <div className="mx-auto max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card p-8 text-center"
                    >
                        <div className="mb-4 flex justify-center">
                            <svg className="h-16 w-16 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                            Belum Ada Grup yang Ditugaskan
                        </h3>
                        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                            Anda perlu ditugaskan ke grup sebelum dapat menetapkan tujuan pembelajaran.
                            Harap tunggu dosen Anda menugaskan Anda ke grup.
                        </p>
                        <Link
                            href={student.courses.show.url({ course: course.id })}
                            className="btn-primary mt-6 inline-flex"
                        >
                            Kembali ke Kelas
                        </Link>
                    </motion.div>
                </div>
            </AppLayout>
        );
    }

    // Check if chat space exists
    if (!chatSpace) {
        return (
            <AppLayout title="Tetapkan Tujuan Pembelajaran" navItems={navItems}>
                <Head title="Tetapkan Tujuan Pembelajaran" />
                <div className="mx-auto max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card p-8 text-center"
                    >
                        <div className="mb-4 flex justify-center">
                            <svg className="h-16 w-16 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                            Chat Space Tidak Ditemukan
                        </h3>
                        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                            Chat space yang Anda cari tidak ditemukan atau Anda tidak memiliki akses.
                        </p>
                        <Link
                            href={student.courses.chatSpaces.url({ course: course.id })}
                            className="btn-primary mt-6 inline-flex"
                        >
                            Kembali ke Diskusi
                        </Link>
                    </motion.div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Tetapkan Tujuan Pembelajaran" navItems={navItems}>
            <Head title="Tetapkan Tujuan Pembelajaran" />

            <div className="mx-auto max-w-3xl space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Link
                        href={student.courses.chatSpaces.url({ course: course.id })}
                        className="mb-4 inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Kembali ke Sesi Diskusi
                    </Link>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        Tetapkan Tujuan Pembelajaran Anda
                    </h2>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Untuk chat space: <span className="font-medium">{chatSpace.name}</span>
                    </p>
                </motion.div>

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card bg-primary-50 p-4 dark:bg-primary-900/20"
                >
                    <div className="flex gap-3">
                        <svg className="h-5 w-5 flex-shrink-0 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-primary-800 dark:text-primary-200">
                            <p className="font-medium">Apa yang membuat tujuan pembelajaran yang baik?</p>
                            <ul className="mt-2 list-inside list-disc space-y-1 text-primary-700 dark:text-primary-300">
                                <li>Mulai dengan kata kerja aksi dari Taksonomi Bloom</li>
                                <li>Jadilah spesifik tentang apa yang ingin Anda pelajari</li>
                                <li>Buatlah dapat diukur sehingga Anda tahu kapan Anda telah mencapainya</li>
                                <li>Jaga agar relevan dengan topik diskusi di chat space ini</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* Action Verb Picker */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card p-6"
                >
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        Pilih Kata Kerja Aksi
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Klik pada kata kerja untuk memulai tujuan Anda. Tingkat yang lebih tinggi mendorong pembelajaran yang lebih dalam.
                    </p>
                    <div className="mt-4 space-y-4">
                        {Object.entries(ACTION_VERBS).map(([level, verbs]) => (
                            <div key={level}>
                                <div className="mb-2 flex items-center gap-2">
                                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${LEVEL_COLORS[level as keyof typeof LEVEL_COLORS]}`}>
                                        {LEVEL_LABELS[level as keyof typeof LEVEL_LABELS]}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {verbs.map((verb) => (
                                        <button
                                            key={verb}
                                            type="button"
                                            onClick={() => handleVerbClick(verb)}
                                            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all hover:scale-105 active:scale-95 ${
                                                selectedVerb === verb
                                                    ? 'border-primary-500 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                                                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600'
                                            }`}
                                        >
                                            {verb.charAt(0).toUpperCase() + verb.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Goal Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card p-6"
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between">
                                <InputLabel htmlFor="content" required>
                                    Tujuan Pembelajaran Anda
                                </InputLabel>
                                {detectedLevel && (
                                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${LEVEL_COLORS[detectedLevel]}`}>
                                        Tingkat: {LEVEL_LABELS[detectedLevel]}
                                    </span>
                                )}
                            </div>
                            <textarea
                                id="content"
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                className="input-field mt-1 min-h-[120px]"
                                placeholder="misalnya, Analisis pendekatan berbeda untuk normalisasi database dan evaluasi mana yang paling sesuai untuk aplikasi e-commerce"
                                rows={4}
                            />
                            <InputError message={errors.content} />
                            <p className="mt-1 text-xs text-zinc-500">
                                {data.content.length}/500 karakter
                            </p>
                        </div>

                        {/* Example Goals */}
                        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Contoh Tujuan:
                            </p>
                            <ul className="mt-2 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-500">•</span>
                                    <span>"<strong>Membandingkan</strong> berbagai algoritma pengurutan dan menjelaskan kompleksitas waktunya"</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-500">•</span>
                                    <span>"<strong>Merancang</strong> RESTful API untuk aplikasi blog dengan autentikasi yang tepat"</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-accent-500">•</span>
                                    <span>"<strong>Mengevaluasi</strong> kelebihan dan kekurangan SQL vs NoSQL untuk proyek kami"</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Link
                                href={student.courses.chatSpaces.url({ course: course.id })}
                                className="btn-secondary flex-1"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing || !data.content.trim()}
                                className="btn-primary flex-1"
                            >
                                {processing ? 'Menetapkan Tujuan...' : 'Tetapkan Tujuan & Mulai Diskusi'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AppLayout>
    );
}
