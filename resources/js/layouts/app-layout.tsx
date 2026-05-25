import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { PropsWithChildren, useState, useMemo } from 'react';
import { LogOut, Menu, Search, X } from 'lucide-react';

import { SharedData } from '@/types';
import auth from '@/routes/auth';
import { OrganicBlob } from '@/components/Welcome/utils/helpers';
import { AdminNav } from '@/components/navigation/admin-nav';
import DarkModeToggle from '@/components/ui/DarkModeToggle';
import NotificationCenter from '@/components/dashboard/NotificationCenter';
import { GlobalSearch } from '@/components/admin/GlobalSearch';
import { KeyboardShortcutsHelpModal } from '@/components/ui/KeyboardShortcutsHelpModal';
import { useKeyboardShortcuts, KeyboardShortcutMap } from '@/hooks/useKeyboardShortcuts';
import { useDarkMode } from '@/hooks/useDarkMode';
import { adminShortcuts } from '@/config/shortcuts/admin';
import { studentShortcuts } from '@/config/shortcuts/student';
import { lecturerShortcuts } from '@/config/shortcuts/lecturer';

interface NavSubItem {
    name: string;
    href: string;
}

interface NavItem {
    name: string;
    href: string;
    icon: React.ReactNode;
    active?: boolean;
    subItems?: NavSubItem[];
}

interface AppLayoutProps extends PropsWithChildren {
    title?: string;
    navItems?: NavItem[];
}

export default function AppLayout({ children, title, navItems = [] }: AppLayoutProps) {
    const { auth: authData, url } = usePage<SharedData>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { darkMode, toggleDarkMode } = useDarkMode();
    const [expandedItems, setExpandedItems] = useState<string[]>(() => {
        return navItems
            .filter(item => item.active && item.subItems && item.subItems.length > 0)
            .map(item => item.name);
    });
    const [searchOpen, setSearchOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);

    const user = authData?.user;
    void title;

    const shortcuts = useMemo(() => {
        const role = user?.role;
        if (role === 'admin') return adminShortcuts;
        if (role === 'student') return studentShortcuts;
        if (role === 'lecturer') return lecturerShortcuts;
        return adminShortcuts;
    }, [user?.role]);

    useKeyboardShortcuts({
        shortcuts,
        searchOpen,
        setSearchOpen,
        helpOpen,
        setHelpOpen,
    });

    const toggleExpanded = (itemName: string) => {
        setExpandedItems(prev => 
            prev.includes(itemName) 
                ? prev.filter(name => name !== itemName)
                : [...prev, itemName]
        );
    };

    const isSubItemActive = (href: string) => {
        const currentUrl = typeof url === 'string' ? url : window.location.pathname;
        return currentUrl === href || currentUrl.startsWith(href + '/');
    };

    const renderNavItem = (item: NavItem, isMobile: boolean = false) => {
        const hasSubItems = item.subItems && item.subItems.length > 0;
        const isExpanded = expandedItems.includes(item.name);
        
        if (hasSubItems) {
            return (
                <div key={item.name}>
                    <button
                        onClick={() => toggleExpanded(item.name)}
                        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                            item.active
                                ? 'text-[var(--dm-accent)]'
                                : 'text-[var(--dm-text)] hover:text-[var(--dm-accent)]'
                        }`}
                        style={{
                            background: item.active
                                ? 'var(--dm-accent-bg)'
                                : 'transparent',
                            border: item.active
                                ? `1px solid var(--dm-accent-border)`
                                : '1px solid transparent',
                        }}
                    >
                        <span className={item.active ? 'text-[var(--dm-accent)]' : 'text-[var(--dm-text-secondary)]'}>
                            {item.icon}
                        </span>
                        <span className="flex-1 text-left">{item.name}</span>
                        <motion.svg 
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="h-4 w-4 text-[var(--dm-text-secondary)]" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                    </button>
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="ml-4 mt-1 space-y-1 border-l-2 border-[var(--dm-accent)]/20 pl-4">
                                    {item.subItems!.map((subItem) => (
                                        <Link
                                            key={subItem.name}
                                            href={subItem.href}
                                            onClick={isMobile ? () => setSidebarOpen(false) : undefined}
                                            className={`block rounded-lg px-3 py-2 text-sm transition-all ${
                                                isSubItemActive(subItem.href)
                                                    ? 'font-medium text-[var(--dm-accent)]'
                                                    : 'text-[var(--dm-text-secondary)] hover:text-[var(--dm-text)]'
                                            }`}
                                        >
                                            {subItem.name}
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            );
        }

        return (
            <Link
                key={item.name}
                href={item.href}
                onClick={isMobile ? () => setSidebarOpen(false) : undefined}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    item.active
                        ? 'text-[var(--dm-accent)]'
                        : 'text-[var(--dm-text)] hover:text-[var(--dm-accent)]'
                }`}
                style={{
                    background: item.active
                        ? 'var(--dm-accent-bg)'
                        : 'transparent',
                    border: item.active
                        ? `1px solid var(--dm-accent-border)`
                        : '1px solid transparent',
                }}
            >
                <span className={item.active ? 'text-[var(--dm-accent)]' : 'text-[var(--dm-text-secondary)]'}>
                    {item.icon}
                </span>
                {item.name}
                {item.active && !hasSubItems && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-[var(--dm-accent)]" />
                )}
            </Link>
        );
    };

    return (
        <>
        <div 
            className="relative flex h-screen overflow-hidden"
            style={{
                background: darkMode
                    ? 'linear-gradient(135deg, #0a0a0f 0%, #0f0f16 50%, #0a0a0f 100%)'
                    : 'linear-gradient(135deg, #E8EDF8 0%, #EDF0F7 50%, #E8EDF8 100%)',
            }}
        >
            {/* Decorative blobs */}
            <div className={`pointer-events-none absolute inset-0 overflow-hidden ${darkMode ? 'opacity-0' : ''}`}>
                <OrganicBlob className="top-0 left-0" delay={0} color="rgba(136, 22, 28, 0.03)" size={400} />
                <OrganicBlob className="bottom-0 right-0" delay={-5} color="rgba(136, 22, 28, 0.02)" size={300} />
            </div>

            {/* Sidebar - Desktop */}
            <aside 
                className="hidden w-72 flex-shrink-0 lg:block"
                style={{
                    background: darkMode ? 'rgba(17, 17, 22, 0.95)' : 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                    borderRight: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.5)',
                }}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div 
                        className="flex h-20 items-center gap-3 px-6"
                        style={{ borderBottom: `1px solid var(--dm-sidebar-divider)` }}
                    >
                        <div 
                            className="flex h-12 w-12 items-center justify-center rounded-2xl"
                            style={{
                                background: 'var(--dm-accent-bg)',
                                border: '1px solid var(--dm-accent-border-light)',
                            }}
                        >
                            <img src="/LogoKolabri.webp" alt="Kolabri" className="h-8 w-8" />
                        </div>
                        <div>
                            <span 
                                className="text-xl font-bold"
                                style={{ color: 'var(--dm-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                            >
                                Kolabri
                            </span>
                            <p className="text-xs text-[#6B7280]">Platform Kolaborasi</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
                        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--dm-text-secondary)]">
                            Menu
                        </p>
                        {user?.role === 'admin' ? <AdminNav /> : navItems.map((item) => renderNavItem(item, false))}

                        {user?.role === 'admin' && (
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all text-[#6B7280] hover:text-[#88161c]"
                                style={{
                                    background: 'rgba(136,22,28,0.04)',
                                    border: '1px solid rgba(136,22,28,0.08)',
                                }}
                            >
                                <Search className="h-5 w-5" />
                                <span className="flex-1 text-left">Cari...</span>
                                <kbd
                                    className="hidden sm:inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium"
                                    style={{
                                        background: 'rgba(136,22,28,0.06)',
                                        border: '1px solid rgba(136,22,28,0.1)',
                                    }}
                                >
                                    ⌘K
                                </kbd>
                            </button>
                        )}
                    </nav>

                    {/* User Info */}
                    <div 
                        className="p-4"
                        style={{ borderTop: `1px solid var(--dm-sidebar-divider)` }}
                    >
                        <div 
                            className="flex items-center gap-3 rounded-2xl p-3"
                            style={{
                                background: 'var(--dm-sidebar-user-bg)',
                                border: `1px solid var(--dm-sidebar-divider)`,
                            }}
                        >
                            <div 
                                className="flex h-11 w-11 items-center justify-center rounded-full font-bold text-white"
                                style={{
                                    background: 'linear-gradient(135deg, #88161c 0%, #a41219 100%)',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                }}
                            >
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="truncate font-semibold text-[var(--dm-text)]">
                                    {user?.name || 'User'}
                                </p>
                                <p className="truncate text-xs text-[var(--dm-text-secondary)] capitalize">
                                    {user?.role || 'Tamu'}
                                </p>
                            </div>
                            <NotificationCenter lightMode={!darkMode} />
                            <DarkModeToggle
                                darkMode={darkMode}
                                onToggle={toggleDarkMode}
                                className="rounded-xl p-2"
                            />
                            <Link
                                href={auth.logout.url()}
                                method="post"
                                as="button"
                                className="rounded-xl p-2 text-[var(--dm-text-secondary)] hover:text-[var(--dm-accent)] transition-colors"
                                style={{
                                    background: 'var(--dm-surface-transparent)',
                                }}
                                title="Keluar"
                            >
                                <LogOut className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 z-40 bg-black lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: -288 }}
                            animate={{ x: 0 }}
                            exit={{ x: -288 }}
                            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                            className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
                            style={{
                                background: darkMode ? 'rgba(17, 17, 22, 0.98)' : 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(40px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                                borderRight: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.5)',
                            }}
                        >
                            <div className="flex h-full flex-col">
                                {/* Logo */}
                                <div 
                                    className="flex h-16 items-center justify-between px-4 sm:h-20 sm:px-6"
                                    style={{ borderBottom: `1px solid var(--dm-sidebar-divider)` }}
                                >
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div 
                                            className="flex h-10 w-10 items-center justify-center rounded-2xl sm:h-12 sm:w-12"
                                            style={{
                                                background: 'var(--dm-accent-bg)',
                                                border: '1px solid var(--dm-accent-border-light)',
                                            }}
                                        >
                                            <img src="/LogoKolabri.webp" alt="Kolabri" className="h-7 w-7 sm:h-8 sm:w-8" />
                                        </div>
                                        <div>
                                            <span 
                                                className="text-lg font-bold sm:text-xl"
                                                style={{ color: 'var(--dm-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                                            >
                                                Kolabri
                                            </span>
                            <p className="text-xs text-[var(--dm-text-secondary)]">Platform Kolaborasi</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSidebarOpen(false)}
                                        className="rounded-lg p-2 text-[var(--dm-text-secondary)] hover:text-[var(--dm-accent)]"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Navigation */}
                                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6">
                                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--dm-text-secondary)] sm:mb-3">
                                        Menu
                                    </p>
                                    {user?.role === 'admin' ? (
                                        <AdminNav isMobile={true} onNavigate={() => setSidebarOpen(false)} />
                                    ) : (
                                        navItems.map((item) => renderNavItem(item, true))
                                    )}

                                    {user?.role === 'admin' && (
                                        <button
                                            onClick={() => { setSearchOpen(true); setSidebarOpen(false); }}
                                            className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all text-[#6B7280] hover:text-[#88161c]"
                                            style={{
                                                background: 'rgba(136,22,28,0.04)',
                                                border: '1px solid rgba(136,22,28,0.08)',
                                            }}
                                        >
                                            <Search className="h-5 w-5" />
                                            <span className="flex-1 text-left">Cari...</span>
                                        </button>
                                    )}
                                </nav>

                                {/* User Info */}
                                <div 
                                    className="p-3 sm:p-4"
                                    style={{ borderTop: `1px solid var(--dm-sidebar-divider)` }}
                                >
                                    <div 
                                        className="flex items-center gap-2 rounded-2xl p-2.5 sm:gap-3 sm:p-3"
                                        style={{
                                            background: 'var(--dm-sidebar-user-bg)',
                                            border: `1px solid var(--dm-sidebar-divider)`,
                                        }}
                                    >
                                        <div 
                                            className="flex h-9 w-9 items-center justify-center rounded-full text-base font-bold text-white sm:h-11 sm:w-11 sm:text-lg"
                                            style={{
                                                background: 'linear-gradient(135deg, #88161c 0%, #a41219 100%)',
                                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                            }}
                                        >
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-[var(--dm-text)] sm:text-base">
                                                {user?.name || 'User'}
                                            </p>
                                            <p className="truncate text-xs text-[var(--dm-text-secondary)] capitalize">
                                                {user?.role || 'Tamu'}
                                            </p>
                                        </div>
                                        <Link
                                            href={auth.logout.url()}
                                            method="post"
                                            as="button"
                                            className="flex-shrink-0 rounded-xl p-1.5 text-[var(--dm-text-secondary)] hover:text-[var(--dm-accent)] sm:p-2"
                                            style={{
                                                background: 'var(--dm-surface-transparent)',
                                            }}
                                            title="Keluar"
                                        >
                                            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-8 pb-6 sm:pb-8 lg:pb-12">
                    <div className="mb-4 flex items-center gap-2 lg:hidden">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--dm-text)] transition-all"
                            style={{
                                background: 'var(--dm-surface-transparent)',
                                border: `1px solid var(--dm-surface-transparent-strong)`,
                                boxShadow: `0 2px 8px var(--dm-shadow)`,
                            }}
                        >
                            <Menu className="h-5 w-5" />
                            Menu
                        </button>
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#6B7280] transition-all"
                            style={{
                                background: 'var(--dm-surface-transparent)',
                                border: `1px solid var(--dm-surface-transparent-strong)`,
                            }}
                        >
                            <Search className="h-4 w-4" />
                        </button>
                        <NotificationCenter lightMode={!darkMode} />
                        <DarkModeToggle
                            darkMode={darkMode}
                            onToggle={toggleDarkMode}
                            size="sm"
                            className="h-9 w-9"
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>

        {user?.role === 'admin' && (
            <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
        )}
        <KeyboardShortcutsHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} shortcuts={shortcuts} />
        </>
    );
}
