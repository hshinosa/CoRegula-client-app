import { Sun, Moon, Monitor } from 'lucide-react';

interface Props {
    theme: string;
    onChange: (value: string) => void;
}

const themes = [
    { value: 'light', label: 'Terang', icon: Sun, description: 'Tampilan terang sepanjang waktu' },
    { value: 'dark', label: 'Gelap', icon: Moon, description: 'Tampilan gelap sepanjang waktu' },
    { value: 'system', label: 'Sistem', icon: Monitor, description: 'Mengikuti pengaturan perangkat' },
];

export default function ThemePrefs({ theme, onChange }: Props) {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {themes.map(({ value, label, icon: Icon, description }) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => onChange(value)}
                    className={`flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all ${
                        theme === value
                            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                            : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500'
                    }`}
                >
                    <Icon
                        className={`mb-2 h-6 w-6 ${
                            theme === value
                                ? 'text-blue-500 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-500'
                        }`}
                    />
                    <span
                        className={`text-sm font-medium ${
                            theme === value
                                ? 'text-blue-700 dark:text-blue-300'
                                : 'text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        {label}
                    </span>
                    <span className="mt-1 text-xs text-gray-600 dark:text-gray-500">
                        {description}
                    </span>
                </button>
            ))}
        </div>
    );
}

export { themes };