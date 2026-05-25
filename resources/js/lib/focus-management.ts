const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

const isVisible = (element: HTMLElement): boolean => {
    return element.getAttribute('aria-hidden') !== 'true' && !element.hasAttribute('hidden');
};

export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isVisible);
};

export const focusFirstElement = (container: HTMLElement): boolean => {
    const [firstElement] = getFocusableElements(container);

    if (firstElement) {
        firstElement.focus();
        return true;
    }

    container.focus();
    return false;
};

interface TabKeyLikeEvent {
    key: string;
    shiftKey: boolean;
    preventDefault: () => void;
}

export const trapFocusWithin = (container: HTMLElement, event: TabKeyLikeEvent): boolean => {
    if (event.key !== 'Tab') {
        return false;
    }

    const focusableElements = getFocusableElements(container);

    if (focusableElements.length === 0) {
        event.preventDefault();
        container.focus();
        return true;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return true;
    }

    if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
        return true;
    }

    return false;
};
