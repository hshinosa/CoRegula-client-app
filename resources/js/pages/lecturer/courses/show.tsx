import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { FormEvent, useRef, useState } from 'react';

import { InputError } from '@/components/ui/input-error';
import AppLayout from '@/layouts/app-layout';
import { Course, KnowledgeBase } from '@/types';
import lecturer from '@/routes/lecturer';

interface Props {
    course: Course & {
        join_code: string;
        knowledge_base: KnowledgeBase[];
    };
}

export default function ShowCourse({ course }: Props) {
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm<{
        file: File | null;
    }>({
        file: null,
    });

    const navItems = [
        {
            name: 'Kelas Saya',
            href: lecturer.courses.index.url(),
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
            active: true,
        },
        {
            name: 'Buat Kelas',
            href: lecturer.courses.create.url(),
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            ),
        },
    ];

    const copyJoinCode = () => {
        navigator.clipboard.writeText(course.join_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('file', file);
    };

    const handleUpload = (e: FormEvent) => {
        e.preventDefault();
        if (!data.file) return;

        post(lecturer.courses.knowledgeBase.store.url({ course: course.id }), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ready':
                return 'status-green';
            case 'processing':
                return 'status-yellow';
            case 'failed':
                return 'status-red';
            default:
                return 'bg-zinc-100 text-zinc-800';
        }
    };

    return (
        <AppLayout title={course.name} navItems={navItems}>
            <Head title={course.name} />

            <div className="space-y-6">
                {/* Course Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-sm font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                                    {course.code}
                                </span>
                            </div>
                            <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                {course.name}
                            </h2>
                        </div>
                        <Link
                            href={lecturer.groups.index.url({ course: course.id })}
                            className="btn-secondary"
                        >
                            Kelola Grup
                        </Link>
                    </div>

                    {/* Join Code */}
                    <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            Kode Bergabung Siswa
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                            <code className="rounded bg-white px-4 py-2 font-mono text-2xl font-bold tracking-wider text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
                                {course.join_code}
                            </code>
                            <button
                                onClick={copyJoinCode}
                                className="btn-secondary"
                            >
                                {copied ? 'Disalin!' : 'Salin'}
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-zinc-500">
                            Bagikan kode ini dengan siswa untuk memungkinkan mereka bergabung dengan kelas
                        </p>
                    </div>
                </motion.div>

                {/* Knowledge Base Upload */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card p-6"
                >
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        Basis Pengetahuan
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Unggah materi kelas (PDF) untuk digunakan chatbot AI
                    </p>

                    {/* Upload Form */}
                    <form onSubmit={handleUpload} className="mt-4">
                        <div className="flex items-center gap-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="flex-1 text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100 dark:text-zinc-400 dark:file:bg-primary-900/30 dark:file:text-primary-300"
                            />
                            <button
                                type="submit"
                                disabled={!data.file || processing}
                                className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Uploading...
                                    </span>
                                ) : (
                                    'Unggah PDF'
                                )}
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-zinc-500">
                            Ukuran file maks: 10MB. Format yang didukung: PDF
                        </p>
                        <InputError message={errors.file} />
                    </form>

                    {/* Uploaded Files List */}
                    {course.knowledge_base && course.knowledge_base.length > 0 && (
                        <div className="mt-6">
                            <h4 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                File yang Diunggah
                            </h4>
                            <div className="space-y-2">
                                {course.knowledge_base.map((file) => (
                                    <div
                                        key={file.id}
                                        className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
                                    >
                                        <div className="flex items-center gap-3">
                                            <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M13,9V3.5L18.5,9H13Z" />
                                            </svg>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                    {file.file_name}
                                                </p>
                                                <p className="text-xs text-zinc-500">
                                                    Diunggah {new Date(file.uploaded_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(file.vector_status)}`}>
                                            {file.vector_status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Quick Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card p-6"
                    >
                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            Total Siswa
                        </p>
                        <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                            {course.students_count || 0}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card p-6"
                    >
                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            Grup
                        </p>
                        <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                            {course.groups_count || 0}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="card p-6"
                    >
                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            Status Basis Pengetahuan
                        </p>
                        <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            {course.knowledge_base?.length
                                ? course.knowledge_base.every((f) => f.vector_status === 'ready')
                                    ? '✓ Siap'
                                    : '⏳ Memproses'
                                : 'Belum diunggah'}
                        </p>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}
