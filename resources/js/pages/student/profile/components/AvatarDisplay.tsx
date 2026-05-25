import { getInitials } from '../utils/avatar-helpers';

interface Props {
    avatarUrl: string | null;
    userName: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-20 w-20 text-lg',
    xl: 'h-28 w-28 text-2xl',
};

const colorMap = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-rose-500',
];

function getColorFromName(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colorMap[Math.abs(hash) % colorMap.length];
}

export default function AvatarDisplay({ avatarUrl, userName, size = 'md', className = '' }: Props) {
    const initials = getInitials(userName);
    const fallbackColor = getColorFromName(userName);
    const sizeClass = sizeClasses[size];

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={`Foto profil ${userName}`}
                className={`${sizeClass} rounded-full object-cover ring-2 ring-white/30 dark:ring-gray-700/50 ${className}`}
                onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                        const fallback = parent.querySelector('[data-avatar-fallback]') as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                    }
                }}
            />
        );
    }

    return (
        <div
            className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white/30 dark:ring-gray-700/50 ${fallbackColor} ${className}`}
            aria-label={`Inisial ${userName}`}
        >
            {initials}
        </div>
    );
}

export { getColorFromName };