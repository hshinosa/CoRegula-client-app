import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

interface ProfileData {
    id: string;
    name: string;
    email: string;
    nim: string;
    role: string;
}

const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

interface UseProfileReturn {
    profile: ProfileData;
    saving: boolean;
    updateProfile: (data: { name: string; email: string }) => Promise<boolean>;
}

const RETRY_MAX = 2;
const RETRY_DELAY = 1000;

async function fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = RETRY_MAX,
): Promise<Response> {
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
    throw new Error('Server sedang sibuk, silakan coba lagi');
}

export function useProfile(initial: ProfileData): UseProfileReturn {
    const [profile, setProfile] = useState<ProfileData>(initial);
    const [saving, setSaving] = useState(false);

    const updateProfile = useCallback(
        async (data: { name: string; email: string }): Promise<boolean> => {
            setSaving(true);
            try {
                const res = await fetchWithRetry('/student/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': csrfToken(),
                    },
                    body: JSON.stringify(data),
                });

                if (res.ok) {
                    const json = await res.json();
                    toast.success(json.message || 'Profil berhasil diperbarui');
                    setProfile((prev) => ({ ...prev, ...data }));
                    return true;
                }

                const error = await res.json().catch(() => null);
                toast.error(error?.message || 'Gagal memperbarui profil');
                return false;
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan jaringan');
                return false;
            } finally {
                setSaving(false);
            }
        },
        [],
    );

    return { profile, saving, updateProfile };
}