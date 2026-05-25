import { beforeEach, describe, expect, it, vi } from 'vitest';

import { focusFirstElement, getFocusableElements, trapFocusWithin } from './focus-management';

describe('focus-management', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('returns focusable elements in tab order', () => {
        document.body.innerHTML = `
            <div id="dialog" tabindex="-1">
                <button id="first">First</button>
                <input id="second" type="text" />
                <button id="disabled" disabled>Disabled</button>
                <a id="third" href="#">Third</a>
            </div>
        `;

        const dialog = document.getElementById('dialog') as HTMLElement;

        expect(getFocusableElements(dialog).map((element) => element.id)).toEqual(['first', 'second', 'third']);
    });

    it('focuses the first interactive element in a container', () => {
        document.body.innerHTML = `
            <div id="dialog" tabindex="-1">
                <button id="first">First</button>
                <button id="second">Second</button>
            </div>
        `;

        const dialog = document.getElementById('dialog') as HTMLElement;
        const first = document.getElementById('first') as HTMLButtonElement;

        focusFirstElement(dialog);

        expect(document.activeElement).toBe(first);
    });

    it('wraps focus from the last element back to the first on Tab', () => {
        document.body.innerHTML = `
            <div id="dialog" tabindex="-1">
                <button id="first">First</button>
                <button id="second">Second</button>
            </div>
        `;

        const dialog = document.getElementById('dialog') as HTMLElement;
        const first = document.getElementById('first') as HTMLButtonElement;
        const second = document.getElementById('second') as HTMLButtonElement;
        const preventDefault = vi.fn();

        second.focus();

        const trapped = trapFocusWithin(dialog, {
            key: 'Tab',
            shiftKey: false,
            preventDefault,
        });

        expect(trapped).toBe(true);
        expect(preventDefault).toHaveBeenCalledOnce();
        expect(document.activeElement).toBe(first);
    });

    it('wraps focus from the first element to the last on Shift+Tab', () => {
        document.body.innerHTML = `
            <div id="dialog" tabindex="-1">
                <button id="first">First</button>
                <button id="second">Second</button>
            </div>
        `;

        const dialog = document.getElementById('dialog') as HTMLElement;
        const first = document.getElementById('first') as HTMLButtonElement;
        const second = document.getElementById('second') as HTMLButtonElement;
        const preventDefault = vi.fn();

        first.focus();

        const trapped = trapFocusWithin(dialog, {
            key: 'Tab',
            shiftKey: true,
            preventDefault,
        });

        expect(trapped).toBe(true);
        expect(preventDefault).toHaveBeenCalledOnce();
        expect(document.activeElement).toBe(second);
    });
});
