import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { LiquidGlassCard } from '@/components/Welcome/utils/helpers';

interface AppearanceTabProps {
    theme: string;
    language: string;
    onThemeChange: (theme: string) => void;
    onLanguageChange: (lang: string) => void;
}

export function AppearanceTab({ theme, language, onThemeChange, onLanguageChange }: AppearanceTabProps) {
    const themeOptions = [
        { id: 'light', label: 'Terang', icon: Sun, description: 'Tema terang untuk siang hari' },
        { id: 'dark', label: 'Gelap', icon: Moon, description: 'Tema gelap untuk malam hari' },
        { id: 'system', label: 'Ikuti Sistem', icon: Monitor, description: 'Otomatis sesuai pengaturan perangkat' },
    ];

    const languageOptions = [
        { id: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
        { id: 'en', label: 'English', flag: '🇬🇧' },
    ];

    return (
        <div className="space-y-6">
            <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                <h2 className="mb-6 text-lg font-semibold text-neutral-800">
                    Tema Tampilan
                </h2>

                <div className="grid gap-4 sm:grid-cols-3">
                    {themeOptions.map((option) => (
                        <motion.button
                            key={option.id}
                            onClick={() => onThemeChange(option.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all ${
                                theme === option.id
                                    ? 'border-primary-600 bg-primary-50'
                                    : 'border-neutral-200 bg-white hover:border-primary-300'
                            }`}
                        >
                            <div
                                className={`rounded-full p-3 ${
                                    theme === option.id ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600'
                                }`}
                            >
                                <option.icon className="h-6 w-6" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-neutral-800">{option.label}</p>
                                <p className="text-xs text-neutral-500">{option.description}</p>
                            </div>
                        </motion.button>
                    ))}
                </div>

                <div className="mt-6 rounded-xl bg-primary-50 p-4">
                    <p className="text-sm text-primary-800">
                        Tema akan diterapkan secara otomatis dan disimpan ke akun Anda.
                    </p>
                </div>
            </LiquidGlassCard>

            <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                <h2 className="mb-6 text-lg font-semibold text-neutral-800">
                    Bahasa
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                    {languageOptions.map((option) => (
                        <motion.button
                            key={option.id}
                            onClick={() => onLanguageChange(option.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                                language === option.id
                                    ? 'border-primary-600 bg-primary-50'
                                    : 'border-neutral-200 bg-white hover:border-primary-300'
                            }`}
                        >
                            <span className="text-3xl">{option.flag}</span>
                            <p className="font-medium text-neutral-800">{option.label}</p>
                            {language === option.id && (
                                <div className="ml-auto h-2 w-2 rounded-full bg-primary-600" />
                            )}
                        </motion.button>
                    ))}
                </div>

                <div className="mt-6 rounded-xl bg-caution-50 p-4">
                    <p className="text-sm text-caution-800">
                        <strong>Catatan:</strong> Perubahan bahasa akan diterapkan pada seluruh antarmuka aplikasi.
                    </p>
                </div>
            </LiquidGlassCard>
        </div>
    );
}
