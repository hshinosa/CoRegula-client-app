import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/Unit/setup.ts', './resources/js/test/setup.ts'],
        include: [
            'tests/Unit/**/*.test.{ts,tsx}',
            'resources/js/**/*.test.{ts,tsx}',
        ],
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'resources/js'),
        },
    },
});
