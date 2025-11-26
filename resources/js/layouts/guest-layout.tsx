import { motion } from 'framer-motion';
import { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary-50 via-white to-primary-50 px-4 py-12 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            {/* Academic Pattern Background */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234338ca' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />

            {/* Logo */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 mb-10"
            >
                <div className="flex flex-col items-center">
                    {/* University-style Crest/Logo */}
                    <div className="relative mb-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary-200 bg-gradient-to-br from-primary-700 to-primary-900 shadow-lg dark:border-primary-700">
                            <svg
                                className="h-10 w-10 text-white"
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
                        {/* Decorative Elements */}
                        <div className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-accent-400" />
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-accent-500" />
                    </div>
                    <h1 className="font-heading text-3xl font-bold tracking-tight text-primary-900 dark:text-zinc-100">
                        CoRegula
                    </h1>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="h-px w-8 bg-accent-400" />
                        <p className="text-sm font-medium uppercase tracking-widest text-primary-600 dark:text-primary-400">
                            Collaborative Learning Platform
                        </p>
                        <span className="h-px w-8 bg-accent-400" />
                    </div>
                </div>
            </motion.div>

            <div className="relative z-10 w-full max-w-md">
                {children}
            </div>

            {/* Academic Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="relative z-10 mt-8 text-center text-xs text-zinc-500 dark:text-zinc-500"
            >
                <p>AI-Powered Co-Regulated Learning Environment</p>
                <p className="mt-1 font-medium text-primary-600 dark:text-primary-400">
                    Est. 2024 • Educational Excellence
                </p>
            </motion.footer>
        </div>
    );
}
