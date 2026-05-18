const FALLBACK_PLACEHOLDER = '/images/attachment-blocked.svg';

function getAllowedOrigins(): Set<string> {
    const raw = import.meta.env.VITE_ATTACHMENT_ALLOWED_ORIGINS as string | undefined;
    if (!raw) return new Set();
    return new Set(raw.split(',').map((o) => o.trim()).filter(Boolean));
}

export function isAllowedAttachmentUrl(rawUrl: string | null | undefined): boolean {
    if (!rawUrl) return false;
    let url: URL;
    try {
        url = new URL(rawUrl);
    } catch {
        return false;
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    if (url.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(url.hostname)) {
        return false;
    }
    const allowed = getAllowedOrigins();
    if (allowed.size > 0 && !allowed.has(url.origin)) {
        return false;
    }
    return true;
}

export function safeAttachmentUrl(rawUrl: string | null | undefined): string {
    return isAllowedAttachmentUrl(rawUrl) ? (rawUrl as string) : FALLBACK_PLACEHOLDER;
}

export const ATTACHMENT_PLACEHOLDER = FALLBACK_PLACEHOLDER;
