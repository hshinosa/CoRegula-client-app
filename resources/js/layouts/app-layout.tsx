import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { PropsWithChildren, useState } from 'react';

import { SharedData } from '@/types';
import auth from '@/routes/auth';

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
    const [expandedItems, setExpandedItems] = useState<string[]>(() => {
        // Auto-expand active items with subItems
        return navItems
            .filter(item => item.active && item.subItems && item.subItems.length > 0)
            .map(item => item.name);
    });

    const user = authData?.user;

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
                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                            item.active
                                ? 'bg-primary-100 text-primary-800 shadow-sm dark:bg-primary-900/30 dark:text-primary-300'
                                : 'text-zinc-700 hover:bg-primary-50 hover:text-primary-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
                        }`}
                    >
                        <span className={item.active ? 'text-primary-600 dark:text-primary-400' : 'text-zinc-400'}>
                            {item.icon}
                        </span>
                        <span className="flex-1 text-left">{item.name}</span>
                        <motion.svg 
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="h-4 w-4 text-zinc-400" 
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
                                <div className="ml-4 mt-1 space-y-1 border-l-2 border-primary-100 pl-4 dark:border-zinc-700">
                                    {item.subItems!.map((subItem) => (
                                        <Link
                                            key={subItem.name}
                                            href={subItem.href}
                                            onClick={isMobile ? () => setSidebarOpen(false) : undefined}
                                            className={`block rounded-lg px-3 py-2 text-sm transition-all ${
                                                isSubItemActive(subItem.href)
                                                    ? 'bg-primary-50 font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                                                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
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
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    item.active
                        ? 'bg-primary-100 text-primary-800 shadow-sm dark:bg-primary-900/30 dark:text-primary-300'
                        : 'text-zinc-700 hover:bg-primary-50 hover:text-primary-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
            >
                <span className={item.active ? 'text-primary-600 dark:text-primary-400' : 'text-zinc-400'}>
                    {item.icon}
                </span>
                {item.name}
                {item.active && !hasSubItems && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-primary-500" />
                )}
            </Link>
        );
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-zinc-50 via-white to-primary-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            {/* Sidebar - Desktop */}
            <aside className="hidden w-72 flex-shrink-0 border-r border-primary-100 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 lg:block">
                <div className="flex h-full flex-col">
                    {/* Logo - Academic Style */}
                    <div className="flex h-20 items-center gap-3 border-b border-primary-100 px-6 dark:border-zinc-800">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary-200 bg-gradient-to-br from-primary-700 to-primary-900 shadow-md">
                            <svg
                                className="h-6 w-6 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                            </svg>
                        </div>
                        <div>
                            <span className="font-heading text-xl font-bold text-primary-900 dark:text-zinc-100">
                                CoRegula
                            </span>
                            <p className="text-xs font-medium text-primary-600 dark:text-primary-400">
                                Platform Pembelajaran
                            </p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
                        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Menu
                        </p>
                        {navItems.map((item) => renderNavItem(item, false))}
                    </nav>

                    {/* User Info - Academic Style */}
                    <div className="border-t border-primary-100 p-4 dark:border-zinc-800">
                        <div className="flex items-center gap-3 rounded-lg bg-primary-50/50 p-3 dark:bg-zinc-800/50">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary-200 bg-gradient-to-br from-primary-600 to-primary-800 font-heading text-lg font-bold text-white shadow-sm">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="truncate font-semibold text-primary-900 dark:text-zinc-100">
                                    {user?.name || 'User'}
                                </p>
                                <p className="truncate text-xs font-medium text-primary-600 capitalize dark:text-primary-400">
                                    {user?.role || 'Tamu'}
                                </p>
                            </div>
                            <Link
                                href={auth.logout.url()}
                                method="post"
                                as="button"
                                className="rounded-lg p-2 text-zinc-400 hover:bg-white hover:text-warning-600 hover:shadow-sm dark:hover:bg-zinc-700 dark:hover:text-warning-400"
                                title="Keluar"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    />
                                </svg>
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
                            transition={{ 
                                type: 'tween',
                                duration: 0.3,
                                ease: 'easeOut',
                            }}
                            className="fixed inset-y-0 left-0 z-50 w-72 border-r border-primary-100 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/95 lg:hidden"
                        >
                            {/* Same content as desktop sidebar */}
                            <div className="flex h-full flex-col">
                                {/* Logo - Academic Style */}
                                <div className="flex h-16 items-center justify-between border-b border-primary-100 px-4 dark:border-zinc-800 sm:h-20 sm:px-6">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary-200 bg-gradient-to-br from-primary-700 to-primary-900 shadow-md sm:h-12 sm:w-12">
                                            <svg
                                                className="h-5 w-5 text-white sm:h-6 sm:w-6"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="font-heading text-lg font-bold text-primary-900 dark:text-zinc-100 sm:text-xl">
                                                CoRegula
                                            </span>
                                            <p className="text-xs font-medium text-primary-600 dark:text-primary-400">
                                                Platform Pembelajaran
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSidebarOpen(false)}
                                        className="rounded-lg p-2 text-zinc-500 hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-zinc-800"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Navigation */}
                                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6">
                                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:mb-3">
                                        Menu
                                    </p>
                                    {navItems.map((item) => renderNavItem(item, true))}
                                </nav>

                                {/* User Info - Academic Style */}
                                <div className="border-t border-primary-100 p-3 dark:border-zinc-800 sm:p-4">
                                    <div className="flex items-center gap-2 rounded-lg bg-primary-50/50 p-2.5 dark:bg-zinc-800/50 sm:gap-3 sm:p-3">
                                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary-200 bg-gradient-to-br from-primary-600 to-primary-800 font-heading text-base font-bold text-white shadow-sm sm:h-11 sm:w-11 sm:text-lg">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-primary-900 dark:text-zinc-100 sm:text-base">
                                                {user?.name || 'User'}
                                            </p>
                                            <p className="truncate text-xs font-medium capitalize text-primary-600 dark:text-primary-400">
                                                {user?.role || 'Tamu'}
                                            </p>
                                        </div>
                                        <Link
                                            href={auth.logout.url()}
                                            method="post"
                                            as="button"
                                            className="flex-shrink-0 rounded-lg p-1.5 text-zinc-400 hover:bg-white hover:text-warning-600 hover:shadow-sm dark:hover:bg-zinc-700 dark:hover:text-warning-400 sm:p-2"
                                            title="Keluar"
                                        >
                                            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                />
                                            </svg>
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
                <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-8">
                    {/* Mobile Menu Button */}
                    <div className="mb-4 lg:hidden">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            Menu
                        </button>
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
    );
}
