import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

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

interface UsePreferencesReturn {
    preferences: PreferencesData;
    saving: boolean;
    saved: boolean;
    updateNotification: (key: keyof Notifications, value: boolean) => void;
    updateField: <K extends keyof PreferencesData>(key: K, value: PreferencesData[K]) => void;
    savePreferences: () => Promise<boolean>;
}

const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

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

const RETRY_MAX = 2;
const RETRY_DELAY = 800;

async function fetchWithRetry(url: string, options: RequestInit, retries = RETRY_MAX): Promise<Response> {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url, options);
            if (res.ok || res.status < 500) return res;
            if (attempt < retries) {
                await new Promise((r) => setTimeout(r, RETRY_DELAY * (attempt + 1)));
            }
        } catch {
            if (attempt < retries) {
                await new Promise((r) => setTimeout(r, RETRY_DELAY * (attempt + 1)));
            } else {
                throw new Error('Gagal terhubung ke server');
            }
        }
    }
    throw new Error('Server sedang sibuk');
}

export function usePreferences(initial: PreferencesData): UsePreferencesReturn {
    const [preferences, setPreferences] = useState<PreferencesData>(initial);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const isInitialMount = useRef(true);

    const updateNotification = useCallback((key: keyof Notifications, value: boolean) => {
        setPreferences((prev) => ({
            ...prev,
            notifications: { ...prev.notifications, [key]: value },
        }));
        setSaved(false);
    }, []);

    const updateField = useCallback(<K extends keyof PreferencesData>(key: K, value: PreferencesData[K]) => {
        setPreferences((prev) => ({ ...prev, [key]: value }));
        setSaved(false);
    }, []);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        applyTheme(preferences.theme);
        applyFontSize(preferences.font_size);
    }, [preferences.theme, preferences.font_size]);

    const savePreferences = useCallback(async (): Promise<boolean> => {
        setSaving(true);
        try {
            const res = await fetchWithRetry('/student/profile/preferences', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
                body: JSON.stringify(preferences),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(data.message || 'Preferensi tersimpan', { id: 'pref-save' });
                setSaved(true);
                return true;
            }

            toast.error('Gagal menyimpan preferensi', { id: 'pref-save' });
            return false;
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan jaringan', { id: 'pref-save' });
            return false;
        } finally {
            setSaving(false);
        }
    }, [preferences]);

    return { preferences, saving, saved, updateNotification, updateField, savePreferences };
}