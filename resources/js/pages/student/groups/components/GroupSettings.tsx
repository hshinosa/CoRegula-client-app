import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Loader2, AlertTriangle } from 'lucide-react';
import { InputError } from '@/components/ui/input-error';
import type { GroupSettings as GroupSettingsType, UpdateGroupSettingsData } from '@/types';

const headingStyle = {
    color: '#4A4A4A',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
} as const;

const bodyTextClass = 'text-sm text-[#6B7280]';

const accessPolicyOptions = [
    { value: 'open', label: 'Terbuka', desc: 'Siapa saja dapat bergabung' },
    { value: 'invite_only', label: 'Undangan', desc: 'Hanya melalui undangan' },
    { value: 'private', label: 'Privat', desc: 'Hanya pemilik yang dapat menambah' },
] as const;

interface GroupSettingsFormProps {
    settings: GroupSettingsType;
    isAdmin: boolean;
    onSave: (data: UpdateGroupSettingsData) => Promise<void>;
}

export function GroupSettingsForm({ settings, isAdmin, onSave }: GroupSettingsFormProps) {
    const [name, setName] = useState(settings.name);
    const [description, setDescription] = useState(settings.description ?? '');
    const [accessPolicy, setAccessPolicy] = useState(settings.access_policy);
    const [showPolicyConfirm, setShowPolicyConfirm] = useState(false);
    const [pendingPolicy, setPendingPolicy] = useState<typeof settings.access_policy | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const hasChanges = name !== settings.name ||
        description !== (settings.description ?? '') ||
        accessPolicy !== settings.access_policy;

    const validate = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};
        if (name.length < 3) newErrors.name = 'Nama minimal 3 karakter';
        if (name.length > 100) newErrors.name = 'Nama maksimal 100 karakter';
        if (description.length > 500) newErrors.description = 'Deskripsi maksimal 500 karakter';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [name, description]);

    const handlePolicyChange = useCallback((newPolicy: typeof settings.access_policy) => {
        if (newPolicy !== accessPolicy) {
            setPendingPolicy(newPolicy);
            setShowPolicyConfirm(true);
        }
    }, [accessPolicy]);

    const confirmPolicyChange = useCallback(() => {
        if (pendingPolicy) {
            setAccessPolicy(pendingPolicy);
            setShowPolicyConfirm(false);
            setPendingPolicy(null);
        }
    }, [pendingPolicy]);

    const handleSubmit = useCallback(async () => {
        if (!validate()) return;

        setIsSaving(true);
        setSuccessMessage('');
        try {
            await onSave({
                name,
                description: description || null,
                access_policy: accessPolicy,
            });
            setSuccessMessage('Pengaturan berhasil disimpan');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch {
            setErrors({ general: 'Gagal menyimpan pengaturan' });
        } finally {
            setIsSaving(false);
        }
    }, [name, description, accessPolicy, validate, onSave]);

    if (!isAdmin) {
        return (
            <div
                className="flex flex-col items-center justify-center rounded-xl py-12"
                style={{ background: 'rgba(0,0,0,0.02)' }}
            >
                <Settings className="mb-3 h-12 w-12 text-gray-300" />
                <h4 className="text-sm font-semibold" style={headingStyle}>
                    Akses Terbatas
                </h4>
                <p className={`mt-1 ${bodyTextClass}`}>
                    Hanya admin dan pemilik grup yang dapat mengubah pengaturan
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {successMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-3 text-sm"
                    style={{
                        background: 'rgba(22,163,74,0.1)',
                        color: '#16A34A',
                        border: '1px solid rgba(22,163,74,0.2)',
                    }}
                >
                    {successMessage}
                </motion.div>
            )}

            {errors.general && (
                <InputError message={errors.general} />
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: '#4A4A4A' }}>
                    Nama Grup
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-[#88161c] focus:outline-none"
                    maxLength={100}
                />
                {errors.name && <InputError message={errors.name} />}
                <p className="text-xs text-[#6B7280]">{name.length}/100 karakter</p>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: '#4A4A4A' }}>
                    Deskripsi
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-[#88161c] focus:outline-none"
                    rows={3}
                    maxLength={500}
                    placeholder="Deskripsi grup (opsional)"
                />
                {errors.description && <InputError message={errors.description} />}
                <p className="text-xs text-[#6B7280]">{description.length}/500 karakter</p>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: '#4A4A4A' }}>
                    Kebijakan Akses
                </label>
                <div className="space-y-2">
                    {accessPolicyOptions.map((option) => (
                        <label
                            key={option.value}
                            className="flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all"
                            style={{
                                background: accessPolicy === option.value
                                    ? 'rgba(136,22,28,0.05)'
                                    : 'transparent',
                                border: accessPolicy === option.value
                                    ? '1px solid rgba(136,22,28,0.2)'
                                    : '1px solid rgba(0,0,0,0.06)',
                            }}
                        >
                            <input
                                type="radio"
                                name="access_policy"
                                value={option.value}
                                checked={accessPolicy === option.value}
                                onChange={() => handlePolicyChange(option.value)}
                                className="h-4 w-4 text-[#88161c] focus:ring-[#88161c]"
                            />
                            <div>
                                <p className="text-sm font-medium" style={{ color: '#4A4A4A' }}>
                                    {option.label}
                                </p>
                                <p className="text-xs text-[#6B7280]">{option.desc}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {showPolicyConfirm && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-4"
                    style={{
                        background: 'rgba(245,158,11,0.1)',
                        border: '1px solid rgba(245,158,11,0.2)',
                    }}
                >
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                        <div>
                            <h4 className="text-sm font-semibold text-amber-800">
                                Ubah Kebijakan Akses?
                            </h4>
                            <p className="mt-1 text-xs text-amber-700">
                                Mengubah kebijakan akses akan mempengaruhi cara anggota baru bergabung.
                            </p>
                            <div className="mt-3 flex gap-2">
                                <button
                                    onClick={confirmPolicyChange}
                                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                                    style={{ background: '#88161c' }}
                                >
                                    Ya, Ubah
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPolicyConfirm(false);
                                        setPendingPolicy(null);
                                    }}
                                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600"
                                    style={{ background: 'rgba(0,0,0,0.05)' }}
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={!hasChanges || isSaving}
                    className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium text-white transition-all disabled:opacity-50"
                    style={{ background: '#88161c' }}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Simpan Perubahan
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
