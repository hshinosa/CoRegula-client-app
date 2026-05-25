import { sanitizeHtml, sanitizeText } from '../utils/sanitize';

describe('XSS Protection Tests', () => {
    describe('sanitizeHtml', () => {
        it('blocks script tags', () => {
            const malicious = '<script>alert("xss")</script>';
            const result = sanitizeHtml(malicious);
            expect(result).not.toContain('<script>');
            expect(result).not.toContain('alert');
        });

        it('blocks img onerror', () => {
            const malicious = '<img src="x" onerror="alert(\'xss\')">';
            const result = sanitizeHtml(malicious);
            expect(result).not.toContain('onerror');
            expect(result).not.toContain('alert');
        });

        it('blocks onclick handlers', () => {
            const malicious = '<div onclick="alert(\'xss\')">Click me</div>';
            const result = sanitizeHtml(malicious);
            expect(result).not.toContain('onclick');
            expect(result).not.toContain('alert');
        });

        it('blocks javascript: URLs', () => {
            const malicious = '<a href="javascript:alert(\'xss\')">Click</a>';
            const result = sanitizeHtml(malicious);
            expect(result).not.toContain('javascript:');
        });

        it('preserves safe bold tags', () => {
            const safe = '<b>Bold text</b>';
            const result = sanitizeHtml(safe);
            expect(result).toContain('<b>');
            expect(result).toContain('Bold text');
        });

        it('preserves safe italic tags', () => {
            const safe = '<i>Italic text</i>';
            const result = sanitizeHtml(safe);
            expect(result).toContain('<i>');
            expect(result).toContain('Italic text');
        });

        it('preserves safe links', () => {
            const safe = '<a href="https://example.com">Link</a>';
            const result = sanitizeHtml(safe);
            expect(result).toContain('<a');
            expect(result).toContain('href="https://example.com"');
            expect(result).toContain('Link');
        });

        it('preserves safe lists', () => {
            const safe = '<ul><li>Item 1</li><li>Item 2</li></ul>';
            const result = sanitizeHtml(safe);
            expect(result).toContain('<ul>');
            expect(result).toContain('<li>');
            expect(result).toContain('Item 1');
        });
    });

    describe('sanitizeText', () => {
        it('strips all HTML tags', () => {
            const html = '<b>Bold</b> <i>Italic</i>';
            const result = sanitizeText(html);
            expect(result).not.toContain('<b>');
            expect(result).not.toContain('<i>');
            expect(result).toContain('Bold');
            expect(result).toContain('Italic');
        });

        it('blocks script in plain text mode', () => {
            const malicious = '<script>alert("xss")</script>Hello';
            const result = sanitizeText(malicious);
            expect(result).not.toContain('<script>');
            expect(result).not.toContain('alert');
        });
    });
});
