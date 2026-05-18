export interface UploadedAttachment {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    previewUrl?: string;
}

export interface UploadProgress {
    file: File;
    percent: number;
}

export async function uploadAttachments(
    files: readonly File[],
    onProgress?: (progress: UploadProgress) => void,
): Promise<UploadedAttachment[]> {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
    const results: UploadedAttachment[] = [];

    for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const result = await new Promise<UploadedAttachment>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable && onProgress) {
                    onProgress({ file, percent: Math.round((event.loaded / event.total) * 100) });
                }
            });
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        resolve(data);
                    } catch {
                        reject(new Error('Invalid upload response'));
                    }
                } else {
                    reject(new Error(`Upload failed: ${xhr.status}`));
                }
            });
            xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
            xhr.open('POST', '/api/chat/upload');
            xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken);
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.withCredentials = true;
            xhr.send(formData);
        });

        results.push(result);
    }

    return results;
}
