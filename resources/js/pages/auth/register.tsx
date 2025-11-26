import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

import { InputError } from '@/components/ui/input-error';
import { InputLabel } from '@/components/ui/input-label';
import GuestLayout from '@/layouts/guest-layout';
import auth from '@/routes/auth';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'student' as 'student' | 'lecturer',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(auth.register.url());
    };

    return (
        <GuestLayout>
            <Head title="Buat Akun" />

            <div className="w-full max-w-md">
                <div className="card-elevated p-8">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                            Buat Akun
                        </h1>
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                            Bergabunglah dengan CoRegula untuk memulai pembelajaran kolaboratif
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="name" required>
                                Nama Lengkap
                            </InputLabel>
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="input-field mt-1"
                                placeholder="Nama Anda"
                                autoComplete="name"
                                autoFocus
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" required>
                                Alamat Email
                            </InputLabel>
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="input-field mt-1"
                                placeholder="anda@contoh.com"
                                autoComplete="email"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div>
                            <InputLabel htmlFor="role" required>
                                Saya adalah...
                            </InputLabel>
                            <div className="mt-2 flex gap-3">
                                <label className="flex flex-1 cursor-pointer items-center justify-center">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="student"
                                        checked={data.role === 'student'}
                                        onChange={(e) => setData('role', e.target.value as 'student')}
                                        className="sr-only"
                                    />
                                    <span
                                        className={`w-full rounded-lg border-2 px-4 py-3 text-center text-sm font-medium transition-all ${
                                            data.role === 'student'
                                                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                                                : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400'
                                        }`}
                                    >
                                        Mahasiswa
                                    </span>
                                </label>
                                <label className="flex flex-1 cursor-pointer items-center justify-center">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="lecturer"
                                        checked={data.role === 'lecturer'}
                                        onChange={(e) => setData('role', e.target.value as 'lecturer')}
                                        className="sr-only"
                                    />
                                    <span
                                        className={`w-full rounded-lg border-2 px-4 py-3 text-center text-sm font-medium transition-all ${
                                            data.role === 'lecturer'
                                                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                                                : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400'
                                        }`}
                                    >
                                        Dosen
                                    </span>
                                </label>
                            </div>
                            <InputError message={errors.role} />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" required>
                                Kata Sandi
                            </InputLabel>
                            <input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="input-field mt-1"
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div>
                            <InputLabel htmlFor="password_confirmation" required>
                                Konfirmasi Kata Sandi
                            </InputLabel>
                            <input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="input-field mt-1"
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            <InputError message={errors.password_confirmation} />
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
                                    Membuat Akun...
                                </span>
                            ) : (
                                'Buat Akun'
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
                        Sudah punya akun?{' '}
                        <Link
                            href={auth.login.url()}
                            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                        >
                            Masuk
                        </Link>
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}
