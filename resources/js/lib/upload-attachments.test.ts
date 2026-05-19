import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateFile, uploadAttachments } from './upload-attachments';

describe('validateFile', () => {
    it('accepts valid image', () => {
        const file = new File([new Uint8Array(1000)], 'photo.png', { type: 'image/png' });
        expect(validateFile(file)).toEqual({ ok: true });
    });

    it('rejects empty file', () => {
        const file = new File([], 'empty.png', { type: 'image/png' });
        const result = validateFile(file);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.reason).toContain('empty');
    });

    it('rejects oversized file', () => {
        const file = new File([new Uint8Array(11 * 1024 * 1024)], 'big.png', { type: 'image/png' });
        const result = validateFile(file);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.reason).toContain('exceeds 10MB');
    });

    it('rejects disallowed MIME type', () => {
        const file = new File([new Uint8Array(100)], 'malware.exe', { type: 'application/x-msdownload' });
        const result = validateFile(file);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.reason).toContain('not allowed');
    });
});

describe('uploadAttachments', () => {
    beforeEach(() => {
        document.head.innerHTML = '<meta name="csrf-token" content="test-csrf">';
    });

    afterEach(() => {
        document.head.innerHTML = '';
        vi.restoreAllMocks();
    });

    it('throws before upload when any file fails validation', async () => {
        const oversized = new File([new Uint8Array(11 * 1024 * 1024)], 'big.png', { type: 'image/png' });
        const xhrSpy = vi.fn();
        vi.stubGlobal('XMLHttpRequest', xhrSpy);

        await expect(uploadAttachments([oversized])).rejects.toThrow(/exceeds 10MB/);
        expect(xhrSpy).not.toHaveBeenCalled();
    });
});
