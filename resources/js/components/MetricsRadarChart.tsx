import { Chart as ChartJS, Filler, Legend, LineElement, PointElement, RadialLinearScale, Tooltip, type ChartData, type ChartOptions } from 'chart.js';
import React from 'react';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const MetricsRadarChart: React.FC = () => {
    const labels = ['Hot', 'Lexical Variety', 'Forethought', 'Performance', 'Collaboration', 'Reflection'];

    const data: ChartData<'radar'> = {
        labels,
        datasets: [
            {
                label: 'Rata-rata Kelas',
                data: [8.7, 7.4, 9.2, 6.9, 8.3, 7.8],
                backgroundColor: 'rgba(136, 22, 28, 0.25)', // warna merah khas Kolabri
                borderColor: 'rgba(136, 22, 28, 1)',
                borderWidth: 3,
                pointBackgroundColor: '#88161c',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#88161c',
                pointRadius: 5,
                pointHoverRadius: 7,
            },
        ],
    };

    const options: ChartOptions<'radar'> = {
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
        // === FITUR KLIK ===
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const metricName = labels[index];
                const value = data.datasets[0].data[index];

                const explanations: Record<string, string> = {
                    Hot: 'Tingkat keterlibatan & antusiasme mahasiswa',
                    'Lexical Variety': 'Keragaman kosakata dalam diskusi/refleksi',
                    Forethought: 'Kemampuan perencanaan & pemikiran ke depan',
                    Performance: 'Performa keseluruhan mahasiswa',
                    Collaboration: 'Kemampuan bekerja sama dalam tim',
                    Reflection: 'Kedalaman refleksi pembelajaran',
                };

                alert(`📊 ${metricName}: ${value} / 10\n\n${explanations[metricName] || 'Metrik penting untuk evaluasi kelas.'}`);
                console.log(`Klik metrik: ${metricName} (${value})`);
            }
        },
    };

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm" style={{ height: '520px' }}>
            <Radar data={data} options={options} />
        </div>
    );
};

export default MetricsRadarChart;
