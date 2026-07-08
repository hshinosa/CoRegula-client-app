import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Loader2, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { router } from '@inertiajs/react';

const headingStyle = {
    color: '#4A4A4A',
} as const;

interface LeaveGroupButtonProps {
    groupId: string;
    isOwner: boolean;
}

export function LeaveGroupButton({ groupId, isOwner }: LeaveGroupButtonProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [error, setError] = useState('');

    const handleLeave = useCallback(async () => {
        setIsLeaving(true);
        setError('');
        try {
            await axios.post(`/student/groups/${groupId}/leave`);
            router.visit('/student/courses');
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr.response?.data?.message ?? 'Gagal keluar dari grup');
            setIsLeaving(false);
        }
    }, [groupId]);

    return (
        <div className="space-y-3">
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-3 text-sm"
                    style={{
                        background: 'rgba(220,38,38,0.1)',
                        color: '#DC2626',
                        border: '1px solid rgba(220,38,38,0.2)',
                    }}
                >
                    {error}
                </motion.div>
            )}

            {isOwner && (
                <div
                    className="rounded-xl p-3 text-xs"
                    style={{
                        background: 'rgba(245,158,11,0.05)',
                        border: '1px solid rgba(245,158,11,0.15)',
                    }}
                >
                    <p className="text-amber-700">
                        Sebagai ketua, kepemilikan akan otomatis dipindah ke anggota terlama saat Anda keluar. Jika tidak ada anggota lain, kelompok akan dihapus.
                    </p>
                </div>
            )}

            <AnimatePresence>
                {showConfirm ? (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="rounded-xl p-4"
                        style={{
                            background: 'rgba(220,38,38,0.05)',
                            border: '1px solid rgba(220,38,38,0.15)',
                        }}
                    >
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-500" />
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold" style={headingStyle}>
                                    Keluar dari Grup?
                                </h4>
                                <p className="mt-1 text-xs text-brand-muted-dark">
                                    {isOwner
                                        ? 'Kepemilikan akan dipindah ke anggota terlama. Anda akan kehilangan akses ke semua diskusi kelompok ini.'
                                        : 'Anda akan kehilangan akses ke semua diskusi dan dokumen dalam kelompok ini.'}
                                </p>
                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={handleLeave}
                                        disabled={isLeaving}
                                        className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {isLeaving ? (
                                            <>
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Keluar...
                                            </>
                                        ) : (
                                            'Ya, Keluar'
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        disabled={isLeaving}
                                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setShowConfirm(true)}
                        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 transition-all"
                        style={{
                            background: 'rgba(220,38,38,0.05)',
                            border: '1px solid rgba(220,38,38,0.15)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(220,38,38,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(220,38,38,0.05)';
                        }}
                    >
                        <LogOut className="h-4 w-4" />
                        Keluar dari Grup
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
