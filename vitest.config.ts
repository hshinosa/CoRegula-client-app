import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/unit/setup.ts', './resources/js/test/setup.ts'],
        include: [
            'tests/{Unit,unit}/**/*.test.{ts,tsx}',
            'resources/js/**/*.test.{ts,tsx}',
        ],
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'resources/js'),
        },
    },
});
