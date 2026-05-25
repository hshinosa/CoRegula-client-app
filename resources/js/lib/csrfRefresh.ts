import axios from 'axios';

/**
 * Refresh CSRF token from server and update axios headers
 */
export async function refreshCsrfToken(): Promise<boolean> {
    try {
        const response = await axios.get('/csrf-token');
        const newToken = response.data.token;
        
        if (newToken) {
            const metaTag = document.querySelector('meta[name="csrf-token"]');
            if (metaTag) {
                metaTag.setAttribute('content', newToken);
            }
            axios.defaults.headers.common['X-CSRF-TOKEN'] = newToken;
            return true;
        }
    } catch (error) {
        console.error('Failed to refresh CSRF token:', error);
    }
    return false;
}

/**
 * Setup periodic CSRF token refresh for long-running forms
 * @param intervalMinutes - Refresh interval in minutes (default: 60)
 * @returns Cleanup function to stop refresh
 */
export function setupCsrfRefresh(intervalMinutes: number = 60): () => void {
    const intervalMs = intervalMinutes * 60 * 1000;
    
    void refreshCsrfToken();
    
    const intervalId = setInterval(() => {
        void refreshCsrfToken();
    }, intervalMs);
    
    return () => clearInterval(intervalId);
}
