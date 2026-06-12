import { motion } from 'framer-motion';
import { Eye, Bot, Share2, ExternalLink, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LiquidGlassCard } from '@/components/Welcome/utils/helpers';

interface PrivacyPreferences {
    analyticsVisibility: boolean;
    aiInteractionConsent: boolean;
    dataSharingConsent: boolean;
}

interface StatusMessage {
    type: 'success' | 'error';
    text: string;
}

const DEFAULT_PREFERENCES: PrivacyPreferences = {
    analyticsVisibility: false,
    aiInteractionConsent: false,
    dataSharingConsent: false,
};

const ENDPOINT = '/api/user/privacy-preferences';
const POLICY_URL = '/api/privacy/policy';

const getCsrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

export function PrivacyTab() {
    const [preferences, setPreferences] = useState<PrivacyPreferences>(DEFAULT_PREFERENCES);
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState<keyof PrivacyPreferences | null>(null);
    const [message, setMessage] = useState<StatusMessage | null>(null);
    const rollbackRef = useRef<PrivacyPreferences>(DEFAULT_PREFERENCES);

    useEffect(() => {
        const controller = new AbortController();

        const loadPreferences = async () => {
            try {
                const response = await fetch(ENDPOINT, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                    },
                    credentials: 'same-origin',
                    signal: controller.signal,
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message ?? 'Gagal memuat preferensi privasi');
                }

                const nextPreferences = {
                    analyticsVisibility: Boolean(result.data?.analyticsVisibility ?? result.analyticsVisibility ?? false),
                    aiInteractionConsent: Boolean(result.data?.aiInteractionConsent ?? result.aiInteractionConsent ?? false),
                    dataSharingConsent: Boolean(result.data?.dataSharingConsent ?? result.dataSharingConsent ?? false),
                } satisfies PrivacyPreferences;

                setPreferences(nextPreferences);
                rollbackRef.current = nextPreferences;
            } catch (error) {
                if (!controller.signal.aborted) {
                    setMessage({
                        type: 'error',
                        text: error instanceof Error ? error.message : 'Terjadi kesalahan jaringan',
                    });
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        void loadPreferences();

        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (!message) return;

        const timeout = window.setTimeout(() => setMessage(null), 4000);
        return () => window.clearTimeout(timeout);
    }, [message]);

    const privacyTypes = useMemo(() => ([
        {
            key: 'analyticsVisibility' as const,
            label: 'Visibilitas Analitik',
            description: 'Izinkan data analitik Anda dilihat oleh dosen',
            icon: Eye,
        },
        {
            key: 'aiInteractionConsent' as const,
            label: 'Interaksi AI',
            description: 'Izinkan AI memberikan respons dan scaffolding dalam diskusi',
            icon: Bot,
        },
        {
            key: 'dataSharingConsent' as const,
            label: 'Berbagi Data',
            description: 'Izinkan data digunakan untuk penelitian dan peningkatan layanan',
            icon: Share2,
        },
    ]), []);

    const persistPreferences = async (nextPreferences: PrivacyPreferences, changedKey: keyof PrivacyPreferences) => {
        setSavingKey(changedKey);

        try {
            const response = await fetch(ENDPOINT, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'same-origin',
                body: JSON.stringify(nextPreferences),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message ?? 'Gagal menyimpan preferensi privasi');
            }

            rollbackRef.current = nextPreferences;
            setMessage({ type: 'success', text: result.message ?? 'Preferensi privasi berhasil disimpan' });
        } catch (error) {
            setPreferences(rollbackRef.current);
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Terjadi kesalahan jaringan',
            });
        } finally {
            setSavingKey(null);
        }
    };

    const handleToggle = (key: keyof PrivacyPreferences) => {
        if (loading || savingKey) {
            return;
        }

        const nextPreferences = { ...preferences, [key]: !preferences[key] };
        setPreferences(nextPreferences);
        void persistPreferences(nextPreferences, key);
    };

    return (
        <div className="space-y-6">
            <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-lg bg-primary-50 p-2">
                        <ShieldCheck className="h-5 w-5 text-primary-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-neutral-800">Preferensi Privasi</h2>
                </div>

                {message && (
                    <div
                        className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
                            message.type === 'success'
                                ? 'border-success-200 bg-success-50 text-success-800'
                                : 'border-warning-200 bg-warning-50 text-warning-800'
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <div className="space-y-4">
                    {privacyTypes.map((type) => (
                        <motion.div
                            key={type.key}
                            className="flex items-start justify-between rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-primary-300"
                            whileHover={{ scale: 1.01 }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="rounded-lg bg-primary-50 p-2">
                                    <type.icon className="h-5 w-5 text-primary-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-neutral-800">{type.label}</p>
                                    <p className="text-sm text-neutral-500">{type.description}</p>
                                    {loading && <p className="mt-1 text-xs text-neutral-400">Memuat preferensi...</p>}
                                    {savingKey === type.key && <p className="mt-1 text-xs text-primary-600">Menyimpan perubahan...</p>}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleToggle(type.key)}
                                disabled={loading || savingKey !== null}
                                aria-pressed={preferences[type.key]}
                                className={`relative h-6 w-11 rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                                    preferences[type.key] ? 'bg-primary-600' : 'bg-neutral-300'
                                }`}
                            >
                                <motion.div
                                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"
                                    animate={{ left: preferences[type.key] ? '22px' : '2px' }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            </button>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-6 rounded-xl bg-primary-50 p-4">
                    <p className="text-sm text-primary-800">
                        <strong>Catatan:</strong> Perubahan preferensi privasi akan disimpan secara otomatis.
                    </p>
                </div>
            </LiquidGlassCard>

            <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                <h2 className="mb-4 text-lg font-semibold text-neutral-800">Kebijakan Privasi</h2>
                <p className="mb-4 text-sm text-neutral-500">
                    Pelajari bagaimana data Anda dikelola, digunakan, dan dilindungi di platform Kolabri.
                </p>
                <a
                    href={POLICY_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:underline"
                >
                    Lihat Kebijakan Privasi
                    <ExternalLink className="h-4 w-4" />
                </a>
            </LiquidGlassCard>
        </div>
    );
}
