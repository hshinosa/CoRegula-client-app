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

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_PARALLEL = 3;
const ALLOWED_MIME_TYPES = new Set<string>([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
]);

export type FileValidation = { ok: true } | { ok: false; reason: string };

export function validateFile(file: File): FileValidation {
    if (file.size === 0) {
        return { ok: false, reason: `${file.name}: file is empty` };
    }
    if (file.size > MAX_FILE_SIZE) {
        return { ok: false, reason: `${file.name}: file size exceeds 10MB` };
    }
    if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
        return { ok: false, reason: `${file.name}: file type ${file.type} not allowed` };
    }
    return { ok: true };
}

async function uploadOne(
    file: File,
    onProgress?: (progress: UploadProgress) => void,
    conversationId?: string,
): Promise<UploadedAttachment> {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
    const formData = new FormData();
    formData.append('file', file);
    if (conversationId) {
        formData.append('conversation_id', conversationId);
    }

    return new Promise<UploadedAttachment>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && onProgress) {
                onProgress({ file, percent: Math.round((event.loaded / event.total) * 100) });
            }
        });
        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    resolve(JSON.parse(xhr.responseText));
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
        xhr.timeout = 120000;
        xhr.ontimeout = () => reject(new Error('Upload timed out'));
        xhr.send(formData);
    });
}

async function withConcurrency<T, R>(
    items: readonly T[],
    limit: number,
    worker: (item: T) => Promise<R>,
): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let nextIndex = 0;

    async function runner() {
        while (true) {
            const idx = nextIndex++;
            if (idx >= items.length) return;
            results[idx] = await worker(items[idx]);
        }
    }

    const workerCount = Math.min(limit, items.length);
    const workers = Array.from({ length: workerCount }, () => runner());
    await Promise.all(workers);
    return results;
}

export async function uploadAttachments(
    files: readonly File[],
    onProgress?: (progress: UploadProgress) => void,
    conversationId?: string,
): Promise<UploadedAttachment[]> {
    for (const file of files) {
        const validation = validateFile(file);
        if (!validation.ok) {
            throw new Error(validation.reason);
        }
    }

    return withConcurrency(files, MAX_PARALLEL, (file) => uploadOne(file, onProgress, conversationId));
}
