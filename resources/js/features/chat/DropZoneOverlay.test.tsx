import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DropZoneOverlay } from './DropZoneOverlay';

describe('DropZoneOverlay', () => {
    it('shows the drop message while dragging', () => {
        render(<DropZoneOverlay isDragging={true} />);

        expect(screen.getByText('Drop file di sini')).toBeInTheDocument();
        expect(screen.getByText('Gambar, PDF, dokumen, atau kode hingga 10MB')).toBeInTheDocument();
    });

    it('hides itself when dragging is inactive', () => {
        render(<DropZoneOverlay isDragging={false} />);

        expect(screen.queryByText('Drop file di sini')).not.toBeInTheDocument();
    });
});
