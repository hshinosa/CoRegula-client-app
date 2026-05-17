import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-chartjs-2', () => ({
    Bar: ({ data }: { data: { datasets: Array<{ data: number[] }> } }) => (
        <div data-testid="bar-chart" data-plan={JSON.stringify(data.datasets[0]?.data)} data-diskusi={JSON.stringify(data.datasets[1]?.data)} />
    ),
}));

vi.mock('chart.js', () => ({
    Chart: { register: vi.fn() },
    CategoryScale: {},
    LinearScale: {},
    BarElement: {},
    Tooltip: {},
    Legend: {},
}));

import PlanVsDiskusiChart from '@/components/PlanVsDiskusiChart';

describe('PlanVsDiskusiChart', () => {
    it('renders loading skeleton when isLoading is true', () => {
        const { container } = render(<PlanVsDiskusiChart isLoading={true} />);
        expect(container.querySelector('.animate-pulse')).toBeTruthy();
    });

    it('renders empty state when no data provided', () => {
        render(<PlanVsDiskusiChart />);
        expect(screen.getByText('Data belum tersedia')).toBeTruthy();
    });

    it('renders empty state when planData is empty', () => {
        render(<PlanVsDiskusiChart planData={[]} diskusiData={[1, 2, 3, 4]} />);
        expect(screen.getByText('Data belum tersedia')).toBeTruthy();
    });

    it('renders chart when both data arrays are provided', () => {
        render(<PlanVsDiskusiChart planData={[12, 19, 15, 22]} diskusiData={[8, 15, 20, 18]} />);
        expect(screen.getByTestId('bar-chart')).toBeTruthy();
    });

    it('renders error state when error prop is provided', () => {
        render(<PlanVsDiskusiChart error="Gagal memuat data chart" />);
        expect(screen.getByText('Gagal memuat data chart')).toBeTruthy();
    });
});
