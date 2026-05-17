import { describe, expect, it, vi } from 'vitest';

const { isAxiosError } = vi.hoisted(() => ({
    isAxiosError: vi.fn(),
}));

vi.mock('axios', () => ({
    default: {
        isAxiosError,
    },
}));

import { getErrorMessage } from '@/lib/errorHandler';

describe('getErrorMessage', () => {
    it('returns native Error message', () => {
        isAxiosError.mockReturnValue(false);
        expect(getErrorMessage(new Error('boom'))).toBe('boom');
    });

    it('returns domain error message', () => {
        isAxiosError.mockReturnValue(false);
        expect(getErrorMessage({ message: 'Email sudah digunakan', code: 'DUPLICATE' })).toBe('Email sudah digunakan');
    });

    it('returns WebSocket error message', () => {
        isAxiosError.mockReturnValue(false);
        const wsError = new Event('error');
        expect(getErrorMessage(wsError)).toBe('Koneksi terputus. Periksa internet Anda.');
    });

    it('returns generic fallback for unknown errors', () => {
        isAxiosError.mockReturnValue(false);
        expect(getErrorMessage(null)).toBe('Terjadi kesalahan tidak terduga.');
    });

    it('maps 401 errors to the session-expired message', () => {
        isAxiosError.mockReturnValue(true);
        expect(getErrorMessage({ response: { status: 401 } })).toBe('Sesi Anda telah berakhir. Silakan login kembali.');
    });

    it('maps 403 errors to the forbidden message', () => {
        isAxiosError.mockReturnValue(true);
        expect(getErrorMessage({ response: { status: 403 } })).toBe('Anda tidak memiliki akses untuk melakukan ini.');
    });

    it('maps 429 errors to the rate-limit message', () => {
        isAxiosError.mockReturnValue(true);
        expect(getErrorMessage({ response: { status: 429 } })).toBe('Terlalu banyak permintaan. Tunggu sebentar.');
    });

    it('maps 500 errors to the server-error message', () => {
        isAxiosError.mockReturnValue(true);
        expect(getErrorMessage({ response: { status: 500 } })).toBe('Server error. Tim kami sedang memperbaiki.');
    });

    it('maps 503 errors to the service-unavailable message', () => {
        isAxiosError.mockReturnValue(true);
        expect(getErrorMessage({ response: { status: 503 } })).toBe('Layanan tidak tersedia. Coba lagi nanti.');
    });

    it('maps timeout errors by code', () => {
        isAxiosError.mockReturnValue(true);
        expect(getErrorMessage({ code: 'ECONNABORTED' })).toBe('Koneksi timeout. Periksa internet Anda.');
    });

    it('maps network errors by code', () => {
        isAxiosError.mockReturnValue(true);
        expect(getErrorMessage({ code: 'ERR_NETWORK' })).toBe('Tidak ada koneksi internet.');
    });

    it('uses the API message when available', () => {
        isAxiosError.mockReturnValue(true);
        expect(getErrorMessage({ response: { data: { message: 'Custom API error' } } })).toBe('Custom API error');
    });

    it('falls back to the generic axios message when no special case matches', () => {
        isAxiosError.mockReturnValue(true);
        expect(getErrorMessage({ response: { status: 418 } })).toBe('Terjadi kesalahan. Coba lagi.');
    });
});
