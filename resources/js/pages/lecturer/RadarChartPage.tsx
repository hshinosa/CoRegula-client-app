import React from 'react';
import MetricsRadarChart from '../../components/MetricsRadarChart';

const RadarChartPage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-6 text-2xl font-bold">Halaman Radar Chart Metrik Kelas</h1>
            <MetricsRadarChart />
        </div>
    );
};

export default RadarChartPage;
