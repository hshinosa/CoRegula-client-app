import axios from 'axios';

let cachedToken: string | null = null;
let cachedAt: number | null = null;
let tokenPromise: Promise<string> | null = null;
const CACHE_TTL_MS = 4 * 60 * 1000;

export async function getAuthToken(): Promise<string> {
    if (cachedToken && cachedAt !== null && Date.now() - cachedAt > CACHE_TTL_MS) {
        cachedToken = null;
        cachedAt = null;
    }

    if (cachedToken) {
        return cachedToken;
    }

    if (tokenPromise) {
        return tokenPromise;
    }

    tokenPromise = (async () => {
        try {
            const response = await axios.get<{ data: { token: string } }>('/api/auth/token');
            cachedToken = response.data.data.token;
            cachedAt = Date.now();
            return cachedToken;
        } catch (error) {
            console.error('Failed to fetch auth token:', error);
            throw new Error('Authentication failed');
        } finally {
            tokenPromise = null;
        }
    })();

    return tokenPromise;
}

export function clearCachedToken() {
    cachedToken = null;
    cachedAt = null;
}
