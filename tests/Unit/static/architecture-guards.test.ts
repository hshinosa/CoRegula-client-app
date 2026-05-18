import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

function grepInPages(pattern: string, allowedFiles: string[] = []): string[] {
    try {
        const result = execSync(
            `grep -rn -E "${pattern}" resources/js/pages || true`,
            { encoding: 'utf8' }
        );
        return result
            .split('\n')
            .filter(Boolean)
            .filter((line) => !allowedFiles.some((allowed) => line.startsWith(allowed)));
    } catch {
        return [];
    }
}

const SOCKET_AUTH_ALLOWED = [
    'resources/js/pages/student/chat/index.tsx',
    'resources/js/pages/student/chat/room.tsx',
    'resources/js/pages/lecturer/analytics/index.tsx',
    'resources/js/pages/lecturer/analytics/show.tsx',
];

describe('BFF boundary enforcement', () => {
    it('forbids Authorization Bearer with jwtToken in pages', () => {
        const violations = grepInPages('Authorization.*Bearer.*\\\\\\$\\{jwtToken\\}');
        expect(violations, `Direct Core call with raw JWT found:\n${violations.join('\n')}`).toEqual([]);
    });

    it('forbids fetch with VITE_API_URL in pages', () => {
        const violations = grepInPages(
            'fetch\\(`?\\\\\\$\\{(apiBaseUrl|apiUrl)\\}/api',
            SOCKET_AUTH_ALLOWED
        );
        expect(violations, `Direct Core fetch found:\n${violations.join('\n')}`).toEqual([]);
    });

    it('forbids getCoreApiUrl helper in pages', () => {
        const violations = grepInPages('getCoreApiUrl');
        expect(violations, `getCoreApiUrl usage found:\n${violations.join('\n')}`).toEqual([]);
    });
});

describe('No legacy auth imports', () => {
    it('app.tsx does not import setupAxiosInterceptors', () => {
        const result = execSync(
            "grep -n 'setupAxiosInterceptors\\|@/lib/auth\\b\\|@/lib/useAuth' resources/js/app.tsx || true",
            { encoding: 'utf8' }
        );
        expect(result.trim(), `Legacy auth imported in app.tsx:\n${result}`).toBe('');
    });

    it('no file imports from @/lib/auth or @/lib/useAuth', () => {
        const result = execSync(
            "grep -rn \"from '@/lib/auth\\|from '@/lib/useAuth\" resources/js || true",
            { encoding: 'utf8' }
        );
        expect(result.trim(), `Legacy auth imports remain:\n${result}`).toBe('');
    });
});

describe('Test discovery coverage', () => {
    it('discovers React component tests in tests/Unit', () => {
        const result = execSync(
            "find tests/Unit -name '*.test.tsx' -o -name '*.test.ts' 2>/dev/null | wc -l",
            { encoding: 'utf8' }
        );
        const count = parseInt(result.trim(), 10);
        expect(count, `Component tests in tests/Unit: ${count}`).toBeGreaterThanOrEqual(5);
    });

    it('discovers feature tests in resources/js/features', () => {
        const result = execSync(
            "find resources/js/features -name '*.test.tsx' -o -name '*.test.ts' 2>/dev/null | wc -l",
            { encoding: 'utf8' }
        );
        const count = parseInt(result.trim(), 10);
        expect(count, `Feature tests: ${count}`).toBeGreaterThanOrEqual(2);
    });
});
