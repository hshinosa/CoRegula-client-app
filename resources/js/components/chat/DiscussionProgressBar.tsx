import React from 'react';

interface Message {
    isRelevant?: boolean | null;
}

interface DiscussionProgressBarProps {
    messages: Message[];
    learningGoal?: string | null;
}

export const DiscussionProgressBar: React.FC<DiscussionProgressBarProps> = ({ messages, learningGoal }) => {
    if (!learningGoal) {
        return null;
    }

    const totalMessages = messages.length;
    if (totalMessages === 0) {
        return null;
    }

    const relevantCount = messages.filter(m => m.isRelevant === true).length;
    const relevanceRatio = relevantCount / totalMessages;
    const percentage = Math.round(relevanceRatio * 100);

    let colorClasses = '';
    if (relevanceRatio > 0.7) {
        colorClasses = 'bg-green-500';
    } else if (relevanceRatio >= 0.4) {
        colorClasses = 'bg-yellow-500';
    } else {
        colorClasses = 'bg-red-500';
    }

    return (
        <div className="w-full bg-gray-200 h-1">
            <div 
                className={`h-1 transition-all duration-300 ${colorClasses}`}
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};

export default DiscussionProgressBar;
