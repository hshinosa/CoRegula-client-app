import { Chart as ChartJS, Filler, Legend, LineElement, PointElement, RadialLinearScale, Tooltip, type ChartData, type ChartOptions } from 'chart.js';
import React, { useMemo } from 'react';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface MetricsRadarChartProps {
    data?: number[];
    labels?: string[];
    isLoading?: boolean;
    error?: string;
}

const DEFAULT_LABELS = ['Hot', 'Lexical Variety', 'Forethought', 'Performance', 'Collaboration', 'Reflection'];

const RADAR_OPTIONS: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            titleColor: '#fff',
            bodyColor: '#fff',
            displayColors: false,
            callbacks: {
                label: (context) => `${context.raw} / 10`,
            },
        },
        title: {
            display: true,
            text: 'Metrik Total Kelas (Radar)',
            font: { size: 18, weight: 'bold' },
            padding: { bottom: 20 },
        },
    },
    scales: {
        r: {
            angleLines: { color: 'rgba(0,0,0,0.1)' },
            grid: { color: 'rgba(0,0,0,0.1)' },
            suggestedMin: 0,
            suggestedMax: 10,
            ticks: {
                stepSize: 2,
                color: '#6B7280',
                font: { size: 12 },
            },
            pointLabels: {
                font: { size: 13, weight: 'normal' },
                color: '#4A4A4A',
            },
        },
    },
};

const MetricsRadarChart: React.FC<MetricsRadarChartProps> = ({
    data,
    labels = DEFAULT_LABELS,
    isLoading = false,
    error,
}) => {
    const chartData = useMemo<ChartData<'radar'>>(() => ({
        labels,
        datasets: data ? [
            {
                label: 'Rata-rata Kelas',
                data,
                backgroundColor: 'rgba(136, 22, 28, 0.25)',
                borderColor: 'rgba(136, 22, 28, 1)',
                borderWidth: 3,
                pointBackgroundColor: '#88161c',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#88161c',
                pointRadius: 5,
                pointHoverRadius: 7,
            },
        ] : [],
    }), [data, labels]);

    if (isLoading) {
        return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-red-500 text-sm">
                {error}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                Data belum tersedia
            </div>
        );
    }

    return (
        <div className="h-full w-full">
            <Radar data={chartData} options={RADAR_OPTIONS} />
        </div>
    );
};

export default MetricsRadarChart;
