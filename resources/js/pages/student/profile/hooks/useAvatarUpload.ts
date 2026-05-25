import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import avatar from '@/routes/student/profile/avatar';

interface AvatarUrls {
    thumbnail: string | null;
    medium: string | null;
    large: string | null;
}

const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

export function useAvatarUpload() {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const upload = useCallback(
        async (
            file: File,
            crop?: { x: number; y: number; width: number; height: number },
        ): Promise<AvatarUrls | null> => {
            setUploading(true);
            setProgress(0);

            const formData = new FormData();
            formData.append('avatar', file);
            if (crop) {
                formData.append('crop_x', String(Math.round(crop.x)));
                formData.append('crop_y', String(Math.round(crop.y)));
                formData.append('crop_width', String(Math.round(crop.width)));
                formData.append('crop_height', String(Math.round(crop.height)));
            }

            return new Promise<AvatarUrls | null>((resolve) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', avatar.store.url());
                xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken());
                xhr.setRequestHeader('Accept', 'application/json');

                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        setProgress(Math.round((e.loaded / e.total) * 100));
                    }
                });

                xhr.addEventListener('load', () => {
                    setUploading(false);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const response = JSON.parse(xhr.responseText);
                        toast.success(response.message || 'Avatar berhasil diunggah');
                        resolve(response.data?.urls ?? null);
                    } else {
                        const error = JSON.parse(xhr.responseText);
                        toast.error(error.message || 'Gagal mengunggah avatar');
                        resolve(null);
                    }
                });

                xhr.addEventListener('error', () => {
                    setUploading(false);
                    toast.error('Terjadi kesalahan jaringan');
                    resolve(null);
                });

                xhr.send(formData);
            });
        },
        [],
    );

    const remove = useCallback(async (): Promise<boolean> => {
        try {
            const res = await fetch(avatar.destroy.url(), {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
            });
            if (res.ok) {
                const data = await res.json();
                toast.success(data.message || 'Avatar berhasil dihapus');
                return true;
            }
            const error = await res.json();
            toast.error(error.message || 'Gagal menghapus avatar');
            return false;
        } catch {
            toast.error('Terjadi kesalahan jaringan');
            return false;
        }
    }, []);

    return { upload, remove, uploading, progress };
}
