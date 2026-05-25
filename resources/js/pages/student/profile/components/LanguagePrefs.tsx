interface Props {
    language: string;
    onChange: (value: string) => void;
}

const languages = [
    { value: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
    { value: 'en', label: 'English', flag: '🇬🇧' },
];

export default function LanguagePrefs({ language, onChange }: Props) {
    return (
        <div className="space-y-2">
            {languages.map(({ value, label, flag }) => (
                <label
                    key={value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors ${
                        language === value
                            ? 'bg-blue-50 ring-2 ring-blue-500/30 dark:bg-blue-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                >
                    <input
                        type="radio"
                        name="language"
                        value={value}
                        checked={language === value}
                        onChange={() => onChange(value)}
                        className="h-4 w-4 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-lg">{flag}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                    </span>
                </label>
            ))}
        </div>
    );
}