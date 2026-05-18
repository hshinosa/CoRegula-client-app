import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isAllowedAttachmentUrl, safeAttachmentUrl, ATTACHMENT_PLACEHOLDER } from './attachment-url';

describe('isAllowedAttachmentUrl', () => {
    let envSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        envSpy = vi.spyOn(import.meta, 'env', 'get');
    });

    afterEach(() => {
        envSpy.mockRestore();
    });

    it('rejects javascript: scheme', () => {
        expect(isAllowedAttachmentUrl('javascript:alert(1)')).toBe(false);
    });

    it('rejects data: scheme', () => {
        expect(isAllowedAttachmentUrl('data:image/png;base64,abc')).toBe(false);
    });

    it('rejects malformed URLs', () => {
        expect(isAllowedAttachmentUrl('not a url')).toBe(false);
        expect(isAllowedAttachmentUrl('')).toBe(false);
        expect(isAllowedAttachmentUrl(null)).toBe(false);
        expect(isAllowedAttachmentUrl(undefined)).toBe(false);
    });

    it('rejects http:// on non-localhost', () => {
        expect(isAllowedAttachmentUrl('http://attacker.example.com/track.gif')).toBe(false);
    });

    it('allows http://localhost for dev', () => {
        expect(isAllowedAttachmentUrl('http://localhost:3000/uploads/a.png')).toBe(true);
        expect(isAllowedAttachmentUrl('http://127.0.0.1:3000/u/b.png')).toBe(true);
    });

    it('allows https on any origin when allowlist empty', () => {
        expect(isAllowedAttachmentUrl('https://uploads.kolabri.id/a.png')).toBe(true);
        expect(isAllowedAttachmentUrl('https://other.example.com/b.png')).toBe(true);
    });
});

describe('safeAttachmentUrl', () => {
    it('returns original when allowed', () => {
        const url = 'https://example.com/a.png';
        expect(safeAttachmentUrl(url)).toBe(url);
    });

    it('returns placeholder when blocked', () => {
        expect(safeAttachmentUrl('javascript:void(0)')).toBe(ATTACHMENT_PLACEHOLDER);
    });

    it('returns placeholder for null/empty', () => {
        expect(safeAttachmentUrl(null)).toBe(ATTACHMENT_PLACEHOLDER);
        expect(safeAttachmentUrl('')).toBe(ATTACHMENT_PLACEHOLDER);
    });
});
