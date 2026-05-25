import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, LogOut, Moon, Settings, Sun } from 'lucide-react';

import NotificationCenter from '@/components/dashboard/NotificationCenter';
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
    const displayName = user?.name?.trim() || 'User';
    const initials = displayName.charAt(0).toUpperCase();

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
                className="flex items-center gap-2 rounded-xl p-2 text-[var(--dm-text-secondary)] transition-colors hover:text-[var(--dm-accent)]"
                style={{ background: isOpen ? 'var(--dm-surface)' : 'var(--dm-surface-transparent)' }}
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-semibold text-white">
                    {initials}
                </div>
                <div className="hidden text-left md:block">
                    <p className="text-sm font-semibold text-[var(--dm-text)]">{displayName}</p>
                    <p className="text-xs capitalize text-[var(--dm-text-secondary)]">{user.role}</p>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div
                    className="absolute bottom-full right-0 z-50 mb-2 w-80 overflow-hidden rounded-xl border shadow-lg"
                    style={{
                        background: 'var(--dm-surface)',
                        borderColor: 'var(--dm-border)',
                    }}
                >
                    <div className="p-3">
                        <div className="mb-2 flex items-center gap-2 px-2 text-sm font-semibold text-[var(--dm-text)]">
                            <Bell className="h-4 w-4" />
                            <span>Notifikasi</span>
                        </div>
                        <NotificationCenter lightMode={!darkMode} inDropdown />
                    </div>

                    <div className="border-t p-2" style={{ borderColor: 'var(--dm-border)' }}>
                        <button
                            type="button"
                            onClick={() => {
                                onToggleDarkMode();
                                setIsOpen(false);
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[var(--dm-text)] transition-colors hover:bg-[var(--dm-surface-hover)]"
                        >
                            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            <span className="flex-1 text-left">{darkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
                        </button>

                        <Link
                            href="/settings"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[var(--dm-text)] transition-colors hover:bg-[var(--dm-surface-hover)]"
                            onClick={() => setIsOpen(false)}
                        >
                            <Settings className="h-5 w-5" />
                            <span className="flex-1 text-left">Pengaturan</span>
                        </Link>

                        <Link
                            href={auth.logout.url()}
                            method="post"
                            as="button"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => setIsOpen(false)}
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="flex-1 text-left">Keluar</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
