import { motion } from 'framer-motion';

export function PasswordStrengthMeter({ password, lightMode = true }: { password: string; lightMode?: boolean }) {
    let score = 0;

    if (password.length > 0) {
        if (password.length >= 8) score += 1;
        if (password.match(/[A-Z]/) && password.match(/[a-z]/)) score += 1;
        if (password.match(/[0-9]/)) score += 1;
        if (password.match(/[^A-Za-z0-9]/)) score += 1;
    }

    const isTooShort = password.length > 0 && password.length < 8;

    const getStrengthColor = () => {
        if (isTooShort) return '#ef4444';
        if (score === 0) return lightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)';
        if (score === 1) return '#ef4444';
        if (score === 2) return '#f59e0b';
        if (score === 3) return '#10b981';
        if (score === 4) return '#059669';
        return lightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)';
    };

    const getStrengthLabel = () => {
        if (isTooShort) return 'Terlalu Pendek';
        if (score === 0) return '';
        if (score === 1) return 'Lemah';
        if (score === 2) return 'Sedang';
        if (score === 3) return 'Kuat';
        if (score === 4) return 'Sangat Kuat';
        return '';
    };

    const strengthColor = getStrengthColor();

    const getHintText = () => {
        if (isTooShort) return 'Kata sandi harus minimal 8 karakter.';
        if (password.length === 0) return '';
        const missing = [];
        if (!password.match(/[A-Z]/)) missing.push('huruf besar');
        if (!password.match(/[a-z]/)) missing.push('huruf kecil');
        if (!password.match(/[0-9]/)) missing.push('angka');
        if (!password.match(/[^A-Za-z0-9]/)) missing.push('simbol');
        if (missing.length > 0) return `Tambahkan ${missing.join(', ')} untuk keamanan lebih baik.`;
        return '';
    };

    const displayScore = isTooShort ? 0 : score;

    return (
        <div className="mt-2 w-full">
            <div className="mb-1 flex justify-between text-xs font-medium">
                <span style={{ color: lightMode ? '#64748b' : '#94a3b8' }}>
                    Kekuatan Sandi
                </span>
                <span style={{ color: strengthColor }}>
                    {getStrengthLabel()}
                </span>
            </div>

            <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full">
                {[1, 2, 3, 4].map((level) => {
                    const isActive = displayScore >= level;
                    const isDefault = displayScore === 0;

                    return (
                        <motion.div
                            key={level}
                            className="h-full flex-1 transition-all duration-300"
                            animate={{
                                backgroundColor: isActive ? strengthColor : (isDefault ? (lightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)') : (lightMode ? '#f1f5f9' : 'rgba(255,255,255,0.05)'))
                            }}
                        />
                    );
                })}
            </div>

            {getHintText() && (
                <p className="mt-1.5 text-[10px]" style={{ color: isTooShort ? '#ef4444' : (lightMode ? '#64748b' : '#94a3b8') }}>
                    {getHintText()}
                </p>
            )}
        </div>
    );
}
