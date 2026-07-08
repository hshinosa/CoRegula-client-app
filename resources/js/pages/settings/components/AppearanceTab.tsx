import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { LiquidGlassCard } from '@/components/Welcome/utils/helpers';

interface AppearanceTabProps {
    theme: string;
    onThemeChange: (theme: string) => void;
}

export function AppearanceTab({ theme, onThemeChange }: AppearanceTabProps) {
    const themeOptions = [
        { id: 'light', label: 'Terang', icon: Sun, description: 'Tema terang untuk siang hari' },
        { id: 'dark', label: 'Gelap', icon: Moon, description: 'Tema gelap untuk malam hari' },
        { id: 'system', label: 'Ikuti Sistem', icon: Monitor, description: 'Otomatis sesuai pengaturan perangkat' },
    ];

    return (
        <div className="space-y-6">
            <LiquidGlassCard intensity="medium" className="p-6" lightMode={true}>
                <h2 className="mb-6 text-lg font-semibold text-brand-dark">
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
                                    ? 'border-brand-primary'
                                    : 'border-neutral-200 bg-white hover:border-[rgba(136,22,28,0.15)]'
                            }`}
                            style={theme === option.id ? { backgroundColor: 'rgba(136,22,28,0.08)' } : {}}
                        >
                            <div
                                className={`rounded-full p-3 ${
                                    theme === option.id ? 'bg-brand-primary text-white' : 'bg-neutral-100 text-brand-muted'
                                }`}
                            >
                                <option.icon className="h-6 w-6" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-brand-dark">{option.label}</p>
                                <p className="text-xs text-brand-muted">{option.description}</p>
                            </div>
                        </motion.button>
                    ))}
                </div>

                <div className="mt-6 rounded-xl p-4" style={{ backgroundColor: 'rgba(136,22,28,0.08)' }}>
                    <p className="text-sm text-brand-dark">
                        Tema akan diterapkan secara otomatis dan disimpan ke akun Anda.
                    </p>
                </div>
            </LiquidGlassCard>

        </div>
    );
}
