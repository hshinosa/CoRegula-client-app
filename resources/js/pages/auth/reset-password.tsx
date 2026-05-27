import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, ReactNode, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, KeyRound } from 'lucide-react';

import { InputError } from '@/components/ui/input-error';
import GuestLayout, { useTheme } from '@/layouts/guest-layout';
import { LiquidGlassCard, PrimaryButton } from '@/components/Welcome/utils/helpers';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';
import { refreshCsrfToken } from '@/lib/csrfRefresh';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { lightMode } = useTheme();
    const { data, setData, post, processing, errors } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
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
        post('/reset-password', {
            preserveScroll: true,
        });
    };

    const inputStyles = {
        backgroundColor: lightMode ? '#ffffff' : 'rgba(30, 41, 59, 0.6)',
        borderColor: lightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)',
        color: lightMode ? '#1e293b' : '#f8fafc',
    };

    return (
        <>
            <Head title="Reset Kata Sandi" />

            <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
                <LiquidGlassCard intensity="medium" lightMode={lightMode} className="w-full p-8 sm:p-10 transition-colors duration-500">
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/8 dark:bg-brand-primary/20">
                            <KeyRound size={28} className="text-brand-primary" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-brand-dark dark:text-slate-50">
                            Atur Ulang Kata Sandi
                        </h1>
                        <p className="mt-1.5 text-sm text-brand-muted-dark dark:text-slate-400">
                            Masukkan kata sandi baru untuk akun Anda
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-brand-dark dark:text-slate-200"
                            >
                                Alamat Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="mt-2 w-full rounded-xl border px-4 py-3 shadow-brand-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                                style={inputStyles}
                                autoComplete="email"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-brand-dark dark:text-slate-200"
                            >
                                Kata Sandi Baru
                            </label>
                            <PasswordInput
                                id="password"
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                lightMode={lightMode}
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            <InputError message={errors.password} />
                            <PasswordStrengthMeter password={data.password} lightMode={lightMode} />
                        </div>

                        <div>
                            <label
                                htmlFor="password_confirmation"
                                className="block text-sm font-medium text-brand-dark dark:text-slate-200"
                            >
                                Konfirmasi Kata Sandi Baru
                            </label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                lightMode={lightMode}
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <div className="pt-2">
                            <PrimaryButton className="w-full justify-center" disabled={processing}>
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Mengatur ulang...
                                    </span>
                                ) : (
                                    'Atur Ulang Kata Sandi'
                                )}
                            </PrimaryButton>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1 font-medium text-brand-primary hover:underline"
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

ResetPassword.layout = (page: ReactNode) => <GuestLayout>{page}</GuestLayout>;
