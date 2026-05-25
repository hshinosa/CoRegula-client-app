import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface QuickAction {
    href: string;
    icon: LucideIcon;
    title: string;
    desc: string;
    color?: string;
}

interface QuickActionsGridProps {
    actions: QuickAction[];
    lightMode?: boolean;
}

export default function QuickActionsGrid({ actions, lightMode = true }: QuickActionsGridProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {actions.map((action, index) => (
                <motion.div
                    key={action.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                >
                    <Link
                        href={action.href}
                        className="group flex items-center gap-4 rounded-2xl p-4 transition-all"
                        style={{
                            background: lightMode ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.05)',
                            border: lightMode ? '1px solid rgba(255,255,255,0.6)' : '1px solid rgba(255,255,255,0.08)',
                            boxShadow: lightMode ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = lightMode ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.boxShadow = lightMode ? '0 4px 16px rgba(0,0,0,0.08)' : '0 4px 16px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = lightMode ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.boxShadow = lightMode ? '0 2px 8px rgba(0,0,0,0.04)' : 'none';
                        }}
                    >
                        <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl transition-all group-hover:scale-110"
                            style={{
                                background: `${action.color ?? '#88161c'}10`,
                                border: `1px solid ${action.color ?? '#88161c'}20`,
                            }}
                        >
                            <action.icon className="h-6 w-6" style={{ color: action.color ?? '#88161c' }} />
                        </div>
                        <div>
                            <p className="font-medium" style={{ color: lightMode ? '#4A4A4A' : '#e5e7eb' }}>
                                {action.title}
                            </p>
                            <p className="text-sm" style={{ color: lightMode ? '#6B7280' : '#9ca3af' }}>
                                {action.desc}
                            </p>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}
