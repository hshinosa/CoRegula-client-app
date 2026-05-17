import React from 'react';
import { describe, expect, it, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-chartjs-2', () => ({
    Radar: ({ data }: { data: { datasets: Array<{ data: number[] }> } }) => (
        <div data-testid="radar-chart" data-values={JSON.stringify(data.datasets[0]?.data)} />
    ),
}));

vi.mock('chart.js', () => ({
    Chart: { register: vi.fn() },
    RadialLinearScale: {},
    PointElement: {},
    LineElement: {},
    Filler: {},
    Tooltip: {},
    Legend: {},
}));

import MetricsRadarChart from '@/components/MetricsRadarChart';

describe('MetricsRadarChart', () => {
    it('renders loading skeleton when isLoading is true', () => {
        const { container } = render(<MetricsRadarChart isLoading={true} />);
        expect(container.querySelector('.animate-pulse')).toBeTruthy();
    });

    it('renders empty state when no data provided', () => {
        render(<MetricsRadarChart />);
        expect(screen.getByText('Data belum tersedia')).toBeTruthy();
    });

    it('renders empty state when data array is empty', () => {
        render(<MetricsRadarChart data={[]} />);
        expect(screen.getByText('Data belum tersedia')).toBeTruthy();
    });

    it('renders chart when data is provided', () => {
        render(<MetricsRadarChart data={[8.7, 7.4, 9.2, 6.9, 8.3, 7.8]} />);
        expect(screen.getByTestId('radar-chart')).toBeTruthy();
    });

    it('renders error state when error prop is provided', () => {
        render(<MetricsRadarChart error="Gagal memuat data" />);
        expect(screen.getByText('Gagal memuat data')).toBeTruthy();
    });

    it('uses provided labels', () => {
        const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
        const { container } = render(<MetricsRadarChart data={[1, 2, 3, 4, 5, 6]} labels={labels} />);
        expect(container.querySelector('[data-testid="radar-chart"]')).toBeTruthy();
    });
});
