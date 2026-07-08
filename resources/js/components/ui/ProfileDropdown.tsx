import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { LogOut, Moon, Settings, Sun, ChevronUp } from 'lucide-react';

import auth from '@/routes/auth';

interface ProfileDropdownProps {
    user: {
        name: string;
        email?: string;
        role: string;
    };
    darkMode: boolean;
    onToggleDarkMode: () => void;
}

export default function ProfileDropdown({ user, darkMode, onToggleDarkMode }: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const hoverBackground = darkMode ? 'var(--dm-surface-hover)' : 'rgba(136, 22, 28, 0.08)';
    const dangerHoverBackground = darkMode ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.12)';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-all"
                style={{
                    background: isOpen ? 'var(--dm-accent-bg)' : 'transparent',
                    color: isOpen ? 'var(--dm-accent)' : 'var(--dm-text-muted)',
                    border: isOpen ? '1px solid var(--dm-accent-border)' : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.background = darkMode ? 'var(--dm-surface-transparent)' : 'rgba(136, 22, 28, 0.08)';
                        e.currentTarget.style.color = darkMode ? 'var(--dm-text-secondary)' : 'var(--dm-accent)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--dm-text-muted)';
                    }
                }}
                title="Profile settings"
            >
                <ChevronUp className={`h-4 w-4 transition-transform duration-200 ${isOpen ? '' : 'rotate-180'}`} />
            </button>

            {isOpen && (
                <div
                    className="absolute bottom-full left-1/2 z-50 mb-3 w-56 -translate-x-1/2 overflow-hidden rounded-2xl shadow-xl"
                    style={{
                        background: 'var(--dm-surface-solid)',
                        border: '1px solid var(--dm-border-strong)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    <div className="p-1.5">
                        <div className="px-3 py-2.5 mb-1">
                            <p className="text-xs font-medium text-[var(--dm-text-muted)] uppercase tracking-wider">Akun</p>
                            <p className="mt-1 truncate text-sm font-semibold text-[var(--dm-text)]">{user.name}</p>
                            {user.email && <p className="truncate text-xs text-[var(--dm-text-muted)]">{user.email}</p>}
                        </div>

                        <button
                            type="button"
                            onClick={onToggleDarkMode}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors"
                            style={{ color: 'var(--dm-text)' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = hoverBackground;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
                            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                            <span className="ml-auto text-[10px] text-[var(--dm-text-muted)]">
                                {darkMode ? '☀' : '☾'}
                            </span>
                        </button>

                        <Link
                            href="/settings"
                            as="button"
                            onClick={() => setIsOpen(false)}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--dm-text)] transition-colors"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = hoverBackground;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <Settings className="h-4 w-4 text-[var(--dm-text-muted)]" />
                            <span>Settings</span>
                        </Link>

                        <div className="my-1.5 mx-3 h-px" style={{ background: 'var(--dm-border)' }} />

                        <Link
                            href={auth.logout.url()}
                            method="post"
                            as="button"
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition-colors"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = dangerHoverBackground;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Log out</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
