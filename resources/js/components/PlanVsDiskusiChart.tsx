import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip, type ChartData, type ChartOptions } from 'chart.js';
import React from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface PlanVsDiskusiChartProps {
    planData?: number[];
    diskusiData?: number[];
    weekLabels?: string[];
    isLoading?: boolean;
    error?: string;
}

const DEFAULT_LABELS = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];

const PlanVsDiskusiChart: React.FC<PlanVsDiskusiChartProps> = ({
    planData,
    diskusiData,
    weekLabels = DEFAULT_LABELS,
    isLoading = false,
    error,
}) => {
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

    if (!planData || !diskusiData || planData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                Data belum tersedia
            </div>
        );
    }

    const data: ChartData<'bar'> = {
        labels: weekLabels,
        datasets: [
            {
                label: 'Plan',
                data: planData,
                backgroundColor: 'rgba(136, 22, 28, 0.75)',
                borderColor: 'rgba(136, 22, 28, 1)',
                borderWidth: 2,
                borderRadius: 6,
                barPercentage: 0.5,
                categoryPercentage: 0.5,
            },
            {
                label: 'Diskusi',
                data: diskusiData,
                backgroundColor: 'rgba(74, 74, 74, 0.65)',
                borderColor: 'rgba(74, 74, 74, 1)',
                borderWidth: 2,
                borderRadius: 6,
                barPercentage: 0.5,
                categoryPercentage: 0.5,
            },
        ],
    };

    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 800,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        family: "'Plus Jakarta Sans', sans-serif",
                        size: 13,
                    },
                    color: '#4A4A4A',
                },
            },
            tooltip: {
                backgroundColor: 'rgba(255,255,255,0.95)',
                titleColor: '#4A4A4A',
                bodyColor: '#6B7280',
                borderColor: 'rgba(136,22,28,0.15)',
                borderWidth: 1,
                padding: 12,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: '#6B7280',
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0,0,0,0.05)',
                },
                ticks: {
                    color: '#6B7280',
                },
            },
        },
    };

    return (
        <div className="h-full w-full">
            <Bar data={data} options={options} />
        </div>
    );
};

export default PlanVsDiskusiChart;
