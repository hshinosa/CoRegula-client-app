import React from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';

interface SessionSummaryModalProps {
    goalAchieved: boolean;
    topics: string[];
    contributions: Record<string, number>;
    assessment: string;
    isLoading: boolean;
    onClose: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
    goalAchieved,
    topics,
    contributions,
    assessment,
    isLoading,
    onClose,
}) => {
    return (
        <BaseModal open={true} title="Ringkasan Sesi Diskusi" onClose={onClose} size="lg" className="border border-white/50 p-6" closeOnOverlayClick>
            <div className="relative w-full rounded-2xl bg-white/95 shadow-xl backdrop-blur-md" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Tutup"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-brand-dark">Ringkasan Sesi Diskusi</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Berikut adalah ringkasan dari sesi diskusi yang baru saja selesai
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-brand-primary"></div>
                        <p className="mt-4 text-sm text-gray-600">Memproses ringkasan...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Goal Achievement */}
                        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4">
                            <div className="flex items-center gap-3">
                                {goalAchieved ? (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                                        <AlertCircle className="h-6 w-6 text-yellow-600" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-brand-dark">
                                        {goalAchieved ? 'Tujuan Pembelajaran Tercapai' : 'Tujuan Pembelajaran Belum Tercapai'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {goalAchieved 
                                            ? 'Diskusi telah mencapai tujuan yang ditetapkan' 
                                            : 'Perlu diskusi lebih lanjut untuk mencapai tujuan'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Topics Discussed */}
                        {topics.length > 0 && (
                            <div>
                                <h3 className="mb-3 text-lg font-semibold text-brand-dark">Topik yang Dibahas</h3>
                                <div className="flex flex-wrap gap-2">
                                    {topics.map((topic, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center rounded-full bg-brand-primary/10 px-3 py-1 text-sm font-medium text-brand-primary"
                                        >
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Contributions */}
                        {Object.keys(contributions).length > 0 && (
                            <div>
                                <h3 className="mb-3 text-lg font-semibold text-brand-dark">Kontribusi Peserta</h3>
                                <div className="overflow-hidden rounded-xl border border-gray-200">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                    Nama
                                                </th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                                    Jumlah Pesan
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {Object.entries(contributions)
                                                .sort(([, a], [, b]) => b - a)
                                                .map(([name, count]) => (
                                                    <tr key={name} className="transition-colors hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm text-gray-900">{name}</td>
                                                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                            {count}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Assessment */}
                        {assessment && (
                            <div>
                                <h3 className="mb-3 text-lg font-semibold text-brand-dark">Penilaian</h3>
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                                        {assessment}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Close Button */}
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={onClose}
                                className="rounded-xl bg-brand-primary px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-primary/90"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </BaseModal>
    );
};

export default SessionSummaryModal;
