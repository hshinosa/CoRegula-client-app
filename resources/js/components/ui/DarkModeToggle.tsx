import { Moon, Sun } from 'lucide-react';

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

interface DarkModeToggleProps {
    darkMode: boolean;
    onToggle: () => void;
    size?: 'sm' | 'md';
    className?: string;
}

export default function DarkModeToggle({
    darkMode,
    onToggle,
    size = 'md',
    className = '',
}: DarkModeToggleProps) {
    const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

    return (
        <button
            onClick={onToggle}
            className={`flex items-center justify-center rounded-xl transition-all duration-200 hover:opacity-80 ${className}`}
            style={{
                background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
                border: darkMode
                    ? '1px solid rgba(255,255,255,0.15)'
                    : '1px solid rgba(255,255,255,0.8)',
            }}
            title={darkMode ? 'Mode terang' : 'Mode gelap'}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {darkMode ? (
                <Sun className={`${iconSize} text-amber-400`} />
            ) : (
                <Moon className={`${iconSize} text-[var(--dm-sidebar-text)]`} />
            )}
        </button>
    );
}
