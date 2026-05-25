import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AISummaryButton } from './AISummaryButton';

describe('AISummaryButton', () => {
    it('calls onSummarize when clicked', () => {
        const onSummarize = vi.fn();

        render(<AISummaryButton onSummarize={onSummarize} isLoading={false} />);

        fireEvent.click(screen.getByRole('button', { name: 'Ringkas percakapan' }));

        expect(onSummarize).toHaveBeenCalledTimes(1);
    });

    it('shows spinner and disables the button while loading', () => {
        render(<AISummaryButton onSummarize={() => {}} isLoading={true} />);

        const button = screen.getByRole('button', { name: 'Ringkas percakapan' });

        expect(button).toBeDisabled();
        expect(button.querySelector('svg')).not.toBeNull();
    });
});
