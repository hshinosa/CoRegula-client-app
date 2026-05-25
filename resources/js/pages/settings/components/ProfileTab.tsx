import { motion } from 'framer-motion';
import { Camera, Mail, Save, User as UserIcon } from 'lucide-react';
import { useState, useRef, ChangeEvent } from 'react';
import { LiquidGlassCard } from '@/components/Welcome/utils/helpers';
import { InputError } from '@/components/ui/input-error';

interface ProfileTabProps {
    profile: { name: string; email: string; avatar?: string | null };
    onSave: (data: { name: string; email: string; avatar?: File }) => Promise<void>;
    saving: boolean;
}

export function ProfileTab({ profile, onSave, saving }: ProfileTabProps) {
    const [form, setForm] = useState({ name: profile.name, email: profile.email });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar ?? null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [hasChanges, setHasChanges] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleInputChange = (field: 'name' | 'email', value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, avatar: 'Ukuran file maksimal 2MB' }));
            return;
        }

        if (!file.type.startsWith('image/')) {
            setErrors(prev => ({ ...prev, avatar: 'File harus berupa gambar' }));
            return;
        }

        setAvatarFile(file);
        setHasChanges(true);
        setErrors(prev => ({ ...prev, avatar: '' }));

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        const newErrors: Record<string, string> = {};

        if (!form.name.trim()) {
            newErrors.name = 'Nama wajib diisi';
        }

        if (!form.email.trim()) {
            newErrors.email = 'Email wajib diisi';
        } else if (!validateEmail(form.email)) {
            newErrors.email = 'Format email tidak valid';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        await onSave({ ...form, avatar: avatarFile ?? undefined });
        setHasChanges(false);
    };

    return (
        <div className="space-y-6">
            <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                <h2 className="mb-6 text-lg font-semibold text-neutral-800">
                    Informasi Profil
                </h2>

                <div className="mb-6 flex items-center gap-6">
                    <div className="relative">
                        <div className="h-24 w-24 overflow-hidden rounded-full bg-neutral-200">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <UserIcon className="h-12 w-12 text-neutral-400" />
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 rounded-full bg-primary-600 p-2 text-white shadow-lg transition-all hover:bg-primary-700"
                        >
                            <Camera className="h-4 w-4" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-neutral-700">Foto Profil</p>
                        <p className="text-xs text-neutral-500">JPG, PNG, atau GIF. Maksimal 2MB.</p>
                        {errors.avatar && <InputError message={errors.avatar} className="mt-1" />}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Nama Lengkap
                    </label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        placeholder="Masukkan nama lengkap"
                    />
                    {errors.name && <InputError message={errors.name} className="mt-1" />}
                </div>

                <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full rounded-xl border border-neutral-300 bg-white py-3 pl-10 pr-4 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            placeholder="email@example.com"
                        />
                    </div>
                    {errors.email && <InputError message={errors.email} className="mt-1" />}
                    {form.email !== profile.email && (
                        <p className="mt-2 text-xs text-caution-600">
                            Mengubah email akan mengirim verifikasi ke email baru Anda
                        </p>
                    )}
                </div>

                <motion.button
                    onClick={handleSubmit}
                    disabled={saving || !hasChanges}
                    whileHover={{ scale: hasChanges ? 1.02 : 1 }}
                    whileTap={{ scale: hasChanges ? 0.98 : 1 }}
                    className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </motion.button>
            </LiquidGlassCard>
        </div>
    );
}
