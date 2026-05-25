import { Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    lightMode?: boolean;
}

export default function Breadcrumbs({ items, lightMode = true }: BreadcrumbsProps) {
    return (
        <nav className="mb-4 flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
            <Link
                href="/dashboard"
                className="flex items-center gap-1 transition-colors hover:opacity-80"
                style={{ color: lightMode ? '#6B7280' : '#9ca3af' }}
            >
                <Home className="h-3.5 w-3.5" />
            </Link>
            {items.map((item, index) => (
                <span key={index} className="flex items-center gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5" style={{ color: lightMode ? '#9ca3af' : '#4b5563' }} />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="transition-colors hover:opacity-80"
                            style={{ color: lightMode ? '#6B7280' : '#9ca3af' }}
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span style={{ color: lightMode ? '#4A4A4A' : '#e5e7eb', fontWeight: 500 }}>
                            {item.label}
                        </span>
                    )}
                </span>
            ))}
        </nav>
    );
}
