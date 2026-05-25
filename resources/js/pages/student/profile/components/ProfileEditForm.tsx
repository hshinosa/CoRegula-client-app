import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Save, X, Loader2, User, Mail, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import { sanitizeText } from '@/utils/sanitize';

interface ProfileData {
    id: string;
    name: string;
    email: string;
    nim: string;
    role: string;
}

interface Props {
    profile: ProfileData;
    onProfileUpdate: (profile: ProfileData) => void;
}

const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

export default function ProfileEditForm({ profile, onProfileUpdate }: Props) {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: profile.name, email: profile.email });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleEdit = useCallback(() => {
        setForm({ name: profile.name, email: profile.email });
        setErrors({});
        setEditing(true);
    }, [profile]);

    const handleCancel = useCallback(() => {
        setEditing(false);
        setErrors({});
    }, []);

    const validate = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};
        if (!form.name.trim()) {
            newErrors.name = 'Nama wajib diisi';
        } else if (form.name.trim().length < 2) {
            newErrors.name = 'Nama minimal 2 karakter';
        }
        if (!form.email.trim()) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = 'Format email tidak valid';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [form]);

    const handleSave = useCallback(async () => {
        if (!validate()) return;

        setSaving(true);
        try {
            const res = await fetch('/student/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
                body: JSON.stringify({ name: form.name.trim(), email: form.email.trim() }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(data.message || 'Profil berhasil diperbarui');
                onProfileUpdate({ ...profile, ...form });
                setEditing(false);
            } else if (res.status === 422) {
                const data = await res.json();
                if (data.errors) {
                    const serverErrors: Record<string, string> = {};
                    Object.entries(data.errors).forEach(([key, msgs]) => {
                        serverErrors[key] = (msgs as string[])[0];
                    });
                    setErrors(serverErrors);
                }
            } else {
                toast.error('Gagal memperbarui profil');
            }
        } catch {
            toast.error('Terjadi kesalahan jaringan');
        } finally {
            setSaving(false);
        }
    }, [form, validate, profile, onProfileUpdate]);

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Informasi Profil
                </h2>
                {!editing && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEdit}
                        className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                    </motion.button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {editing ? (
                    <motion.div
                        key="editing"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Nama Lengkap
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => {
                                        setForm((prev) => ({ ...prev, name: e.target.value }));
                                        if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                                    }}
                                    className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                                        errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => {
                                        setForm((prev) => ({ ...prev, email: e.target.value }));
                                        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                                    }}
                                    className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                                        errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Masukkan email"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                NIM
                            </label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={profile.nim}
                                    disabled
                                    className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 py-2.5 pl-10 pr-4 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-400">NIM tidak dapat diubah</p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCancel}
                                disabled={saving}
                                className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                            >
                                <X className="h-4 w-4" />
                                Batal
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2.5 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="viewing"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                            <User className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Nama</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {sanitizeText(profile.name)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {sanitizeText(profile.email)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                            <Hash className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">NIM</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {sanitizeText(profile.nim || '-')}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
