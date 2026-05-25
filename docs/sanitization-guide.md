# Sanitization Guide

This guide documents how to safely handle user-generated content in the Kolabri client application to prevent XSS (Cross-Site Scripting) attacks.

## Overview

All user-generated content must be sanitized before rendering in the browser. The application uses DOMPurify for HTML sanitization with two utility functions:

- `sanitizeHtml()` - Allows safe formatting tags (bold, links, etc.)
- `sanitizeText()` - Strips all HTML tags (plain text only)

## When to Sanitize

**Always sanitize** user-generated content before rendering:

- Chat messages
- User names and profiles
- Course descriptions
- Group names
- Comments and feedback
- Search results with highlighting
- Any content from external sources

**Never trust** content from:
- API responses containing user input
- WebSocket messages
- URL parameters
- Form submissions
- Local storage

## Sanitization Functions

### Location

```typescript
// Primary implementation
import { sanitizeHtml, sanitizeText } from '@/utils/sanitize';

// Alternative (legacy)
import { sanitizeHtml } from '@/lib/sanitize';
```

### sanitizeHtml()

Use when you need to preserve formatting (bold, links, lists, etc.):

```typescript
import { sanitizeHtml } from '@/utils/sanitize';

// Allows safe HTML tags
const clean = sanitizeHtml(userContent);

// Render with dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: clean }} />
```

**Allowed tags:**
- Text formatting: `b`, `i`, `em`, `strong`, `u`, `s`, `strike`
- Links: `a` (with `href`, `title`, `class` attributes)
- Structure: `p`, `br`, `div`, `span`
- Lists: `ul`, `ol`, `li`
- Headings: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- Code: `code`, `pre`, `blockquote`

**Blocked:**
- Scripts: `<script>`, event handlers (`onclick`, etc.)
- Iframes, objects, embeds
- Forms and inputs
- Data attributes
- Unsafe URL schemes (javascript:, data:, etc.)

### sanitizeText()

Use when you want plain text only (no HTML):

```typescript
import { sanitizeText } from '@/utils/sanitize';

// Strips all HTML tags
const clean = sanitizeText(userContent);

// Render directly
<p>{clean}</p>
```

This is safer and should be the default choice unless formatting is required.

## Usage Examples

### Chat Messages

```typescript
import { sanitizeText } from '@/utils/sanitize';

function ChatMessage({ message }) {
    return (
        <div>
            <span className="font-medium">
                {sanitizeText(message.sender_name)}
            </span>
            <p className="whitespace-pre-wrap">
                {sanitizeText(message.content)}
            </p>
        </div>
    );
}
```

### Search Results with Highlighting

```typescript
import { sanitizeHtml } from '@/utils/sanitize';

function SearchResult({ result }) {
    // API returns highlighted content with <mark> tags
    const cleanHighlight = sanitizeHtml(result.highlighted_content);
    
    return (
        <div 
            dangerouslySetInnerHTML={{ __html: cleanHighlight }}
        />
    );
}
```

### User Profile Display

```typescript
import { sanitizeText } from '@/utils/sanitize';

function UserProfile({ user }) {
    return (
        <div>
            <h2>{sanitizeText(user.name)}</h2>
            <p>{sanitizeText(user.bio)}</p>
        </div>
    );
}
```

### Reply Preview

```typescript
import { sanitizeText } from '@/utils/sanitize';

function ReplyPreview({ replyTo }) {
    return (
        <div className="reply-preview">
            <span className="font-medium">
                {sanitizeText(replyTo.senderName)}
            </span>
            <p className="truncate">
                {sanitizeText(replyTo.content)}
            </p>
        </div>
    );
}
```

## Best Practices

1. **Sanitize at render time**, not at storage time
   - Store original content in database
   - Sanitize when displaying to users
   - Allows updating sanitization rules without data migration

2. **Default to `sanitizeText()`**
   - Use plain text unless formatting is required
   - Reduces attack surface

3. **Never use `dangerouslySetInnerHTML` without sanitization**
   ```typescript
   // WRONG - XSS vulnerability
   <div dangerouslySetInnerHTML={{ __html: userContent }} />
   
   // CORRECT
   <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userContent) }} />
   
   // BETTER - use plain text when possible
   <div>{sanitizeText(userContent)}</div>
   ```

4. **Sanitize all user-controlled data**
   - Even if you think it's safe
   - Even if it comes from your own API
   - Defense in depth

5. **Test with malicious input**
   ```typescript
   const malicious = '<script>alert("XSS")</script><img src=x onerror=alert(1)>';
   const safe = sanitizeHtml(malicious);
   // Result: empty string (all dangerous tags removed)
   ```

6. **Combine with CSP headers**
   - Content Security Policy provides additional protection
   - See `helmet` configuration in Core API

## Testing

```typescript
import { describe, it, expect } from 'vitest';
import { sanitizeHtml, sanitizeText } from '@/utils/sanitize';

describe('Sanitization', () => {
    it('should remove script tags', () => {
        const dirty = '<script>alert("XSS")</script>Hello';
        expect(sanitizeHtml(dirty)).toBe('Hello');
    });

    it('should remove event handlers', () => {
        const dirty = '<img src=x onerror=alert(1)>';
        expect(sanitizeHtml(dirty)).toBe('');
    });

    it('should allow safe formatting', () => {
        const dirty = '<b>Bold</b> and <a href="/safe">link</a>';
        const clean = sanitizeHtml(dirty);
        expect(clean).toContain('<b>Bold</b>');
        expect(clean).toContain('<a href="/safe">link</a>');
    });

    it('should strip all HTML in text mode', () => {
        const dirty = '<b>Bold</b> text';
        expect(sanitizeText(dirty)).toBe('Bold text');
    });
});
```

## Security Considerations

### XSS Attack Vectors

Sanitization protects against:
- Script injection: `<script>alert(1)</script>`
- Event handlers: `<img onerror="alert(1)">`
- JavaScript URLs: `<a href="javascript:alert(1)">`
- Data URLs: `<img src="data:text/html,<script>alert(1)</script>">`
- DOM clobbering: `<form name="getElementById">`

### Defense in Depth

Sanitization is one layer. Also use:
1. **Content Security Policy** (CSP headers)
2. **HTTP-only cookies** (prevent JS access to tokens)
3. **Input validation** (server-side, see [Validation Patterns](../../Kolabri-core-api/docs/validation-patterns.md))
4. **Output encoding** (automatic in React/Vue)
5. **HTTPS** (prevent MITM attacks)

### Known Limitations

- Sanitization cannot prevent all attacks (e.g., phishing links)
- Users can still post misleading content
- Combine with moderation and reporting features
- Consider rate limiting for spam prevention

## Configuration

DOMPurify configuration in `resources/js/utils/sanitize.ts`:

```typescript
DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [...],      // Whitelist of safe tags
    ALLOWED_ATTR: [...],      // Whitelist of safe attributes
    ALLOW_DATA_ATTR: false,   // Block data-* attributes
    ALLOWED_URI_REGEXP: /.../ // Restrict URL schemes
});
```

Modify this configuration if you need to:
- Add new safe tags (e.g., tables)
- Allow additional attributes
- Restrict URL schemes further

## Related Documentation

- [API Error Response Format](../../Kolabri-core-api/docs/API_ERROR_RESPONSES.md)
- [Validation Patterns](../../Kolabri-core-api/docs/validation-patterns.md)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
