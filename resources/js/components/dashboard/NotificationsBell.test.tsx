import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NotificationsBell from './NotificationsBell';

vi.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
        button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
        div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    },
}));

vi.mock('react-dom', async () => {
    const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
    return {
        ...actual,
        createPortal: (node: React.ReactNode) => node,
    };
});

vi.mock('@/components/ui/toaster', () => ({
    toast: {
        error: vi.fn(),
    },
}));

describe('NotificationsBell', () => {
    it('does not render notification bell while feature is temporarily hidden', () => {
        const { container } = render(<NotificationsBell lightMode={true} />);

        expect(container).toBeEmptyDOMElement();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
