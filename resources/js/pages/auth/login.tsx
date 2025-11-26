import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import { InputError } from '@/components/ui/input-error';
import { InputLabel } from '@/components/ui/input-label';
import GuestLayout from '@/layouts/guest-layout';
import auth from '@/routes/auth';

export default function Login() {
    const [loginAs, setLoginAs] = useState<'lecturer' | 'student'>('student');

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(auth.login.url());
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />

            <div className="w-full">
                <div className="card-elevated p-8">
                    {/* Academic Header */}
                    <div className="mb-8 text-center">
                        <h2 className="font-heading text-2xl font-bold text-primary-900 dark:text-zinc-100">
                            Selamat Datang Kembali
                        </h2>
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                            Masuk untuk melanjutkan perjalanan belajar Anda
                        </p>
                    </div>

                    {/* Role Toggle - Academic Style */}
                    <div className="mb-6">
                        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Pilih Peran Anda
                        </p>
                        <div className="flex rounded-lg border-2 border-primary-100 bg-primary-50 p-1 dark:border-zinc-700 dark:bg-zinc-800">
                            <button
                                type="button"
                                onClick={() => setLoginAs('student')}
                                className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all ${
                                    loginAs === 'student'
                                        ? 'bg-white text-primary-700 shadow-sm dark:bg-zinc-700 dark:text-primary-300'
                                        : 'text-zinc-600 hover:text-primary-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                                }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                    Mahasiswa
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setLoginAs('lecturer')}
                                className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all ${
                                    loginAs === 'lecturer'
                                        ? 'bg-white text-primary-700 shadow-sm dark:bg-zinc-700 dark:text-primary-300'
                                        : 'text-zinc-600 hover:text-primary-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                                }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                    Dosen
                                </span>
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="email">
                                <span className="flex items-center gap-1">
                                    <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Alamat Email
                                </span>
                            </InputLabel>
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="input-field mt-1"
                                placeholder="anda@universitas.ac.id"
                                autoComplete="email"
                                autoFocus
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div>
                            <InputLabel htmlFor="password">
                                <span className="flex items-center gap-1">
                                    <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Kata Sandi
                                </span>
                            </InputLabel>
                            <input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="input-field mt-1"
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Memproses...
                                </span>
                            ) : (
                                'Masuk'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="divider-ornament my-6">
                        <span className="bg-white px-3 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:bg-zinc-900">
                            atau
                        </span>
                    </div>

                    <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                        Baru di CoRegula?{' '}
                        <Link
                            href={auth.register.url()}
                            className="font-semibold text-primary-700 hover:text-primary-600 hover:underline dark:text-primary-400"
                        >
                            Buat Akun
                        </Link>
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}
