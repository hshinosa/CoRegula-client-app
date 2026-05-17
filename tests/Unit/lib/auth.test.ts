import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPost = vi.hoisted(() => vi.fn());
const mockAxiosCall = vi.hoisted(() => vi.fn());
const requestUse = vi.hoisted(() => vi.fn());
const responseUse = vi.hoisted(() => vi.fn());
const isAxiosError = vi.hoisted(() => vi.fn());

vi.mock('axios', () => {
    const axios = Object.assign(mockAxiosCall, {
        post: mockPost,
        isAxiosError,
        interceptors: {
            request: { use: requestUse },
            response: { use: responseUse },
        },
    });

    return { default: axios };
});

import { authStorage, logout, refreshAccessToken, setupAxiosInterceptors } from '@/lib/auth';

describe('authStorage', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        authStorage.clearTokens();
    });

    it('stores access token, refresh token, and expiry time', () => {
        vi.spyOn(Date, 'now').mockReturnValue(1_000);

        authStorage.setTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' });

        expect(authStorage.getAccessToken()).toBe('access-1');
        expect(authStorage.getRefreshToken()).toBe('refresh-1');
        expect(authStorage.getTokenExpiry()).toBe(1_000 + 14 * 60 * 1000);
    });

    it('reads back stored tokens and expiry', () => {
        authStorage.setTokens({ accessToken: 'access-2', refreshToken: 'refresh-2' });

        expect(authStorage.getAccessToken()).toBe('access-2');
        expect(authStorage.getRefreshToken()).toBe('refresh-2');
        expect(authStorage.getTokenExpiry()).toBeGreaterThan(0);
    });

    it('clears all auth tokens', () => {
        authStorage.setTokens({ accessToken: 'access-3', refreshToken: 'refresh-3' });

        authStorage.clearTokens();

        expect(authStorage.getAccessToken()).toBeNull();
        expect(authStorage.getRefreshToken()).toBeNull();
        expect(authStorage.getTokenExpiry()).toBeNull();
    });

    it('treats a missing expiry as expiring soon', () => {
        expect(authStorage.isTokenExpiringSoon()).toBe(true);
    });

    it('returns true when less than two minutes remain', () => {
        const expiry = 10_000 + 119_000;
        vi.spyOn(Date, 'now').mockReturnValue(expiry - 14 * 60 * 1000);
        authStorage.setTokens({ accessToken: 'tok', refreshToken: 'ref' });
        vi.spyOn(Date, 'now').mockReturnValue(expiry - 1_000);

        expect(authStorage.isTokenExpiringSoon()).toBe(true);
    });

    it('returns false when more than two minutes remain', () => {
        const now = 10_000;
        vi.spyOn(Date, 'now').mockReturnValue(now);
        authStorage.setTokens({ accessToken: 'tok', refreshToken: 'ref' });
        vi.spyOn(Date, 'now').mockReturnValue(now + 1_000);

        expect(authStorage.isTokenExpiringSoon()).toBe(false);
    });
});

describe('refreshAccessToken', () => {
    beforeEach(() => {
        authStorage.clearTokens();
        mockPost.mockReset();
        mockAxiosCall.mockReset();
        requestUse.mockReset();
        responseUse.mockReset();
    });

    it('refreshes the token and stores the new access token', async () => {
        authStorage.setTokens({ accessToken: 'old-access', refreshToken: 'refresh-abc' });
        mockPost.mockResolvedValue({
            data: {
                data: {
                    accessToken: 'new-access',
                    refreshToken: 'server-refresh-token-is-ignored',
                    user: { id: '1', name: 'Test', email: 'a@b.c', role: 'student' },
                },
            },
        });

        await expect(refreshAccessToken()).resolves.toBe('new-access');

        expect(mockPost).toHaveBeenCalledWith(
            'http://127.0.0.1:3000/api/auth/refresh',
            { refreshToken: 'refresh-abc' },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
        expect(authStorage.getAccessToken()).toBe('new-access');
        expect(authStorage.getRefreshToken()).toBe('refresh-abc');
    });

    it('returns the same token to concurrent callers while a refresh is already in progress', async () => {
        authStorage.setTokens({ accessToken: 'old', refreshToken: 'refresh-xyz' });

        let resolveRefresh: ((value: unknown) => void) | undefined;
        mockPost.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveRefresh = resolve;
                }),
        );

        const firstCall = refreshAccessToken();
        const secondCall = refreshAccessToken();

        resolveRefresh?.({
            data: {
                data: {
                    accessToken: 'shared-token',
                    refreshToken: 'unused',
                    user: { id: '1', name: 'Test', email: 'a@b.c', role: 'student' },
                },
            },
        });

        await expect(firstCall).resolves.toBe('shared-token');
        await expect(secondCall).resolves.toBe('shared-token');
        expect(mockPost).toHaveBeenCalledTimes(1);
    });

    it('clears tokens and redirects to login when refresh fails', async () => {
        authStorage.setTokens({ accessToken: 'old-access', refreshToken: 'refresh-fail' });
        mockPost.mockRejectedValue(new Error('Network error'));

        const locationMock = { href: '' };
        Object.defineProperty(globalThis, 'window', {
            value: { location: locationMock },
            configurable: true,
        });

        await refreshAccessToken();

        expect(authStorage.getAccessToken()).toBeNull();
        expect(authStorage.getRefreshToken()).toBeNull();
        expect(locationMock.href).toBe('/login');
    });
});

describe('logout', () => {
    beforeEach(() => {
        authStorage.clearTokens();
        mockPost.mockReset();
    });

    it('calls the logout endpoint with the refresh token', async () => {
        authStorage.setTokens({ accessToken: 'access-tok', refreshToken: 'refresh-tok' });
        mockPost.mockResolvedValue({});

        await logout();

        expect(mockPost).toHaveBeenCalledWith(
            'http://127.0.0.1:3000/api/auth/logout',
            { refreshToken: 'refresh-tok' },
            { headers: { 'Content-Type': 'application/json' } },
        );
        expect(authStorage.getAccessToken()).toBeNull();
    });

    it('clears tokens even when the logout request fails', async () => {
        authStorage.setTokens({ accessToken: 'access-tok', refreshToken: 'refresh-tok' });
        mockPost.mockRejectedValue(new Error('Network error'));

        await logout();

        expect(authStorage.getAccessToken()).toBeNull();
    });

    it('skips the API call when there is no refresh token', async () => {
        await logout();

        expect(mockPost).not.toHaveBeenCalled();
    });
});

describe('setupAxiosInterceptors', () => {
    it('registers request and response interceptors', () => {
        setupAxiosInterceptors();

        expect(requestUse).toHaveBeenCalledTimes(1);
        expect(responseUse).toHaveBeenCalledTimes(1);
    });
});
