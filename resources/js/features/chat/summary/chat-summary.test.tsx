import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChatSummaryCard } from './chat-summary-card';

describe('ChatSummaryCard', () => {
    it('shows loading state', () => {
        render(<ChatSummaryCard state={{ status: 'loading' }} onOpenDetail={() => {}} />);
        expect(screen.getByText('Sedang memuat ringkasan diskusi...')).toBeInTheDocument();
    });

    it('shows empty state', () => {
        render(<ChatSummaryCard state={{ status: 'empty' }} onOpenDetail={() => {}} />);
        expect(screen.getByText('Ringkasan diskusi belum tersedia untuk room ini.')).toBeInTheDocument();
    });

    it('shows error state', () => {
        render(<ChatSummaryCard state={{ status: 'error', message: 'Ringkasan tidak dapat dimuat saat ini. Coba lagi.' }} onOpenDetail={() => {}} />);
        expect(screen.getByText('Ringkasan tidak dapat dimuat saat ini. Coba lagi.')).toBeInTheDocument();
    });

    it('shows headline and key points in ready state', () => {
        render(
            <ChatSummaryCard
                state={{
                    status: 'ready',
                    summary: {
                        roomId: 'room-1',
                        headline: 'Diskusi berfokus pada pembagian tugas kelompok.',
                        keyPoints: ['Poin 1', 'Poin 2', 'Poin 3'],
                        detailedSummary: 'Detail lengkap diskusi.',
                        generatedAt: '2026-05-02T10:00:00.000Z',
                    },
                }}
                onOpenDetail={() => {}}
            />,
        );

        expect(screen.getByText('Diskusi berfokus pada pembagian tugas kelompok.')).toBeInTheDocument();
        expect(screen.getByText('Poin 1')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Lihat detail' })).toBeInTheDocument();
    });
});
