import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';

import { InputError } from '@/components/ui/input-error';
import GuestLayout, { useTheme } from '@/layouts/guest-layout';
import { LiquidGlassCard, PrimaryButton } from '@/components/Welcome/utils/helpers';
import { refreshCsrfToken } from '@/lib/csrfRefresh';

export default function ForgotPassword() {
    const { lightMode } = useTheme();
    const [emailSent, setEmailSent] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    useEffect(() => {
        void refreshCsrfToken();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const refreshed = await refreshCsrfToken();
        if (!refreshed) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const retried = await refreshCsrfToken();
            if (!retried) return;
        }
        post('/forgot-password', {
            preserveScroll: true,
            onSuccess: () => setEmailSent(true),
            onError: () => {},
        });
    };

    const inputStyles = {
        backgroundColor: lightMode ? '#ffffff' : 'rgba(30, 41, 59, 0.6)',
        borderColor: lightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)',
        color: lightMode ? '#1e293b' : '#f8fafc',
    };

    return (
        <>
            <Head title="Lupa Kata Sandi" />

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
                                background: lightMode ? 'rgba(136,22,28,0.08)' : 'rgba(136,22,28,0.2)',
                            }}
                        >
                            <Mail
                                size={28}
                                style={{ color: '#88161c' }}
                            />
                        </div>
                        <h1
                            className="text-2xl font-bold tracking-tight transition-colors duration-500"
                            style={{ color: lightMode ? '#4A4A4A' : '#f8fafc' }}
                        >
                            Lupa Kata Sandi?
                        </h1>
                        <p
                            className="mt-1.5 text-sm transition-colors duration-500"
                            style={{ color: lightMode ? '#6B7280' : '#94a3b8' }}
                        >
                            {emailSent
                                ? 'Silakan periksa kotak masuk email Anda'
                                : 'Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi'}
                        </p>
                    </div>

                    {emailSent ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div
                                className="mb-4 rounded-xl p-4"
                                style={{
                                    background: lightMode ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.15)',
                                    border: `1px solid ${lightMode ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.3)'}`,
                                }}
                            >
                                <p className="text-sm" style={{ color: lightMode ? '#059669' : '#34d399' }}>
                                    Tautan reset sandi telah dikirim ke <strong>{data.email}</strong>.
                                    Silakan periksa kotak masuk dan folder spam Anda.
                                </p>
                            </div>

                            <PrimaryButton
                                className="w-full justify-center"
                                onClick={() => setEmailSent(false)}
                            >
                                Kirim Ulang
                            </PrimaryButton>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium transition-colors duration-500"
                                    style={{ color: lightMode ? '#4A4A4A' : '#e2e8f0' }}
                                >
                                    Alamat Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-2 w-full rounded-xl border px-4 py-3 shadow-sm transition-colors focus:border-[#88161c] focus:ring focus:ring-[#88161c] focus:ring-opacity-50"
                                    style={inputStyles}
                                    placeholder="anda@contoh.com"
                                    autoComplete="email"
                                    autoFocus
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="pt-2">
                                <PrimaryButton className="w-full justify-center" disabled={processing}>
                                    {processing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Mengirim...
                                        </span>
                                    ) : (
                                        'Kirim Tautan Reset'
                                    )}
                                </PrimaryButton>
                            </div>
                        </form>
                    )}

                    <p
                        className="mt-6 text-center text-sm transition-colors"
                        style={{ color: lightMode ? '#64748b' : '#94a3b8' }}
                    >
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1 font-medium text-[#88161c] hover:underline"
                        >
                            <ArrowLeft size={14} />
                            Kembali ke Masuk
                        </Link>
                    </p>
                </LiquidGlassCard>
            </motion.div>
        </>
    );
}

ForgotPassword.layout = (page: ReactNode) => <GuestLayout>{page}</GuestLayout>;
