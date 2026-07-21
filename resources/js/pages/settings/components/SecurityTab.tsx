import { motion, AnimatePresence } from 'framer-motion';
import { Key, Save } from 'lucide-react';
import { useState } from 'react';
import { LiquidGlassCard } from '@/components/Welcome/utils/helpers';
import { InputError } from '@/components/ui/input-error';
import { PasswordInput } from '@/components/ui/PasswordInput';

interface SecurityTabProps {
    onPasswordChange: (data: { current_password: string; password: string; password_confirmation: string }) => Promise<void>;
    saving: boolean;
}

export function SecurityTab({ onPasswordChange, saving }: SecurityTabProps) {
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

    const handlePasswordSubmit = async () => {
        const errors: Record<string, string> = {};

        if (!passwordForm.current_password) {
            errors.current_password = 'Password saat ini wajib diisi';
        }

        if (!passwordForm.password) {
            errors.password = 'Password baru wajib diisi';
        } else if (passwordForm.password.length < 8) {
            errors.password = 'Password minimal 8 karakter';
        }

        if (passwordForm.password !== passwordForm.password_confirmation) {
            errors.password_confirmation = 'Konfirmasi password tidak cocok';
        }

        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }

        await onPasswordChange(passwordForm);
        setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
        setPasswordErrors({});
    };

    return (
        <div className="space-y-6">
            <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(136,22,28,0.08)' }}>
                        <Key className="h-5 w-5 text-brand-primary" />
                    </div>
                    <h2 className="text-lg font-semibold text-brand-dark">
                        Ubah Password
                    </h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-brand-muted-dark">
                            Password Saat Ini
                        </label>
                        <PasswordInput
                            value={passwordForm.current_password}
                            onChange={(e) => {
                                setPasswordForm(prev => ({ ...prev, current_password: e.target.value }));
                                setPasswordErrors(prev => ({ ...prev, current_password: '' }));
                            }}
                            placeholder="Masukkan password saat ini"
                        />
                        {passwordErrors.current_password && (
                            <InputError message={passwordErrors.current_password} className="mt-1" />
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-brand-muted-dark">
                            Password Baru
                        </label>
                        <PasswordInput
                            value={passwordForm.password}
                            onChange={(e) => {
                                setPasswordForm(prev => ({ ...prev, password: e.target.value }));
                                setPasswordErrors(prev => ({ ...prev, password: '' }));
                            }}
                            placeholder="Masukkan password baru"
                        />
                        {passwordErrors.password && (
                            <InputError message={passwordErrors.password} className="mt-1" />
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-brand-muted-dark">
                            Konfirmasi Password Baru
                        </label>
                        <PasswordInput
                            value={passwordForm.password_confirmation}
                            onChange={(e) => {
                                setPasswordForm(prev => ({ ...prev, password_confirmation: e.target.value }));
                                setPasswordErrors(prev => ({ ...prev, password_confirmation: '' }));
                            }}
                            placeholder="Ketik ulang password baru"
                        />
                        {passwordErrors.password_confirmation && (
                            <InputError message={passwordErrors.password_confirmation} className="mt-1" />
                        )}
                    </div>

                    <motion.button
                        onClick={handlePasswordSubmit}
                        disabled={saving}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-medium text-white transition-all hover:bg-brand-primary-light disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Menyimpan...' : 'Ubah Password'}
                    </motion.button>
                </div>
            </LiquidGlassCard>

        </div>
    );
}
