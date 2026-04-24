import React from 'react';
import PlanVsDiskusiChart from '../components/PlanVsDiskusiChart';

const PlanVsDiskusiPage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-6 text-2xl font-bold">Chart Plan vs Diskusi</h1>
            <PlanVsDiskusiChart />
        </div>
    );
};

export default PlanVsDiskusiPage;
