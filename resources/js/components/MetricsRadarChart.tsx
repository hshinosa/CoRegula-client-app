import { Chart as ChartJS, Filler, Legend, LineElement, PointElement, RadialLinearScale, Tooltip, type ChartData, type ChartOptions } from 'chart.js';
import React, { useMemo } from 'react';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface MetricsRadarChartProps {
    data?: number[];
    labels?: string[];
    isLoading?: boolean;
    error?: string;
    primaryLabel?: string;
    comparisonData?: number[];
    comparisonLabel?: string;
    classAverageData?: number[];
    classAverageLabel?: string;
    showLegend?: boolean;
    title?: string;
}

const DEFAULT_LABELS = ['Hot', 'Lexical Variety', 'Forethought', 'Performance', 'Collaboration', 'Reflection'];

const buildOptions = (showLegend: boolean, title?: string): ChartOptions<'radar'> => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: showLegend,
            position: 'top',
            labels: {
                font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
                color: '#4A4A4A',
                boxWidth: 18,
                boxHeight: 12,
                padding: 16,
            },
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            titleColor: '#fff',
            bodyColor: '#fff',
            displayColors: true,
            callbacks: {
                label: (context) => `${context.dataset.label ?? ''}: ${context.formattedValue} / 10`,
            },
        },
        title: title
            ? {
                display: true,
                text: title,
                font: { size: 16, weight: 'bold' },
                padding: { bottom: 16 },
                color: '#4A4A4A',
            }
            : { display: false },
    },
    scales: {
        r: {
            angleLines: { color: 'rgba(0,0,0,0.1)' },
            grid: { color: 'rgba(0,0,0,0.1)' },
            suggestedMin: 0,
            suggestedMax: 10,
            ticks: { stepSize: 2, color: '#6B7280', font: { size: 11 } },
            pointLabels: {
                font: { size: 12, weight: 'normal' },
                color: '#4A4A4A',
            },
        },
    },
});

const MetricsRadarChart: React.FC<MetricsRadarChartProps> = ({
    data,
    labels = DEFAULT_LABELS,
    isLoading = false,
    error,
    primaryLabel = 'Rata-rata Kelas',
    comparisonData,
    comparisonLabel,
    classAverageData,
    classAverageLabel = 'Rata-rata kelas',
    showLegend = false,
    title,
}) => {
    const chartData = useMemo<ChartData<'radar'>>(() => {
        const datasets: ChartData<'radar'>['datasets'] = [];

        if (classAverageData && classAverageData.length > 0) {
            datasets.push({
                label: classAverageLabel,
                data: classAverageData,
                backgroundColor: 'rgba(74, 74, 74, 0.08)',
                borderColor: 'rgba(74, 74, 74, 0.30)',
                borderWidth: 1.5,
                borderDash: [4, 4],
                pointRadius: 0,
                pointHoverRadius: 4,
                pointBackgroundColor: 'rgba(74, 74, 74, 0.6)',
                pointBorderColor: '#fff',
            });
        }

        if (comparisonData && comparisonData.length > 0) {
            datasets.push({
                label: comparisonLabel ?? 'Pembanding',
                data: comparisonData,
                backgroundColor: 'rgba(71, 85, 105, 0.20)',
                borderColor: 'rgba(71, 85, 105, 1)',
                borderWidth: 2.5,
                pointBackgroundColor: '#475569',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#475569',
                pointRadius: 4,
                pointHoverRadius: 6,
            });
        }

        if (data && data.length > 0) {
            datasets.push({
                label: primaryLabel,
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
            });
        }

        return { labels, datasets };
    }, [data, labels, primaryLabel, comparisonData, comparisonLabel, classAverageData, classAverageLabel]);

    const options = useMemo(() => buildOptions(showLegend, title), [showLegend, title]);

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
            <Radar data={chartData} options={options} />
        </div>
    );
};

export default MetricsRadarChart;
