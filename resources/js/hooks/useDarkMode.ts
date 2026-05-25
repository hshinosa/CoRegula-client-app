import { useCallback, useEffect, useState } from 'react';

export function getInitialDarkMode(): boolean {
    if (typeof window === 'undefined') return false;
    return (
        localStorage.getItem('kolabri_theme') === 'dark' ||
        localStorage.getItem('kolabri-dark') === 'true'
    );
}

export function applyDarkMode(dark: boolean) {
    if (dark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('kolabri_theme', dark ? 'dark' : 'light');
}

export function useDarkMode() {
    const [darkMode, setDarkMode] = useState(getInitialDarkMode);

    const toggleDarkMode = useCallback(() => {
        setDarkMode(prev => {
            const next = !prev;
            applyDarkMode(next);
            return next;
        });
    }, []);

    useEffect(() => {
        applyDarkMode(darkMode);
    }, [darkMode]);

    return { darkMode, toggleDarkMode, setDarkMode };
}
