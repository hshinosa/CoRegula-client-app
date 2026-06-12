import type { Config } from 'tailwindcss';

export default {
    theme: {
        extend: {
            spacing: {
                'safe-top': 'var(--safe-top)',
                'safe-right': 'var(--safe-right)',
                'safe-bottom': 'var(--safe-bottom)',
                'safe-left': 'var(--safe-left)',
            },
        },
    },
} satisfies Config;
