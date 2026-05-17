import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000';

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResponse {
    data: {
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
    };
}

let _accessToken: string | null = null;
let _refreshToken: string | null = null;
let _tokenExpiry: number | null = null;

export const authStorage = {
    setTokens(tokens: AuthTokens) {
        _accessToken = tokens.accessToken;
        _refreshToken = tokens.refreshToken;
        _tokenExpiry = Date.now() + 14 * 60 * 1000;
    },

    getAccessToken(): string | null {
        return _accessToken;
    },

    getRefreshToken(): string | null {
        return _refreshToken;
    },

    getTokenExpiry(): number | null {
        return _tokenExpiry;
    },

    clearTokens() {
        _accessToken = null;
        _refreshToken = null;
        _tokenExpiry = null;
    },

    isTokenExpiringSoon(): boolean {
        if (!_tokenExpiry) return true;
        return _tokenExpiry - Date.now() < 2 * 60 * 1000;
    },
};

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
    refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string) {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
}

export async function refreshAccessToken(): Promise<string | null> {
    if (isRefreshing) {
        return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
                resolve(token);
            });
        });
    }

    isRefreshing = true;

    try {
        const refreshToken = authStorage.getRefreshToken();

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await axios.post<AuthResponse>(
            `${API_BASE_URL}/api/auth/refresh`,
            { refreshToken },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const { accessToken } = response.data.data;

        authStorage.setTokens({
            accessToken,
            refreshToken,
        });

        onTokenRefreshed(accessToken);

        return accessToken;
    } catch {
        authStorage.clearTokens();
        window.location.href = '/login';
        return null;
    } finally {
        isRefreshing = false;
    }
}

export async function logout(): Promise<void> {
    const refreshToken = authStorage.getRefreshToken();

    if (refreshToken) {
        try {
            await axios.post(
                `${API_BASE_URL}/api/auth/logout`,
                { refreshToken },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    authStorage.clearTokens();
}

export function setupAxiosInterceptors() {
    axios.interceptors.request.use(
        async (config) => {
            let token = authStorage.getAccessToken();

            if (token && authStorage.isTokenExpiringSoon()) {
                token = await refreshAccessToken();
            }

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                const newToken = await refreshAccessToken();

                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axios(originalRequest);
                }
            }

            return Promise.reject(error);
        }
    );
}
