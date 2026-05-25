import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent, ReactNode, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle } from 'lucide-react';

import { InputError } from '@/components/ui/input-error';
import GuestLayout, { useTheme } from '@/layouts/guest-layout';
import { LiquidGlassCard, PrimaryButton } from '@/components/Welcome/utils/helpers';
import { refreshCsrfToken } from '@/lib/csrfRefresh';

interface VerifyEmailProps {
    email: string;
    success?: string;
}

export default function VerifyEmail({ email, success }: VerifyEmailProps) {
    const { lightMode } = useTheme();
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const { post: resendPost, processing: resendProcessing } = useForm({ email });

    useEffect(() => {
        void refreshCsrfToken();
    }, []);

    const handleResend = async (e: FormEvent) => {
        e.preventDefault();
        const refreshed = await refreshCsrfToken();
        if (!refreshed) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const retried = await refreshCsrfToken();
            if (!retried) return;
        }
        resendPost('/email/verify/resend');
    };

    return (
        <>
            <Head title="Verifikasi Email" />

            <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
                <LiquidGlassCard intensity="medium" lightMode={lightMode} className="w-full p-8 sm:p-10 transition-colors duration-500">
                    <div className="mb-6 text-center">
                        <div
                            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                            style={{
                                background: lightMode ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.2)',
                            }}
                        >
                            <Mail
                                size={28}
                                style={{ color: '#3b82f6' }}
                            />
                        </div>
                        <h1
                            className="text-2xl font-bold tracking-tight transition-colors duration-500"
                            style={{ color: lightMode ? '#4A4A4A' : '#f8fafc' }}
                        >
                            Verifikasi Email Anda
                        </h1>
                        <p
                            className="mt-1.5 text-sm transition-colors duration-500"
                            style={{ color: lightMode ? '#6B7280' : '#94a3b8' }}
                        >
                            Kami telah mengirim email verifikasi ke{' '}
                            <strong style={{ color: lightMode ? '#4A4A4A' : '#f8fafc' }}>
                                {email || 'email Anda'}
                            </strong>
                        </p>
                    </div>

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-4 rounded-lg border px-4 py-3 text-sm"
                            style={{
                                backgroundColor: lightMode ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.15)',
                                borderColor: lightMode ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.3)',
                                color: lightMode ? '#059669' : '#34d399',
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} />
                                <span>{success}</span>
                            </div>
                        </motion.div>
                    )}

                    {errors.email && (
                        <div className="mb-4">
                            <InputError message={errors.email} />
                        </div>
                    )}

                    <div
                        className="mb-6 rounded-xl p-4 text-sm"
                        style={{
                            background: lightMode ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.1)',
                            border: `1px solid ${lightMode ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.25)'}`,
                            color: lightMode ? '#4A4A4A' : '#e2e8f0',
                        }}
                    >
                        <p className="mb-2 font-medium">Langkah selanjutnya:</p>
                        <ol className="list-inside list-decimal space-y-1" style={{ color: lightMode ? '#64748b' : '#94a3b8' }}>
                            <li>Buka kotak masuk email Anda</li>
                            <li>Cari email dari Kolabri (periksa folder spam jika tidak ada)</li>
                            <li>Klik tombol verifikasi di dalam email</li>
                        </ol>
                    </div>

                    <form onSubmit={handleResend} className="space-y-4">
                        <input type="hidden" name="email" value={email} />

                        <PrimaryButton className="w-full justify-center" disabled={resendProcessing}>
                            {resendProcessing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Mengirim...
                                </span>
                            ) : (
                                'Kirim Ulang Email Verifikasi'
                            )}
                        </PrimaryButton>
                    </form>

                    <p
                        className="mt-6 text-center text-sm transition-colors"
                        style={{ color: lightMode ? '#64748b' : '#94a3b8' }}
                    >
                        <Link
                            href="/login"
                            className="font-medium text-[#88161c] hover:underline"
                        >
                            Kembali ke Masuk
                        </Link>
                    </p>
                </LiquidGlassCard>
            </motion.div>
        </>
    );
}

VerifyEmail.layout = (page: ReactNode) => <GuestLayout>{page}</GuestLayout>;
