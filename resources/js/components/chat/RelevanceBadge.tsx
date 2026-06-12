import React from 'react';

interface RelevanceBadgeProps {
    isRelevant?: boolean | null;
}

export const RelevanceBadge: React.FC<RelevanceBadgeProps> = ({ isRelevant }) => {
    let dotColor = '';
    let tooltipText = '';

    if (isRelevant === true) {
        dotColor = 'bg-green-500';
        tooltipText = 'Relevan';
    } else if (isRelevant === false) {
        dotColor = 'bg-red-500';
        tooltipText = 'Off-topic';
    } else {
        dotColor = 'bg-gray-400';
        tooltipText = 'Belum diklasifikasi';
    }

    return (
        <span className="inline-flex items-center" title={tooltipText}>
            <span className={`h-2 w-2 rounded-full ${dotColor}`} />
        </span>
    );
};

export default RelevanceBadge;
