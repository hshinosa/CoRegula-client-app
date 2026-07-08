import { motion, AnimatePresence } from 'framer-motion';
import { Key, Trash2, AlertTriangle, X, Save } from 'lucide-react';
import { useState } from 'react';
import { LiquidGlassCard } from '@/components/Welcome/utils/helpers';
import { BaseModal } from '@/components/ui/BaseModal';
import { InputError } from '@/components/ui/input-error';
import { PasswordInput } from '@/components/ui/PasswordInput';

interface SecurityTabProps {
    onPasswordChange: (data: { current_password: string; password: string; password_confirmation: string }) => Promise<void>;
    onAccountDelete: (data: { password: string; confirmation: string }) => Promise<void>;
    saving: boolean;
}

export function SecurityTab({ onPasswordChange, onAccountDelete, saving }: SecurityTabProps) {
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteForm, setDeleteForm] = useState({ password: '', confirmation: '' });
    const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});

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

    const handleDeleteSubmit = async () => {
        const errors: Record<string, string> = {};

        if (!deleteForm.password) {
            errors.password = 'Password wajib diisi';
        }

        if (deleteForm.confirmation !== 'HAPUS') {
            errors.confirmation = 'Ketik "HAPUS" untuk konfirmasi';
        }

        if (Object.keys(errors).length > 0) {
            setDeleteErrors(errors);
            return;
        }

        await onAccountDelete(deleteForm);
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

            <LiquidGlassCard intensity="medium" className="border-2 border-warning-200 p-6" lightMode={true}>
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-lg bg-warning-50 p-2">
                        <Trash2 className="h-5 w-5 text-warning-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-brand-dark">
                        Hapus Akun
                    </h2>
                </div>

                <div className="mb-4 rounded-xl bg-warning-50 p-4">
                    <div className="flex gap-3">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-warning-600" />
                        <div className="text-sm text-warning-800">
                            <p className="font-semibold">Peringatan!</p>
                            <p className="mt-1">
                                Menghapus akun akan menghapus semua data Anda secara permanen setelah 30 hari. 
                                Anda akan menerima email dengan link untuk membatalkan penghapusan dalam periode tersebut.
                            </p>
                        </div>
                    </div>
                </div>

                <motion.button
                    onClick={() => setShowDeleteModal(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 rounded-xl bg-warning-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-warning-700"
                >
                    <Trash2 className="h-4 w-4" />
                    Hapus Akun Saya
                </motion.button>
            </LiquidGlassCard>

            <BaseModal open={showDeleteModal} title="Konfirmasi Penghapusan Akun" onClose={() => setShowDeleteModal(false)} size="md" className="rounded-2xl bg-white p-6 shadow-2xl">
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-brand-dark">Konfirmasi Penghapusan Akun</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="rounded-lg p-1 transition-colors hover:bg-[rgba(136,22,28,0.04)]"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mb-6 rounded-xl bg-warning-50 p-4">
                                <p className="text-sm text-warning-800">
                                    Tindakan ini tidak dapat dibatalkan setelah 30 hari. Semua data Anda akan dihapus permanen.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-brand-muted-dark">
                                        Password Anda
                                    </label>
                                    <PasswordInput
                                        value={deleteForm.password}
                                        onChange={(e) => {
                                            setDeleteForm(prev => ({ ...prev, password: e.target.value }));
                                            setDeleteErrors(prev => ({ ...prev, password: '' }));
                                        }}
                                        placeholder="Masukkan password"
                                    />
                                    {deleteErrors.password && (
                                        <InputError message={deleteErrors.password} className="mt-1" />
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-brand-muted-dark">
                                        Ketik <strong>HAPUS</strong> untuk konfirmasi
                                    </label>
                                    <input
                                        type="text"
                                        value={deleteForm.confirmation}
                                        onChange={(e) => {
                                            setDeleteForm(prev => ({ ...prev, confirmation: e.target.value }));
                                            setDeleteErrors(prev => ({ ...prev, confirmation: '' }));
                                        }}
                                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm transition-all focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                        placeholder="HAPUS"
                                    />
                                    {deleteErrors.confirmation && (
                                        <InputError message={deleteErrors.confirmation} className="mt-1" />
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-brand-muted-dark transition-all hover:bg-[rgba(136,22,28,0.04)]"
                                >
                                    Batal
                                </button>
                                <motion.button
                                    onClick={handleDeleteSubmit}
                                    disabled={saving}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 rounded-xl bg-warning-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-warning-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving ? 'Menghapus...' : 'Hapus Akun'}
                                </motion.button>
                            </div>
                        </div>
            </BaseModal>
        </div>
    );
}
