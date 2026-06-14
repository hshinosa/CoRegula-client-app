import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Type, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { useDebounce } from '@/hooks/useDebounce';
import NotificationPrefs from './NotificationPrefs';
import ThemePrefs from './ThemePrefs';

interface Notifications {
    email: boolean;
    push: boolean;
    tasks: boolean;
    chat: boolean;
    groups: boolean;
}

interface PreferencesData {
    notifications: Notifications;
    language: string;
    theme: string;
    font_size: string;
}

interface Props {
    preferences: PreferencesData;
}

const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

const fontSizes = [
    { value: 'small', label: 'Kecil' },
    { value: 'normal', label: 'Normal' },
    { value: 'large', label: 'Besar' },
];

function applyTheme(theme: string) {
    const root = document.documentElement;
    const resolved =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', resolved);
    localStorage.setItem('kolabri_theme', theme);
}

function applyFontSize(fontSize: string) {
    const root = document.documentElement;
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    switch (fontSize) {
        case 'small':
            root.classList.add('text-sm');
            break;
        case 'large':
            root.classList.add('text-lg');
            break;
        default:
            root.classList.add('text-base');
    }
    localStorage.setItem('kolabri_font_size', fontSize);
}

export default function PreferencesSection({ preferences: initial }: Props) {
    const [prefs, setPrefs] = useState<PreferencesData>(initial);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const isInitialMount = useRef(true);
    const debouncedPrefs = useDebounce(prefs, 800);

    const updateNotification = useCallback(
        (key: keyof Notifications, value: boolean) => {
            setPrefs((prev) => ({
                ...prev,
                notifications: { ...prev.notifications, [key]: value },
            }));
            setSaved(false);
        },
        [],
    );

    const updateField = useCallback(
        <K extends keyof PreferencesData>(key: K, value: PreferencesData[K]) => {
            setPrefs((prev) => ({ ...prev, [key]: value }));
            setSaved(false);
        },
        [],
    );

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        applyTheme(prefs.theme);
        applyFontSize(prefs.font_size);
    }, [prefs.theme, prefs.font_size]);

    useEffect(() => {
        if (isInitialMount.current) return;

        const save = async () => {
            setSaving(true);
            try {
                const res = await fetch('/student/profile/preferences', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': csrfToken(),
                    },
                    body: JSON.stringify(prefs),
                });

                if (res.ok) {
                    const data = await res.json();
                    toast.success(data.message || 'Preferensi tersimpan', { id: 'pref-save' });
                    setSaved(true);
                } else {
                    toast.error('Gagal menyimpan preferensi', { id: 'pref-save' });
                }
            } catch {
                toast.error('Terjadi kesalahan jaringan', { id: 'pref-save' });
            } finally {
                setSaving(false);
            }
        };

        save();
    }, [debouncedPrefs]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="space-y-8">
            <div>
                <div className="mb-4 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Notifikasi
                    </h2>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                    <NotificationPrefs
                        notifications={prefs.notifications}
                        onToggle={updateNotification}
                    />
                </div>
            </div>

            <div>
                <div className="mb-4 flex items-center gap-2">
                    <Type className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Tampilan
                    </h2>
                </div>
                <div className="space-y-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                            Tema
                        </h3>
                        <ThemePrefs
                            theme={prefs.theme}
                            onChange={(v) => updateField('theme', v)}
                        />
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                            Ukuran Font
                        </h3>
                        <div className="flex gap-2">
                            {fontSizes.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => updateField('font_size', value)}
                                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                        prefs.font_size === value
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Auto-save indicator */}
            <motion.div
                className="flex items-center justify-end gap-2 text-sm"
                animate={{ opacity: saving || saved ? 1 : 0 }}
                initial={{ opacity: 0 }}
            >
                {saving && (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-gray-500 dark:text-gray-400">Menyimpan...</span>
                    </>
                )}
                {!saving && saved && (
                    <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 dark:text-green-400">Preferensi tersimpan</span>
                    </>
                )}
            </motion.div>
        </div>
    );
}