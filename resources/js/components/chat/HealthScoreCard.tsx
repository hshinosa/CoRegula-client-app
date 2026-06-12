import React from 'react';

interface HealthScoreCardProps {
    score: number;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ score }) => {
    let colorClass = '';
    let bgClass = '';
    let borderClass = '';

    if (score >= 70) {
        colorClass = 'text-green-700';
        bgClass = 'bg-green-50';
        borderClass = 'border-green-200';
    } else if (score >= 40) {
        colorClass = 'text-yellow-700';
        bgClass = 'bg-yellow-50';
        borderClass = 'border-yellow-200';
    } else {
        colorClass = 'text-red-700';
        bgClass = 'bg-red-50';
        borderClass = 'border-red-200';
    }

    return (
        <div className={`rounded-xl border ${borderClass} ${bgClass} p-4 transition-all hover:shadow-md`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">Kesehatan Diskusi</p>
                    <p className={`mt-1 text-3xl font-bold ${colorClass}`}>
                        {Math.round(score)}
                    </p>
                </div>
                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${bgClass} border-2 ${borderClass}`}>
                    <span className={`text-2xl font-bold ${colorClass}`}>
                        {score >= 70 ? '✓' : score >= 40 ? '~' : '✗'}
                    </span>
                </div>
            </div>
            <div className="mt-2">
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                        className={`h-full transition-all duration-300 ${
                            score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(score, 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default HealthScoreCard;
